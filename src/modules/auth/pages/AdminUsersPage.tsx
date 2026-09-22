import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User, authApi } from '../api/auth.api';
import { CreateUserModal } from '../components/CreateUserModal';
import { LuxuryButton } from '@/components/LuxuryButton';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'RECEPTIONIST' | 'GUEST'>('ALL');
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const res = await authApi.getAllUsers();
    setLoading(false);
    if (res.success && res.users) {
      setUsers(res.users);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Administrador',
          bg: '#EFF6FF',
          color: '#0A3B7B',
          border: '#BFDBFE',
          icon: 'shield-checkmark',
        };
      case 'RECEPTIONIST':
        return {
          label: 'Recepcionista',
          bg: '#EBF4F4',
          color: '#488C8C',
          border: '#CDE5E5',
          icon: 'key',
        };
      default:
        return {
          label: 'Huésped',
          bg: '#ECFDF5',
          color: '#10B981',
          border: '#A7F3D0',
          icon: 'person',
        };
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.documentNumber && u.documentNumber.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q));
    return matchesRole && matchesQuery;
  });

  return (
    <View className="flex-1 bg-slate-100">
      {/* Header Superior con Botón "Nuevo Usuario" */}
      <View className="flex-row justify-between items-center bg-white px-4 py-3.5 border-b border-slate-200">
        <View>
          <Text className="text-[17px] font-black text-slate-900">
            Gestión de Usuarios
          </Text>
          <Text className="text-slate-500 text-[12px] font-medium">
            Total: {users.length} cuentas registradas
          </Text>
        </View>

        <LuxuryButton
          title="Nuevo"
          variant="solid"
          size="sm"
          iconName="person-add"
          onPress={() => setCreateModalVisible(true)}
          style={{ minWidth: 95 }}
        />
      </View>

      {/* Buscador Rápido */}
      <View className="px-3.5 pt-3 pb-1">
        <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-3.5 py-2">
          <Ionicons name="search" size={17} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-2 text-[13px] font-semibold text-slate-800"
            placeholder="Buscar por nombre, correo o documento..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filtros por Rol */}
      <View className="flex-row bg-white p-1.5 mx-3.5 mt-2 rounded-2xl border border-slate-200 gap-1">
        {[
          { key: 'ALL' as const, label: `Todos (${users.length})` },
          { key: 'ADMIN' as const, label: `Admin (${users.filter((u) => u.role === 'ADMIN').length})` },
          { key: 'RECEPTIONIST' as const, label: `Recep (${users.filter((u) => u.role === 'RECEPTIONIST').length})` },
          { key: 'GUEST' as const, label: `Huésped (${users.filter((u) => u.role === 'GUEST').length})` },
        ].map((tab) => {
          const isActive = roleFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              className={`flex-1 py-2 items-center rounded-xl ${
                isActive ? 'bg-[#488C8C]' : 'bg-transparent'
              }`}
              onPress={() => setRoleFilter(tab.key)}
              activeOpacity={0.8}
            >
              <Text
                className={`text-[11px] font-bold ${
                  isActive ? 'text-white font-extrabold' : 'text-slate-600'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Lista de Usuarios */}
      <View className="flex-1 px-3.5 pt-2.5">
        {loading ? (
          <View className="py-20 justify-center items-center">
            <ActivityIndicator size="large" color="#488C8C" />
            <Text className="text-slate-500 text-[13px] font-medium mt-2">
              Cargando usuarios...
            </Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View className="py-20 justify-center items-center">
            <Ionicons name="people-outline" size={48} color="#CBD5E1" />
            <Text className="text-slate-500 text-[14px] font-bold mt-2">
              No se encontraron usuarios
            </Text>
            <Text className="text-slate-400 text-[12px] text-center mt-0.5">
              Prueba con otro término de búsqueda o filtro
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => {
              const badge = getRoleBadge(item.role);
              return (
                <View className="bg-white rounded-2xl p-3.5 mb-2.5 border border-slate-200 shadow-xs flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3 flex-1">
                    {/* Avatar */}
                    {item.avatarUrl ? (
                      <Image
                        source={{ uri: item.avatarUrl }}
                        className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-12 h-12 rounded-full bg-[#EBF4F4] border border-[#CDE5E5] justify-center items-center">
                        <Text className="text-[#488C8C] text-[15px] font-black">
                          {getInitials(item.fullName)}
                        </Text>
                      </View>
                    )}

                    {/* Información Principal */}
                    <View className="flex-1 pr-2">
                      <Text
                        className="text-[14px] font-black text-slate-900 leading-tight"
                        numberOfLines={1}
                      >
                        {item.fullName}
                      </Text>
                      <Text
                        className="text-[12px] font-semibold text-slate-500 mt-0.5"
                        numberOfLines={1}
                      >
                        {item.email}
                      </Text>

                      <View className="flex-row items-center gap-2 mt-1">
                        {item.documentNumber && item.documentNumber !== 'N/A' && (
                          <View className="flex-row items-center gap-1">
                            <Ionicons name="card-outline" size={11} color="#64748B" />
                            <Text className="text-[11px] font-medium text-slate-600">
                              {item.documentNumber}
                            </Text>
                          </View>
                        )}
                        {item.phone && item.phone !== 'No registrado' && (
                          <View className="flex-row items-center gap-1">
                            <Ionicons name="call-outline" size={11} color="#64748B" />
                            <Text className="text-[11px] font-medium text-slate-600">
                              {item.phone}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Badge de Rol */}
                  <View
                    style={{
                      backgroundColor: badge.bg,
                      borderColor: badge.border,
                    }}
                    className="border px-2.5 py-1 rounded-xl flex-row items-center gap-1"
                  >
                    <Ionicons name={badge.icon as any} size={12} color={badge.color} />
                    <Text
                      style={{ color: badge.color }}
                      className="text-[10.5px] font-black"
                    >
                      {badge.label}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Modal para Crear Usuario */}
      <CreateUserModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={loadUsers}
      />
    </View>
  );
};
