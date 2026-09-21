import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
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
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.titleLabel}>FILTRO DE HABITACIÓN</Text>
                  <Text style={styles.titleText}>Huéspedes</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Stepper Principal */}
              <View style={styles.stepperContainer}>
                <View style={styles.stepperButtons}>
                  <TouchableOpacity
                    style={[styles.stepBtn, currentCount <= 1 && styles.stepBtnDisabled]}
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

                  <Text style={styles.stepValue}>{currentCount}</Text>

                  <TouchableOpacity
                    style={[styles.stepBtn, currentCount >= 10 && styles.stepBtnDisabled]}
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
              <View style={styles.presetsRow}>
                {PRESET_CAPACITIES.map((num) => {
                  const isSelected = currentCount === num;
                  return (
                    <TouchableOpacity
                      key={num}
                      style={[styles.presetPill, isSelected && styles.presetPillActive]}
                      onPress={() => onSelect(String(num))}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.presetPillText,
                          isSelected && styles.presetPillTextActive,
                        ]}
                      >
                        {num} {num === 1 ? 'pers.' : 'pers.'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Botón Aplicar */}
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.applyBtnText}>Listo</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleLabel: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'Sora_700Bold',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '900',
    fontFamily: 'Sora_800ExtraBold',
    color: '#0F172A',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
  },
  stepperLabel: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    color: '#0F172A',
  },
  stepperSubtext: {
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
    color: '#64748B',
    marginTop: 2,
  },
  stepperButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnDisabled: {
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  stepValue: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Sora_800ExtraBold',
    color: '#0F172A',
    minWidth: 20,
    textAlign: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 4,
    paddingBottom: 14,
  },
  presetPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  presetPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    color: '#64748B',
  },
  presetPillTextActive: {
    color: '#FFFFFF',
  },
  applyBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    fontFamily: 'Sora_700Bold',
  },
});
