import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickTestButtonsProps {
  onSelect: (email: string, roleName: string) => void;
}

export const QuickTestButtons: React.FC<QuickTestButtonsProps> = ({ onSelect }) => {
  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.title}>Accesos de prueba rápidos</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => onSelect('huesped@aurahotel.pe', 'Huésped')}
        >
          <Ionicons name="person-outline" size={15} color="#475569" style={{ marginBottom: 2 }} />
          <Text style={styles.btnText}>Huésped</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => onSelect('recepcion@aurahotel.pe', 'Recepción')}
        >
          <Ionicons name="desktop-outline" size={15} color="#475569" style={{ marginBottom: 2 }} />
          <Text style={styles.btnText}>Recepción</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.adminBtn]}
          onPress={() => onSelect('admin@aurahotel.pe', 'Admin')}
        >
          <Ionicons name="shield-checkmark-outline" size={15} color="#EA580C" style={{ marginBottom: 2 }} />
          <Text style={[styles.btnText, styles.adminBtnText]}>Admin</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>Contraseña única: Aura2026!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  title: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },
  adminBtn: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    borderWidth: 1,
  },
  adminBtnText: {
    color: '#EA580C',
  },
  hint: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
});
