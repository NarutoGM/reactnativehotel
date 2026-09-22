import React from 'react';
import { View, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LuxuryButton } from './LuxuryButton';

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  variant?: 'danger' | 'brand';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  iconName = 'trash-outline',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const isDanger = variant === 'danger';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-slate-900/65 justify-center items-center p-5">
        <View className="bg-white rounded-[24px] p-6 w-full max-w-[360px] items-center shadow-2xl elevation-10 border border-slate-100">
          {/* Icon Circle con tono Brand */}
          <View className="w-16 h-16 rounded-full bg-[#EBF4F4] border border-[#D1E7E7] justify-center items-center mb-3.5">
            <Ionicons
              name={iconName}
              size={32}
              color="#488C8C"
            />
          </View>

          {/* Title */}
          <Text className="text-slate-900 text-[19px] font-black text-center tracking-tight">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-slate-500 text-[13px] font-medium text-center mt-2 leading-5 px-2">
            {message}
          </Text>

          {/* Action Buttons: Variante 2 (Gradient / Contorno Premium) & Variante 1 (Solid Brand) */}
          <View className="flex-row gap-3 w-full mt-6">
            <View className="flex-1">
              <LuxuryButton
                title={cancelText}
                variant="outline"
                size="md"
                onPress={onCancel}
                disabled={loading}
                style={{ width: '100%', marginTop: 0 }}
              />
            </View>

            <View className="flex-1">
              <LuxuryButton
                title={confirmText}
                variant="solid"
                size="md"
                loading={loading}
                onPress={onConfirm}
                style={{ width: '100%', marginTop: 0 }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
