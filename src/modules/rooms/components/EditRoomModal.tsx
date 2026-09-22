import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room, roomsApi, CreateRoomPayload, UpdateRoomPayload } from '../api/rooms.api';
import { LuxuryButton } from '@/components/LuxuryButton';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';

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
  const [selectedFileUri, setSelectedFileUri] = useState<string | null>(null);
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
      setSelectedFileUri(null);
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
      setSelectedFileUri(null);
    }
  }, [room, visible]);

  if (!visible) return null;

  const handlePickImage = async () => {
    try {
      let ImagePicker: any;
      try {
        ImagePicker = await import('expo-image-picker');
      } catch (err) {
        Alert.alert('Aviso', 'Error al cargar el selector de imágenes.');
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso Denegado', 'Se requiere acceso a la galería para seleccionar la foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setSelectedFileUri(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo seleccionar la imagen.');
    }
  };

  const handleSave = async () => {
    if (!roomNumber.trim() || !title.trim() || !pricePerNight.trim()) {
      Alert.alert('Campos Incompletos', 'Por favor ingresa número de habitación, título y precio.');
      return;
    }

    setLoading(true);

    let createdOrUpdatedRoomId = room?.id;

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
      if (!res.success) {
        setLoading(false);
        Alert.alert('Error', res.error || 'No se pudo actualizar la habitación.');
        return;
      }
      createdOrUpdatedRoomId = room.id;
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
      if (!res.success || !res.room) {
        setLoading(false);
        Alert.alert('Error', res.error || 'No se pudo crear la habitación.');
        return;
      }
      createdOrUpdatedRoomId = res.room.id;
    }

    // Si el usuario seleccionó un archivo de imagen local, subirlo a Firebase Storage vía backend
    if (selectedFileUri && createdOrUpdatedRoomId) {
      console.log(`[EditRoomModal] Subiendo archivo ${selectedFileUri} para habitación ${createdOrUpdatedRoomId}`);
      const uploadRes = await roomsApi.uploadRoomImage(createdOrUpdatedRoomId, selectedFileUri);
      if (!uploadRes.success) {
        console.error(`[EditRoomModal Error Subida]`, uploadRes.error);
        Alert.alert(
          'Habitación Guardada con Advertencia',
          `La habitación se guardó pero hubo un problema al subir la foto a Firebase: \n\n${uploadRes.error || 'Error desconocido'}`
        );
      } else {
        console.log(`[EditRoomModal Éxito Subida]`, uploadRes.room?.imageUrl);
      }
    }

    setLoading(false);
    Alert.alert('Éxito', `Habitación ${roomNumber} guardada correctamente.`);
    onSuccess();
    onClose();
  };

  const previewImage = selectedFileUri || imageUrl;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-slate-900/60 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[92%] overflow-hidden border-t border-slate-200">
          {/* Header del Modal */}
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-slate-100">
            <View>
              <Text className="text-[11px] text-teal-700 font-bold uppercase tracking-wider">
                Panel Administrativo
              </Text>
              <Text className="text-[19px] font-black text-slate-900">
                {isEditing ? `Editar Habitación ${room?.roomNumber}` : 'Nueva Habitación'}
              </Text>
            </View>

            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-slate-100 justify-center items-center active:bg-slate-200"
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-5 pt-3" showsVerticalScrollIndicator={false}>
            <View className="space-y-2 pb-8">
              {/* SUBIDA DE ARCHIVO DE IMAGEN A FIREBASE */}
              <View className="bg-slate-50 border border-slate-200 rounded-2xl p-4 items-center mb-2">
                {previewImage ? (
                  <View className="w-full relative mb-3">
                    <Image
                      source={{ uri: previewImage }}
                      className="w-full h-36 rounded-xl bg-slate-200"
                      resizeMode="cover"
                    />
                    {selectedFileUri && (
                      <View className="absolute top-2 left-2 bg-[#488C8C] px-2.5 py-0.5 rounded-full">
                        <Text className="text-white text-[10px] font-bold">Nuevo Archivo Listo</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View className="w-full h-28 border-2 border-dashed border-slate-300 rounded-xl justify-center items-center mb-3 bg-white">
                    <Ionicons name="image-outline" size={32} color="#94A3B8" />
                    <Text className="text-slate-400 text-[12px] font-medium mt-1">Sin imagen seleccionada</Text>
                  </View>
                )}

                <TouchableOpacity
                  className="bg-[#488C8C] py-2.5 px-4 rounded-xl flex-row items-center gap-2 active:opacity-90 shadow-sm"
                  onPress={handlePickImage}
                >
                  <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
                  <Text className="text-white text-[12px] font-bold">
                    {previewImage ? 'Cambiar Archivo de Imagen' : 'Subir Archivo de Imagen (Firebase)'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Número y Título */}
              <View className="flex-row gap-2.5">
                <View className="w-[38%]">
                  <FloatingLabelInput
                    label="N° Habitación *"
                    iconName="key-outline"
                    value={roomNumber}
                    onChangeText={setRoomNumber}
                  />
                </View>

                <View className="flex-1">
                  <FloatingLabelInput
                    label="Nombre / Título *"
                    iconName="bookmark-outline"
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>
              </View>

              {/* Tipo y Piso */}
              <View className="flex-row gap-2.5">
                <View className="flex-1">
                  <FloatingLabelInput
                    label="Tipo"
                    iconName="bed-outline"
                    value={type}
                    onChangeText={setType}
                  />
                </View>

                <View className="w-[35%]">
                  <FloatingLabelInput
                    label="Piso"
                    iconName="layers-outline"
                    keyboardType="numeric"
                    value={floor}
                    onChangeText={setFloor}
                  />
                </View>
              </View>

              {/* Capacidad y Precio */}
              <View className="flex-row gap-2.5">
                <View className="flex-1">
                  <FloatingLabelInput
                    label="Capacidad (Pers.)"
                    iconName="people-outline"
                    keyboardType="numeric"
                    value={capacity}
                    onChangeText={setCapacity}
                  />
                </View>

                <View className="flex-1">
                  <FloatingLabelInput
                    label="Precio / Noche (S/) *"
                    iconName="pricetag-outline"
                    keyboardType="numeric"
                    value={pricePerNight}
                    onChangeText={setPricePerNight}
                  />
                </View>
              </View>

              {/* Camas y Área */}
              <View className="flex-row gap-2.5">
                <View className="flex-1">
                  <FloatingLabelInput
                    label="Distribución Camas"
                    iconName="bed-outline"
                    value={bedType}
                    onChangeText={setBedType}
                  />
                </View>

                <View className="w-[35%]">
                  <FloatingLabelInput
                    label="Área (m²)"
                    iconName="expand-outline"
                    keyboardType="numeric"
                    value={surfaceAreaM2}
                    onChangeText={setSurfaceAreaM2}
                  />
                </View>
              </View>

              {/* Botones Guardar / Cancelar con LuxuryButton */}
              <View className="flex-row gap-3 pt-4">
                <View className="flex-1">
                  <LuxuryButton
                    title="Cancelar"
                    variant="outline"
                    onPress={onClose}
                    disabled={loading}
                    style={{ width: '100%', marginTop: 0 }}
                  />
                </View>

                <View className="flex-[1.4]">
                  <LuxuryButton
                    title={isEditing ? 'Guardar Cambios' : 'Crear Habitación'}
                    variant="solid"
                    loading={loading}
                    onPress={handleSave}
                    style={{ width: '100%', marginTop: 0 }}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
