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
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { authApi, User } from '../api/auth.api';
import { QuickTestButtons } from '../components/QuickTestButtons';
import { FloatingLabelInput } from '../../../components/FloatingLabelInput';

const { width } = Dimensions.get('window');

interface LoginPageProps {
  onAuthSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    <View style={styles.container}>
      <StatusBar style="light" translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Top Hero Section con Imagen y Corte Diagonal */}
          <View style={styles.heroWrapper}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop',
              }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            
            {/* Corte Diagonal Blanco Perfecto */}
            <View style={styles.diagonalCut} />
          </View>

          {/* Badge Circular Centrado Flotando sobre el Corte Diagonal (Sin recortes) */}
          <View style={styles.circleBadge}>
            <Text style={styles.circleBadgeText}>Aura</Text>
            <Text style={styles.circleBadgeSub}>HOTEL</Text>
          </View>

          {/* Formulario Limpio estilo Minimalista */}
          <View style={styles.formContent}>
            {/* Título del Formulario */}
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {isLogin ? 'Acceder' : 'Crear Cuenta'}
              </Text>
              <Text style={styles.formSubtitle}>
                {isLogin
                  ? 'Ingresa tus credenciales para continuar'
                  : 'Regístrate para reservar habitaciones'}
              </Text>
            </View>

            {/* Notificaciones de Error / Éxito */}
            {authError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            ) : null}

            {authSuccess ? (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>{authSuccess}</Text>
              </View>
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

            {/* Botón Principal (Color Coral / Rose Acorde al Mockup) */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={isLogin ? handleLogin : handleRegister}
              disabled={authLoading}
              activeOpacity={0.85}
            >
              {authLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isLogin ? 'SIGN IN' : 'SIGN UP'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle Inferior Registro / Login */}
            <TouchableOpacity
              style={styles.toggleFooter}
              onPress={() => {
                setIsLogin((prev) => !prev);
                setAuthError('');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleFooterText}>
                {isLogin ? "DON'T HAVE AN ACCOUNT? " : 'ALREADY HAVE AN ACCOUNT? '}
                <Text style={styles.toggleFooterBold}>
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 30,
  },
  heroWrapper: {
    height: 190,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  heroImage: {
    width: '100%',
    height: 215,
  },
  diagonalCut: {
    position: 'absolute',
    bottom: -45,
    left: -80,
    right: -80,
    height: 90,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-6deg' }],
  },
  circleBadge: {
    position: 'absolute',
    top: 48, // Centrado perfecto en la cabecera reducida
    alignSelf: 'center',
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#E74C60', // Color Coral/Rose
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 50,
  },
  circleBadgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'Sora_800ExtraBold',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  circleBadgeSub: {
    color: '#FFE4E6',
    fontSize: 8.5,
    fontWeight: '800',
    fontFamily: 'Sora_700Bold',
    letterSpacing: 1.5,
    marginTop: -2,
  },
  formContent: {
    paddingHorizontal: 26,
    paddingTop: 10,
  },
  formHeader: {
    marginBottom: 14,
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'Sora_800ExtraBold',
    color: '#0F172A',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#E74C60', // Mismo tono Coral / Rose del badge
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#E74C60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'Sora_700Bold',
    letterSpacing: 1.5,
  },
  toggleFooter: {
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 6,
  },
  toggleFooterText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    fontFamily: 'Sora_600SemiBold',
    letterSpacing: 0.8,
  },
  toggleFooterBold: {
    color: '#0F172A',
    fontWeight: '900',
    fontFamily: 'Sora_800ExtraBold',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  successBanner: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  successText: {
    color: '#16A34A',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
});
