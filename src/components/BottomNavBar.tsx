import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export type MainTabType = 'rooms' | 'bookings' | 'profile';

interface BottomNavBarProps {
  activeTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
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
          color={activeTab === 'rooms' ? '#0F172A' : '#94A3B8'}
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
          color={activeTab === 'bookings' ? '#0F172A' : '#94A3B8'}
        />
        <Text style={[styles.tabLabel, activeTab === 'bookings' && styles.tabLabelActive]}>
          Reservas
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabBtn}
        onPress={() => onTabChange('profile')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === 'profile' ? 'person' : 'person-outline'}
          size={22}
          color={activeTab === 'profile' ? '#0F172A' : '#94A3B8'}
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
    color: '#0F172A',
    fontWeight: '800',
  },
});
