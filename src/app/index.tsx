import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '@/modules/auth/api/auth.api';
import { sessionManager } from '@/modules/auth/services/sessionManager';
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { ProfilePage } from '@/modules/auth/pages/ProfilePage';
import { RoomsPage } from '@/modules/rooms/pages/RoomsPage';
import { AdminRoomsPage } from '@/modules/rooms/pages/AdminRoomsPage';
import { BoardPage } from '@/modules/rooms/pages/BoardPage';
import { BookingsPage } from '@/modules/bookings/pages/BookingsPage';
import { BottomNavBar, MainTabType } from '@/components/BottomNavBar';
import { UserMenuHeader } from '@/components/UserMenuHeader';

export default function AppScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [activeTab, setActiveTab] = useState<MainTabType>('rooms');

  // Restaurar sesión al abrir la app o recargar
  useEffect(() => {
    const restoreUser = async () => {
      try {
        const savedUser = await sessionManager.getUser();
        if (savedUser) {
          setCurrentUser(savedUser);
          setActiveTab(savedUser.role === 'GUEST' ? 'rooms' : 'adminRooms');
        }
      } finally {
        setIsRestoringSession(false);
      }
    };
    restoreUser();
  }, []);

  const handleAuthSuccess = async (user: User) => {
    await sessionManager.saveUser(user);
    setCurrentUser(user);
    setActiveTab(user.role === 'GUEST' ? 'rooms' : 'adminRooms');
  };

  const handleLogout = async () => {
    await sessionManager.clearUser();
    setCurrentUser(null);
  };

  const handleUpdateUser = async (updated: User) => {
    await sessionManager.saveUser(updated);
    setCurrentUser(updated);
  };

  // Pantalla de carga mientras se restaura la sesión persistida
  if (isRestoringSession) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#488C8C" />
      </View>
    );
  }

  // Si no ha iniciado sesión -> Mostramos la página de Login / Register
  if (!currentUser) {
    return <LoginPage onAuthSuccess={handleAuthSuccess} />;
  }

  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'RECEPTIONIST';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {/* Barra de estado con iconos oscuros */}
      <StatusBar style="dark" />

      {/* Top Header con Avatar de Iniciales y Tooltip interactivo - FIJO EN LA PARTE SUPERIOR */}
      <UserMenuHeader
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenProfile={() => setActiveTab('profile')}
      />

      {/* Vistas según el Tab seleccionado */}
      <View style={styles.content}>
        {activeTab === 'rooms' && (
          <RoomsPage
            currentUser={currentUser}
            onNavigateToBookings={() => setActiveTab('bookings')}
          />
        )}
        {activeTab === 'bookings' && <BookingsPage currentUser={currentUser} />}
        {activeTab === 'adminRooms' && <AdminRoomsPage />}
        {activeTab === 'board' && <BoardPage />}
        {activeTab === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
          />
        )}
      </View>

      {/* Tab Navigation inferior con roles diferenciados */}
      <BottomNavBar activeTab={activeTab} role={currentUser.role} onTabChange={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Fondo blanco superior para armonía con el StatusBar
  },
  content: {
    flex: 1,
    backgroundColor: '#F1F5F9', // Fondo gris pizarra suave para el cuerpo de la app
  },
});
