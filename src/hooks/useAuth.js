import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiPost } from '../services/api';

export const useAuth = () => {
  const handleLogin = useCallback(async (email, password) => {
    try {
      const data = await apiPost(
        '/auth/userlogin',
        {
          domain: 'https://www.algodeltafx.com',
          email: email.trim(),
          password,
        },
        false, // no auth required for login
      );

      if (data?.status === true && data?.token) {
        await AsyncStorage.setItem('token', data.token);
        return { success: true };
      }

      return {
        success: false,
        message: data?.message || data?.error || 'Invalid credentials.',
      };
    } catch (err) {
      return {
        success: false,
        message: err?.message || 'Network error. Please check your connection.',
      };
    }
  }, []);

  const handleLogout = useCallback(async navigation => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Auth');
  }, []);

  return { handleLogin, handleLogout };
};
