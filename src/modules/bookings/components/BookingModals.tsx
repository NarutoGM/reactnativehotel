import React from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, StyleSheet } from 'react-native';
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRoom && (
              <>
                <Text style={styles.modalTitle}>Confirmar Reserva</Text>
                <Text style={styles.modalSubtitle}>{selectedRoom.title}</Text>

                {/* Detalles Limpios sin cajas ni bordes pesados */}
                <View style={styles.infoList}>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#488C8C" />
                    <Text style={styles.infoLabel}>Fechas:</Text>
                    <Text style={styles.infoValue}>{checkIn} al {checkOut} ({nights} {nights === 1 ? 'noche' : 'noches'})</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={16} color="#488C8C" />
                    <Text style={styles.infoLabel}>Huéspedes:</Text>
                    <Text style={styles.infoValue}>{capacity} personas · {selectedRoom.bedType}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="pricetag-outline" size={16} color="#488C8C" />
                    <Text style={styles.infoLabel}>Precio x noche:</Text>
                    <Text style={styles.infoValue}>S/ {pricePerNight}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="calculator-outline" size={16} color="#488C8C" />
                    <Text style={styles.infoLabel}>Precio final:</Text>
                    <Text style={styles.infoValueBold}>S/ {total}</Text>
                  </View>

                  {/* Porcentaje para reservar */}
                  <View style={styles.depositRow}>
                    <Ionicons name="card-outline" size={16} color="#488C8C" />
                    <Text style={styles.depositLabel}>Monto para reservar ({depositPercent}%):</Text>
                    <Text style={styles.depositAmount}>S/ {depositAmount}</Text>
                  </View>
                </View>

                <View style={styles.modalActionRow}>
                  <View style={{ flex: 1 }}>
                    <LuxuryButton
                      title="Cancelar"
                      variant="outline"
                      onPress={onCloseBooking}
                      disabled={bookingLoading}
                    />
                  </View>

                  <View style={{ flex: 1.3 }}>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalSuccessContent}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-done" size={32} color="#16A34A" />
            </View>
            <Text style={styles.successModalTitle}>¡Reserva Registrada!</Text>
            <Text style={styles.successModalDesc}>
              Tu reserva para <Text style={{ fontWeight: 'bold' }}>{bookingSuccessModal?.roomTitle}</Text> ha sido creada con éxito.
            </Text>

            <View style={styles.ticketBox}>
              <Text style={styles.ticketLabel}>Código de Reserva:</Text>
              <Text style={styles.ticketCode}>{bookingSuccessModal?.bookingId}</Text>
              <Text style={styles.ticketTotal}>Total: S/ {bookingSuccessModal?.totalAmount}</Text>
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 19,
    fontWeight: '900',
  },
  modalSubtitle: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  infoList: {
    paddingVertical: 4,
    marginBottom: 18,
    gap: 11,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 4,
  },
  infoValue: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  infoValueBold: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
    flex: 1,
    textAlign: 'right',
  },
  depositRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  depositLabel: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 8,
  },
  depositAmount: {
    color: '#488C8C',
    fontSize: 16,
    fontWeight: '900',
    flex: 1,
    textAlign: 'right',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalSuccessContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  successModalTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
  },
  successModalDesc: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  ticketBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginVertical: 16,
  },
  ticketLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  ticketCode: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    marginVertical: 4,
  },
  ticketTotal: {
    color: '#16A34A',
    fontWeight: '800',
    fontSize: 15,
  },
});
