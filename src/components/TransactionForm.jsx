import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTransaction } from '../store/slices/transactionsSlice';

const TransactionForm = ({ onSubmitSuccess }) => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.categories);

  const [form, setForm] = useState({
    amount: '',
    description: '',
    categoryId: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
  });
  
  const [formattedAmount, setFormattedAmount] = useState('');

  useEffect(() => {
    if (form.amount) {
      const formatted = Number(form.amount).toLocaleString('ru-RU');
      setFormattedAmount(formatted);
    } else {
      setFormattedAmount('');
    }
  }, [form.amount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      const numericValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
      setForm({ ...form, [name]: numericValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const transaction = {
      ...form,
      id: Date.now().toString(),
      amount: Number(form.amount),
      date: new Date(form.date).toISOString(),
    };
    dispatch(createTransaction(transaction));
    setForm({
      amount: '',
      description: '',
      categoryId: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    });
    setFormattedAmount('');
    
    if (onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === form.type);

  return (
    <div className="bg-white rounded-lg p-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-y-4">
          <div className="flex justify-center mb-2">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  form.type === 'expense'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setForm({ ...form, type: 'expense', categoryId: '' })}
              >
                Расход
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  form.type === 'income'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setForm({ ...form, type: 'income', categoryId: '' })}
              >
                Доход
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Сумма
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">₸</span>
              </div>
              <input
                type="text"
                id="amount"
                name="amount"
                value={formattedAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
                  setForm({ ...form, amount: value });
                }}
                required
                className="form-input block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Описание (необязательно)
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="form-input mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Например: Продукты в магазине"
            />
          </div>
          
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
              Категория
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required
              className="form-input mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="">Выберите категорию</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {filteredCategories.length === 0 && (
              <p className="mt-1 text-sm text-red-600">
                У вас нет категорий для {form.type === 'expense' ? 'расходов' : 'доходов'}. 
                Добавьте их в настройках.
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Дата
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="form-input mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          
          <div className="mt-4">
            <button
              type="submit"
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                form.type === 'expense' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105`}
            >
              Добавить {form.type === 'expense' ? 'расход' : 'доход'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm; 