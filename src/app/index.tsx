import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '@/modules/auth/api/auth.api';
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { ProfilePage } from '@/modules/auth/pages/ProfilePage';
import { RoomsPage } from '@/modules/rooms/pages/RoomsPage';
import { AdminRoomsPage } from '@/modules/rooms/pages/AdminRoomsPage';
import { BookingsPage } from '@/modules/rooms/pages/BookingsPage';
import { BottomNavBar, MainTabType } from '@/components/BottomNavBar';
import { UserMenuHeader } from '@/components/UserMenuHeader';

export default function AppScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<MainTabType>('rooms');

  // Si no ha iniciado sesión -> Mostramos la página de Login / Register
  if (!currentUser) {
    return <LoginPage onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'RECEPTIONIST';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container} className="flex-1 bg-slate-100">
      {/* Top Header con Avatar de Iniciales y Tooltip interactivo */}
      <UserMenuHeader
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        onOpenProfile={() => setActiveTab('profile')}
      />

      {/* Vistas según el Tab seleccionado */}
      <View style={styles.content} className="flex-1">
        {activeTab === 'rooms' && (
          <RoomsPage
            currentUser={currentUser}
            onNavigateToBookings={() => setActiveTab('bookings')}
          />
        )}
        {activeTab === 'bookings' && <BookingsPage currentUser={currentUser} />}
        {activeTab === 'adminRooms' && <AdminRoomsPage />}
        {activeTab === 'profile' && (
          <ProfilePage currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
        )}
      </View>

      {/* Tab Navigation inferior con pestaña de Gestión para Admin */}
      <BottomNavBar activeTab={activeTab} isAdmin={isAdmin} onTabChange={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  content: {
    flex: 1,
  },
});
