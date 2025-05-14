import { initializeMockData } from './mockData';
import { initializeUserCategories } from './userDataUtils';

initializeMockData();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const API = {
  getAll: async (collection) => {
    await delay(300); // Эмуляция задержки сети
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const userId = currentUser ? currentUser.id : 'guest';
      const storageKey = `${userId}_${collection}`;
      
      const data = localStorage.getItem(storageKey);
      return { data: JSON.parse(data || '[]') };
    } catch (error) {
      throw new Error(`Ошибка при получении ${collection}: ${error.message}`);
    }
  },
  
  getById: async (collection, id) => {
    await delay(300); // Эмуляция задержки сети
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const userId = currentUser ? currentUser.id : 'guest';
      const storageKey = `${userId}_${collection}`;
      
      const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const item = data.find(item => item.id === id);
      if (!item) {
        throw new Error(`Элемент с ID ${id} не найден в ${collection}`);
      }
      return { data: item };
    } catch (error) {
      throw new Error(`Ошибка при получении элемента из ${collection}: ${error.message}`);
    }
  },
  
  create: async (collection, item) => {
    await delay(300); // Эмуляция задержки сети
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const userId = currentUser ? currentUser.id : 'guest';
      const storageKey = `${userId}_${collection}`;
      
      const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const newItem = { ...item, id: item.id || String(Date.now()) };
      data.push(newItem);
      localStorage.setItem(storageKey, JSON.stringify(data));
      return { data: newItem };
    } catch (error) {
      throw new Error(`Ошибка при создании элемента в ${collection}: ${error.message}`);
    }
  },
  
  update: async (collection, id, updates) => {
    await delay(300); // Эмуляция задержки сети
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const userId = currentUser ? currentUser.id : 'guest';
      const storageKey = `${userId}_${collection}`;
      
      const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const index = data.findIndex(item => item.id === id);
      if (index === -1) {
        throw new Error(`Элемент с ID ${id} не найден в ${collection}`);
      }
      data[index] = { ...data[index], ...updates };
      localStorage.setItem(storageKey, JSON.stringify(data));
      return { data: data[index] };
    } catch (error) {
      throw new Error(`Ошибка при обновлении элемента в ${collection}: ${error.message}`);
    }
  },
  
  delete: async (collection, id) => {
    await delay(300); // Эмуляция задержки сети
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const userId = currentUser ? currentUser.id : 'guest';
      const storageKey = `${userId}_${collection}`;
      
      let data = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const index = data.findIndex(item => item.id === id);
      if (index === -1) {
        throw new Error(`Элемент с ID ${id} не найден в ${collection}`);
      }
      data = data.filter(item => item.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(data));
      return { success: true };
    } catch (error) {
      throw new Error(`Ошибка при удалении элемента из ${collection}: ${error.message}`);
    }
  },
};

export const categoriesAPI = {
  getAll: () => API.getAll('categories'),
  getById: (id) => API.getById('categories', id),
  create: (category) => API.create('categories', category),
  update: (id, category) => API.update('categories', id, category),
  delete: (id) => API.delete('categories', id),
};

// API для транзакций
export const transactionsAPI = {
  getAll: () => API.getAll('transactions'),
  getById: (id) => API.getById('transactions', id),
  create: (transaction) => API.create('transactions', transaction),
  update: (id, transaction) => API.update('transactions', id, transaction),
  delete: (id) => API.delete('transactions', id),
  getStats: async (params) => {
    await delay(300); // Эмуляция задержки сети
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const userId = currentUser ? currentUser.id : 'guest';
      
      let transactions = JSON.parse(localStorage.getItem(`${userId}_transactions`) || '[]');
      const categories = JSON.parse(localStorage.getItem(`${userId}_categories`) || '[]');
      
      // Эмулируем текущую дату - берем реальную текущую дату
      const now = new Date();
      
      // Фильтрация по дате, если указан диапазон дат
      if (params && params.dateRange) {
        const { startDate, endDate } = params.dateRange;
        
        if (startDate && endDate) {
          const startTimestamp = new Date(startDate).getTime();
          const endTimestamp = new Date(endDate).getTime();
          
          transactions = transactions.filter(transaction => {
            const transactionTime = new Date(transaction.date).getTime();
            return transactionTime >= startTimestamp && transactionTime <= endTimestamp;
          });
        }
      } else if (params && params.period) {
        // Фильтрация по предопределенному периоду
        let startDate;
        
        switch (params.period) {
          case 'week':
            // Последние 7 дней
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            // Текущий месяц
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'quarter':
            // Текущий квартал (3 месяца)
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 3);
            break;
          case 'year':
            // Текущий год
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            // По умолчанию - весь период
            startDate = new Date(0);
        }
        
        const startTimestamp = startDate.getTime();
        
        transactions = transactions.filter(transaction => {
          const transactionTime = new Date(transaction.date).getTime();
          return transactionTime >= startTimestamp && transactionTime <= now.getTime();
        });
      }
      
      // Вычисление итоговых значений
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Группируем расходы по категориям
      const expensesByCategory = {};
      transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          if (!expensesByCategory[t.categoryId]) {
            expensesByCategory[t.categoryId] = 0;
          }
          expensesByCategory[t.categoryId] += t.amount;
        });
      
      // Группируем доходы по категориям
      const incomesByCategory = {};
      transactions
        .filter(t => t.type === 'income')
        .forEach(t => {
          if (!incomesByCategory[t.categoryId]) {
            incomesByCategory[t.categoryId] = 0;
          }
          incomesByCategory[t.categoryId] += t.amount;
        });
      
      // Формируем статистику по категориям
      const categoriesStats = categories.map(category => {
        const categoryTransactions = transactions.filter(t => t.categoryId === category.id && t.type === category.type);
        const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
        return {
          id: category.id,
          name: category.name,
          type: category.type,
          total,
          count: categoryTransactions.length,
          percentage: category.type === 'expense' 
              ? totalExpense > 0 ? (total / totalExpense) * 100 : 0 
              : totalIncome > 0 ? (total / totalIncome) * 100 : 0
        };
      });
      
      // Формируем статистику по месяцам
      const currentYear = new Date().getFullYear();
      const monthlyStats = {};
      
      // Инициализируем все месяцы нулями
      for (let i = 0; i < 12; i++) {
        const monthName = new Date(currentYear, i, 1).toLocaleString('ru-RU', { month: 'long' });
        monthlyStats[monthName] = { income: 0, expense: 0 };
      }
      
      // Заполняем данными
      transactions.forEach(t => {
        const transactionDate = new Date(t.date);
        // Учитываем только транзакции текущего года
        if (transactionDate.getFullYear() === currentYear) {
          const monthName = transactionDate.toLocaleString('ru-RU', { month: 'long' });
          if (t.type === 'income') {
            monthlyStats[monthName].income += t.amount;
          } else {
            monthlyStats[monthName].expense += t.amount;
          }
        }
      });
      
      const stats = {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        categoriesStats,
        expensesByCategory,
        incomesByCategory,
        monthlyStats: Object.entries(monthlyStats).map(([month, data]) => ({
          month,
          ...data
        }))
      };
      
      return { data: stats };
    } catch (error) {
      throw new Error(`Ошибка при получении статистики транзакций: ${error.message}`);
    }
  },
};

// API для аутентификации
export const authAPI = {
  login: async (credentials) => {
    await delay(500); // Длиннее задержка для аутентификации
    // Проверяем учетные данные
    if (credentials.email && credentials.password) {
      // Для повышения безопасности добавим проверку корректности учетных данных
      // В реальном приложении здесь будет запрос к API
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = storedUsers.find(
        user => user.email === credentials.email && user.password === credentials.password
      );
      
      if (!foundUser) {
        throw new Error('Неверный email или пароль');
      }
      
      // Создаем токен и данные пользователя
      const token = `fake-token-${Date.now()}`;
      const user = { email: foundUser.email, id: foundUser.id, name: foundUser.name || 'Пользователь' };
      
      // Сохраняем в localStorage для эмуляции сессии
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      // Инициализируем категории для пользователя
      initializeUserCategories(user.id);
      
      return { data: { user, token } };
    }
    throw new Error('Необходимо указать email и пароль');
  },
  
  register: async (userData) => {
    await delay(500); // Длиннее задержка для регистрации
    if (userData.email && userData.password) {
      // Проверка, что пользователь с таким email не существует
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = storedUsers.find(user => user.email === userData.email);
      
      if (existingUser) {
        throw new Error('Пользователь с таким email уже существует');
      }
      
      // Создаем нового пользователя
      const newUser = {
        id: `user-${Date.now()}`,
        email: userData.email,
        password: userData.password,
        name: userData.name || 'Пользователь',
        createdAt: new Date().toISOString()
      };
      
      // Сохраняем в "базу данных"
      storedUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(storedUsers));
      
      // Создаем токен и данные пользователя
      const token = `fake-token-${Date.now()}`;
      const user = { email: newUser.email, id: newUser.id, name: newUser.name };
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      initializeUserCategories(user.id);
      
      return { data: { user, token } };
    }
    throw new Error('Необходимо указать email и пароль');
  },
  
  logout: async () => {
    await delay(300);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return { success: true };
  },
  
  getCurrentUser: async () => {
    await delay(300);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      throw new Error('Пользователь не аутентифицирован');
    }
    
    initializeUserCategories(user.id);
    
    return { data: user };
  },
};