import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
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
        <View className="flex-1 bg-slate-900/65 justify-end">
          <TouchableWithoutFeedback onPress={onClose}>
            <View className="flex-1" />
          </TouchableWithoutFeedback>

          <View
            className="bg-white rounded-t-[28px] overflow-hidden border-t border-slate-200 shadow-2xl elevation-20"
            style={{ maxHeight: screenHeight * 0.88 }}
          >
            {/* Botón flotante de Cerrar */}
            <TouchableOpacity
              className="absolute top-3.5 right-3.5 bg-slate-900/75 w-9 h-9 rounded-full justify-center items-center z-50 elevation-10"
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {/* Header Image & Badge */}
              <View className="relative w-full h-[220px] bg-slate-900">
                <Image
                  source={{ uri: room.imageUrl || defaultImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />

                <View className="absolute bottom-3 left-4 bg-slate-900/85 px-3 py-1.5 rounded-lg">
                  <Text className="text-white text-[12px] font-extrabold">
                    Habitación {formatRoomNumber(room.roomNumber)}
                  </Text>
                </View>
              </View>

              <View className="p-5">
                {/* Title, Subtitle, Price & Rating */}
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1 pr-2">
                    <Text className="text-[20px] font-black text-slate-900">{room.title}</Text>
                    <Text className="text-slate-500 text-[13px] font-semibold mt-0.5">
                      Tipo: {room.type} · Piso {room.floor}
                    </Text>
                    <Text className="text-slate-900 text-[18px] font-black mt-1.5">
                      S/ {room.pricePerNight} <Text className="text-slate-400 text-[11px] font-normal">/noche</Text>
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Ionicons name="star" size={15} color="#D97706" />
                    <Text className="text-amber-600 font-bold text-[14px]">
                      {room.rating || 4.8}
                    </Text>
                  </View>
                </View>

                {/* Specifications & Amenities */}
                <Text className="text-slate-900 text-[15px] font-black mb-3">
                  Especificaciones y Servicios
                </Text>

                <View className="mb-2">
                  <View className="flex-row items-center py-2.5">
                    <Ionicons name="people" size={18} color="#488C8C" />
                    <Text className="text-slate-700 text-[13.5px] font-medium ml-3">
                      Capacidad: <Text className="font-extrabold text-slate-900">Hasta {room.capacity} personas</Text>
                    </Text>
                  </View>

                  <View className="flex-row items-center py-2.5">
                    <Ionicons name="bed" size={18} color="#488C8C" />
                    <Text className="text-slate-700 text-[13.5px] font-medium ml-3">
                      Distribución: <Text className="font-extrabold text-slate-900">{room.bedType}</Text>
                    </Text>
                  </View>

                  <View className="flex-row items-center py-2.5">
                    <Ionicons name="expand" size={18} color="#488C8C" />
                    <Text className="text-slate-700 text-[13.5px] font-medium ml-3">
                      Dimensiones: <Text className="font-extrabold text-slate-900">{room.surfaceAreaM2} m²</Text>
                    </Text>
                  </View>

                  <View className="flex-row items-center py-2.5">
                    <Ionicons name="wifi" size={18} color="#488C8C" />
                    <Text className="text-slate-700 text-[13.5px] font-medium ml-3">
                      Conexión: <Text className="font-extrabold text-slate-900">Wi-Fi de Alta Velocidad</Text>
                    </Text>
                  </View>

                  <View className="flex-row items-center py-2.5">
                    <Ionicons name="shield-checkmark" size={18} color="#488C8C" />
                    <Text className="text-slate-700 text-[13.5px] font-medium ml-3">
                      Seguridad: <Text className="font-extrabold text-slate-900">Caja fuerte y cerradura digital</Text>
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Barra inferior fija */}
            <View className="px-5 py-3.5 bg-white border-t border-slate-100 flex-row gap-3 shadow-md elevation-8">
              <View className="flex-1">
                <LuxuryButton
                  title="Cerrar"
                  variant={showBookButton && onBook ? "outline" : "solid"}
                  onPress={onClose}
                />
              </View>

              {showBookButton && onBook && (
                <View className="flex-[2]">
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
