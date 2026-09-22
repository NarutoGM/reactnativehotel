import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarPickerModal } from './CalendarPickerModal';
import { GuestPickerModal } from './GuestPickerModal';

interface DateFilterBarProps {
  checkIn: string;
  checkOut: string;
  capacity: string;
  onCheckInChange: (val: string) => void;
  onCheckOutChange: (val: string) => void;
  onCapacityChange: (val: string) => void;
  onSearch: () => void;
}

const MONTH_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic',
];

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
  const [guestModalVisible, setGuestModalVisible] = useState(false);

  const getTodayStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = getTodayStr();

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      return `${day} ${MONTH_SHORT[monthIdx] || ''}`;
    }
    return dateStr;
  };

  const checkInLabel = checkIn ? formatShortDate(checkIn) : 'Elegir';
  const checkOutLabel = checkOut ? formatShortDate(checkOut) : 'Elegir';
  const guestCount = capacity || '2';

  return (
    <View className="px-3 pt-2.5 pb-1.5">
      <View className="flex-row items-center bg-white rounded-[18px] border border-slate-200 py-1.5 px-2 shadow-sm elevation-2">
        {/* SEGMENTO 1: FECHA DE ENTRADA */}
        <TouchableOpacity
          className="flex-1 items-start py-0.5 px-1.5"
          onPress={() => setCalendarTarget('checkIn')}
          activeOpacity={0.7}
        >
          <Text className="text-[8.5px] font-extrabold text-slate-400 tracking-wider">ENTRADA</Text>
          <View className="flex-row items-center gap-1 mt-0.5">
            <Ionicons name="calendar-outline" size={13} color="#0F172A" />
            <Text className="text-[11.5px] font-extrabold text-slate-900" numberOfLines={1}>
              {checkInLabel}
            </Text>
          </View>
        </TouchableOpacity>

        {/* SEPARADOR VERTICAL */}
        <View className="w-[1px] h-6 bg-slate-200 mx-1" />

        {/* SEGMENTO 2: FECHA DE SALIDA */}
        <TouchableOpacity
          className="flex-1 items-start py-0.5 px-1.5"
          onPress={() => setCalendarTarget('checkOut')}
          activeOpacity={0.7}
        >
          <Text className="text-[8.5px] font-extrabold text-slate-400 tracking-wider">SALIDA</Text>
          <View className="flex-row items-center gap-1 mt-0.5">
            <Ionicons name="calendar-outline" size={13} color="#0F172A" />
            <Text className="text-[11.5px] font-extrabold text-slate-900" numberOfLines={1}>
              {checkOutLabel}
            </Text>
          </View>
        </TouchableOpacity>

        {/* SEPARADOR VERTICAL */}
        <View className="w-[1px] h-6 bg-slate-200 mx-1" />

        {/* SEGMENTO 3: HUÉSPEDES */}
        <TouchableOpacity
          className="px-1.5 py-0.5 rounded-lg items-start justify-center"
          onPress={() => setGuestModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text className="text-[8.5px] font-extrabold text-slate-400 tracking-wider">HUÉSPEDES</Text>
          <View className="flex-row items-center gap-1 mt-0.5">
            <Ionicons name="people-outline" size={14} color="#0F172A" />
            <Text className="text-[12px] font-black text-slate-900">{guestCount}</Text>
          </View>
        </TouchableOpacity>

        {/* SEGMENTO 4: BOTÓN DE BÚSQUEDA */}
        <TouchableOpacity
          className="w-9 h-9 rounded-xl bg-[#488C8C] justify-center items-center ml-1 shadow-sm elevation-2"
          onPress={onSearch}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* MODAL HUÉSPEDES */}
      <GuestPickerModal
        visible={guestModalVisible}
        capacity={capacity}
        onSelect={(val) => onCapacityChange(val)}
        onClose={() => setGuestModalVisible(false)}
      />

      {/* MODAL 1: CALENDARIO DE ENTRADA */}
      <CalendarPickerModal
        visible={calendarTarget === 'checkIn'}
        title="Fecha de Entrada"
        selectedDate={checkIn}
        minDate={todayStr}
        onSelect={(d) => {
          onCheckInChange(d);
          if (checkOut && d >= checkOut) {
            const nextD = new Date(d + 'T00:00:00');
            nextD.setDate(nextD.getDate() + 1);
            const mm = String(nextD.getMonth() + 1).padStart(2, '0');
            const dd = String(nextD.getDate()).padStart(2, '0');
            onCheckOutChange(`${nextD.getFullYear()}-${mm}-${dd}`);
          }
        }}
        onClose={() => setCalendarTarget(null)}
      />

      {/* MODAL 2: CALENDARIO DE SALIDA */}
      <CalendarPickerModal
        visible={calendarTarget === 'checkOut'}
        title="Fecha de Salida"
        selectedDate={checkOut}
        minDate={checkIn || todayStr}
        onSelect={(d) => onCheckOutChange(d)}
        onClose={() => setCalendarTarget(null)}
      />
    </View>
  );
};
