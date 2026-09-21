import React from 'react';
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export type LuxuryButtonVariant = 'solid' | 'gradient' | 'outline' | 'ghost';
export type LuxuryButtonSize = 'sm' | 'md' | 'lg';

export interface LuxuryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: LuxuryButtonVariant;
  size?: LuxuryButtonSize;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const LuxuryButton: React.FC<LuxuryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'solid',
  size = 'md',
  iconName,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const isInteractive = !loading && !disabled;
  const isSm = size === 'sm';

  // Renderizado con degradado
  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={!isInteractive}
        activeOpacity={0.85}
        style={[
          styles.baseButton,
          isSm ? styles.baseButtonSm : styles.baseButtonMd,
          disabled && styles.btnDisabled,
          style,
        ]}
      >
        <LinearGradient
          colors={disabled ? ['#CBD5E1', '#94A3B8'] : ['#5FA7A7', '#488C8C', '#2E6666']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientContainer, isSm && styles.gradientContainerSm]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              {iconName && iconPosition === 'left' && (
                <Ionicons
                  name={iconName}
                  size={isSm ? 15 : 18}
                  color="#FFFFFF"
                  style={styles.iconLeft}
                />
              )}
              <Text style={[styles.btnTextSolid, isSm && styles.btnTextSm, textStyle]}>
                {title}
              </Text>
              {iconName && iconPosition === 'right' && (
                <Ionicons
                  name={iconName}
                  size={isSm ? 15 : 18}
                  color="#FFFFFF"
                  style={styles.iconRight}
                />
              )}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Renderizado outline
  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={!isInteractive}
        activeOpacity={0.7}
        style={[
          styles.baseButton,
          styles.btnOutline,
          isSm ? styles.btnOutlineSm : styles.btnOutlineMd,
          disabled && styles.btnDisabledOutline,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#488C8C" size="small" />
        ) : (
          <>
            {iconName && iconPosition === 'left' && (
              <Ionicons
                name={iconName}
                size={isSm ? 15 : 18}
                color={disabled ? '#94A3B8' : '#488C8C'}
                style={styles.iconLeft}
              />
            )}
            <Text
              style={[
                styles.btnTextOutline,
                isSm && styles.btnTextOutlineSm,
                disabled && styles.btnTextDisabled,
                textStyle,
              ]}
            >
              {title}
            </Text>
            {iconName && iconPosition === 'right' && (
              <Ionicons
                name={iconName}
                size={isSm ? 15 : 18}
                color={disabled ? '#94A3B8' : '#488C8C'}
                style={styles.iconRight}
              />
            )}
          </>
        )}
      </TouchableOpacity>
    );
  }

  // Renderizado solid por defecto (#488C8C)
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isInteractive}
      activeOpacity={0.85}
      style={[
        styles.baseButton,
        styles.btnSolid,
        isSm ? styles.btnSolidSm : styles.btnSolidMd,
        disabled && styles.btnDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <>
          {iconName && iconPosition === 'left' && (
            <Ionicons
              name={iconName}
              size={isSm ? 15 : 18}
              color="#FFFFFF"
              style={styles.iconLeft}
            />
          )}
          <Text style={[styles.btnTextSolid, isSm && styles.btnTextSolidSm, textStyle]}>
            {title}
          </Text>
          {iconName && iconPosition === 'right' && (
            <Ionicons
              name={iconName}
              size={isSm ? 15 : 18}
              color="#FFFFFF"
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseButtonMd: {
    marginTop: 14,
  },
  baseButtonSm: {
    marginTop: 0,
    borderRadius: 10,
  },
  btnSolid: {
    backgroundColor: '#488C8C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#488C8C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnSolidMd: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  btnSolidSm: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    minHeight: 38,
    minWidth: 95,
  },
  gradientContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientContainerSm: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    minHeight: 38,
  },
  btnOutline: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineMd: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  btnOutlineSm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 38,
  },
  btnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnDisabledOutline: {
    borderColor: '#E2E8F0',
  },
  btnTextSolid: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
    fontFamily: 'Sora_700Bold',
    letterSpacing: 0.8,
    textAlign: 'center',
    includeFontPadding: false,
  },
  btnTextOutline: {
    color: '#334155', // Texto plomo oscuro elegante
    fontSize: 13.5,
    fontWeight: '800',
    fontFamily: 'Sora_700Bold',
    letterSpacing: 0.8,
    textAlign: 'center',
    includeFontPadding: false,
  },
  btnTextSolidSm: {
    fontSize: 12.5,
    letterSpacing: 0.6,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  btnTextOutlineSm: {
    fontSize: 12.5,
    letterSpacing: 0.6,
    fontWeight: '800',
    color: '#334155',
  },
  btnTextDisabled: {
    color: '#94A3B8',
  },
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },
});
