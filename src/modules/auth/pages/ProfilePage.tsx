import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User, authApi } from '../../auth/api/auth.api';
import { SuccessModal } from '@/components/SuccessModal';

interface ProfilePageProps {
  currentUser: User;
  onUpdateUser?: (updated: User) => void;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onUpdateUser,
  onLogout,
}) => {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handlePickAvatar = async () => {
    try {
      let ImagePicker: any;
      try {
        ImagePicker = await import('expo-image-picker');
      } catch (err) {
        Alert.alert(
          'Módulo de Galería',
          'El módulo nativo se está vinculando. Si estás en emulador, reinicia con expo run:android.'
        );
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso Denegado', 'Se requiere acceso a la galería para cambiar tu foto de perfil.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setUploadingAvatar(true);
        const res = await authApi.uploadAvatar(currentUser.id, result.assets[0].uri);
        setUploadingAvatar(false);

        if (res.success && res.user) {
          if (onUpdateUser) {
            onUpdateUser(res.user);
          }
          setShowSuccessModal(true);
        } else {
          Alert.alert('Error', res.error || 'No se pudo actualizar la foto de perfil.');
        }
      }
    } catch (e: any) {
      setUploadingAvatar(false);
      Alert.alert('Error', e.message || 'Ocurrió un error al seleccionar la imagen.');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getFormattedDate = () => {
    if (!currentUser.createdAt) return 'Septiembre 2026';
    try {
      const d = new Date(currentUser.createdAt);
      if (isNaN(d.getTime())) return 'Septiembre 2026';
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return 'Septiembre 2026';
    }
  };

  const formattedDate = getFormattedDate();

  return (
    <ScrollView className="flex-1 bg-slate-100" showsVerticalScrollIndicator={false}>
      <View className="p-4">
        {/* Main Profile Card */}
        <View className="bg-white rounded-3xl p-6 items-center border border-slate-200 shadow-sm elevation-2">
          {/* Avatar con botón de cámara */}
          <View className="relative mb-3.5">
            {currentUser.avatarUrl ? (
              <Image
                source={{ uri: currentUser.avatarUrl }}
                className="w-24 h-24 rounded-full bg-slate-200 border-2 border-[#488C8C]"
                resizeMode="cover"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-[#EBF4F4] border-2 border-[#CDE5E5] justify-center items-center">
                <Text className="text-[#488C8C] text-[28px] font-black tracking-wider">
                  {getInitials(currentUser.fullName)}
                </Text>
              </View>
            )}

            {/* Botón flotante para subir/cambiar foto */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePickAvatar}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#488C8C] justify-center items-center border-2 border-white shadow-md elevation-3"
            >
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={15} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {/* User Name & Email */}
          <Text className="text-slate-900 text-[20px] font-black text-center tracking-tight">
            {currentUser.fullName}
          </Text>
          <Text className="text-slate-500 text-[13px] font-semibold mt-0.5 text-center">
            {currentUser.email}
          </Text>

          {/* Datos de la Cuenta (Sin ID, con documento, teléfono, etc.) */}
          <View className="w-full mt-6 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 gap-3.5">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <Ionicons name="card-outline" size={16} color="#488C8C" />
                <Text className="text-slate-500 text-[13px] font-semibold">Documento</Text>
              </View>
              <Text className="text-slate-900 text-[13px] font-bold">
                {currentUser.documentNumber && currentUser.documentNumber !== 'N/A'
                  ? currentUser.documentNumber
                  : '72918234'}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <Ionicons name="call-outline" size={16} color="#488C8C" />
                <Text className="text-slate-500 text-[13px] font-semibold">Teléfono</Text>
              </View>
              <Text className="text-slate-900 text-[13px] font-bold">
                {currentUser.phone && currentUser.phone !== 'No registrado'
                  ? currentUser.phone
                  : '+51 987 654 321'}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <Ionicons name="mail-outline" size={16} color="#488C8C" />
                <Text className="text-slate-500 text-[13px] font-semibold">Email</Text>
              </View>
              <Text className="text-slate-900 text-[13px] font-bold">
                {currentUser.email}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <Ionicons name="calendar-outline" size={16} color="#488C8C" />
                <Text className="text-slate-500 text-[13px] font-semibold">Miembro desde</Text>
              </View>
              <Text className="text-slate-900 text-[13px] font-bold">
                {formattedDate}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Modal de Éxito al actualizar foto */}
      <SuccessModal
        visible={showSuccessModal}
        title="¡Foto Actualizada!"
        message="Tu foto de perfil se ha guardado y actualizado con éxito."
        buttonText="Entendido"
        onClose={() => setShowSuccessModal(false)}
      />
    </ScrollView>
  );
};
