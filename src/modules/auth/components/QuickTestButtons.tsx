import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickTestButtonsProps {
  selectedEmail: string;
  onSelect: (email: string, roleName: string) => void;
}

export const QuickTestButtons: React.FC<QuickTestButtonsProps> = ({ selectedEmail, onSelect }) => {
  const isHuesped = selectedEmail === 'huesped@aurahotel.pe';
  const isRecepcion = selectedEmail === 'recepcion@aurahotel.pe';
  const isAdmin = selectedEmail === 'admin@aurahotel.pe';

  return (
    <View style={styles.container}>
      {/* HUÉSPED */}
      <TouchableOpacity
        style={[styles.iconBtn, isHuesped && styles.iconBtnActive]}
        onPress={() => onSelect('huesped@aurahotel.pe', 'Huésped')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="person-outline"
          size={19}
          color={isHuesped ? '#FFFFFF' : '#64748B'}
        />
      </TouchableOpacity>

      {/* RECEPCIÓN */}
      <TouchableOpacity
        style={[styles.iconBtn, isRecepcion && styles.iconBtnActive]}
        onPress={() => onSelect('recepcion@aurahotel.pe', 'Recepción')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="desktop-outline"
          size={19}
          color={isRecepcion ? '#FFFFFF' : '#64748B'}
        />
      </TouchableOpacity>

      {/* ADMIN */}
      <TouchableOpacity
        style={[styles.iconBtn, isAdmin && styles.iconBtnActive]}
        onPress={() => onSelect('admin@aurahotel.pe', 'Admin')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={19}
          color={isAdmin ? '#FFFFFF' : '#64748B'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginTop: 20,
    paddingBottom: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9', // Gris pizarra suave y limpio
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBtnActive: {
    backgroundColor: '#0F172A',
    shadowColor: '#0F172A',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
});
