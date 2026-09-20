import React from 'react';
import { View, Text, Image, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../api/rooms.api';

interface RoomDetailModalProps {
  room: Room | null;
  onClose: () => void;
  onBook: (room: Room) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({ room, onClose, onBook }) => {
  if (!room) return null;

  const defaultImage = room.type.toLowerCase().includes('suite')
    ? 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'
    : 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80';

  return (
    <Modal visible={!!room} transparent animationType="slide">
      <View className="flex-1 bg-slate-900/60 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[85%] overflow-hidden border-t border-slate-200">
          {/* Header Image & Close Button */}
          <View className="relative">
            <Image
              source={{ uri: room.imageUrl || defaultImage }}
              className="w-full h-56"
              resizeMode="cover"
            />
            <TouchableOpacity
              className="absolute top-4 right-4 bg-slate-900/70 w-9 h-9 rounded-full justify-center items-center"
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View className="absolute bottom-3 left-4 bg-slate-900/85 px-3 py-1.5 rounded-lg">
              <Text className="text-white text-[12px] font-bold">Habitación {room.roomNumber}</Text>
            </View>
          </View>

          <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
            {/* Title & Rating */}
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 pr-2">
                <Text className="text-[20px] font-black text-slate-900">{room.title}</Text>
                <Text className="text-slate-500 text-[13px] font-semibold mt-0.5">
                  Tipo: {room.type} · Piso {room.floor}
                </Text>
              </View>
              <View className="flex-row items-center bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                <Ionicons name="star" size={15} color="#D97706" />
                <Text className="text-amber-700 font-black text-[13px] ml-1">
                  {room.rating || 4.8}
                </Text>
              </View>
            </View>

            {/* Price banner */}
            <View className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 my-3 flex-row justify-between items-center">
              <View>
                <Text className="text-slate-500 text-[11px] font-bold">Tarifa por Noche</Text>
                <Text className="text-slate-900 text-[22px] font-black">S/ {room.pricePerNight}</Text>
              </View>
              <View className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <Text className="text-emerald-700 text-[11px] font-bold">Disponible</Text>
              </View>
            </View>

            {/* Specifications & Amenities */}
            <Text className="text-slate-900 text-[15px] font-black mt-2 mb-2.5">
              Especificaciones y Servicios
            </Text>

            <View className="space-y-2 mb-6">
              <View className="flex-row items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Ionicons name="people" size={18} color="#0F172A" />
                <Text className="text-slate-700 text-[13px] font-semibold ml-3">
                  Capacidad: <Text className="font-bold">Hasta {room.capacity} personas</Text>
                </Text>
              </View>

              <View className="flex-row items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Ionicons name="bed" size={18} color="#0F172A" />
                <Text className="text-slate-700 text-[13px] font-semibold ml-3">
                  Distribución: <Text className="font-bold">{room.bedType}</Text>
                </Text>
              </View>

              <View className="flex-row items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Ionicons name="expand" size={18} color="#0F172A" />
                <Text className="text-slate-700 text-[13px] font-semibold ml-3">
                  Dimensiones: <Text className="font-bold">{room.surfaceAreaM2} m²</Text>
                </Text>
              </View>

              <View className="flex-row items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Ionicons name="wifi" size={18} color="#0F172A" />
                <Text className="text-slate-700 text-[13px] font-semibold ml-3">
                  Conexión: <Text className="font-bold">Wi-Fi de Alta Velocidad Gratuito</Text>
                </Text>
              </View>

              <View className="flex-row items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Ionicons name="shield-checkmark" size={18} color="#0F172A" />
                <Text className="text-slate-700 text-[13px] font-semibold ml-3">
                  Seguridad: <Text className="font-bold">Caja fuerte y cerradura digital</Text>
                </Text>
              </View>
            </View>

            {/* Action buttons */}
            <View className="flex-row gap-3 pb-8">
              <TouchableOpacity
                className="flex-1 bg-slate-100 border border-slate-300 py-3.5 rounded-xl items-center"
                onPress={onClose}
              >
                <Text className="text-slate-700 font-bold text-[14px]">Cerrar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-2 bg-slate-900 py-3.5 rounded-xl items-center shadow-md active:bg-slate-800"
                onPress={() => {
                  onClose();
                  onBook(room);
                }}
              >
                <Text className="text-white font-black text-[14px]">Reservar Habitación</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
