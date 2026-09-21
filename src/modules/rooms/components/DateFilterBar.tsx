import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

  const todayStr = '2026-09-20';

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
    <View style={styles.outerContainer}>
      <View style={styles.barContainer}>
        {/* SEGMENTO 1: FECHA DE ENTRADA */}
        <TouchableOpacity
          style={styles.dateSegment}
          onPress={() => setCalendarTarget('checkIn')}
          activeOpacity={0.7}
        >
          <Text style={styles.segmentLabel}>ENTRADA</Text>
          <View style={styles.valueWithIconRow}>
            <Ionicons name="calendar-outline" size={13} color="#0F172A" />
            <Text style={styles.segmentValue} numberOfLines={1}>
              {checkInLabel}
            </Text>
          </View>
        </TouchableOpacity>

        {/* SEPARADOR VERTICAL */}
        <View style={styles.verticalDivider} />

        {/* SEGMENTO 2: FECHA DE SALIDA */}
        <TouchableOpacity
          style={styles.dateSegment}
          onPress={() => setCalendarTarget('checkOut')}
          activeOpacity={0.7}
        >
          <Text style={styles.segmentLabel}>SALIDA</Text>
          <View style={styles.valueWithIconRow}>
            <Ionicons name="calendar-outline" size={13} color="#0F172A" />
            <Text style={styles.segmentValue} numberOfLines={1}>
              {checkOutLabel}
            </Text>
          </View>
        </TouchableOpacity>

        {/* SEPARADOR VERTICAL */}
        <View style={styles.verticalDivider} />

        {/* SEGMENTO 3: HUÉSPEDES */}
        <TouchableOpacity
          style={styles.guestSegment}
          onPress={() => setGuestModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.segmentLabel}>HUÉSPEDES</Text>
          <View style={styles.guestInputRow}>
            <Ionicons name="people-outline" size={14} color="#0F172A" />
            <Text style={styles.guestValueText}>{guestCount}</Text>
          </View>
        </TouchableOpacity>

        {/* SEGMENTO 4: BOTÓN DE BÚSQUEDA */}
        <TouchableOpacity
          style={styles.searchButton}
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

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 8,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dateSegment: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  valueWithIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  segmentLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    fontFamily: 'Sora_700Bold',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  segmentValue: {
    fontSize: 11.5,
    fontWeight: '800',
    fontFamily: 'Sora_700Bold',
    color: '#0F172A',
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 3,
  },
  guestSegment: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  guestInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  guestValueText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'Sora_800ExtraBold',
    color: '#0F172A',
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: '#488C8C',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    shadowColor: '#488C8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});
