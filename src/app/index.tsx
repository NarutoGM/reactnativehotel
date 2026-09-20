import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService, User } from '@/services/auth.service';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [role, setRole] = useState<'GUEST' | 'RECEPTIONIST' | 'ADMIN'>('GUEST');

  // Quick fill credentials
  const fillCredentials = (userEmail: string, roleName: string) => {
    setEmail(userEmail);
    setPassword('Aura2026!');
    setErrorMessage('');
    setSuccessMessage(`Datos cargados para: ${roleName}`);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const res = await authService.login({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });

    setLoading(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
      setSuccessMessage(`¡Bienvenido de nuevo, ${res.user.fullName}!`);
    } else {
      setErrorMessage(res.error || 'Credenciales inválidas.');
    }
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Por favor completa los campos obligatorios.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const res = await authService.register({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      documentNumber: documentNumber.trim() || 'N/A',
      role,
    });

    setLoading(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
      setSuccessMessage('¡Cuenta creada exitosamente en Aura Hotel!');
    } else {
      setErrorMessage(res.error || 'No se pudo crear la cuenta.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setSuccessMessage('');
    setErrorMessage('');
  };

  // 1. Pantalla cuando el usuario ya ha iniciado sesión
  if (currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loggedCard}>
          <Text style={styles.badgeRole}>
            {currentUser.role === 'ADMIN'
              ? '🛡️ ADMINISTRADOR'
              : currentUser.role === 'RECEPTIONIST'
              ? '🛎️ RECEPCIÓN'
              : '👤 HUÉSPED'}
          </Text>

          <Text style={styles.loggedTitle}>Sesión Iniciada</Text>
          <Text style={styles.loggedName}>{currentUser.fullName}</Text>
          <Text style={styles.loggedEmail}>{currentUser.email}</Text>
          <Text style={styles.loggedDoc}>
            Doc / DNI: {currentUser.documentNumber}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.backendStatus}>
            Conectado al backend Neon PostgreSQL ✨
          </Text>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 2. Pantalla de Login / Registro
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Brand */}
          <View style={styles.brandContainer}>
            <Text style={styles.hotelLogo}>🏨 AURA GRAND HOTEL</Text>
            <Text style={styles.hotelSubtitle}>
              Gestión Hotelera y Experiencia de Huéspedes
            </Text>
          </View>

          {/* Selector de Pestañas */}
          <View style={styles.tabSelector}>
            <TouchableOpacity
              style={[styles.tabButton, isLogin && styles.tabButtonActive]}
              onPress={() => {
                setIsLogin(true);
                setErrorMessage('');
                setSuccessMessage('');
              }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  isLogin && styles.tabButtonTextActive,
                ]}
              >
                Iniciar Sesión
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, !isLogin && styles.tabButtonActive]}
              onPress={() => {
                setIsLogin(false);
                setErrorMessage('');
                setSuccessMessage('');
              }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  !isLogin && styles.tabButtonTextActive,
                ]}
              >
                Crear Cuenta
              </Text>
            </TouchableOpacity>
          </View>

          {/* Alertas */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* Formulario */}
          <View style={styles.card}>
            {!isLogin && (
              <>
                <Text style={styles.inputLabel}>Nombre y Apellidos *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Sofia Morales"
                  placeholderTextColor="#94A3B8"
                  value={fullName}
                  onChangeText={setFullName}
                />

                <Text style={styles.inputLabel}>DNI o Pasaporte</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 72891045"
                  placeholderTextColor="#94A3B8"
                  value={documentNumber}
                  onChangeText={setDocumentNumber}
                />
              </>
            )}

            <Text style={styles.inputLabel}>Correo Electrónico *</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@aurahotel.pe"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.inputLabel}>Contraseña *</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.mainButton}
              onPress={isLogin ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.mainButtonText}>
                  {isLogin ? 'Entrar al Sistema' : 'Registrar Cuenta'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Accesos rápidos de prueba */}
          {isLogin && (
            <View style={styles.quickAccessCard}>
              <Text style={styles.quickAccessTitle}>
                Accesos rápidos de prueba (Neon DB):
              </Text>
              <View style={styles.quickButtonsRow}>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() =>
                    fillCredentials('huesped@aurahotel.pe', 'Huésped Demo')
                  }
                >
                  <Text style={styles.quickButtonText}>👤 Huésped</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() =>
                    fillCredentials('recepcion@aurahotel.pe', 'Recepción')
                  }
                >
                  <Text style={styles.quickButtonText}>🛎️ Recepción</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickButton, styles.quickButtonAdmin]}
                  onPress={() =>
                    fillCredentials('admin@aurahotel.pe', 'Administrador')
                  }
                >
                  <Text style={[styles.quickButtonText, styles.quickButtonAdminText]}>
                    🛡️ Admin
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.quickNote}>
                Contraseña unificada: Aura2026!
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  brandContainer: {
    alignItems: 'center',
    marginVertical: 18,
  },
  hotelLogo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 1.2,
  },
  hotelSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#2563EB',
  },
  tabButtonText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 14,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: '#22C55E',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  successText: {
    color: '#86EFAC',
    fontSize: 13,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  inputLabel: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
  },
  mainButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quickAccessCard: {
    marginTop: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 14,
    padding: 14,
    borderColor: '#334155',
    borderWidth: 1,
  },
  quickAccessTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  quickButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  quickButtonAdmin: {
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
    borderColor: '#F97316',
    borderWidth: 1,
  },
  quickButtonAdminText: {
    color: '#FB923C',
  },
  quickNote: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
  loggedCard: {
    margin: 20,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderColor: '#334155',
    borderWidth: 1,
  },
  badgeRole: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
  },
  loggedTitle: {
    fontSize: 14,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loggedName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
    textAlign: 'center',
  },
  loggedEmail: {
    fontSize: 14,
    color: '#38BDF8',
    marginTop: 4,
  },
  loggedDoc: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    width: '100%',
    marginVertical: 20,
  },
  backendStatus: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
