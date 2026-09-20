import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickTestButtonsProps {
  selectedEmail: string;
  onSelect: (email: string, roleName: string) => void;
}

export const QuickTestButtons: React.FC<QuickTestButtonsProps> = ({ selectedEmail, onSelect }) => {
  const isHuesped = selectedEmail === 'huesped@aurahotel.pe';
  const isRecepcion = selectedEmail === 'recepcion@aurahotel.pe';
  const isAdmin = selectedEmail === 'admin@aurahotel.pe';

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
        {/* HUÉSPED */}
        <TouchableOpacity
          style={[styles.btn, isHuesped && styles.btnActive]}
          className={`flex-1 py-2.5 rounded-xl items-center border ${
            isHuesped
              ? 'bg-slate-900 border-slate-900 shadow-sm'
              : 'bg-slate-50 border-slate-200 active:bg-slate-100'
          }`}
          onPress={() => onSelect('huesped@aurahotel.pe', 'Huésped')}
        >
          <Ionicons
            name="person-outline"
            size={16}
            color={isHuesped ? '#FFFFFF' : '#475569'}
            style={{ marginBottom: 2 }}
          />
          <Text
            style={[styles.btnText, isHuesped && styles.btnTextActive]}
            className={`text-[11px] font-bold ${isHuesped ? 'text-white' : 'text-slate-700'}`}
          >
            Huésped
          </Text>
        </TouchableOpacity>

        {/* RECEPCIÓN */}
        <TouchableOpacity
          style={[styles.btn, isRecepcion && styles.btnActive]}
          className={`flex-1 py-2.5 rounded-xl items-center border ${
            isRecepcion
              ? 'bg-slate-900 border-slate-900 shadow-sm'
              : 'bg-slate-50 border-slate-200 active:bg-slate-100'
          }`}
          onPress={() => onSelect('recepcion@aurahotel.pe', 'Recepción')}
        >
          <Ionicons
            name="desktop-outline"
            size={16}
            color={isRecepcion ? '#FFFFFF' : '#475569'}
            style={{ marginBottom: 2 }}
          />
          <Text
            style={[styles.btnText, isRecepcion && styles.btnTextActive]}
            className={`text-[11px] font-bold ${isRecepcion ? 'text-white' : 'text-slate-700'}`}
          >
            Recepción
          </Text>
        </TouchableOpacity>

        {/* ADMIN */}
        <TouchableOpacity
          style={[styles.btn, isAdmin && styles.btnActive]}
          className={`flex-1 py-2.5 rounded-xl items-center border ${
            isAdmin
              ? 'bg-slate-900 border-slate-900 shadow-sm'
              : 'bg-slate-50 border-slate-200 active:bg-slate-100'
          }`}
          onPress={() => onSelect('admin@aurahotel.pe', 'Admin')}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={isAdmin ? '#FFFFFF' : '#475569'}
            style={{ marginBottom: 2 }}
          />
          <Text
            style={[styles.btnText, isAdmin && styles.btnTextActive]}
            className={`text-[11px] font-bold ${isAdmin ? 'text-white' : 'text-slate-700'}`}
          >
            Admin
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint} className="text-slate-400 text-[11px] text-center mt-2.5">
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
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  btnText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },
  btnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  hint: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
});
