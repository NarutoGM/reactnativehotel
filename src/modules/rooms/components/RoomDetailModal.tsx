import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room, formatRoomNumber } from '../api/rooms.api';
import { LuxuryButton } from '@/components/LuxuryButton';

const { height: screenHeight } = Dimensions.get('window');

interface RoomDetailModalProps {
  room: Room | null;
  onClose: () => void;
  onBook?: (room: Room) => void;
  showBookButton?: boolean;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  onClose,
  onBook,
  showBookButton = true,
}) => {
  const defaultImage = room?.type.toLowerCase().includes('suite')
    ? 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'
    : 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80';

  return (
    <Modal
      visible={!!room}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {room ? (
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.backdropTouch} />
          </TouchableWithoutFeedback>

        <View style={styles.sheetContainer}>
          {/* Botón flotante de Cerrar arriba a la derecha */}
          <TouchableOpacity
            style={styles.floatingCloseBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header Image & Badge dentro del scroll */}
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: room.imageUrl || defaultImage }}
                style={styles.roomImage}
                resizeMode="cover"
              />

              <View style={styles.badgeRoomNumber}>
                <Text style={styles.badgeRoomText}>
                  Habitación {formatRoomNumber(room.roomNumber)}
                </Text>
              </View>
            </View>

            <View style={styles.bodyContent}>
              {/* Title, Subtitle, Price & Rating */}
              <View style={styles.headerRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.titleText}>{room.title}</Text>
                  <Text style={styles.subtitleText}>
                    Tipo: {room.type} · Piso {room.floor}
                  </Text>
                  <Text style={styles.priceText}>
                    S/ {room.pricePerNight} <Text style={styles.pricePeriod}>/noche</Text>
                  </Text>
                </View>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={15} color="#D97706" />
                  <Text style={styles.ratingText}>
                    {room.rating || 4.8}
                  </Text>
                </View>
              </View>

              {/* Specifications & Amenities */}
              <Text style={styles.sectionTitle}>
                Especificaciones y Servicios
              </Text>

              <View style={styles.specsList}>
                <View style={styles.specItem}>
                  <Ionicons name="people" size={18} color="#488C8C" />
                  <Text style={styles.specText}>
                    Capacidad: <Text style={styles.specBold}>Hasta {room.capacity} personas</Text>
                  </Text>
                </View>

                <View style={styles.specItem}>
                  <Ionicons name="bed" size={18} color="#488C8C" />
                  <Text style={styles.specText}>
                    Distribución: <Text style={styles.specBold}>{room.bedType}</Text>
                  </Text>
                </View>

                <View style={styles.specItem}>
                  <Ionicons name="expand" size={18} color="#488C8C" />
                  <Text style={styles.specText}>
                    Dimensiones: <Text style={styles.specBold}>{room.surfaceAreaM2} m²</Text>
                  </Text>
                </View>

                <View style={styles.specItem}>
                  <Ionicons name="wifi" size={18} color="#488C8C" />
                  <Text style={styles.specText}>
                    Conexión: <Text style={styles.specBold}>Wi-Fi de Alta Velocidad</Text>
                  </Text>
                </View>

                <View style={styles.specItem}>
                  <Ionicons name="shield-checkmark" size={18} color="#488C8C" />
                  <Text style={styles.specText}>
                    Seguridad: <Text style={styles.specBold}>Caja fuerte y cerradura digital</Text>
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Barra inferior fija */}
          <View style={styles.bottomBar}>
            <View style={{ flex: 1 }}>
              <LuxuryButton
                title="Cerrar"
                variant={showBookButton && onBook ? "outline" : "solid"}
                onPress={onClose}
              />
            </View>

            {showBookButton && onBook && (
              <View style={{ flex: 2 }}>
                <LuxuryButton
                  title="Reservar Habitación"
                  variant="solid"
                  onPress={() => {
                    onClose();
                    onBook(room);
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    ) : null}
  </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: screenHeight * 0.88,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  floatingCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    elevation: 10,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 220,
    backgroundColor: '#0F172A',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  badgeRoomNumber: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeRoomText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  bodyContent: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  subtitleText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  priceText: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 6,
  },
  pricePeriod: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '400',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    color: '#D97706',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 12,
  },
  specsList: {
    marginBottom: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
  },
  specText: {
    color: '#334155',
    fontSize: 13.5,
    fontWeight: '500',
    marginLeft: 12,
  },
  specBold: {
    fontWeight: '800',
    color: '#0F172A',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
});
