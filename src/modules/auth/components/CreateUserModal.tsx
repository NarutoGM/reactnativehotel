import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authApi, RegisterPayload } from '../api/auth.api';
import { LuxuryButton } from '@/components/LuxuryButton';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';

interface CreateUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'RECEPTIONIST' | 'GUEST'>('GUEST');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setDocumentNumber('');
    setPhone('');
    setRole('GUEST');
    setLoading(false);
  };

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Campos Obligatorios', 'Por favor ingresa nombre completo, correo y contraseña.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Correo Inválido', 'Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Contraseña Corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    const payload: RegisterPayload = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      documentNumber: documentNumber.trim() || 'N/A',
      phone: phone.trim() || 'No registrado',
      role,
    };

    const res = await authApi.createUser(payload);
    setLoading(false);

    if (res.success) {
      Alert.alert('¡Usuario Creado!', `El usuario ${fullName} (${role}) ha sido creado exitosamente.`);
      resetForm();
      onSuccess();
      onClose();
    } else {
      Alert.alert('Error', res.error || 'No se pudo crear el usuario.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-end sm:justify-center items-center p-0 sm:p-4">
        <View className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92%] flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-200 bg-slate-50">
            <View className="flex-row items-center gap-2.5">
              <View className="w-9 h-9 rounded-xl bg-[#EBF4F4] items-center justify-center">
                <Ionicons name="person-add" size={20} color="#488C8C" />
              </View>
              <View>
                <Text className="text-[17px] font-black text-slate-900">
                  Nuevo Usuario
                </Text>
                <Text className="text-[11.5px] font-medium text-slate-500">
                  Registrar huésped, recepcionista o admin
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/70 items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Form Scrollable Body */}
          <ScrollView
            className="p-5"
            contentContainerStyle={{ paddingBottom: 25 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Rol de Usuario (Select) */}
            <View className="mb-2">
              <Text className="text-[11.5px] font-bold text-slate-600 mb-1.5 ml-1">
                Rol del Usuario *
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setRoleDropdownOpen(true)}
                className="bg-[#F8FAFC] border-[1.2px] border-slate-300 rounded-2xl px-4 py-3 flex-row justify-between items-center"
              >
                <View className="flex-row items-center gap-2.5">
                  <View
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        role === 'ADMIN'
                          ? '#0A3B7B'
                          : role === 'RECEPTIONIST'
                          ? '#488C8C'
                          : '#10B981',
                    }}
                  />
                  <Text className="text-[13.5px] font-bold text-slate-800">
                    {role === 'ADMIN'
                      ? 'Administrador (Acceso total)'
                      : role === 'RECEPTIONIST'
                      ? 'Recepcionista (Gestión & Tablero)'
                      : 'Huésped (Reservas & Catálogo)'}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Datos Personales */}
            <FloatingLabelInput
              label="Nombre Completo *"
              iconName="person-outline"
              value={fullName}
              onChangeText={setFullName}
            />

            <FloatingLabelInput
              label="Correo Electrónico *"
              iconName="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <FloatingLabelInput
              label="Contraseña (Mínimo 6 caracteres) *"
              iconName="lock-closed-outline"
              isPassword
              value={password}
              onChangeText={setPassword}
            />

            <View className="flex-row gap-2.5">
              <View className="flex-1">
                <FloatingLabelInput
                  label="DNI / Pasaporte"
                  iconName="card-outline"
                  keyboardType="numeric"
                  value={documentNumber}
                  onChangeText={setDocumentNumber}
                />
              </View>
              <View className="flex-1">
                <FloatingLabelInput
                  label="Teléfono / Celular"
                  iconName="call-outline"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            {/* Botones de Acción */}
            <View className="flex-row gap-3 pt-4 mt-2">
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
                  title="Crear Usuario"
                  variant="solid"
                  iconName="person-add"
                  loading={loading}
                  onPress={handleSave}
                  style={{ width: '100%', marginTop: 0 }}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Modal Selector de Rol */}
      <Modal
        visible={roleDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRoleDropdownOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end sm:justify-center items-center px-4"
          activeOpacity={1}
          onPress={() => setRoleDropdownOpen(false)}
        >
          <View
            className="w-full max-w-[380px] bg-white rounded-3xl p-5 mb-6 sm:mb-0 shadow-2xl border border-slate-100"
            onStartShouldSetResponder={() => true}
          >
            <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100 mb-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="shield-outline" size={20} color="#488C8C" />
                <Text className="text-[16px] font-black text-slate-900">
                  Seleccionar Rol
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setRoleDropdownOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View className="gap-2.5">
              {[
                {
                  value: 'ADMIN' as const,
                  label: 'Administrador',
                  desc: 'Control total de usuarios, habitaciones y tablero',
                  color: '#0A3B7B',
                  bg: '#EFF6FF',
                  icon: 'shield-checkmark',
                },
                {
                  value: 'RECEPTIONIST' as const,
                  label: 'Recepcionista',
                  desc: 'Gestión de habitaciones, reservas y check-in/out',
                  color: '#488C8C',
                  bg: '#EBF4F4',
                  icon: 'key',
                },
                {
                  value: 'GUEST' as const,
                  label: 'Huésped',
                  desc: 'Explorar habitaciones y crear sus propias reservas',
                  color: '#10B981',
                  bg: '#ECFDF5',
                  icon: 'person',
                },
              ].map((opt) => {
                const isSelected = role === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    activeOpacity={0.7}
                    onPress={() => {
                      setRole(opt.value);
                      setRoleDropdownOpen(false);
                    }}
                    style={{
                      backgroundColor: isSelected ? opt.bg : '#F8FAFC',
                      borderColor: isSelected ? opt.color : '#E2E8F0',
                      borderWidth: isSelected ? 2 : 1,
                    }}
                    className="p-3.5 rounded-2xl flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center"
                        style={{ backgroundColor: opt.bg }}
                      >
                        <Ionicons name={opt.icon as any} size={20} color={opt.color} />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-[14px] font-bold"
                          style={{ color: isSelected ? opt.color : '#1E293B' }}
                        >
                          {opt.label}
                        </Text>
                        <Text className="text-[11.5px] text-slate-500 font-medium mt-0.5">
                          {opt.desc}
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color={opt.color} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
};
