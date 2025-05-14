import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TransactionsList from '../components/TransactionsList';
import { formatCurrency } from '../utils/formatters';
import AddTransactionButton from '../components/AddTransactionButton';
import TransactionModal from '../components/TransactionModal';
import TopCategories from '../components/TopCategories';
import { fetchTransactions } from '../store/slices/transactionsSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { transactions, loading } = useSelector((state) => state.transactions);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);
  
  // Подсчет общего баланса
  const calculateBalance = () => {
    return transactions.reduce((total, transaction) => {
      if (transaction.type === 'income') {
        return total + transaction.amount;
      } else {
        return total - transaction.amount;
      }
    }, 0);
  };

  // Подсчет доходов
  const calculateIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Подсчет расходов
  const calculateExpense = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const balance = calculateBalance();
  const totalIncome = calculateIncome();
  const totalExpense = calculateExpense();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="py-6">
      <div className="space-y-8">
        {/* Карточки с балансом, доходами и расходами */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`relative overflow-hidden bg-white shadow-lg rounded-lg p-6 ${
            balance >= 0 ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
          } transition-shadow duration-300 hover:shadow-xl`}>
            <div className="relative z-10">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Текущий баланс</h2>
              <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
            <div 
              className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4"
              style={{ width: '120px', height: '120px' }}
            >
              <div className={`w-full h-full rounded-full ${balance >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-white shadow-lg rounded-lg p-6 border-l-4 border-green-500 transition-shadow duration-300 hover:shadow-xl">
            <div className="relative z-10">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Доходы</h2>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div 
              className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4"
              style={{ width: '120px', height: '120px' }}
            >
              <div className="w-full h-full rounded-full bg-green-500"></div>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-white shadow-lg rounded-lg p-6 border-l-4 border-red-500 transition-shadow duration-300 hover:shadow-xl">
            <div className="relative z-10">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Расходы</h2>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(totalExpense)}
              </p>
            </div>
            <div 
              className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4"
              style={{ width: '120px', height: '120px' }}
            >
              <div className="w-full h-full rounded-full bg-red-500"></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Популярные категории */}
          <div className="bg-white shadow-lg rounded-lg p-6 transition-shadow duration-300 hover:shadow-xl">
            <TopCategories />
          </div>
        </div>
        
        {/* Список транзакций */}
        <div className="bg-white shadow-lg rounded-lg p-2 sm:p-4 transition-shadow duration-300 hover:shadow-xl">
          <TransactionsList />
        </div>
      </div>

      {/* Кнопка быстрого добавления транзакции */}
      <AddTransactionButton onOpenForm={handleOpenModal} />

      {/* Модальное окно с формой транзакции */}
      <TransactionModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default Dashboard; 