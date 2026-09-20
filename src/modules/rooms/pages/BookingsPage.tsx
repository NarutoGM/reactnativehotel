import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../auth/api/auth.api';

interface BookingsPageProps {
  currentUser: User;
}

export const BookingsPage: React.FC<BookingsPageProps> = ({ currentUser }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="receipt-outline" size={28} color="#0F172A" />
        </View>
        <Text style={styles.title}>Mis Reservas</Text>
        <Text style={styles.subtitle}>
          Historial de estadías y vouchers generados para {currentUser.fullName}.
        </Text>

        <View style={styles.bookingItem}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemCode}>AG-88219</Text>
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeSuccessText}>CONFIRMADA</Text>
            </View>
          </View>
          <Text style={styles.itemRoom}>Suite Presidencial Aura</Text>
          <Text style={styles.itemDates}>📅 2026-09-20 al 2026-09-23 · 2 Huéspedes</Text>
          <Text style={styles.itemPrice}>Total: S/ 1,350.00</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
  },
  bookingItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemCode: {
    fontWeight: '800',
    color: '#0F172A',
    fontSize: 15,
    letterSpacing: 1,
  },
  badgeSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeSuccessText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '800',
  },
  itemRoom: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  itemDates: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
});
