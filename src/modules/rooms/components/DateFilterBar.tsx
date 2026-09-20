import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DateFilterBarProps {
  checkIn: string;
  checkOut: string;
  capacity: string;
  onCheckInChange: (val: string) => void;
  onCheckOutChange: (val: string) => void;
  onCapacityChange: (val: string) => void;
  onSearch: () => void;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  checkIn,
  checkOut,
  capacity,
  onCheckInChange,
  onCheckOutChange,
  onCapacityChange,
  onSearch,
}) => {
  return (
    <View className="bg-white m-3.5 p-4 rounded-2xl border border-slate-200 shadow-sm">
      <View className="flex-row items-center gap-1.5 mb-3">
        <Ionicons name="calendar" size={16} color="#0F172A" />
        <Text className="text-[15px] font-black text-slate-900">
          Fechas y Huéspedes
        </Text>
      </View>

      <View className="flex-row gap-2">
        <View className="flex-1">
          <View className="flex-row items-center gap-1 mb-1">
            <Ionicons name="calendar-outline" size={11} color="#64748B" />
            <Text className="text-slate-500 text-[11px] font-bold">Check-in</Text>
          </View>
          <TextInput
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 text-[12px]"
            value={checkIn}
            onChangeText={onCheckInChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-1 mb-1">
            <Ionicons name="calendar-outline" size={11} color="#64748B" />
            <Text className="text-slate-500 text-[11px] font-bold">Check-out</Text>
          </View>
          <TextInput
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 text-[12px]"
            value={checkOut}
            onChangeText={onCheckOutChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View className="w-20">
          <View className="flex-row items-center gap-1 mb-1">
            <Ionicons name="people-outline" size={11} color="#64748B" />
            <Text className="text-slate-500 text-[11px] font-bold">Pers.</Text>
          </View>
          <TextInput
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 text-[12px] text-center"
            value={capacity}
            onChangeText={onCapacityChange}
            keyboardType="numeric"
            placeholder="2"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <TouchableOpacity
        className="flex-row justify-center items-center bg-slate-900 rounded-xl py-3 mt-3 shadow-sm active:bg-slate-800"
        onPress={onSearch}
      >
        <Ionicons name="filter-outline" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text className="text-white font-bold text-[13px]">
          Aplicar Filtros y Buscar
        </Text>
      </TouchableOpacity>
    </View>
  );
};
