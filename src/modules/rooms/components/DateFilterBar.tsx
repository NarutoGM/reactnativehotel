import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarPickerModal } from './CalendarPickerModal';

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
  const [calendarTarget, setCalendarTarget] = useState<'checkIn' | 'checkOut' | null>(null);

  const todayStr = '2026-09-20';

  return (
    <View className="bg-white m-3.5 p-4 rounded-2xl border border-slate-200 shadow-sm">
      <View className="flex-row items-center gap-1.5 mb-3">
        <Ionicons name="calendar" size={16} color="#0F172A" />
        <Text className="text-[15px] font-black text-slate-900">
          Fechas y Huéspedes
        </Text>
      </View>

      <View className="flex-row gap-2">
        {/* CHECK-IN TOUCH BUTTON */}
        <TouchableOpacity
          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 active:bg-slate-100"
          onPress={() => setCalendarTarget('checkIn')}
        >
          <View className="flex-row items-center gap-1 mb-1">
            <Ionicons name="calendar-outline" size={12} color="#64748B" />
            <Text className="text-slate-500 text-[11px] font-bold">Check-in</Text>
          </View>
          <Text className="text-slate-900 text-[13px] font-bold">{checkIn || 'Seleccionar'}</Text>
        </TouchableOpacity>

        {/* CHECK-OUT TOUCH BUTTON */}
        <TouchableOpacity
          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 active:bg-slate-100"
          onPress={() => setCalendarTarget('checkOut')}
        >
          <View className="flex-row items-center gap-1 mb-1">
            <Ionicons name="calendar-outline" size={12} color="#64748B" />
            <Text className="text-slate-500 text-[11px] font-bold">Check-out</Text>
          </View>
          <Text className="text-slate-900 text-[13px] font-bold">{checkOut || 'Seleccionar'}</Text>
        </TouchableOpacity>

        {/* PERS. COUNTER */}
        <View className="w-20 bg-slate-50 border border-slate-300 rounded-xl p-2 justify-center">
          <View className="flex-row items-center justify-center gap-1 mb-0.5">
            <Ionicons name="people-outline" size={11} color="#64748B" />
            <Text className="text-slate-500 text-[11px] font-bold">Pers.</Text>
          </View>
          <TextInput
            className="text-slate-900 text-[13px] font-black text-center p-0"
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

      {/* CALENDARIO MODAL INTERACTIVO */}
      <CalendarPickerModal
        visible={calendarTarget === 'checkIn'}
        title="Fecha de Entrada (Check-in)"
        selectedDate={checkIn}
        minDate={todayStr}
        onSelect={(d) => {
          onCheckInChange(d);
          if (d >= checkOut) {
            const nextD = new Date(d + 'T00:00:00');
            nextD.setDate(nextD.getDate() + 1);
            const mm = String(nextD.getMonth() + 1).padStart(2, '0');
            const dd = String(nextD.getDate()).padStart(2, '0');
            onCheckOutChange(`${nextD.getFullYear()}-${mm}-${dd}`);
          }
        }}
        onClose={() => setCalendarTarget(null)}
      />

      <CalendarPickerModal
        visible={calendarTarget === 'checkOut'}
        title="Fecha de Salida (Check-out)"
        selectedDate={checkOut}
        minDate={checkIn || todayStr}
        onSelect={(d) => onCheckOutChange(d)}
        onClose={() => setCalendarTarget(null)}
      />
    </View>
  );
};
