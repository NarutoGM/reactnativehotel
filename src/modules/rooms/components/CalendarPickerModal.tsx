import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CalendarPickerModalProps {
  visible: boolean;
  title: string;
  selectedDate: string; // "YYYY-MM-DD"
  minDate?: string;     // "YYYY-MM-DD"
  onSelect: (dateStr: string) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAYS_HEADER = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

export const CalendarPickerModal: React.FC<CalendarPickerModalProps> = ({
  visible,
  title,
  selectedDate,
  minDate = '2026-09-20',
  onSelect,
  onClose,
}) => {
  const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear() || 2026);
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth() || 8); // 0-indexed

  if (!visible) return null;

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Generar matriz de días
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const days: { day: number | null; dateStr: string }[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ day: null, dateStr: '' });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    days.push({ day: d, dateStr: `${currentYear}-${mm}-${dd}` });
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Header Title */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.badgeStep}>CALENDARIO</Text>
                  <Text style={styles.titleText}>{title}</Text>
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Month Navigation */}
              <View style={styles.monthNav}>
                <TouchableOpacity
                  style={styles.navArrow}
                  onPress={handlePrevMonth}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={18} color="#0F172A" />
                </TouchableOpacity>

                <Text style={styles.monthTitle}>
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </Text>

                <TouchableOpacity
                  style={styles.navArrow}
                  onPress={handleNextMonth}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-forward" size={18} color="#0F172A" />
                </TouchableOpacity>
              </View>

              {/* Days Header */}
              <View style={styles.daysHeaderRow}>
                {DAYS_HEADER.map((d, idx) => (
                  <Text key={idx} style={styles.dayHeaderCell}>
                    {d}
                  </Text>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.daysGrid}>
                {days.map((item, idx) => {
                  if (!item.day) {
                    return <View key={idx} style={styles.emptyDayCell} />;
                  }

                  const isSelected = item.dateStr === selectedDate;
                  const isPast = minDate ? item.dateStr < minDate : false;

                  return (
                    <TouchableOpacity
                      key={idx}
                      disabled={isPast}
                      style={[
                        styles.dayCell,
                        isSelected && styles.dayCellSelected,
                        isPast && styles.dayCellPast,
                      ]}
                      onPress={() => {
                        onSelect(item.dateStr);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayCellText,
                          isSelected && styles.dayCellTextSelected,
                          isPast && styles.dayCellTextPast,
                        ]}
                      >
                        {item.day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  badgeStep: {
    fontSize: 9.5,
    fontWeight: '800',
    fontFamily: 'Sora_700Bold',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '900',
    fontFamily: 'Sora_800ExtraBold',
    color: '#0F172A',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 4,
  },
  navArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'Sora_700Bold',
    color: '#0F172A',
  },
  daysHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dayHeaderCell: {
    width: 36,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Sora_600SemiBold',
    color: '#94A3B8',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyDayCell: {
    width: 36,
    height: 36,
    marginVertical: 2,
  },
  dayCell: {
    width: 36,
    height: 36,
    marginVertical: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellSelected: {
    backgroundColor: '#0F172A',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  dayCellPast: {
    opacity: 0.25,
  },
  dayCellText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Sora_600SemiBold',
    color: '#0F172A',
  },
  dayCellTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Sora_800ExtraBold',
  },
  dayCellTextPast: {
    color: '#94A3B8',
  },
  footerRow: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 11.5,
    fontFamily: 'Sora_400Regular',
    color: '#64748B',
  },
  footerVal: {
    fontSize: 12.5,
    fontWeight: '800',
    fontFamily: 'Sora_700Bold',
    color: '#0F172A',
  },
});
