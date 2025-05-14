// Категории
export const mockCategories = [
  { id: '1', name: 'Продукты', type: 'expense', icon: 'shopping-cart', color: '#4CAF50' },
  { id: '2', name: 'Транспорт', type: 'expense', icon: 'bus', color: '#2196F3' },
  { id: '3', name: 'Развлечения', type: 'expense', icon: 'movie', color: '#9C27B0' },
  { id: '4', name: 'Рестораны', type: 'expense', icon: 'restaurant', color: '#FF9800' },
  { id: '5', name: 'Здоровье', type: 'expense', icon: 'medical-services', color: '#F44336' },
  { id: '6', name: 'Жилье', type: 'expense', icon: 'home', color: '#795548' },
  { id: '7', name: 'Зарплата', type: 'income', icon: 'work', color: '#4CAF50' },
  { id: '8', name: 'Фриланс', type: 'income', icon: 'laptop', color: '#2196F3' },
  { id: '9', name: 'Подарки', type: 'income', icon: 'card-giftcard', color: '#9C27B0' },
  { id: '10', name: 'Инвестиции', type: 'income', icon: 'trending-up', color: '#FF9800' },
];

// Тестовые пользователи
export const mockUsers = [
  {
    id: 'user-1',
    email: 'user1@example.com',
    password: 'dummypassword1',
    name: 'Пользователь 1',
    createdAt: '2024-07-01T10:00:00.000Z'
  },
  {
    id: 'user-2',
    email: 'user2@example.com',
    password: 'dummypassword2',
    name: 'Пользователь 2',
    createdAt: '2024-07-01T11:00:00.000Z'
  }
];

// Инициализация хранилища мок-данными
export const initializeMockData = () => {
  // Инициализация пользователей (только если их еще нет)
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(mockUsers));
  }
}; 