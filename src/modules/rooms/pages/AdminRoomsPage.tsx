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
import { LuxuryButton } from '@/components/LuxuryButton';
import { ConfirmModal } from '@/components/ConfirmModal';

export const AdminRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingRoomTarget, setDeletingRoomTarget] = useState<Room | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleConfirmDelete = async () => {
    if (!deletingRoomTarget) return;
    setDeleting(true);
    const res = await roomsApi.deleteRoom(deletingRoomTarget.id);
    setDeleting(false);
    setDeletingRoomTarget(null);
    if (res.success) {
      loadAllRooms();
    } else {
      Alert.alert('No se pudo eliminar', res.error || 'Error al eliminar la habitación.');
    }
  };

  const handleDeletePress = (room: Room) => {
    if (room.isAvailable) {
      Alert.alert(
        'Habitación Activa',
        'Solo puedes eliminar habitaciones que estén desactivadas. Primero desactívala.'
      );
      return;
    }
    setDeletingRoomTarget(room);
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

        <LuxuryButton
          title="Nueva"
          variant="solid"
          size="sm"
          iconName="add"
          onPress={() => {
            setSelectedRoomToEdit(null);
            setEditModalVisible(true);
          }}
          style={{ minWidth: 90 }}
        />
      </View>

      {/* Lista de Habitaciones para Admin */}
      <View className="flex-1 px-3.5 pt-3">
        {loading ? (
          <View className="py-20 justify-center items-center">
            <ActivityIndicator size="large" color="#488C8C" />
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

              return (
                <View
                  className={`bg-white rounded-2xl p-4 mb-3 border shadow-sm ${
                    item.isAvailable ? 'border-slate-200' : 'border-amber-200 bg-amber-50/20'
                  }`}
                >
                  {/* Header Row */}
                  <View className="flex-row items-center justify-between pb-2.5 border-b border-slate-100">
                    <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                      <Image
                        source={{ uri: item.imageUrl || defaultImage }}
                        className="w-13 h-13 rounded-xl bg-slate-200"
                        resizeMode="cover"
                      />
                      <View className="flex-1">
                        <Text className="text-slate-900 font-black text-[15px]" numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text className="text-slate-500 text-[11px] font-bold mt-0.5">
                          Hab. {formatRoomNumber(item.roomNumber)} · Piso {item.floor} · {item.capacity} pers.
                        </Text>
                      </View>
                    </View>

                    {/* Status Badge */}
                    <View
                      className={`px-2.5 py-1 rounded-full ${
                        item.isAvailable
                          ? 'bg-emerald-100'
                          : 'bg-red-100'
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-black tracking-wide ${
                          item.isAvailable ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {item.isAvailable ? 'ACTIVA' : 'DESACTIVADA'}
                      </Text>
                    </View>
                  </View>

                  {/* Pricing & Bed Info */}
                  <View className="flex-row justify-between items-center py-2.5">
                    <Text className="text-slate-600 text-[12px] font-semibold">
                      {item.bedType} · {item.surfaceAreaM2} m²
                    </Text>
                    <Text className="text-slate-900 font-black text-[16px]">
                      S/ {item.pricePerNight} <Text className="text-[11px] text-slate-400 font-normal">/noche</Text>
                    </Text>
                  </View>

                  {/* Actions Row with Luxury Buttons */}
                  <View className="flex-row items-center pt-2.5 border-t border-slate-100 gap-2">
                    {/* Toggle Button */}
                    <View className="flex-[1.2]">
                      <LuxuryButton
                        title={item.isAvailable ? 'Desactivar' : 'Activar'}
                        variant={item.isAvailable ? 'outline' : 'solid'}
                        size="sm"
                        iconName={item.isAvailable ? 'pause-circle-outline' : 'play-circle-outline'}
                        loading={isToggling}
                        onPress={() => handleToggle(item)}
                        style={{ width: '100%', marginTop: 0 }}
                      />
                    </View>

                    {/* Edit Button */}
                    <View className="flex-1">
                      <LuxuryButton
                        title="Editar"
                        variant="outline"
                        size="sm"
                        iconName="create-outline"
                        onPress={() => {
                          setSelectedRoomToEdit(item);
                          setEditModalVisible(true);
                        }}
                        style={{ width: '100%', marginTop: 0 }}
                      />
                    </View>

                    {/* Delete Button (Solo si está desactivada) */}
                    <TouchableOpacity
                      className={`h-[38px] px-3 rounded-xl justify-center items-center flex-row gap-1 border ${
                        !item.isAvailable
                          ? 'bg-red-50 border-red-200 active:bg-red-100'
                          : 'bg-slate-50 border-slate-200 opacity-35'
                      }`}
                      onPress={() => handleDeletePress(item)}
                      disabled={item.isAvailable}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={15}
                        color={!item.isAvailable ? '#DC2626' : '#94A3B8'}
                      />
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

      {/* Modal Personalizado de Confirmación para Eliminar Habitación */}
      <ConfirmModal
        visible={!!deletingRoomTarget}
        title="Eliminar Habitación"
        message={`¿Estás seguro de eliminar permanentemente la habitación ${
          deletingRoomTarget ? formatRoomNumber(deletingRoomTarget.roomNumber) : ''
        } (${deletingRoomTarget?.title})? Esta acción liberará el espacio en el sistema.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="brand"
        iconName="trash-outline"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingRoomTarget(null)}
      />
    </View>
  );
};
