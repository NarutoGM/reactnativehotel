import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { User } from '@/modules/auth/api/auth.api';

interface UserMenuHeaderProps {
  currentUser: User;
  onLogout: () => void;
  onOpenProfile?: () => void;
}

export const UserMenuHeader: React.FC<UserMenuHeaderProps> = ({
  currentUser,
  onLogout,
  onOpenProfile,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(currentUser.fullName);
  const topOffset = Math.max(insets.top, Platform.OS === 'android' ? 52 : 56);

  return (
    <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-slate-200">
      {/* Brand & Greetings */}
      <View className="flex-row items-center gap-2.5">
        <View className="w-9 h-9 rounded-full bg-slate-100 justify-center items-center border border-slate-200">
          <Ionicons name="business" size={18} color="#0F172A" />
        </View>
        <View>
          <Text className="text-[11px] text-slate-500 font-bold tracking-wider">
            AURA GRAND HOTEL
          </Text>
          <Text className="text-[16px] font-black text-slate-900">
            Hola, {currentUser.fullName?.split(' ')[0] || 'Invitado'}
          </Text>
        </View>
      </View>

      {/* Avatar Circle with Initials at the Right */}
      <TouchableOpacity
        className="w-10 h-10 rounded-full bg-slate-900 justify-center items-center shadow-sm border border-slate-700 active:opacity-80"
        onPress={() => setMenuVisible(true)}
      >
        <Text className="text-white font-black text-[14px] tracking-wider">
          {initials}
        </Text>
      </TouchableOpacity>

      {/* Tooltip / Popup Natural y Limpio */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View
            className="flex-1 bg-black/20 justify-start items-end px-4"
            style={{ paddingTop: topOffset }}
          >
            <TouchableWithoutFeedback>
              <View className="w-64 bg-white rounded-2xl p-4 shadow-2xl border border-slate-200">
                {/* Header: Nombre, Correo y Rol limpio y fluido sin cajas pesadas */}
                <View className="pb-3 border-b border-slate-100">
                  <Text className="text-slate-900 font-black text-[15px]" numberOfLines={1}>
                    {currentUser.fullName}
                  </Text>
                  <Text className="text-slate-500 text-[12px] mt-0.5" numberOfLines={1}>
                    {currentUser.email}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <Text className="text-slate-400 text-[11px] font-medium mr-1.5">Rol:</Text>
                    <Text className="text-blue-600 font-bold text-[11px] uppercase tracking-wider">
                      {currentUser.role}
                    </Text>
                  </View>
                </View>

                {/* Acciones directas y limpias */}
                <View className="pt-2">
                  {onOpenProfile && (
                    <TouchableOpacity
                      className="flex-row items-center py-2.5 px-2 rounded-xl active:bg-slate-50"
                      onPress={() => {
                        setMenuVisible(false);
                        onOpenProfile();
                      }}
                    >
                      <Ionicons name="person-outline" size={16} color="#475569" style={{ marginRight: 10 }} />
                      <Text className="text-slate-700 font-semibold text-[13px]">Ver Mi Perfil</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    className="flex-row items-center py-2.5 px-2 rounded-xl active:bg-red-50"
                    onPress={() => {
                      setMenuVisible(false);
                      onLogout();
                    }}
                  >
                    <Ionicons name="log-out-outline" size={16} color="#DC2626" style={{ marginRight: 10 }} />
                    <Text className="text-red-600 font-bold text-[13px]">Cerrar Sesión</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};
