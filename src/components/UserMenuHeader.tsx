import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
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

  // Obtener iniciales (ej: "Carlos Pantoja" -> "CP")
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(currentUser.fullName);

  return (
    <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-slate-200 z-50">
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

      {/* Tooltip / Dropdown Modal */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View className="flex-1 bg-slate-900/30 justify-start items-end p-4 pt-14">
            <TouchableWithoutFeedback>
              <View className="w-64 bg-white rounded-2xl p-4 shadow-xl border border-slate-200 mt-2">
                {/* Header User Details */}
                <View className="flex-row items-center gap-3 pb-3 border-b border-slate-100">
                  <View className="w-11 h-11 rounded-full bg-slate-900 justify-center items-center">
                    <Text className="text-white font-black text-[15px]">
                      {initials}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-900 font-black text-[14px]" numberOfLines={1}>
                      {currentUser.fullName}
                    </Text>
                    <Text className="text-slate-500 text-[11px]" numberOfLines={1}>
                      {currentUser.email}
                    </Text>
                  </View>
                </View>

                {/* Role badge */}
                <View className="flex-row items-center justify-between my-2.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                  <Text className="text-slate-500 text-[11px] font-bold">Rol:</Text>
                  <View className="bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    <Text className="text-blue-700 text-[10px] font-black">
                      {currentUser.role}
                    </Text>
                  </View>
                </View>

                {/* Optional View Profile */}
                {onOpenProfile && (
                  <TouchableOpacity
                    className="flex-row items-center py-2.5 px-2 rounded-xl active:bg-slate-50"
                    onPress={() => {
                      setMenuVisible(false);
                      onOpenProfile();
                    }}
                  >
                    <Ionicons name="person-outline" size={17} color="#475569" style={{ marginRight: 8 }} />
                    <Text className="text-slate-700 font-bold text-[13px]">Ver Mi Perfil</Text>
                  </TouchableOpacity>
                )}

                {/* Logout Option */}
                <TouchableOpacity
                  className="flex-row items-center py-2.5 px-2 mt-1 rounded-xl bg-red-50 border border-red-200 active:bg-red-100"
                  onPress={() => {
                    setMenuVisible(false);
                    onLogout();
                  }}
                >
                  <Ionicons name="log-out-outline" size={17} color="#DC2626" style={{ marginRight: 8 }} />
                  <Text className="text-red-600 font-bold text-[13px]">Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};
