import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '@/modules/auth/api/auth.api';
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { ProfilePage } from '@/modules/auth/pages/ProfilePage';
import { RoomsPage } from '@/modules/rooms/pages/RoomsPage';
import { AdminRoomsPage } from '@/modules/rooms/pages/AdminRoomsPage';
import { BookingsPage } from '@/modules/bookings/pages/BookingsPage';
import { BottomNavBar, MainTabType } from '@/components/BottomNavBar';
import { UserMenuHeader } from '@/components/UserMenuHeader';

export default function AppScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<MainTabType>('rooms');

  // Si no ha iniciado sesión -> Mostramos la página de Login / Register
  if (!currentUser) {
    return (
      <LoginPage
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab(user.role === 'GUEST' ? 'rooms' : 'adminRooms');
        }}
      />
    );
  }

  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'RECEPTIONIST';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {/* Barra de estado con iconos oscuros y fondo blanco en Android */}
      <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />

      {/* Top Header con Avatar de Iniciales y Tooltip interactivo - FIJO EN LA PARTE SUPERIOR */}
      <UserMenuHeader
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
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
        {activeTab === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onLogout={() => setCurrentUser(null)}
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
