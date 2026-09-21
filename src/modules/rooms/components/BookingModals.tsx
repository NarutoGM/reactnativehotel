import React from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../api/rooms.api';

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
  return (
    <>
      {/* MODAL CONFIRMACIÓN DE RESERVA */}
      <Modal visible={!!selectedRoom} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRoom && (
              <>
                <Text style={styles.modalTitle}>Confirmar Reserva</Text>
                <Text style={styles.modalSubtitle}>{selectedRoom.title}</Text>

                <View style={styles.modalInfoBox}>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#488C8C" />
                    <Text style={styles.modalInfoItem}>
                      <Text style={{ fontWeight: 'bold' }}>Fechas: </Text>{checkIn} al {checkOut}
                    </Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Ionicons name="people-outline" size={16} color="#488C8C" />
                    <Text style={styles.modalInfoItem}>
                      <Text style={{ fontWeight: 'bold' }}>Huéspedes: </Text>{capacity} personas
                    </Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Ionicons name="bed-outline" size={16} color="#488C8C" />
                    <Text style={styles.modalInfoItem}>
                      <Text style={{ fontWeight: 'bold' }}>Camas: </Text>{selectedRoom.bedType}
                    </Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Ionicons name="cash-outline" size={16} color="#488C8C" />
                    <Text style={styles.modalInfoItem}>
                      <Text style={{ fontWeight: 'bold' }}>Tarifa: </Text>S/ {selectedRoom.pricePerNight} / noche
                    </Text>
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

                  <View style={{ flex: 1.2 }}>
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
      <Modal visible={!!bookingSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSuccessContent}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-done" size={32} color="#16A34A" />
            </View>
            <Text style={styles.successModalTitle}>¡Reserva Registrada!</Text>
            <Text style={styles.successModalDesc}>
              Tu reserva para <Text style={{ fontWeight: 'bold' }}>{bookingSuccessModal?.roomTitle}</Text> ha sido creada en estado pendiente de voucher.
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    width: '100%',
    maxWidth: 380,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
  },
  modalSubtitle: {
    color: '#475569',
    fontSize: 14,
    marginBottom: 14,
    fontWeight: '600',
  },
  modalInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalInfoItem: {
    color: '#334155',
    fontSize: 13,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#475569',
    fontWeight: '700',
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalSuccessContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderColor: '#E2E8F0',
    borderWidth: 1,
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
    borderWidth: 1,
    borderColor: '#86EFAC',
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
    borderRadius: 12,
    padding: 14,
    width: '100%',
    alignItems: 'center',
    marginVertical: 16,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderWidth: 1,
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
  successDoneBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  successDoneText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
