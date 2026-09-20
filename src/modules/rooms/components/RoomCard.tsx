import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../api/rooms.api';

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onBook }) => {
  const defaultImage = room.type.toLowerCase().includes('suite')
    ? 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'
    : 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80';

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: room.imageUrl || defaultImage }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{room.roomNumber}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{room.title}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#D97706" />
            <Text style={styles.ratingText}>{room.rating || 4.8}</Text>
          </View>
        </View>

        <Text style={styles.meta}>
          Piso {room.floor} · {room.bedType} · {room.surfaceAreaM2} m²
        </Text>

        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <Ionicons name="people-outline" size={13} color="#475569" style={{ marginRight: 4 }} />
            <Text style={styles.chipText}>Hasta {room.capacity} pers.</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="eye-outline" size={13} color="#475569" style={{ marginRight: 4 }} />
            <Text style={styles.chipText}>Vista Exterior</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="wifi-outline" size={13} color="#475569" style={{ marginRight: 4 }} />
            <Text style={styles.chipText}>Wi-Fi Gratis</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Precio por noche</Text>
            <Text style={styles.priceValue}>S/ {room.pricePerNight}</Text>
          </View>

          <TouchableOpacity style={styles.bookBtn} onPress={() => onBook(room)}>
            <Text style={styles.bookBtnText}>Reservar Ahora</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    shadowColor: '#64748B',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 160,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  details: {
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    color: '#D97706',
    fontWeight: 'bold',
    fontSize: 13,
  },
  meta: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  chipText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopColor: '#F1F5F9',
    borderTopWidth: 1,
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
  bookBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
