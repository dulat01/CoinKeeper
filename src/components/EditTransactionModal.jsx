import { Fragment, useRef, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { updateTransaction, deleteTransaction } from '../store/slices/transactionsSlice';

const EditTransactionModal = ({ isOpen, onClose, transaction }) => {
  const dispatch = useDispatch();
  const cancelButtonRef = useRef(null);
  const categories = useSelector((state) => state.categories.categories);

  const [form, setForm] = useState({
    id: '',
    amount: '',
    description: '',
    categoryId: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
  });
  
  // Состояние для отформатированной суммы
  const [formattedAmount, setFormattedAmount] = useState('');

  // Инициализация формы при открытии модального окна
  useEffect(() => {
    if (transaction) {
      setForm({
        id: transaction.id,
        amount: transaction.amount.toString(),
        description: transaction.description || '',
        categoryId: transaction.categoryId,
        type: transaction.type,
        date: new Date(transaction.date).toISOString().split('T')[0],
      });
      
      // Форматирование суммы
      const formatted = transaction.amount.toLocaleString('ru-RU');
      setFormattedAmount(formatted);
    }
  }, [transaction]);

  // Обновление форматированной суммы при изменении amount
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
    
    // Для поля amount обрабатываем ввод особым образом
    if (name === 'amount') {
      // Удаляем все нечисловые символы, кроме точки и запятой
      const numericValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
      setForm({ ...form, [name]: numericValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedTransaction = {
      ...form,
      amount: Number(form.amount),
      date: new Date(form.date).toISOString(),
    };
    dispatch(updateTransaction(updatedTransaction));
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
      dispatch(deleteTransaction(form.id));
      onClose();
    }
  };

  // Фильтруем категории по выбранному типу транзакции
  const filteredCategories = categories.filter(cat => cat.type === form.type);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                    ref={cancelButtonRef}
                  >
                    <span className="sr-only">Закрыть</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Редактирование транзакции
                    </Dialog.Title>
                    
                    <div className="mt-2">
                      <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-y-4">
                          <div className="flex justify-between items-center mb-2">
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
                            
                            <button
                              type="button"
                              onClick={handleDelete}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Удалить
                            </button>
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
                              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300`}
                            >
                              Сохранить изменения
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default EditTransactionModal; 