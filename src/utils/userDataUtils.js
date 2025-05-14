import { mockCategories } from './mockData';

// Инициализация категорий для нового пользователя
export const initializeUserCategories = (userId) => {
  // Проверяем существование категорий пользователя
  const userCategoriesKey = `${userId}_categories`;
  
  // Если категорий нет, создаем их из mockCategories
  if (!localStorage.getItem(userCategoriesKey)) {
    localStorage.setItem(userCategoriesKey, JSON.stringify(mockCategories));
    return true;
  }
  
  return false;
};

// Функция для проверки и загрузки данных пользователя
export const ensureUserData = () => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return false;
  
  try {
    const user = JSON.parse(userJson);
    if (user && user.id) {
      // Инициализируем категории, если их еще нет
      initializeUserCategories(user.id);
      return true;
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных пользователя:', error);
  }
  
  return false;
};

// Вызов функции при загрузке файла
ensureUserData();
 