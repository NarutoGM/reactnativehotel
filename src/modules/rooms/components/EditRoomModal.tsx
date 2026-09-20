import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room, roomsApi, CreateRoomPayload, UpdateRoomPayload } from '../api/rooms.api';

interface EditRoomModalProps {
  visible: boolean;
  room: Room | null; // Si es null -> modo Crear, si tiene datos -> modo Editar
  onClose: () => void;
  onSuccess: () => void;
}

export const EditRoomModal: React.FC<EditRoomModalProps> = ({
  visible,
  room,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!room;

  const [roomNumber, setRoomNumber] = useState(room?.roomNumber || '');
  const [title, setTitle] = useState(room?.title || '');
  const [type, setType] = useState(room?.type || 'Estándar');
  const [floor, setFloor] = useState(String(room?.floor || '1'));
  const [capacity, setCapacity] = useState(String(room?.capacity || '2'));
  const [pricePerNight, setPricePerNight] = useState(String(room?.pricePerNight || '180'));
  const [bedType, setBedType] = useState(room?.bedType || '1 Cama Queen');
  const [surfaceAreaM2, setSurfaceAreaM2] = useState(String(room?.surfaceAreaM2 || '28'));
  const [imageUrl, setImageUrl] = useState(room?.imageUrl || '');
  const [loading, setLoading] = useState(false);

  // Sincronizar estado cuando se abre para editar
  React.useEffect(() => {
    if (room) {
      setRoomNumber(room.roomNumber);
      setTitle(room.title);
      setType(room.type);
      setFloor(String(room.floor));
      setCapacity(String(room.capacity));
      setPricePerNight(String(room.pricePerNight));
      setBedType(room.bedType);
      setSurfaceAreaM2(String(room.surfaceAreaM2));
      setImageUrl(room.imageUrl || '');
    } else {
      setRoomNumber('');
      setTitle('');
      setType('Estándar');
      setFloor('1');
      setCapacity('2');
      setPricePerNight('180');
      setBedType('1 Cama Queen');
      setSurfaceAreaM2('28');
      setImageUrl('');
    }
  }, [room, visible]);

  if (!visible) return null;

  const handleSave = async () => {
    if (!roomNumber.trim() || !title.trim() || !pricePerNight.trim()) {
      Alert.alert('Campos Incompletos', 'Por favor ingresa número de habitación, título y precio.');
      return;
    }

    setLoading(true);

    if (isEditing && room) {
      const payload: UpdateRoomPayload = {
        roomNumber: roomNumber.trim(),
        title: title.trim(),
        type: type.trim(),
        floor: parseInt(floor, 10) || 1,
        capacity: parseInt(capacity, 10) || 2,
        pricePerNight: parseFloat(pricePerNight) || 100,
        bedType: bedType.trim(),
        surfaceAreaM2: parseInt(surfaceAreaM2, 10) || 25,
        imageUrl: imageUrl.trim() || undefined,
      };

      const res = await roomsApi.updateRoom(room.id, payload);
      setLoading(false);

      if (res.success) {
        Alert.alert('Éxito', `Habitación ${roomNumber} actualizada correctamente.`);
        onSuccess();
        onClose();
      } else {
        Alert.alert('Error', res.error || 'No se pudo actualizar la habitación.');
      }
    } else {
      const payload: CreateRoomPayload = {
        roomNumber: roomNumber.trim(),
        title: title.trim(),
        type: type.trim(),
        floor: parseInt(floor, 10) || 1,
        capacity: parseInt(capacity, 10) || 2,
        pricePerNight: parseFloat(pricePerNight) || 100,
        bedType: bedType.trim(),
        surfaceAreaM2: parseInt(surfaceAreaM2, 10) || 25,
        imageUrl: imageUrl.trim() || undefined,
      };

      const res = await roomsApi.createRoom(payload);
      setLoading(false);

      if (res.success) {
        Alert.alert('Éxito', `Habitación ${roomNumber} creada con éxito.`);
        onSuccess();
        onClose();
      } else {
        Alert.alert('Error', res.error || 'No se pudo crear la habitación.');
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-slate-900/60 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[90%] overflow-hidden border-t border-slate-200">
          <View className="flex-row justify-between items-center p-4 border-b border-slate-100">
            <View>
              <Text className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                Panel Administrativo
              </Text>
              <Text className="text-[18px] font-black text-slate-900">
                {isEditing ? `Editar Habitación ${room?.roomNumber}` : 'Nueva Habitación'}
              </Text>
            </View>

            <TouchableOpacity
              className="w-8 h-8 rounded-full bg-slate-100 justify-center items-center"
              onPress={onClose}
            >
              <Ionicons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
            <View className="space-y-3 pb-8">
              {/* Número y Título */}
              <View className="flex-row gap-3">
                <View className="w-1/3">
                  <Text className="text-slate-700 text-[12px] font-bold mb-1">N° Habitación *</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 text-[14px]"
                    placeholder="Ej: 301"
                    placeholderTextColor="#94A3B8"
                    value={roomNumber}
                    onChangeText={setRoomNumber}
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-slate-700 text-[12px] font-bold mb-1">Nombre / Título *</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 text-[14px]"
                    placeholder="Ej: Suite Deluxe Marina"
                    placeholderTextColor="#94A3B8"
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>
              </View>

              {/* Tipo y Piso */}
              <View className="flex-row gap-3 mt-2">
                <View className="flex-1">
                  <Text className="text-slate-700 text-[12px] font-bold mb-1">Tipo</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 text-[14px]"
                    placeholder="Ej: Suite / Doble"
                    placeholderTextColor="#94A3B8"
                    value={type}
                    onChangeText={setType}
                  />
                </View>

                <View className="w-1/3">
                  <Text className="text-slate-700 text-[12px] font-bold mb-1">Piso</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 text-[14px] text-center"
                    placeholder="1"
                    keyboardType="numeric"
                    placeholderTextColor="#94A3B8"
                    value={floor}
                    onChangeText={setFloor}
                  />
                </View>
              </View>

              {/* Capacidad y Precio */}
              <View className="flex-row gap-3 mt-2">
                <View className="flex-1">
                  <Text className="text-slate-700 text-[12px] font-bold mb-1">Capacidad (Personas)</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 text-[14px] text-center"
                    placeholder="2"
                    keyboardType="numeric"
                    placeholderTextColor="#94A3B8"
                    value={capacity}
                    onChangeText={setCapacity}
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-slate-700 text-[12px] font-bold mb-1">Precio por Noche (S/) *</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 text-[14px] text-center"
                    placeholder="250"
                    keyboardType="numeric"
                    placeholderTextColor="#94A3B8"
                    value={pricePerNight}
                    onChangeText={setPricePerNight}
                  />
                </View>
              </View>

              {/* Camas y Área */}
              <View className="flex-row gap-3 mt-2">
                <View className="flex-1">
                  <Text className="text-slate-700 text-[12px] font-bold mb-1">Distribución de Camas</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 text-[14px]"
                    placeholder="Ej: 1 Cama King + 1 Twin"
                    placeholderTextColor="#94A3B8"
                    value={bedType}
                    onChangeText={setBedType}
                  />
                </View>

                <View className="w-1/3">
                  <Text className="text-slate-700 text-[12px] font-bold mb-1">Área (m²)</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 text-[14px] text-center"
                    placeholder="30"
                    keyboardType="numeric"
                    placeholderTextColor="#94A3B8"
                    value={surfaceAreaM2}
                    onChangeText={setSurfaceAreaM2}
                  />
                </View>
              </View>

              {/* URL de Imagen */}
              <View className="mt-2">
                <Text className="text-slate-700 text-[12px] font-bold mb-1">URL de Imagen (Opcional)</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 text-[14px]"
                  placeholder="https://images.unsplash.com/..."
                  placeholderTextColor="#94A3B8"
                  value={imageUrl}
                  onChangeText={setImageUrl}
                />
              </View>

              {/* Botón Guardar */}
              <View className="flex-row gap-3 mt-5">
                <TouchableOpacity
                  className="flex-1 bg-slate-100 border border-slate-300 py-3 rounded-xl items-center"
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text className="text-slate-700 font-bold text-[14px]">Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-2 bg-slate-900 py-3 rounded-xl items-center shadow-md active:bg-slate-800"
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-[14px]">
                      {isEditing ? 'Guardar Cambios' : 'Crear Habitación'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
