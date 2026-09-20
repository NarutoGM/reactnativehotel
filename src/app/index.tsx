import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '@/modules/auth/api/auth.api';
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { ProfilePage } from '@/modules/auth/pages/ProfilePage';
import { RoomsPage } from '@/modules/rooms/pages/RoomsPage';
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

  // Usuario autenticado
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-slate-100">
      {/* Top Header con Avatar de Iniciales y Tooltip interactivo */}
      <UserMenuHeader
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        onOpenProfile={() => setActiveTab('profile')}
      />

      {/* Vistas según el Tab seleccionado */}
      <View className="flex-1">
        {activeTab === 'rooms' && (
          <RoomsPage
            currentUser={currentUser}
            onNavigateToBookings={() => setActiveTab('bookings')}
          />
        )}
        {activeTab === 'bookings' && <BookingsPage currentUser={currentUser} />}
        {activeTab === 'profile' && (
          <ProfilePage currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
        )}
      </View>

      {/* Tab Navigation inferior para cambiar entre vistas */}
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </SafeAreaView>
  );
}
