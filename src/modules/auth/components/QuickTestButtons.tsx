import React from 'react';
import { View, TouchableOpacity } from 'react-native';
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
    <View className="flex-row justify-center items-center gap-3.5 mt-5 pb-2">
      {/* HUÉSPED */}
      <TouchableOpacity
        className={`w-11 h-11 rounded-full justify-center items-center elevation-2 shadow-sm ${
          isHuesped ? 'bg-slate-900' : 'bg-slate-100'
        }`}
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
        className={`w-11 h-11 rounded-full justify-center items-center elevation-2 shadow-sm ${
          isRecepcion ? 'bg-slate-900' : 'bg-slate-100'
        }`}
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
        className={`w-11 h-11 rounded-full justify-center items-center elevation-2 shadow-sm ${
          isAdmin ? 'bg-slate-900' : 'bg-slate-100'
        }`}
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
