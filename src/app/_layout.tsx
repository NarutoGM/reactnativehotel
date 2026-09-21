import '../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, Text, TextInput } from 'react-native';
import {
  useFonts,
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
} from '@expo-google-fonts/sora';

SplashScreen.preventAutoHideAsync();

// Configurar defaultProps solo de forma segura si la propiedad existe
try {
  if ((Text as any).defaultProps) {
    (Text as any).defaultProps.style = {
      fontFamily: 'Sora_400Regular',
      ...((Text as any).defaultProps.style || {}),
    };
  }
  if ((TextInput as any).defaultProps) {
    (TextInput as any).defaultProps.style = {
      fontFamily: 'Sora_400Regular',
      ...((TextInput as any).defaultProps.style || {}),
    };
  }
} catch (e) {
  // En React 19 / RN modernos defaultProps está deprecado y LogBox puede interceptarlo
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
    Sora: Sora_400Regular,
    'Sora-Regular': Sora_400Regular,
    'Sora-Medium': Sora_500Medium,
    'Sora-SemiBold': Sora_600SemiBold,
    'Sora-Bold': Sora_700Bold,
    'Sora-ExtraBold': Sora_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
