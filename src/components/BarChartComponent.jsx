import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatters';

const BarChartComponent = ({ period, dateRange, type = 'expense' }) => {
  const { transactions } = useSelector((state) => state.transactions);
  const { categories } = useSelector((state) => state.categories);

  // Функция для фильтрации транзакций по периоду
  const filterTransactionsByPeriod = (transactions) => {
    if (!period || period === 'all') return transactions;

    const now = new Date();
    let startDate;

    if (period === 'custom' && dateRange) {
      // Если указан произвольный период
      return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= new Date(dateRange.startDate) && 
               transactionDate <= new Date(dateRange.endDate);
      });
    }

    // Предопределенные периоды
    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return transactions;
    }

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= now;
    });
  };

  // Подготовка данных для диаграммы
  const prepareChartData = () => {
    // Фильтруем транзакции по выбранному периоду и типу
    const filteredTransactions = filterTransactionsByPeriod(transactions)
      .filter(t => t.type === type);
    
    // Группируем транзакции по категориям
    const transactionsByCategory = filteredTransactions.reduce((acc, transaction) => {
      const { categoryId, amount } = transaction;
      if (!acc[categoryId]) {
        acc[categoryId] = 0;
      }
      acc[categoryId] += amount;
      return acc;
    }, {});

    // Преобразуем объект в массив для recharts
    const data = Object.entries(transactionsByCategory).map(([categoryId, amount]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        name: category ? category.name : 'Без категории',
        amount,
        color: category ? category.color : '#CBD5E0',
      };
    });

    // Сортируем по сумме от большей к меньшей
    return data.sort((a, b) => b.amount - a.amount);
  };

  const data = prepareChartData();

  // Если нет данных, показываем сообщение
  if (data.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {type === 'expense' ? 'Расходы' : 'Доходы'} по категориям
        </h2>
        <p className="text-gray-500">Нет данных для отображения{period !== 'all' ? ' за выбранный период' : ''}</p>
      </div>
    );
  }

  // Форматтер для отображения значений в тултипе
  const tooltipFormatter = (value) => [formatCurrency(value), 'Сумма'];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {type === 'expense' ? 'Расходы' : 'Доходы'} по категориям
        {period !== 'all' && period !== 'custom' && ` за ${
          period === 'week' ? 'неделю' : 
          period === 'month' ? 'месяц' : 
          period === 'quarter' ? 'квартал' : 'год'
        }`}
      </h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 100,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip formatter={tooltipFormatter} />
            <Bar 
              dataKey="amount" 
              name={type === 'expense' ? 'Расходы' : 'Доходы'} 
              fill={type === 'expense' ? "#F87171" : "#4ADE80"} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartComponent; 