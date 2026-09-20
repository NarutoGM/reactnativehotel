import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../auth/api/auth.api';

interface ProfilePageProps {
  currentUser: User;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, onLogout }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={36} color="#0F172A" />
        </View>
        <Text style={styles.name}>{currentUser.fullName}</Text>
        <Text style={styles.email}>{currentUser.email}</Text>

        <View style={styles.badgeRole}>
          <Text style={styles.badgeRoleText}>{currentUser.role}</Text>
        </View>

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Documento</Text>
            <Text style={styles.infoVal}>{currentUser.documentNumber || 'No registrado'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID de Usuario</Text>
            <Text style={styles.infoVal}>{currentUser.id?.slice(0, 10)}...</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={18} color="#DC2626" style={{ marginRight: 6 }} />
          <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  name: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  email: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  badgeRole: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 18,
  },
  badgeRoleText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '800',
  },
  infoList: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  infoVal: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    width: '100%',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
