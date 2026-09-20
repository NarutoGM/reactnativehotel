import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickTestButtonsProps {
  onSelect: (email: string, roleName: string) => void;
}

export const QuickTestButtons: React.FC<QuickTestButtonsProps> = ({ onSelect }) => {
  return (
    <View style={styles.container} className="mt-5 pt-4 border-t border-slate-100">
      <View style={styles.divider} className="flex-row items-center mb-3">
        <View style={styles.line} className="flex-1 h-[1px] bg-slate-200" />
        <Text style={styles.title} className="text-slate-400 text-[11px] font-bold px-2 uppercase tracking-wider">
          Accesos de prueba rápidos
        </Text>
        <View style={styles.line} className="flex-1 h-[1px] bg-slate-200" />
      </View>

      <View style={styles.row} className="flex-row gap-2">
        <TouchableOpacity
          style={styles.btn}
          className="flex-1 bg-slate-50 py-2.5 rounded-lg items-center border border-slate-200 active:bg-slate-100"
          onPress={() => onSelect('huesped@aurahotel.pe', 'Huésped')}
        >
          <Ionicons name="person-outline" size={15} color="#475569" style={{ marginBottom: 2 }} />
          <Text style={styles.btnText} className="text-slate-600 text-[11px] font-bold">Huésped</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          className="flex-1 bg-slate-50 py-2.5 rounded-lg items-center border border-slate-200 active:bg-slate-100"
          onPress={() => onSelect('recepcion@aurahotel.pe', 'Recepción')}
        >
          <Ionicons name="desktop-outline" size={15} color="#475569" style={{ marginBottom: 2 }} />
          <Text style={styles.btnText} className="text-slate-600 text-[11px] font-bold">Recepción</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.adminBtn]}
          className="flex-1 bg-amber-50 py-2.5 rounded-lg items-center border border-amber-200 active:bg-amber-100"
          onPress={() => onSelect('admin@aurahotel.pe', 'Admin')}
        >
          <Ionicons name="shield-checkmark-outline" size={15} color="#EA580C" style={{ marginBottom: 2 }} />
          <Text style={[styles.btnText, styles.adminBtnText]} className="text-amber-700 text-[11px] font-bold">Admin</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint} className="text-slate-400 text-[11px] text-center mt-2">
        Contraseña única: Aura2026!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
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
