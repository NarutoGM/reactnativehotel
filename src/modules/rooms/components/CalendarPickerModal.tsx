import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
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
        <View className="flex-1 bg-slate-900/45 justify-center items-center p-4">
          <TouchableWithoutFeedback>
            <View className="w-full max-w-[340px] bg-white rounded-3xl p-5 shadow-2xl elevation-10 border border-slate-200">
              {/* Header Title */}
              <View className="flex-row justify-between items-center pb-2.5 border-b border-slate-100">
                <View>
                  <Text className="text-[9.5px] font-extrabold text-slate-500 tracking-wider">CALENDARIO</Text>
                  <Text className="text-[17px] font-black text-slate-900 mt-0.5">{title}</Text>
                </View>

                <TouchableOpacity
                  className="w-8 h-8 rounded-full bg-slate-100 justify-center items-center"
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Month Navigation */}
              <View className="flex-row justify-between items-center my-3 px-1">
                <TouchableOpacity
                  className="w-8 h-8 rounded-full bg-slate-100 justify-center items-center"
                  onPress={handlePrevMonth}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={18} color="#0F172A" />
                </TouchableOpacity>

                <Text className="text-[15px] font-extrabold text-slate-900">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </Text>

                <TouchableOpacity
                  className="w-8 h-8 rounded-full bg-slate-100 justify-center items-center"
                  onPress={handleNextMonth}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-forward" size={18} color="#0F172A" />
                </TouchableOpacity>
              </View>

              {/* Days Header */}
              <View className="flex-row justify-between mb-1.5">
                {DAYS_HEADER.map((d, idx) => (
                  <Text key={idx} className="w-9 text-center text-[11px] font-bold text-slate-400">
                    {d}
                  </Text>
                ))}
              </View>

              {/* Days Grid */}
              <View className="flex-row flex-wrap justify-between">
                {days.map((item, idx) => {
                  if (!item.day) {
                    return <View key={idx} className="w-9 h-9 my-0.5" />;
                  }

                  const isSelected = item.dateStr === selectedDate;
                  const isPast = minDate ? item.dateStr < minDate : false;

                  return (
                    <TouchableOpacity
                      key={idx}
                      disabled={isPast}
                      className={`w-9 h-9 my-0.5 rounded-xl justify-center items-center ${
                        isSelected ? 'bg-slate-900 shadow-sm elevation-2' : ''
                      } ${isPast ? 'opacity-25' : ''}`}
                      onPress={() => {
                        onSelect(item.dateStr);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-[13px] ${
                          isSelected
                            ? 'text-white font-black'
                            : isPast
                            ? 'text-slate-400 font-semibold'
                            : 'text-slate-900 font-bold'
                        }`}
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
