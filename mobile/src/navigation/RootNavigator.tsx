import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Role Screens
import SuperadminDashboardScreen from '../screens/superadmin/SuperadminDashboardScreen';
import DukandarDashboardScreen from '../screens/dukandar/DukandarDashboardScreen';
import CustomerHomeScreen from '../screens/customer/CustomerHomeScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, role } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Unauthenticated Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : role === 'superadmin' ? (
        // Superadmin Portal
        <Stack.Screen name="Superadmin" component={SuperadminDashboardScreen} />
      ) : role === 'shop_owner' ? (
        // Dukandar Portal
        <Stack.Screen name="Dukandar" component={DukandarDashboardScreen} />
      ) : (
        // Customer / User Portal
        <Stack.Screen name="Customer" component={CustomerHomeScreen} />
      )}
    </Stack.Navigator>
  );
}
