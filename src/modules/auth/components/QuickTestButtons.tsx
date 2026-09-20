import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickTestButtonsProps {
  onSelect: (email: string, roleName: string) => void;
}

export const QuickTestButtons: React.FC<QuickTestButtonsProps> = ({ onSelect }) => {
  return (
    <View className="mt-5 pt-4 border-t border-slate-100">
      <View className="flex-row items-center mb-3">
        <View className="flex-1 h-[1px] bg-slate-200" />
        <Text className="text-slate-400 text-[11px] font-bold px-2 uppercase tracking-wider">
          Accesos de prueba rápidos
        </Text>
        <View className="flex-1 h-[1px] bg-slate-200" />
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity
          className="flex-1 bg-slate-50 py-2.5 rounded-lg items-center border border-slate-200 active:bg-slate-100"
          onPress={() => onSelect('huesped@aurahotel.pe', 'Huésped')}
        >
          <Ionicons name="person-outline" size={15} color="#475569" style={{ marginBottom: 2 }} />
          <Text className="text-slate-600 text-[11px] font-bold">Huésped</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-slate-50 py-2.5 rounded-lg items-center border border-slate-200 active:bg-slate-100"
          onPress={() => onSelect('recepcion@aurahotel.pe', 'Recepción')}
        >
          <Ionicons name="desktop-outline" size={15} color="#475569" style={{ marginBottom: 2 }} />
          <Text className="text-slate-600 text-[11px] font-bold">Recepción</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-amber-50 py-2.5 rounded-lg items-center border border-amber-200 active:bg-amber-100"
          onPress={() => onSelect('admin@aurahotel.pe', 'Admin')}
        >
          <Ionicons name="shield-checkmark-outline" size={15} color="#EA580C" style={{ marginBottom: 2 }} />
          <Text className="text-amber-700 text-[11px] font-bold">Admin</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-slate-400 text-[11px] text-center mt-2">
        Contraseña única: Aura2026!
      </Text>
    </View>
  );
};
