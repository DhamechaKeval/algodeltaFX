import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/userlogin', {
    domain: 'https://www.algodeltafx.com',
    email,
    password,
  });
  return response.data;
};

export const saveToken = async token => {
  await AsyncStorage.setItem('token', token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

export const removeToken = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

export const saveUser = async user => {
  await AsyncStorage.setItem('user', JSON.stringify(user));
};

export const getUser = async () => {
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};