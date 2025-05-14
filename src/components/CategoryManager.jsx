import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCategory, deleteCategoryById, updateCategory } from '../store/slices/categoriesSlice';

// Набор цветов для категорий
const COLOR_PALETTE = [
  '#4CAF50', // Зеленый
  '#2196F3', // Синий
  '#9C27B0', // Фиолетовый
  '#FF9800', // Оранжевый
  '#F44336', // Красный
  '#795548', // Коричневый
  '#607D8B', // Сине-серый
  '#00BCD4', // Голубой
  '#FFEB3B', // Желтый
  '#8BC34A', // Светло-зеленый
  '#673AB7', // Темно-фиолетовый
  '#FF5722', // Глубокий оранжевый
  '#E91E63', // Розовый
  '#009688', // Бирюзовый
  '#3F51B5', // Индиго
];

const CategoryManager = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.categories);
  const [showColorPicker, setShowColorPicker] = useState(null);
  const colorPickerRef = useRef(null);
  
  const [form, setForm] = useState({
    name: '',
    type: 'expense',
    color: getRandomColor(), // Используем случайный цвет по умолчанию
  });

  // Обработчик закрытия палитры цветов при клике вне элемента
  useEffect(() => {
    function handleClickOutside(event) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target) && showColorPicker) {
        setShowColorPicker(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColorPicker]);

  // Функция для выбора случайного цвета из палитры
  function getRandomColor() {
    return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const category = {
      ...form,
      id: Date.now().toString(),
    };
    dispatch(createCategory(category));
    setForm({
      name: '',
      type: form.type, // Сохраняем выбранный тип для удобства добавления похожих категорий
      color: getRandomColor(), // Новый случайный цвет для следующей категории
    });
  };

  const handleDelete = (categoryId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      dispatch(deleteCategoryById(categoryId));
    }
  };

  // Обработчик клика по цвету категории
  const handleColorClick = (categoryId) => {
    setShowColorPicker(showColorPicker === categoryId ? null : categoryId);
  };

  // Обработчик изменения цвета категории
  const handleColorChange = (categoryId, newColor) => {
    dispatch(updateCategory({ id: categoryId, color: newColor }));
    setShowColorPicker(null);
  };

  // Группировка категорий по типу
  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const incomeCategories = categories.filter(cat => cat.type === 'income');

  return (
    <div className="bg-white shadow rounded-lg p-6 w-full">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Управление категориями</h2>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Название категории
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="form-input mt-1 w-full p-2 border border-gray-300 rounded-md"
              placeholder="Например: Продукты"
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Тип
            </label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="form-input mt-1 w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="expense">Расход</option>
              <option value="income">Доход</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700">
              Цвет
            </label>
            <div className="flex items-center mt-1">
              <input
                type="color"
                id="color"
                name="color"
                value={form.color}
                onChange={handleChange}
                className="h-10 w-10 border-0 p-0 mr-2"
              />
              <span className="text-sm text-gray-500">{form.color}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            className="w-full md:w-auto flex justify-center py-2 px-8 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Добавить категорию
          </button>
        </div>
      </form>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3">Категории расходов</h3>
          {expenseCategories.length === 0 ? (
            <p className="text-gray-500 text-sm">Нет категорий расходов</p>
          ) : (
            <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
              {expenseCategories.map((category) => (
                <li key={category.id} className="py-3 px-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="h-5 w-5 rounded-full mr-3 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-gray-400 transition-all"
                      style={{ backgroundColor: category.color }}
                      onClick={() => handleColorClick(category.id)}
                      title="Нажмите, чтобы изменить цвет"
                    />
                    <span className="text-gray-900">{category.name}</span>
                    
                    {showColorPicker === category.id && (
                      <div ref={colorPickerRef} className="absolute mt-10 ml-3 bg-white p-2 rounded-md shadow-lg z-10 grid grid-cols-5 gap-1">
                        {COLOR_PALETTE.map((color) => (
                          <div 
                            key={color}
                            className="h-6 w-6 rounded-full cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={() => handleColorChange(category.id, color)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(category.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3">Категории доходов</h3>
          {incomeCategories.length === 0 ? (
            <p className="text-gray-500 text-sm">Нет категорий доходов</p>
          ) : (
            <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
              {incomeCategories.map((category) => (
                <li key={category.id} className="py-3 px-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="h-5 w-5 rounded-full mr-3 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-gray-400 transition-all"
                      style={{ backgroundColor: category.color }}
                      onClick={() => handleColorClick(category.id)}
                      title="Нажмите, чтобы изменить цвет"
                    />
                    <span className="text-gray-900">{category.name}</span>
                    
                    {showColorPicker === category.id && (
                      <div ref={colorPickerRef} className="absolute mt-10 ml-3 bg-white p-2 rounded-md shadow-lg z-10 grid grid-cols-5 gap-1">
                        {COLOR_PALETTE.map((color) => (
                          <div 
                            key={color}
                            className="h-6 w-6 rounded-full cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={() => handleColorChange(category.id, color)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(category.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager; 