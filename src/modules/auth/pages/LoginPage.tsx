import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authApi, User } from '../api/auth.api';
import { QuickTestButtons } from '../components/QuickTestButtons';

interface LoginPageProps {
  onAuthSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setAuthError('Por favor ingresa tu correo y contraseña.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    const res = await authApi.login({ email: email.trim(), password });
    setAuthLoading(false);
    if (!res.success) {
      setAuthError(res.error || 'Error al iniciar sesión.');
      return;
    }
    if (res.user) {
      onAuthSuccess(res.user);
    }
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setAuthError('Por favor completa todos los campos requeridos (*).');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    const res = await authApi.register({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      documentNumber: documentNumber.trim(),
    });
    setAuthLoading(false);
    if (!res.success) {
      setAuthError(res.error || 'Error al registrarte.');
      return;
    }
    setAuthSuccess('¡Cuenta creada con éxito! Iniciando sesión...');
    setTimeout(() => {
      if (res.user) {
        onAuthSuccess(res.user);
      }
    }, 900);
  };

  const fillCredentials = (targetEmail: string, _roleName: string) => {
    setEmail(targetEmail);
    setPassword('Aura2026!');
    setAuthError('');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="p-5 justify-center"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Brand */}
          <View className="items-center my-4">
            <View className="w-14 h-14 rounded-full bg-white justify-center items-center mb-2.5 border border-slate-200 shadow-sm">
              <Ionicons name="business" size={28} color="#0F172A" />
            </View>
            <Text className="text-[22px] font-black text-slate-900 tracking-wider">
              AURA GRAND HOTEL
            </Text>
            <Text className="text-[13px] text-slate-500 mt-1 text-center">
              Ingresa a tu cuenta para buscar y reservar
            </Text>
          </View>

          {/* Switch Tab Bar: Iniciar Sesión / Crear Cuenta */}
          <View className="flex-row bg-slate-200 rounded-xl p-1 mb-4">
            <TouchableOpacity
              className={`flex-1 py-2.5 items-center rounded-lg ${isLogin ? 'bg-white shadow-sm' : ''}`}
              onPress={() => {
                setIsLogin(true);
                setAuthError('');
              }}
            >
              <Text className={`text-[14px] ${isLogin ? 'text-slate-900 font-bold' : 'text-slate-500 font-semibold'}`}>
                Iniciar Sesión
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-2.5 items-center rounded-lg ${!isLogin ? 'bg-white shadow-sm' : ''}`}
              onPress={() => {
                setIsLogin(false);
                setAuthError('');
              }}
            >
              <Text className={`text-[14px] ${!isLogin ? 'text-slate-900 font-bold' : 'text-slate-500 font-semibold'}`}>
                Crear Cuenta
              </Text>
            </TouchableOpacity>
          </View>

          {/* Banners de Notificación */}
          {authError ? (
            <View className="bg-red-50 border border-red-300 rounded-xl p-3 mb-3.5">
              <Text className="text-red-600 text-[13px] text-center font-medium">
                {authError}
              </Text>
            </View>
          ) : null}

          {authSuccess ? (
            <View className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 mb-3.5">
              <Text className="text-emerald-600 text-[13px] text-center font-medium">
                {authSuccess}
              </Text>
            </View>
          ) : null}

          {/* Card Principal de Autenticación */}
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            {!isLogin && (
              <>
                <Text className="text-slate-700 text-[13px] font-bold mb-1.5 mt-2">
                  Nombre Completo *
                </Text>
                <TextInput
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-slate-900 text-[15px]"
                  placeholder="Ej: Sofia Morales"
                  placeholderTextColor="#64748B"
                  value={fullName}
                  onChangeText={setFullName}
                />

                <Text className="text-slate-700 text-[13px] font-bold mb-1.5 mt-3">
                  DNI / Pasaporte
                </Text>
                <TextInput
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-slate-900 text-[15px]"
                  placeholder="Ej: 72891045"
                  placeholderTextColor="#64748B"
                  value={documentNumber}
                  onChangeText={setDocumentNumber}
                />
              </>
            )}

            <Text className="text-slate-700 text-[13px] font-bold mb-1.5 mt-2">
              Correo Electrónico *
            </Text>
            <TextInput
              className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-slate-900 text-[15px]"
              placeholder="ejemplo@aurahotel.pe"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text className="text-slate-700 text-[13px] font-bold mb-1.5 mt-3">
              Contraseña *
            </Text>
            <TextInput
              className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-slate-900 text-[15px]"
              placeholder="••••••••"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              className="bg-slate-900 rounded-xl py-3.5 items-center mt-5 shadow-sm active:bg-slate-800"
              onPress={isLogin ? handleLogin : handleRegister}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-[16px] tracking-wide">
                  {isLogin ? 'Entrar a Aura Hotel' : 'Registrarme'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Accesos rápidos dentro del mismo card */}
            {isLogin && <QuickTestButtons onSelect={fillCredentials} />}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
