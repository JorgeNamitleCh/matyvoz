import React, { useRef } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme, NavigationState } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParams } from './types';
import { useAuthStore } from '../stores/useAuthStore';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ProfileScreen from '../screens/account/ProfileScreen';
import EditFamilyScreen from '../screens/account/EditFamilyScreen';
import EditPersonScreen from '../screens/account/EditPersonScreen';
import DeleteAccountScreen from '../screens/account/DeleteAccountScreen';
import AnimatedSplash from '../components/brand/AnimatedSplash';
import { applyScheme, BG, SURFACE, INK, BORDER, ACCENT } from '../theme/tokens';

const Root = createStackNavigator<RootStackParams>();

export default function AppNavigator() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isLoading = useAuthStore(s => s.isLoading);
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  // Antes de pintar los hijos: la paleta tiene que coincidir con el modo del sistema.
  applyScheme(scheme);

  // Al cambiar de modo se vuelve a montar la navegación (para que todas las
  // pantallas tomen los colores nuevos) y se restaura donde estaba el usuario.
  const navState = useRef<NavigationState | undefined>(undefined);

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: { ...base.colors, background: BG, card: SURFACE, text: INK, border: BORDER, primary: ACCENT },
  };

  return (
    <>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <NavigationContainer
        key={scheme}
        theme={theme}
        initialState={navState.current}
        onStateChange={state => { navState.current = state; }}
      >
        <Root.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <>
              <Root.Screen name="Main" component={MainTabs} />
              <Root.Screen name="Profile" component={ProfileScreen} />
              <Root.Screen name="EditFamily" component={EditFamilyScreen} />
              <Root.Screen name="EditPerson" component={EditPersonScreen} />
              <Root.Screen name="DeleteAccount" component={DeleteAccountScreen} />
            </>
          ) : (
            <Root.Screen name="Auth" component={AuthStack} />
          )}
        </Root.Navigator>
      </NavigationContainer>
      {/* Encima de todo mientras se revisa la sesión; luego se desvanece y se desmonta. */}
      <AnimatedSplash loading={isLoading} />
    </>
  );
}
