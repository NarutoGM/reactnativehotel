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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.brandBox}>
            <View style={styles.brandIconCircle}>
              <Ionicons name="business" size={30} color="#0F172A" />
            </View>
            <Text style={styles.brandTitle}>AURA GRAND HOTEL</Text>
            <Text style={styles.brandSubtitle}>Ingresa a tu cuenta para buscar y reservar</Text>
          </View>

          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabBtn, isLogin && styles.tabBtnActive]}
              onPress={() => {
                setIsLogin(true);
                setAuthError('');
              }}
            >
              <Text style={[styles.tabBtnText, isLogin && styles.tabBtnTextActive]}>Iniciar Sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, !isLogin && styles.tabBtnActive]}
              onPress={() => {
                setIsLogin(false);
                setAuthError('');
              }}
            >
              <Text style={[styles.tabBtnText, !isLogin && styles.tabBtnTextActive]}>Crear Cuenta</Text>
            </TouchableOpacity>
          </View>

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

          <View style={styles.authCard}>
            {!isLogin && (
              <>
                <Text style={styles.label}>Nombre Completo *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Sofia Morales"
                  placeholderTextColor="#64748B"
                  value={fullName}
                  onChangeText={setFullName}
                />

                <Text style={styles.label}>DNI / Pasaporte</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 72891045"
                  placeholderTextColor="#64748B"
                  value={documentNumber}
                  onChangeText={setDocumentNumber}
                />
              </>
            )}

            <Text style={styles.label}>Correo Electrónico *</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@aurahotel.pe"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Contraseña *</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={isLogin ? handleLogin : handleRegister}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isLogin ? 'Entrar a Aura Hotel' : 'Registrarme'}
                </Text>
              )}
            </TouchableOpacity>

            {isLogin && <QuickTestButtons onSelect={fillCredentials} />}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scroll: {
    padding: 20,
    justifyContent: 'center',
  },
  brandBox: {
    alignItems: 'center',
    marginVertical: 18,
  },
  brandIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
  },
  tabBtnTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  successBanner: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  successText: {
    color: '#16A34A',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    shadowColor: '#64748B',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0F172A',
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
