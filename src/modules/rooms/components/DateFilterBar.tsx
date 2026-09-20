import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DateFilterBarProps {
  checkIn: string;
  checkOut: string;
  capacity: string;
  onCheckInChange: (val: string) => void;
  onCheckOutChange: (val: string) => void;
  onCapacityChange: (val: string) => void;
  onSearch: () => void;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  checkIn,
  checkOut,
  capacity,
  onCheckInChange,
  onCheckOutChange,
  onCapacityChange,
  onSearch,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerTitleRow}>
        <Ionicons name="calendar" size={16} color="#0F172A" />
        <Text style={styles.title}>Fechas y Huéspedes</Text>
      </View>

      <View style={styles.inputsRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.labelRow}>
            <Ionicons name="calendar-outline" size={12} color="#64748B" />
            <Text style={styles.label}>Check-in</Text>
          </View>
          <TextInput
            style={styles.input}
            value={checkIn}
            onChangeText={onCheckInChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.labelRow}>
            <Ionicons name="calendar-outline" size={12} color="#64748B" />
            <Text style={styles.label}>Check-out</Text>
          </View>
          <TextInput
            style={styles.input}
            value={checkOut}
            onChangeText={onCheckOutChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={{ width: 85 }}>
          <View style={styles.labelRow}>
            <Ionicons name="people-outline" size={12} color="#64748B" />
            <Text style={styles.label}>Huéspedes</Text>
          </View>
          <TextInput
            style={styles.input}
            value={capacity}
            onChangeText={onCapacityChange}
            keyboardType="numeric"
            placeholder="2"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.searchBtn} onPress={onSearch}>
        <Ionicons name="filter-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.searchBtnText}>Aplicar Filtros y Buscar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    margin: 14,
    padding: 16,
    borderRadius: 16,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    shadowColor: '#64748B',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  label: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#0F172A',
    fontSize: 12,
  },
  searchBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 12,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
