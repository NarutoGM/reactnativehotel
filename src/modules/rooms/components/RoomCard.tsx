import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room, formatRoomNumber } from '../api/rooms.api';
import { LuxuryButton } from '@/components/LuxuryButton';

interface RoomCardProps {
  room: Room;
  onPress: (room: Room) => void;
  onBook: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onPress, onBook }) => {
  const defaultImage = room.type.toLowerCase().includes('suite')
    ? 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'
    : 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80';

  return (
    <View style={styles.cardContainer}>
      {/* Área superior clickeable (Foto, Título, Especificaciones) */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => onPress(room)}
        style={styles.clickableArea}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: room.imageUrl || defaultImage }}
            style={styles.roomImage}
            resizeMode="cover"
          />
          <View style={styles.badgeRoomNumber}>
            <Text style={styles.badgeRoomText}>
              Hab. {formatRoomNumber(room.roomNumber)}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.headerRow}>
            <Text style={styles.titleText}>
              {room.title}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#D97706" />
              <Text style={styles.ratingText}>{room.rating || 4.8}</Text>
            </View>
          </View>

          <Text style={styles.subtitleText}>
            Piso {room.floor} · {room.bedType} · {room.surfaceAreaM2} m²
          </Text>

          <View style={styles.tagsRow}>
            <View style={styles.tagBadge}>
              <Ionicons name="people-outline" size={12} color="#475569" style={{ marginRight: 4 }} />
              <Text style={styles.tagText}>Hasta {room.capacity} pers.</Text>
            </View>
            <View style={styles.tagBadge}>
              <Ionicons name="eye-outline" size={12} color="#475569" style={{ marginRight: 4 }} />
              <Text style={styles.tagText}>Vista Exterior</Text>
            </View>
            <View style={styles.tagBadge}>
              <Ionicons name="wifi-outline" size={12} color="#475569" style={{ marginRight: 4 }} />
              <Text style={styles.tagText}>Wi-Fi</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Fila inferior con Precio y Botones de Acción */}
      <View style={styles.bottomRow}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.priceLabel}>Precio por noche</Text>
          <Text style={styles.priceValue}>S/ {room.pricePerNight}</Text>
        </View>

        <View style={styles.actionCol}>
          <LuxuryButton
            title="Detalles"
            variant="outline"
            size="sm"
            onPress={() => onPress(room)}
          />
          <LuxuryButton
            title="Reservar"
            variant="solid"
            size="sm"
            onPress={() => onBook(room)}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  clickableArea: {
    width: '100%',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 176,
    backgroundColor: '#0F172A',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  badgeRoomNumber: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeRoomText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  cardBody: {
    padding: 16,
    paddingBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#D97706',
    fontWeight: '700',
    fontSize: 13,
  },
  subtitleText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    marginBottom: 6,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  priceLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  priceValue: {
    color: '#0F172A',
    fontSize: 19,
    fontWeight: '900',
  },
  actionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
