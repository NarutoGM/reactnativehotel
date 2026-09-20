import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../api/rooms.api';

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
    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm mb-4"
      activeOpacity={0.88}
      onPress={() => onPress(room)}
    >
      <View className="relative">
        <Image
          source={{ uri: room.imageUrl || defaultImage }}
          className="w-full h-44"
          resizeMode="cover"
        />
        <View className="absolute top-2.5 left-2.5 bg-slate-900/85 px-2.5 py-1 rounded-lg">
          <Text className="text-white text-[11px] font-bold">Hab. {room.roomNumber}</Text>
        </View>
      </View>

      <View className="p-4">
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

        <View className="flex-row flex-wrap gap-1.5 my-2.5">
          <View className="flex-row items-center bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
            <Ionicons name="people-outline" size={12} color="#475569" style={{ marginRight: 4 }} />
            <Text className="text-slate-700 text-[11px] font-semibold">Hasta {room.capacity} pers.</Text>
          </View>
          <View className="flex-row items-center bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
            <Ionicons name="eye-outline" size={12} color="#475569" style={{ marginRight: 4 }} />
            <Text className="text-slate-700 text-[11px] font-semibold">Vista Exterior</Text>
          </View>
          <View className="flex-row items-center bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
            <Ionicons name="wifi-outline" size={12} color="#475569" style={{ marginRight: 4 }} />
            <Text className="text-slate-700 text-[11px] font-semibold">Wi-Fi</Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center pt-2.5 border-t border-slate-100">
          <View>
            <Text className="text-slate-500 text-[10px] font-semibold">Precio por noche</Text>
            <Text className="text-slate-900 text-[19px] font-black">S/ {room.pricePerNight}</Text>
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity
              className="bg-slate-100 border border-slate-300 px-3 py-2.5 rounded-xl justify-center items-center"
              onPress={() => onPress(room)}
            >
              <Text className="text-slate-700 text-[12px] font-bold">Ver Detalles</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-slate-900 px-4 py-2.5 rounded-xl justify-center items-center shadow-sm"
              onPress={() => onBook(room)}
            >
              <Text className="text-white text-[12px] font-bold">Reservar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
