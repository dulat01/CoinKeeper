import axios from 'axios';
import { authAPI as localAuthAPI, categoriesAPI as localCategoriesAPI, transactionsAPI as localTransactionsAPI } from './LocalStorageAPI';

const isLocalMode = true; // Возвращаем основную логику на локальное хранилище

// Используем переменную окружения или заглушку для API URL
const API_URL = process.env.REACT_APP_API_URL || 'https://your-api-url-here.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const syncWithMockAPI = async (action, mockAction) => {
  try {
    // Выполняем основное действие (с локальным хранилищем)
    const result = await action();
    
    // Дублируем запрос в MockAPI (но игнорируем результат)
    mockAction().catch(error => {
      console.log('Ошибка синхронизации с MockAPI (это нормально):', error.message);
    });
    
    return result;
  } catch (error) {
    throw error;
  }
};

// API для аутентификации
export const authAPI = {
  login: async (credentials) => {
    // Основная логика через локальное хранилище
    const result = await localAuthAPI.login(credentials);
    
    // Дублируем в MockAPI для статистики (если есть ресурс users)
    try {
      const usersResponse = await api.get('/users');
      const users = usersResponse.data;
      const foundUser = users.find(user => user.email === credentials.email);
      
      if (!foundUser) {
        // Если пользователя нет в MockAPI, создаем его
        api.post('/users', {
          name: result.data.user.name,
          email: credentials.email,
          password: credentials.password,
          createdAt: new Date().toISOString()
        }).catch(error => console.log('Ошибка создания пользователя в MockAPI:', error.message));
      }
    } catch (error) {
      console.log('Ошибка проверки пользователя в MockAPI (это нормально):', error.message);
    }
    
    return result;
  },
  
  register: async (userData) => {
    // Основная логика через локальное хранилище
    const result = await localAuthAPI.register(userData);
    
    // Дублируем в MockAPI для статистики
    api.post('/users', {
      name: userData.name || 'Пользователь',
      email: userData.email,
      password: userData.password,
      createdAt: new Date().toISOString()
    }).catch(error => console.log('Ошибка создания пользователя в MockAPI (это нормально):', error.message));
    
    return result;
  },
  
  logout: () => localAuthAPI.logout(),
  
  getCurrentUser: () => localAuthAPI.getCurrentUser(),

  deleteAccount: async () => {
    // Получаем текущего пользователя
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    // Сначала проверяем, есть ли данные пользователя в localStorage
    console.log('Удаление пользователя:', user);
    
    // Удаляем базовые данные пользователя
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Если есть данные о пользователе с ID, удаляем его категории и транзакции
    if (user && user.id) {
      const userId = user.id;
      localStorage.removeItem(`${userId}_categories`);
      localStorage.removeItem(`${userId}_transactions`);
      console.log(`Удалены данные для пользователя с ID: ${userId}`);
    }
    
    const allKeys = Object.keys(localStorage);
    console.log('Все ключи в localStorage:', allKeys);
    
    allKeys.forEach(key => {
      if (key.includes('_categories') || key.includes('_transactions')) {
        console.log(`Удаление ключа: ${key}`);
        localStorage.removeItem(key);
      }
      
      if (user && user.email && key.includes(user.email)) {
        console.log(`Удаление ключа, связанного с email: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    if (user && user.email) {
      try {
        const usersResponse = await api.get('/users');
        const users = usersResponse.data;
        const foundUser = users.find(u => u.email === user.email);
        
        if (foundUser) {
          await api.delete(`/users/${foundUser.id}`);
          console.log(`Пользователь удален из MockAPI: ${foundUser.id}`);
        } else {
          console.log('Пользователь не найден в MockAPI');
        }
      } catch (error) {
        console.log('Ошибка при попытке удалить пользователя в MockAPI:', error.message);
      }
    }
    
    // Для старых версий можно попробовать удалить массив всех пользователей
    try {
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      if (user && user.email) {
        const updatedUsers = allUsers.filter(u => u.email !== user.email);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        console.log('Обновлен список пользователей в localStorage');
      }
    } catch (error) {
      console.log('Ошибка при обновлении списка пользователей:', error.message);
    }
    
    // Всегда возвращаем успешный результат
    return { success: true };
  }
};

// API для транзакций
export const transactionsAPI = localTransactionsAPI;

// API для категорий
export const categoriesAPI = localCategoriesAPI;

export default api; 