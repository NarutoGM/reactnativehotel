import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room, roomsApi, formatRoomNumber } from '../api/rooms.api';
import { EditRoomModal } from '../components/EditRoomModal';

export const AdminRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal para Crear / Editar
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRoomToEdit, setSelectedRoomToEdit] = useState<Room | null>(null);

  useEffect(() => {
    loadAllRooms();
  }, []);

  const loadAllRooms = async () => {
    setLoading(true);
    const res = await roomsApi.getAllRoomsForAdmin();
    setLoading(false);
    if (res.success) {
      setRooms(res.rooms);
    }
  };

  const handleToggle = async (room: Room) => {
    setTogglingId(room.id);
    const res = await roomsApi.toggleRoomAvailability(room.id, !room.isAvailable);
    setTogglingId(null);

    if (res.success) {
      loadAllRooms();
    } else {
      Alert.alert('Error', res.error || 'No se pudo cambiar el estado de la habitación.');
    }
  };

  const handleDelete = (room: Room) => {
    if (room.isAvailable) {
      Alert.alert(
        'Habitación Activa',
        'Solo puedes eliminar habitaciones que estén desactivadas. Primero desactívala.'
      );
      return;
    }

    Alert.alert(
      'Eliminar Habitación',
      `¿Estás seguro de eliminar permanentemente la habitación ${formatRoomNumber(room.roomNumber)} (${room.title})? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(room.id);
            const res = await roomsApi.deleteRoom(room.id);
            setDeletingId(null);
            if (res.success) {
              Alert.alert('Eliminada', 'La habitación ha sido eliminada del sistema.');
              loadAllRooms();
            } else {
              Alert.alert('No se pudo eliminar', res.error || 'Error al eliminar la habitación.');
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-100">
      {/* Top Banner with Summary & New Button */}
      <View className="flex-row justify-between items-center bg-white px-4 py-3.5 border-b border-slate-200">
        <View>
          <Text className="text-[17px] font-black text-slate-900">
            Gestión de Habitaciones
          </Text>
          <Text className="text-slate-500 text-[12px] font-medium">
            Total: {rooms.length} · Activas: {rooms.filter((r) => r.isAvailable).length}
          </Text>
        </View>

        <TouchableOpacity
          className="flex-row items-center bg-slate-900 px-3.5 py-2.5 rounded-xl active:bg-slate-800 shadow-sm"
          onPress={() => {
            setSelectedRoomToEdit(null);
            setEditModalVisible(true);
          }}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text className="text-white font-bold text-[13px]">Nueva</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Habitaciones para Admin */}
      <View className="flex-1 px-3.5 pt-3">
        {loading ? (
          <View className="py-20 justify-center items-center">
            <ActivityIndicator size="large" color="#0F172A" />
            <Text className="text-slate-500 mt-2 text-[13px] font-medium">Cargando habitaciones...</Text>
          </View>
        ) : rooms.length === 0 ? (
          <View className="py-16 justify-center items-center px-6">
            <Ionicons name="bed-outline" size={48} color="#94A3B8" />
            <Text className="text-slate-900 text-[16px] font-bold mt-2.5">
              No hay habitaciones registradas
            </Text>
            <Text className="text-slate-500 text-center text-[12px] mt-1">
              Presiona el botón "+ Nueva" para crear la primera habitación.
            </Text>
          </View>
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(item) => item.id}
            contentContainerClassName="pb-8"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const defaultImage = item.type.toLowerCase().includes('suite')
                ? 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'
                : 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80';

              const isToggling = togglingId === item.id;
              const isDeleting = deletingId === item.id;

              return (
                <View
                  className={`bg-white rounded-2xl p-4 mb-3 border shadow-sm ${
                    item.isAvailable ? 'border-slate-200' : 'border-amber-200 bg-amber-50/20'
                  }`}
                >
                  {/* Header Row */}
                  <View className="flex-row items-center justify-between pb-2 border-b border-slate-100">
                    <View className="flex-row items-center gap-2">
                      <Image
                        source={{ uri: item.imageUrl || defaultImage }}
                        className="w-12 h-12 rounded-xl bg-slate-200"
                        resizeMode="cover"
                      />
                      <View>
                        <Text className="text-slate-900 font-black text-[15px]">{item.title}</Text>
                        <Text className="text-slate-500 text-[11px] font-bold">
                          Hab. {formatRoomNumber(item.roomNumber)} · Piso {item.floor} · {item.capacity} pers.
                        </Text>
                      </View>
                    </View>

                    {/* Status Badge */}
                    <View
                      className={`px-2.5 py-0.5 rounded-full border ${
                        item.isAvailable
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-black ${
                          item.isAvailable ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {item.isAvailable ? 'ACTIVA' : 'DESACTIVADA'}
                      </Text>
                    </View>
                  </View>

                  {/* Pricing & Bed Info */}
                  <View className="flex-row justify-between items-center py-2.5">
                    <Text className="text-slate-600 text-[12px] font-medium">
                      {item.bedType} · {item.surfaceAreaM2} m²
                    </Text>
                    <Text className="text-slate-900 font-black text-[16px]">
                      S/ {item.pricePerNight} <Text className="text-[11px] text-slate-500 font-normal">/noche</Text>
                    </Text>
                  </View>

                  {/* Actions Row */}
                  <View className="flex-row justify-between items-center pt-2.5 border-t border-slate-100 gap-2">
                    {/* Toggle Button */}
                    <TouchableOpacity
                      className={`flex-1 py-2 px-2.5 rounded-xl border flex-row justify-center items-center gap-1.5 ${
                        item.isAvailable
                          ? 'bg-amber-50 border-amber-300 active:bg-amber-100'
                          : 'bg-emerald-50 border-emerald-300 active:bg-emerald-100'
                      }`}
                      onPress={() => handleToggle(item)}
                      disabled={isToggling}
                    >
                      {isToggling ? (
                        <ActivityIndicator size="small" color="#475569" />
                      ) : (
                        <>
                          <Ionicons
                            name={item.isAvailable ? 'pause-circle-outline' : 'play-circle-outline'}
                            size={16}
                            color={item.isAvailable ? '#D97706' : '#16A34A'}
                          />
                          <Text
                            className={`text-[12px] font-bold ${
                              item.isAvailable ? 'text-amber-800' : 'text-emerald-800'
                            }`}
                          >
                            {item.isAvailable ? 'Desactivar' : 'Activar'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    {/* Edit Button */}
                    <TouchableOpacity
                      className="bg-slate-100 border border-slate-300 py-2 px-3.5 rounded-xl flex-row justify-center items-center gap-1 active:bg-slate-200"
                      onPress={() => {
                        setSelectedRoomToEdit(item);
                        setEditModalVisible(true);
                      }}
                    >
                      <Ionicons name="create-outline" size={15} color="#334155" />
                      <Text className="text-slate-800 text-[12px] font-bold">Editar</Text>
                    </TouchableOpacity>

                    {/* Delete Button (Solo habilitado si está desactivada) */}
                    <TouchableOpacity
                      className={`py-2 px-3.5 rounded-xl flex-row justify-center items-center gap-1 border ${
                        !item.isAvailable
                          ? 'bg-red-50 border-red-200 active:bg-red-100'
                          : 'bg-slate-50 border-slate-200 opacity-40'
                      }`}
                      onPress={() => handleDelete(item)}
                      disabled={item.isAvailable || isDeleting}
                    >
                      {isDeleting ? (
                        <ActivityIndicator size="small" color="#DC2626" />
                      ) : (
                        <>
                          <Ionicons
                            name="trash-outline"
                            size={15}
                            color={!item.isAvailable ? '#DC2626' : '#94A3B8'}
                          />
                          <Text
                            className={`text-[12px] font-bold ${
                              !item.isAvailable ? 'text-red-600' : 'text-slate-400'
                            }`}
                          >
                            Eliminar
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Modal de Crear / Editar Habitación */}
      <EditRoomModal
        visible={editModalVisible}
        room={selectedRoomToEdit}
        onClose={() => setEditModalVisible(false)}
        onSuccess={() => loadAllRooms()}
      />
    </View>
  );
};
