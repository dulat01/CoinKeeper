import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { formatCurrency, formatDate } from '../utils/formatters';
import { deleteTransaction } from '../store/slices/transactionsSlice';
import EditTransactionModal from './EditTransactionModal';
import { TrashIcon } from '@heroicons/react/24/outline';

const TransactionsList = () => {
  const dispatch = useDispatch();
  const { transactions } = useSelector((state) => state.transactions);
  const { categories } = useSelector((state) => state.categories);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Без категории';
  };

  // Обработчик выбора транзакции для редактирования
  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  // Обработчик закрытия модального окна
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedTransaction(null);
  };

  // Обработчик выбора всех транзакций
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(sortedTransactions.map(t => t.id));
    }
    setSelectAll(!selectAll);
  };

  // Обработчик выбора отдельной транзакции
  const handleSelectTransaction = (event, id) => {
    event.stopPropagation(); // Предотвращаем открытие модального окна
    
    if (selectedTransactions.includes(id)) {
      setSelectedTransactions(selectedTransactions.filter(transactionId => transactionId !== id));
      if (selectAll) setSelectAll(false);
    } else {
      setSelectedTransactions([...selectedTransactions, id]);
      if (sortedTransactions.length === selectedTransactions.length + 1) {
        setSelectAll(true);
      }
    }
  };

  // Обработчик удаления выбранных транзакций
  const handleDeleteSelected = () => {
    if (selectedTransactions.length === 0) return;
    
    if (window.confirm(`Вы уверены, что хотите удалить ${selectedTransactions.length} транзакций?`)) {
      selectedTransactions.forEach(id => {
        dispatch(deleteTransaction(id));
      });
      setSelectedTransactions([]);
      setSelectAll(false);
    }
  };

  // Сортировка транзакций по дате (самые новые сверху)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  if (sortedTransactions.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500">Транзакции пока отсутствуют</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            История транзакций
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Нажмите на строку для редактирования транзакции
          </p>
        </div>
        {selectedTransactions.length > 0 && (
          <button
            onClick={handleDeleteSelected}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Удалить выбранные ({selectedTransactions.length})
          </button>
        )}
      </div>
      <div className="border-t border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Описание
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сумма
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTransactions.map((transaction) => (
                <tr 
                  key={transaction.id} 
                  className={`hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                    selectedTransactions.includes(transaction.id) ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => handleTransactionClick(transaction)}
                >
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={(e) => handleSelectTransaction(e, transaction.id)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getCategoryName(transaction.categoryId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.description}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно редактирования транзакции */}
      <EditTransactionModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default TransactionsList; 