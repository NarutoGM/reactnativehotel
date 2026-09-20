import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

  // Si no ha iniciado sesión -> Mostramos la página modular de Login / Register
  if (!currentUser) {
    return <LoginPage onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  // Usuario autenticado -> Header + Vista activa según Tab + Barra inferior de navegación
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerBar}>
        <View style={styles.brandRow}>
          <View style={styles.headerIconCircle}>
            <Ionicons name="business" size={18} color="#0F172A" />
          </View>
          <View>
            <Text style={styles.headerHotel}>AURA GRAND HOTEL</Text>
            <Text style={styles.headerUser}>
              Hola, {currentUser.fullName?.split(' ')[0] || 'Invitado'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutPill} onPress={() => setCurrentUser(null)}>
          <Ionicons name="log-out-outline" size={15} color="#DC2626" style={{ marginRight: 4 }} />
          <Text style={styles.logoutPillText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Vistas según el Tab seleccionado */}
      <View style={styles.content}>
        {activeTab === 'rooms' && <RoomsPage currentUser={currentUser} />}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9', // Fondo blanco con plomo elegante
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerHotel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  headerUser: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  logoutPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  logoutPillText: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
});
