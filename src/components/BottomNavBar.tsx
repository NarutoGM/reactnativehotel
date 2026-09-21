import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export type MainTabType = 'rooms' | 'bookings' | 'adminRooms' | 'profile';

interface BottomNavBarProps {
  activeTab: MainTabType;
  isAdmin?: boolean;
  onTabChange: (tab: MainTabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, isAdmin, onTabChange }) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 6 : 14);

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <TouchableOpacity
        style={styles.tabBtn}
        onPress={() => onTabChange('rooms')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === 'rooms' ? 'bed' : 'bed-outline'}
          size={22}
          color={activeTab === 'rooms' ? '#488C8C' : '#94A3B8'}
        />
        <Text style={[styles.tabLabel, activeTab === 'rooms' && styles.tabLabelActive]}>
          Habitaciones
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabBtn}
        onPress={() => onTabChange('bookings')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === 'bookings' ? 'receipt' : 'receipt-outline'}
          size={22}
          color={activeTab === 'bookings' ? '#488C8C' : '#94A3B8'}
        />
        <Text style={[styles.tabLabel, activeTab === 'bookings' && styles.tabLabelActive]}>
          Reservas
        </Text>
      </TouchableOpacity>

      {/* Pestaña de Gestión de Habitaciones para Admin */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => onTabChange('adminRooms')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'adminRooms' ? 'settings' : 'settings-outline'}
            size={22}
            color={activeTab === 'adminRooms' ? '#488C8C' : '#94A3B8'}
          />
          <Text style={[styles.tabLabel, activeTab === 'adminRooms' && styles.tabLabelActive]}>
            Gestión
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.tabBtn}
        onPress={() => onTabChange('profile')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === 'profile' ? 'person' : 'person-outline'}
          size={22}
          color={activeTab === 'profile' ? '#488C8C' : '#94A3B8'}
        />
        <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>
          Perfil
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    justifyContent: 'space-around',
    shadowColor: '#64748B',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -3 },
    elevation: 8,
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#488C8C',
    fontWeight: '800',
  },
});
