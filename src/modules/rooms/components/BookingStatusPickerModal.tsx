import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type BookingStatusType = 'CONFIRMED' | 'CHECKED_IN' | 'PENDING' | 'CANCELLED';

export interface BookingStatusOption {
  value: BookingStatusType;
  label: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const BOOKING_STATUS_OPTIONS: BookingStatusOption[] = [
  {
    value: 'CONFIRMED',
    label: 'Confirmada',
    desc: 'Reserva garantizada y confirmada',
    color: '#0A3B7B',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    icon: 'shield-checkmark',
  },
  {
    value: 'CHECKED_IN',
    label: 'En Estadía (Check-In)',
    desc: 'Huésped registrado e instalado',
    color: '#488C8C',
    bg: '#EBF4F4',
    border: '#CDE5E5',
    icon: 'key',
  },
  {
    value: 'PENDING',
    label: 'Pendiente de Pago',
    desc: 'Apartada a espera de liquidación',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    icon: 'time',
  },
  {
    value: 'CANCELLED',
    label: 'Cancelada',
    desc: 'Reserva anulada o descartada',
    color: '#EF4444',
    bg: '#FEF2F2',
    border: '#FECACA',
    icon: 'close-circle',
  },
];

interface BookingStatusPickerModalProps {
  visible: boolean;
  selectedStatus: BookingStatusType;
  onSelect: (status: BookingStatusType) => void;
  onClose: () => void;
}

export const BookingStatusPickerModal: React.FC<BookingStatusPickerModalProps> = ({
  visible,
  selectedStatus,
  onSelect,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-end sm:justify-center items-center px-4"
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          className="w-full max-w-[380px] bg-white rounded-3xl p-5 mb-6 sm:mb-0 shadow-2xl border border-slate-100"
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100 mb-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="options-outline" size={20} color="#488C8C" />
              <Text className="text-[16px] font-black text-slate-900">
                Estado de la Reserva
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
            >
              <Ionicons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Opciones */}
          <View className="gap-2.5">
            {BOOKING_STATUS_OPTIONS.map((opt) => {
              const isSelected = selectedStatus === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelect(opt.value);
                    onClose();
                  }}
                  style={{
                    backgroundColor: isSelected ? opt.bg : '#F8FAFC',
                    borderColor: isSelected ? opt.color : '#E2E8F0',
                    borderWidth: isSelected ? 2 : 1,
                  }}
                  className="p-3.5 rounded-2xl flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center"
                      style={{ backgroundColor: opt.bg }}
                    >
                      <Ionicons name={opt.icon} size={20} color={opt.color} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-[14px] font-bold"
                        style={{ color: isSelected ? opt.color : '#1E293B' }}
                      >
                        {opt.label}
                      </Text>
                      <Text className="text-[11.5px] text-slate-500 font-medium mt-0.5">
                        {opt.desc}
                      </Text>
                    </View>
                  </View>

                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color={opt.color} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
