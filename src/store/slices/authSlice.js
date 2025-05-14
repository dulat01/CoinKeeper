import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../utils/api';
import { fetchCategories } from './categoriesSlice';

const defaultCategories = [
  { name: 'Продукты', type: 'expense', color: '#4CAF50' },
  { name: 'Транспорт', type: 'expense', color: '#2196F3' },
  { name: 'Развлечения', type: 'expense', color: '#9C27B0' },
  { name: 'Коммунальные услуги', type: 'expense', color: '#FF9800' },
  { name: 'Здоровье', type: 'expense', color: '#F44336' },
  { name: 'Одежда', type: 'expense', color: '#795548' },
  { name: 'Образование', type: 'expense', color: '#009688' },
  { name: 'Зарплата', type: 'income', color: '#4CAF50' },
  { name: 'Фриланс', type: 'income', color: '#673AB7' },
  { name: 'Подарки', type: 'income', color: '#E91E63' },
];

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem('token', response.data.token);
      
      setTimeout(() => {
        dispatch(fetchCategories());
      }, 100);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка входа');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const response = await authAPI.register(userData);
      localStorage.setItem('token', response.data.token);
      
      const userId = response.data.user.id;
      
      const userCategories = defaultCategories.map(category => ({
        ...category,
        id: `${Date.now().toString()}-${Math.random().toString(36).substr(2, 5)}`
      }));
      
      localStorage.setItem(`${userId}_categories`, JSON.stringify(userCategories));
      
      setTimeout(() => {
        dispatch(fetchCategories());
      }, 100);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка регистрации');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при выходе');
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.deleteAccount();
      return null;
    } catch (error) {
      return rejectWithValue(error.message || 'Ошибка при удалении аккаунта');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await authAPI.getCurrentUser();
      
      setTimeout(() => {
        dispatch(fetchCategories());
      }, 100);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка получения данных пользователя');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })

      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('token');
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 