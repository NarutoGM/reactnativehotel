import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
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
    <View className="bg-white rounded-2xl overflow-hidden border border-slate-200 mb-4 shadow-sm elevation-2">
      {/* Área superior clickeable (Foto, Título, Especificaciones) */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => onPress(room)}
        className="w-full"
      >
        <View className="relative w-full h-44 bg-slate-900">
          <Image
            source={{ uri: room.imageUrl || defaultImage }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute top-2.5 left-2.5 bg-slate-900/85 px-2.5 py-1 rounded-lg">
            <Text className="text-white text-[11px] font-extrabold">
              Hab. {formatRoomNumber(room.roomNumber)}
            </Text>
          </View>
        </View>

        <View className="p-4 pb-1.5">
          <View className="flex-row justify-between items-center">
            <Text className="text-[17px] font-black text-slate-900 flex-1">
              {room.title}
            </Text>
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={14} color="#D97706" />
              <Text className="text-amber-600 font-bold text-[13px]">{room.rating || 4.8}</Text>
            </View>
          </View>

          <Text className="text-slate-500 text-[12px] mt-1 font-medium">
            Piso {room.floor} · {room.bedType} · {room.surfaceAreaM2} m²
          </Text>

          <View className="flex-row flex-wrap gap-1.5 mt-2.5 mb-1.5">
            <View className="flex-row items-center bg-slate-100 px-2.5 py-1 rounded-md">
              <Ionicons name="people-outline" size={12} color="#475569" style={{ marginRight: 4 }} />
              <Text className="text-slate-700 text-[11px] font-semibold">Hasta {room.capacity} pers.</Text>
            </View>
            <View className="flex-row items-center bg-slate-100 px-2.5 py-1 rounded-md">
              <Ionicons name="eye-outline" size={12} color="#475569" style={{ marginRight: 4 }} />
              <Text className="text-slate-700 text-[11px] font-semibold">Vista Exterior</Text>
            </View>
            <View className="flex-row items-center bg-slate-100 px-2.5 py-1 rounded-md">
              <Ionicons name="wifi-outline" size={12} color="#475569" style={{ marginRight: 4 }} />
              <Text className="text-slate-700 text-[11px] font-semibold">Wi-Fi</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Fila inferior con Precio y Botones de Acción */}
      <View className="flex-row justify-between items-center px-4 py-3 border-t border-slate-100">
        <View className="flex-1 pr-2">
          <Text className="text-slate-500 text-[10px] font-semibold">Precio por noche</Text>
          <Text className="text-slate-900 text-[19px] font-black">S/ {room.pricePerNight}</Text>
        </View>

        <View className="flex-row items-center gap-2">
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
