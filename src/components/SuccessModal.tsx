import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LuxuryButton } from './LuxuryButton';

export interface SuccessModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  buttonText?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  badgeText?: string;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  title = '¡Operación Exitosa!',
  message = 'La acción se ha completado correctamente en el sistema.',
  buttonText = 'Entendido',
  iconName = 'checkmark-done',
  badgeText,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-slate-900/65 justify-center items-center p-5">
        <View className="bg-white rounded-[24px] p-6 w-full max-w-[360px] items-center shadow-2xl elevation-10 border border-slate-100">
          {/* Icon Circle */}
          <View className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 justify-center items-center mb-3.5">
            <Ionicons name={iconName} size={34} color="#16A34A" />
          </View>

          {/* Title */}
          <Text className="text-slate-900 text-[19px] font-black text-center tracking-tight">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-slate-500 text-[13px] font-medium text-center mt-2 leading-5 px-2">
            {message}
          </Text>

          {/* Optional Badge */}
          {badgeText ? (
            <View className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 mt-3.5 items-center">
              <Text className="text-slate-700 text-[12px] font-bold tracking-wide">
                {badgeText}
              </Text>
            </View>
          ) : null}

          {/* Action Button */}
          <View className="w-full mt-5">
            <LuxuryButton
              title={buttonText}
              variant="solid"
              onPress={onClose}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
