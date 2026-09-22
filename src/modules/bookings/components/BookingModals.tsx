import React from 'react';
import { View, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '@/modules/rooms/api/rooms.api';
import { LuxuryButton } from '@/components/LuxuryButton';

interface BookingModalsProps {
  selectedRoom: Room | null;
  checkIn: string;
  checkOut: string;
  capacity: string;
  bookingLoading: boolean;
  bookingSuccessModal: any | null;
  onCloseBooking: () => void;
  onConfirmBooking: () => void;
  onCloseSuccess: () => void;
}

export const BookingModals: React.FC<BookingModalsProps> = ({
  selectedRoom,
  checkIn,
  checkOut,
  capacity,
  bookingLoading,
  bookingSuccessModal,
  onCloseBooking,
  onConfirmBooking,
  onCloseSuccess,
}) => {
  const dIn = new Date(checkIn);
  const dOut = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((dOut.getTime() - dIn.getTime()) / (1000 * 3600 * 24)) || 1);
  const pricePerNight = selectedRoom?.pricePerNight || 0;
  const total = nights * pricePerNight;
  const depositPercent = 50; // 50% de adelanto para reservar
  const depositAmount = Math.round(total * (depositPercent / 100));

  return (
    <>
      {/* MODAL CONFIRMACIÓN DE RESERVA */}
      <Modal visible={!!selectedRoom} transparent animationType="fade" onRequestClose={onCloseBooking}>
        <View className="flex-1 bg-slate-900/65 justify-center items-center p-5">
          <View className="bg-white rounded-[22px] p-6 w-full max-w-[380px] shadow-2xl elevation-8">
            {selectedRoom && (
              <>
                <Text className="text-slate-900 text-[19px] font-black">Confirmar Reserva</Text>
                <Text className="text-slate-500 text-[13px] font-semibold mb-4 mt-0.5">{selectedRoom.title}</Text>

                {/* Detalles Limpios */}
                <View className="py-1 mb-4.5 gap-2.5">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={16} color="#488C8C" />
                    <Text className="text-slate-500 text-[13px] font-semibold ml-2 mr-1">Fechas:</Text>
                    <Text className="text-slate-900 text-[13px] font-semibold flex-1 text-right">
                      {checkIn} al {checkOut} ({nights} {nights === 1 ? 'noche' : 'noches'})
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Ionicons name="people-outline" size={16} color="#488C8C" />
                    <Text className="text-slate-500 text-[13px] font-semibold ml-2 mr-1">Huéspedes:</Text>
                    <Text className="text-slate-900 text-[13px] font-semibold flex-1 text-right">
                      {capacity} personas · {selectedRoom.bedType}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Ionicons name="pricetag-outline" size={16} color="#488C8C" />
                    <Text className="text-slate-500 text-[13px] font-semibold ml-2 mr-1">Precio x noche:</Text>
                    <Text className="text-slate-900 text-[13px] font-semibold flex-1 text-right">
                      S/ {pricePerNight}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Ionicons name="calculator-outline" size={16} color="#488C8C" />
                    <Text className="text-slate-500 text-[13px] font-semibold ml-2 mr-1">Precio final:</Text>
                    <Text className="text-slate-900 text-[14px] font-black flex-1 text-right">
                      S/ {total}
                    </Text>
                  </View>

                  {/* Porcentaje para reservar */}
                  <View className="flex-row items-center pt-2.5 mt-1 border-t border-slate-100">
                    <Ionicons name="card-outline" size={16} color="#488C8C" />
                    <Text className="text-slate-900 text-[13px] font-extrabold ml-2">
                      Monto para reservar ({depositPercent}%):
                    </Text>
                    <Text className="text-[#488C8C] text-[16px] font-black flex-1 text-right">
                      S/ {depositAmount}
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <LuxuryButton
                      title="Cancelar"
                      variant="outline"
                      onPress={onCloseBooking}
                      disabled={bookingLoading}
                    />
                  </View>

                  <View className="flex-[1.3]">
                    <LuxuryButton
                      title="Confirmar"
                      variant="solid"
                      loading={bookingLoading}
                      onPress={onConfirmBooking}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL RESERVA EXITOSA */}
      <Modal visible={!!bookingSuccessModal} transparent animationType="fade" onRequestClose={onCloseSuccess}>
        <View className="flex-1 bg-slate-900/65 justify-center items-center p-5">
          <View className="bg-white rounded-[22px] p-6 w-full max-w-[360px] items-center shadow-2xl elevation-8">
            <View className="w-15 h-15 rounded-full bg-emerald-50 justify-center items-center mb-3">
              <Ionicons name="checkmark-done" size={32} color="#16A34A" />
            </View>
            <Text className="text-slate-900 text-[20px] font-black">¡Reserva Registrada!</Text>
            <Text className="text-slate-500 text-[13px] text-center mt-1.5 leading-4.5">
              Tu reserva para <Text className="font-bold">{bookingSuccessModal?.roomTitle}</Text> ha sido creada con éxito.
            </Text>

            <View className="bg-slate-50 rounded-2xl p-4 w-full items-center my-4">
              <Text className="text-slate-500 text-[11px] font-semibold">Código de Reserva:</Text>
              <Text className="text-slate-900 text-[22px] font-black tracking-widest my-1">
                {bookingSuccessModal?.bookingId}
              </Text>
              <Text className="text-emerald-600 font-extrabold text-[15px]">
                Total: S/ {bookingSuccessModal?.totalAmount}
              </Text>
            </View>

            <LuxuryButton
              title="Entendido"
              variant="solid"
              onPress={onCloseSuccess}
              style={{ width: '100%', marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};
