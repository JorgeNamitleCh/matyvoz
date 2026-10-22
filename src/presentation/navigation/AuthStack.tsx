import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParams } from './types';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ChildDataScreen from '../screens/onboarding/ChildDataScreen';
import ChildProfileScreen from '../screens/onboarding/ChildProfileScreen';

const Stack = createStackNavigator<AuthStackParams>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ChildData" component={ChildDataScreen} />
      <Stack.Screen name="ChildProfile" component={ChildProfileScreen} />
    </Stack.Navigator>
  );
}
