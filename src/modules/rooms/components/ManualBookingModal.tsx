import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room, Booking, BookingPayload, formatRoomNumber } from '../api/rooms.api';
import { LuxuryButton } from '@/components/LuxuryButton';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { CalendarPickerModal } from './CalendarPickerModal';
import { BookingStatusPickerModal, BookingStatusType } from './BookingStatusPickerModal';

interface ManualBookingModalProps {
  visible: boolean;
  targetRoom: (Room & { bookings?: Booking[] }) | null;
  initialDate?: string;
  creating: boolean;
  onClose: () => void;
  onSubmit: (payload: BookingPayload) => Promise<void>;
}

export const ManualBookingModal: React.FC<ManualBookingModalProps> = ({
  visible,
  targetRoom,
  initialDate,
  creating,
  onClose,
  onSubmit,
}) => {
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestsCount, setGuestsCount] = useState('2');
  const [nights, setNights] = useState('1');
  const [totalAmount, setTotalAmount] = useState('0');
  const [status, setStatus] = useState<BookingStatusType>('CONFIRMED');

  const [calendarTarget, setCalendarTarget] = useState<'checkIn' | 'checkOut' | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  useEffect(() => {
    if (visible && targetRoom && initialDate) {
      setCheckIn(initialDate);
      const nextDay = new Date(initialDate + 'T00:00:00');
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDateStr = nextDay.toISOString().split('T')[0];
      setCheckOut(nextDateStr);

      setGuestName('');
      setGuestPhone('');
      setGuestEmail('');
      setGuestsCount(String(Math.min(2, targetRoom.capacity || 2)));
      setNights('1');
      setTotalAmount(String(targetRoom.pricePerNight));
      setStatus('CONFIRMED');
    }
  }, [visible, targetRoom, initialDate]);

  const handleSave = async () => {
    if (!guestName.trim() || !checkIn || !checkOut || !targetRoom) {
      Alert.alert('Campos Incompletos', 'Por favor ingresa el nombre del huésped y las fechas.');
      return;
    }

    const guests = parseInt(guestsCount, 10) || 1;
    const maxCapacity = targetRoom.capacity || 2;
    if (guests < 1) {
      Alert.alert('Cantidad Inválida', 'Debe haber al menos 1 huésped.');
      return;
    }
    if (guests > maxCapacity) {
      Alert.alert(
        'Capacidad Excedida',
        `Esta habitación admite un máximo de ${maxCapacity} personas.`
      );
      return;
    }

    const payload: BookingPayload = {
      roomId: targetRoom.id,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim() || `${guestName.toLowerCase().replace(/\s+/g, '')}@presencial.aura`,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guestsCount: guests,
      totalAmount: parseFloat(totalAmount) || targetRoom.pricePerNight,
      status,
    };

    await onSubmit(payload);
  };

  const getStatusColor = (st: BookingStatusType) => {
    switch (st) {
      case 'CONFIRMED': return '#0A3B7B';
      case 'CHECKED_IN': return '#488C8C';
      case 'PENDING': return '#F59E0B';
      case 'CANCELLED': return '#EF4444';
    }
  };

  const getStatusLabel = (st: BookingStatusType) => {
    switch (st) {
      case 'CONFIRMED': return 'Confirmada';
      case 'CHECKED_IN': return 'En Estadía (Check-In)';
      case 'PENDING': return 'Pendiente de Pago';
      case 'CANCELLED': return 'Cancelada';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-slate-900/60 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[92%] overflow-hidden border-t border-slate-200">
          {/* Header del Modal */}
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-slate-100">
            <View>
              <Text className="text-[11px] text-[#488C8C] font-bold uppercase tracking-wider">
                Recepción · Reserva Presencial
              </Text>
              <Text className="text-[18px] font-black text-slate-900">
                Habitación {targetRoom ? formatRoomNumber(targetRoom.roomNumber) : ''} ({targetRoom?.type})
              </Text>
            </View>

            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-slate-100 justify-center items-center active:bg-slate-200"
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-5 pt-3" showsVerticalScrollIndicator={false}>
            <View className="space-y-2.5 pb-8">
              {/* Nombre del Huésped */}
              <FloatingLabelInput
                label="Nombre Completo del Huésped *"
                iconName="person-outline"
                value={guestName}
                onChangeText={setGuestName}
              />

              {/* Teléfono / Contacto */}
              <FloatingLabelInput
                label="Teléfono / Celular (Opcional)"
                iconName="call-outline"
                keyboardType="phone-pad"
                value={guestPhone}
                onChangeText={setGuestPhone}
              />

              {/* Correo Electrónico */}
              <FloatingLabelInput
                label="Email (Opcional)"
                iconName="mail-outline"
                keyboardType="email-address"
                value={guestEmail}
                onChangeText={setGuestEmail}
              />

              {/* Fechas: CheckIn y CheckOut usando CalendarPickerModal */}
              <View className="flex-row gap-2.5 my-1">
                <TouchableOpacity
                  className="flex-1 bg-[#F1F5F9] border-[1.2px] border-[#CBD5E1] rounded-xl px-3.5 py-2 justify-center active:bg-slate-100"
                  onPress={() => setCalendarTarget('checkIn')}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center gap-1.5 mb-0.5">
                    <Ionicons name="calendar-outline" size={13} color="#488C8C" />
                    <Text className="text-[10.5px] font-bold text-slate-500 uppercase tracking-tight">
                      Check-In *
                    </Text>
                  </View>
                  <Text className="text-[14px] font-black text-slate-900">
                    {checkIn || 'Seleccionar'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-[#F1F5F9] border-[1.2px] border-[#CBD5E1] rounded-xl px-3.5 py-2 justify-center active:bg-slate-100"
                  onPress={() => setCalendarTarget('checkOut')}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center gap-1.5 mb-0.5">
                    <Ionicons name="calendar-outline" size={13} color="#488C8C" />
                    <Text className="text-[10.5px] font-bold text-slate-500 uppercase tracking-tight">
                      Check-Out *
                    </Text>
                  </View>
                  <Text className="text-[14px] font-black text-slate-900">
                    {checkOut || 'Seleccionar'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Número de Huéspedes */}
              <FloatingLabelInput
                label={`N° Huéspedes (Capacidad max: ${targetRoom?.capacity || 2})`}
                iconName="people-outline"
                keyboardType="numeric"
                value={guestsCount}
                onChangeText={(val) => {
                  const cleanVal = val.replace(/[^0-9]/g, '');
                  if (!cleanVal) {
                    setGuestsCount('');
                    return;
                  }
                  const num = parseInt(cleanVal, 10);
                  const maxCap = targetRoom?.capacity || 2;
                  if (num > maxCap) {
                    setGuestsCount(String(maxCap));
                  } else {
                    setGuestsCount(String(num));
                  }
                }}
              />

              {/* Resumen del Monto Total Calculado Automáticamente (Solo Lectura) */}
              <View className="bg-[#EBF4F4] border-[1.2px] border-[#CDE5E5] rounded-xl px-4 py-2.5 my-1 flex-row justify-between items-center">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="pricetag" size={16} color="#488C8C" />
                  <View>
                    <Text className="text-[10.5px] font-bold text-teal-800 uppercase tracking-tight">
                      Monto Total Calculado
                    </Text>
                    <Text className="text-[11px] text-slate-500 font-medium">
                      {nights} {parseInt(nights, 10) === 1 ? 'noche' : 'noches'} · S/ {targetRoom?.pricePerNight || 0}/noche
                    </Text>
                  </View>
                </View>
                <Text className="text-[18px] font-black text-[#2E6666]">
                  S/ {totalAmount}
                </Text>
              </View>

              {/* Selector de Estado Inicial (Select) */}
              <View className="mt-1 mb-1">
                <Text className="text-[11.5px] font-bold text-slate-600 mb-1.5 ml-1">
                  Estado de la Reserva:
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setStatusDropdownOpen(true)}
                  className="bg-[#F8FAFC] border-[1.2px] border-slate-300 rounded-2xl px-4 py-3.5 flex-row justify-between items-center"
                >
                  <View className="flex-row items-center gap-2.5">
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStatusColor(status) }}
                    />
                    <Text className="text-[13.5px] font-bold text-slate-800">
                      {getStatusLabel(status)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Botones con LuxuryButton */}
              <View className="flex-row gap-3 pt-3">
                <View className="flex-1">
                  <LuxuryButton
                    title="Cancelar"
                    variant="outline"
                    onPress={onClose}
                    disabled={creating}
                    style={{ width: '100%', marginTop: 0 }}
                  />
                </View>
                <View className="flex-[1.5]">
                  <LuxuryButton
                    title="Registrar Reserva"
                    variant="solid"
                    iconName="checkmark-circle-outline"
                    loading={creating}
                    onPress={handleSave}
                    style={{ width: '100%', marginTop: 0 }}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Calendar Picker Modals */}
      <CalendarPickerModal
        visible={calendarTarget === 'checkIn'}
        title="Fecha de Check-In"
        selectedDate={checkIn}
        minDate={new Date().toISOString().split('T')[0]}
        onSelect={(dateStr) => {
          setCheckIn(dateStr);
          if (!checkOut || checkOut <= dateStr) {
            const nextDay = new Date(dateStr + 'T00:00:00');
            nextDay.setDate(nextDay.getDate() + 1);
            const nextStr = nextDay.toISOString().split('T')[0];
            setCheckOut(nextStr);
            if (targetRoom) {
              setNights('1');
              setTotalAmount(String(targetRoom.pricePerNight));
            }
          } else {
            const d1 = new Date(dateStr + 'T00:00:00').getTime();
            const d2 = new Date(checkOut + 'T00:00:00').getTime();
            const n = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
            setNights(String(n));
            if (targetRoom) {
              setTotalAmount(String(n * targetRoom.pricePerNight));
            }
          }
        }}
        onClose={() => setCalendarTarget(null)}
      />

      <CalendarPickerModal
        visible={calendarTarget === 'checkOut'}
        title="Fecha de Check-Out"
        selectedDate={checkOut}
        minDate={checkIn || new Date().toISOString().split('T')[0]}
        onSelect={(dateStr) => {
          setCheckOut(dateStr);
          if (checkIn) {
            const d1 = new Date(checkIn + 'T00:00:00').getTime();
            const d2 = new Date(dateStr + 'T00:00:00').getTime();
            const n = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
            setNights(String(n));
            if (targetRoom) {
              setTotalAmount(String(n * targetRoom.pricePerNight));
            }
          }
        }}
        onClose={() => setCalendarTarget(null)}
      />

      {/* Selector de Estado Modular */}
      <BookingStatusPickerModal
        visible={statusDropdownOpen}
        selectedStatus={status}
        onSelect={setStatus}
        onClose={() => setStatusDropdownOpen(false)}
      />
    </Modal>
  );
};
