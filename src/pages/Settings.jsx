import CategoryManager from '../components/CategoryManager';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, deleteAccount } from '../store/slices/authSlice';
import { fetchCategories } from '../store/slices/categoriesSlice';

const Settings = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('categories');

  // Загружаем категории при открытии страницы настроек
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      dispatch(logoutUser());
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Вы действительно хотите удалить свой аккаунт? Это действие невозможно отменить.')) {
      if (window.confirm('Все ваши данные будут удалены. Подтвердите удаление.')) {
        dispatch(deleteAccount());
      }
    }
  };

  return (
    <div className="py-6 w-full">
      <div className="space-y-6 max-w-full w-full">
        {/* Табы для переключения между разными настройками */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('categories')}
              className={`${
                activeTab === 'categories'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Категории
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`${
                activeTab === 'profile'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Профиль
            </button>
          </nav>
        </div>

        {/* Контент в зависимости от активного таба */}
        <div className="space-y-6">
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'profile' && (
            <div className="bg-white shadow-lg rounded-lg p-6 transition-shadow duration-300 hover:shadow-xl w-full">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Профиль пользователя</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                </div>
                
                <div className="pt-4 flex flex-col gap-3">
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors duration-200 disabled:opacity-70"
                  >
                    {loading ? 'Выполняется...' : 'Выйти из аккаунта'}
                  </button>
                  
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-800 transition-colors duration-200 disabled:opacity-70"
                  >
                    {loading ? 'Выполняется...' : 'Удалить аккаунт'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings; 