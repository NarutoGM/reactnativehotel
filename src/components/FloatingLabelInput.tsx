import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Animated,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface FloatingLabelInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  containerStyle?: object;
  error?: string;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChangeText,
  iconName,
  isPassword = false,
  containerStyle,
  error,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  const isFloating = isFocused || (value && value.length > 0);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFloating ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isFloating]);

  // Interpolaciones para posición, tamaño de fuente y color dentro del input
  const labelTop = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 5], // Permanece dentro del contenedor compacto
  });

  const labelFontSize = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [13.5, 10.5],
  });

  const labelColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#64748B', isFocused ? '#488C8C' : '#64748B'],
  });

  const inputPaddingLeft = iconName ? 38 : 14;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
          !!error && styles.containerError,
        ]}
      >
        {/* Icono Izquierdo Opcional */}
        {iconName && (
          <View style={styles.leftIconContainer}>
            <Ionicons
              name={iconName}
              size={17}
              color={isFocused ? '#488C8C' : '#94A3B8'}
            />
          </View>
        )}

        {/* Placeholder / Label Flotante que se queda adentro en la parte superior */}
        <Animated.Text
          style={[
            styles.floatingLabel,
            {
              left: inputPaddingLeft,
              top: labelTop,
              fontSize: labelFontSize,
              color: labelColor,
              fontWeight: isFloating ? '700' : '500',
            },
          ]}
          pointerEvents="none"
        >
          {label}
        </Animated.Text>

        {/* Input de Texto Real */}
        <TextInput
          {...textInputProps}
          style={[
            styles.textInput,
            {
              paddingLeft: inputPaddingLeft,
              paddingRight: isPassword ? 40 : 14,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          placeholder=""
          selectionColor="#488C8C"
          placeholderTextColor="transparent"
        />

        {/* Botón para mostrar / ocultar contraseña */}
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={isFocused ? '#488C8C' : '#64748B'}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Mensaje de Error si aplica */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
  },
  container: {
    height: 50,
    backgroundColor: '#F1F5F9', // Gris plomito elegante y definido
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    position: 'relative',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  containerFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#488C8C',
    shadowColor: '#488C8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  containerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  floatingLabel: {
    position: 'absolute',
    letterSpacing: 0.2,
    zIndex: 1,
    fontFamily: 'Sora_600SemiBold',
  },
  textInput: {
    height: '100%',
    paddingTop: 15,
    paddingBottom: 2,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
  leftIconContainer: {
    position: 'absolute',
    left: 12,
    top: 15,
    zIndex: 2,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: 13,
    padding: 4,
    zIndex: 2,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '600',
  },
});
