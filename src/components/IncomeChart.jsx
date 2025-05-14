import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../utils/formatters';

const IncomeChart = ({ period, dateRange }) => {
  const { transactions } = useSelector((state) => state.transactions);
  const { categories } = useSelector((state) => state.categories);

  // Функция для получения цвета категории
  const getCategoryColor = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.color : '#CBD5E0'; // Серый по умолчанию
  };

  // Функция для получения имени категории
  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Без категории';
  };

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
    // Фильтруем только доходы по выбранному периоду
    const filteredTransactions = filterTransactionsByPeriod(transactions);
    const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
    
    // Вычисляем общую сумму доходов для процентов
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Группируем доходы по категориям
    const incomesByCategory = incomeTransactions.reduce((acc, transaction) => {
      const { categoryId, amount } = transaction;
      if (!acc[categoryId]) {
        acc[categoryId] = 0;
      }
      acc[categoryId] += amount;
      return acc;
    }, {});

    // Преобразуем объект в массив для recharts и добавляем проценты
    const data = Object.entries(incomesByCategory).map(([categoryId, value]) => ({
      name: getCategoryName(categoryId),
      value,
      color: getCategoryColor(categoryId),
      percent: totalIncome > 0 ? (value / totalIncome * 100).toFixed(0) : 0
    }));

    // Сортируем по размеру доходов от большего к меньшему
    return data.sort((a, b) => b.value - a.value);
  };

  const data = prepareChartData();

  // Если нет данных, показываем сообщение
  if (data.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Доходы по категориям</h2>
        <p className="text-gray-500">Нет данных для отображения{period !== 'all' ? ' за выбранный период' : ''}</p>
      </div>
    );
  }

  // Форматтер для отображения значений в тултипе
  const tooltipFormatter = (value) => [formatCurrency(value), 'Сумма'];
  
  // Кастомный формат лейбла с процентами
  const renderCustomizedLabel = ({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
    if (percent < 5) return null; // Не показываем маленькие секторы
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${percent}%`}
      </text>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Доходы по категориям
        {period !== 'all' && period !== 'custom' && ` за ${
          period === 'week' ? 'неделю' : 
          period === 'month' ? 'месяц' : 
          period === 'quarter' ? 'квартал' : 'год'
        }`}
      </h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IncomeChart; 