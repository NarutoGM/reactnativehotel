import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GuestPickerModalProps {
  visible: boolean;
  capacity: string;
  onSelect: (val: string) => void;
  onClose: () => void;
}

const PRESET_CAPACITIES = [1, 2, 3, 4, 5, 6];

export const GuestPickerModal: React.FC<GuestPickerModalProps> = ({
  visible,
  capacity,
  onSelect,
  onClose,
}) => {
  const currentCount = parseInt(capacity, 10) || 2;

  if (!visible) return null;

  const handleIncrement = () => {
    if (currentCount < 10) {
      onSelect(String(currentCount + 1));
    }
  };

  const handleDecrement = () => {
    if (currentCount > 1) {
      onSelect(String(currentCount - 1));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-slate-900/45 justify-center items-center p-5">
          <TouchableWithoutFeedback>
            <View className="w-full max-w-[320px] bg-white rounded-3xl p-5 shadow-2xl elevation-8 border border-slate-200">
              {/* Header */}
              <View className="flex-row justify-between items-center pb-3 border-b border-slate-100">
                <View>
                  <Text className="text-[10px] font-extrabold text-slate-400 tracking-wider">FILTRO DE HABITACIÓN</Text>
                  <Text className="text-[17px] font-black text-slate-900 mt-0.5">Huéspedes</Text>
                </View>
                <TouchableOpacity
                  className="w-8 h-8 rounded-full bg-slate-100 justify-center items-center"
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Stepper Principal */}
              <View className="flex-row justify-center items-center py-4.5">
                <View className="flex-row items-center gap-2.5">
                  <TouchableOpacity
                    className={`w-8.5 h-8.5 rounded-full border border-slate-200 bg-white justify-center items-center ${
                      currentCount <= 1 ? 'border-slate-100 bg-slate-50 opacity-40' : ''
                    }`}
                    onPress={handleDecrement}
                    disabled={currentCount <= 1}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="remove"
                      size={18}
                      color={currentCount <= 1 ? '#CBD5E1' : '#0F172A'}
                    />
                  </TouchableOpacity>

                  <Text className="text-[16px] font-black text-slate-900 min-w-[20px] text-center">
                    {currentCount}
                  </Text>

                  <TouchableOpacity
                    className={`w-8.5 h-8.5 rounded-full border border-slate-200 bg-white justify-center items-center ${
                      currentCount >= 10 ? 'border-slate-100 bg-slate-50 opacity-40' : ''
                    }`}
                    onPress={handleIncrement}
                    disabled={currentCount >= 10}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="add"
                      size={18}
                      color={currentCount >= 10 ? '#CBD5E1' : '#0F172A'}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Botones de Selección Rápida */}
              <View className="flex-row flex-wrap gap-1.5 pt-1 pb-3.5">
                {PRESET_CAPACITIES.map((num) => {
                  const isSelected = currentCount === num;
                  return (
                    <TouchableOpacity
                      key={num}
                      className={`py-1.5 px-2.5 rounded-xl border ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900'
                          : 'bg-slate-100 border-slate-200'
                      }`}
                      onPress={() => onSelect(String(num))}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-[11.5px] font-bold ${
                          isSelected ? 'text-white' : 'text-slate-600'
                        }`}
                      >
                        {num} pers.
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Botón Aplicar */}
              <TouchableOpacity
                className="bg-slate-900 rounded-xl py-3 items-center shadow-sm elevation-2"
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text className="text-white text-[13.5px] font-extrabold">Listo</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
