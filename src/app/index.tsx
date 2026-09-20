import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { User } from '@/modules/auth/api/auth.api';
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { ProfilePage } from '@/modules/auth/pages/ProfilePage';
import { RoomsPage } from '@/modules/rooms/pages/RoomsPage';
import { BookingsPage } from '@/modules/rooms/pages/BookingsPage';
import { BottomNavBar, MainTabType } from '@/components/BottomNavBar';

export default function AppScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<MainTabType>('rooms');

  // Si no ha iniciado sesión -> Mostramos la página de Login / Register
  if (!currentUser) {
    return <LoginPage onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  // Usuario autenticado
  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      {/* Top Header */}
      <View className="flex-row justify-between items-center px-4 py-3.5 bg-white border-b border-slate-200">
        <View className="flex-row items-center gap-2.5">
          <View className="w-9 h-9 rounded-full bg-slate-100 justify-center items-center border border-slate-200">
            <Ionicons name="business" size={18} color="#0F172A" />
          </View>
          <View>
            <Text className="text-[11px] text-slate-500 font-bold tracking-wider">
              AURA GRAND HOTEL
            </Text>
            <Text className="text-[17px] font-black text-slate-900">
              Hola, {currentUser.fullName?.split(' ')[0] || 'Invitado'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="flex-row items-center bg-red-50 border border-red-200 px-3 py-1.5 rounded-full"
          onPress={() => setCurrentUser(null)}
        >
          <Ionicons name="log-out-outline" size={14} color="#DC2626" style={{ marginRight: 4 }} />
          <Text className="text-red-600 font-bold text-[12px]">Salir</Text>
        </TouchableOpacity>
      </View>

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
