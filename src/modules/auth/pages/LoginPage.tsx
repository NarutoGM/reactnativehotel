import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { authApi, User } from '../api/auth.api';
import { QuickTestButtons } from '../components/QuickTestButtons';
import { FloatingLabelInput } from '../../../components/FloatingLabelInput';
import { LuxuryButton } from '../../../components/LuxuryButton';

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
      setAuthError('Por favor completa todos los campos requeridos.');
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
    <View className="flex-1 bg-white">
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 bg-white"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Top Hero Section con Imagen y Corte Diagonal */}
          <View className="h-[190px] w-full relative overflow-hidden bg-slate-900">
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop',
              }}
              className="w-full h-[215px]"
              resizeMode="cover"
            />

            {/* Corte Diagonal Blanco */}
            <View
              className="absolute -bottom-[45px] -left-[80px] -right-[80px] h-[90px] bg-white"
              style={{ transform: [{ rotate: '-6deg' }] }}
            />
          </View>

          {/* Badge Circular Centrado Flotando sobre el Corte Diagonal */}
          <View
            className="absolute top-12 self-center w-[78px] h-[78px] rounded-full justify-center items-center shadow-lg z-50"
            style={styles.circleBadge}
          >
            <Text className="text-white text-[18px] font-black tracking-wide text-center">
              Aura
            </Text>
            <Text className="text-[#E6F4F4] text-[8.5px] font-extrabold tracking-widest -mt-0.5">
              HOTEL
            </Text>
          </View>

          {/* Formulario Limpio estilo Minimalista con Tailwind */}
          <View className="px-6.5 pt-2.5">
            {/* Título del Formulario */}
            <View className="mb-3.5 items-center">
              <Text className="text-[20px] font-black text-slate-900 tracking-tight text-center">
                {isLogin ? 'Acceder' : 'Crear Cuenta'}
              </Text>
              <Text className="text-[12px] text-slate-500 mt-0.5 text-center">
                {isLogin
                  ? 'Ingresa tus credenciales para continuar'
                  : 'Regístrate para reservar habitaciones'}
              </Text>
            </View>

            {/* Notificaciones de Error / Éxito */}
            {authError ? (
              <Text className="text-red-500 text-[12.5px] text-center font-semibold my-1.5">
                {authError}
              </Text>
            ) : null}

            {authSuccess ? (
              <Text className="text-emerald-500 text-[12.5px] text-center font-semibold my-1.5">
                {authSuccess}
              </Text>
            ) : null}

            {!isLogin && (
              <>
                <FloatingLabelInput
                  label="Nombre Completo"
                  iconName="person-outline"
                  value={fullName}
                  onChangeText={setFullName}
                />

                <FloatingLabelInput
                  label="DNI / Pasaporte"
                  iconName="card-outline"
                  value={documentNumber}
                  onChangeText={setDocumentNumber}
                />
              </>
            )}

            <FloatingLabelInput
              label="Correo Electrónico"
              iconName="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <FloatingLabelInput
              label="Contraseña"
              iconName="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              isPassword
            />

            {/* Botón Principal Reutilizable (LuxuryButton) */}
            <LuxuryButton
              title={isLogin ? 'SIGN IN' : 'SIGN UP'}
              onPress={isLogin ? handleLogin : handleRegister}
              loading={authLoading}
              variant="solid"
            />

            {/* Toggle Inferior Registro / Login */}
            <TouchableOpacity
              className="items-center mt-4.5 py-1.5"
              onPress={() => {
                setIsLogin((prev) => !prev);
                setAuthError('');
              }}
              activeOpacity={0.7}
            >
              <Text className="text-[11px] text-slate-400 font-semibold tracking-wider">
                {isLogin ? "DON'T HAVE AN ACCOUNT? " : 'ALREADY HAVE AN ACCOUNT? '}
                <Text className="text-[#488C8C] font-black">
                  {isLogin ? 'SIGN UP' : 'SIGN IN'}
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Accesos Rápidos de Prueba */}
            {isLogin && <QuickTestButtons selectedEmail={email} onSelect={fillCredentials} />}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 30,
  },
  circleBadge: {
    backgroundColor: '#488C8C',
    shadowColor: '#488C8C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
});
