import {useCallback} from 'react';
import AsyncStorage  from '@react-native-async-storage/async-storage';
import {login}       from '../services/authService';

export const useAuth = () => {

  const handleLogin = useCallback(async (email, password) => {
    const data = await login(email.trim(), password);
    if (data?.status === true && data?.token) {
      await AsyncStorage.setItem('token', data.token);
      return {success: true};
    }
    return {
      success: false,
      message: data?.message || data?.error || 'Invalid credentials.',
    };
  }, []);

  const handleLogout = useCallback(async (navigation) => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Auth');
  }, []);

  return {handleLogin, handleLogout};
};