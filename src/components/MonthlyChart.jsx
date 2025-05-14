import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatters';

const MonthlyChart = ({ period, dateRange }) => {
  const { transactions } = useSelector((state) => state.transactions);

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const filterTransactionsByPeriod = (transactions) => {
    if (!period || period === 'all') return transactions;

    const now = new Date();
    let startDate;

    if (period === 'custom' && dateRange) {
      return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= new Date(dateRange.startDate) && 
               transactionDate <= new Date(dateRange.endDate);
      });
    }

    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 3);
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

  const prepareDailyData = () => {
    const filteredTransactions = filterTransactionsByPeriod(transactions);
    const dailyData = {};
    
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - 7);
    
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dayKey = d.toISOString().split('T')[0];
      dailyData[dayKey] = { 
        date: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(d),
        income: 0, 
        expense: 0 
      };
    }
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const dayKey = date.toISOString().split('T')[0];
      
      if (dailyData[dayKey]) {
        if (transaction.type === 'income') {
          dailyData[dayKey].income += transaction.amount;
        } else {
          dailyData[dayKey].expense += transaction.amount;
        }
      }
    });
    
    return Object.keys(dailyData)
      .sort()
      .map(key => dailyData[key]);
  };
  
  const prepareMonthlyDataByDays = () => {
    const filteredTransactions = filterTransactionsByPeriod(transactions);
    const daysData = {};
    
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayKey = d.toISOString().split('T')[0];
      daysData[dayKey] = { 
        date: d.getDate().toString(),
        income: 0, 
        expense: 0 
      };
    }
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const dayKey = date.toISOString().split('T')[0];
      
      if (daysData[dayKey]) {
        if (transaction.type === 'income') {
          daysData[dayKey].income += transaction.amount;
        } else {
          daysData[dayKey].expense += transaction.amount;
        }
      }
    });
    
    return Object.keys(daysData)
      .sort()
      .map(key => daysData[key]);
  };

  const prepareQuarterlyData = () => {
    const filteredTransactions = filterTransactionsByPeriod(transactions);
    const monthlyData = {};
    
    const now = new Date();
    const startMonth = now.getMonth() - 2;
    
    for (let i = 0; i < 3; i++) {
      const month = (startMonth + i + 12) % 12;
      const year = now.getFullYear() - (startMonth + i < 0 ? 1 : 0);
      
      const monthKey = `${year}-${month}`;
      monthlyData[monthKey] = { 
        month: months[month],
        income: 0, 
        expense: 0 
      };
    }
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const month = date.getMonth();
      const year = date.getFullYear();
      const monthKey = `${year}-${month}`;
      
      if (monthlyData[monthKey]) {
        if (transaction.type === 'income') {
          monthlyData[monthKey].income += transaction.amount;
        } else {
          monthlyData[monthKey].expense += transaction.amount;
        }
      }
    });
    
    return Object.entries(monthlyData)
      .sort(([keyA], [keyB]) => {
        const [yearA, monthA] = keyA.split('-').map(Number);
        const [yearB, monthB] = keyB.split('-').map(Number);
        return yearA !== yearB ? yearA - yearB : monthA - monthB;
      })
      .map(([_, data]) => data);
  };

  const prepareMonthlyData = () => {
    const filteredTransactions = filterTransactionsByPeriod(transactions);
    
    const monthlyData = {};

    let startYear, startMonth, endYear, endMonth;
    
    if (period === 'custom' && dateRange) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      startYear = startDate.getFullYear();
      startMonth = startDate.getMonth();
      endYear = endDate.getFullYear();
      endMonth = endDate.getMonth();
    } else {
      const now = new Date();
      startYear = endYear = now.getFullYear();
      startMonth = 0;
      endMonth = now.getMonth();
    }

    for (let year = startYear; year <= endYear; year++) {
      const monthStart = year === startYear ? startMonth : 0;
      const monthEnd = year === endYear ? endMonth : 11;
      
      for (let month = monthStart; month <= monthEnd; month++) {
        const monthKey = `${year}-${month}`;
        monthlyData[monthKey] = { 
          month: months[month] + (startYear !== endYear ? ` ${year}` : ''), 
          income: 0, 
          expense: 0 
        };
      }
    }

    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthKey = `${year}-${month}`;
      
      if (monthlyData[monthKey]) {
        if (transaction.type === 'income') {
          monthlyData[monthKey].income += transaction.amount;
        } else {
          monthlyData[monthKey].expense += transaction.amount;
        }
      }
    });

    return Object.entries(monthlyData)
      .sort(([keyA], [keyB]) => {
        const [yearA, monthA] = keyA.split('-').map(Number);
        const [yearB, monthB] = keyB.split('-').map(Number);
        return yearA !== yearB ? yearA - yearB : monthA - monthB;
      })
      .map(([_, data]) => data);
  };

  const getChartData = () => {
    switch (period) {
      case 'week':
        return prepareDailyData();
      case 'month':
        return prepareMonthlyDataByDays();
      case 'quarter':
        return prepareQuarterlyData();
      case 'year':
      case 'custom':
      default:
        return prepareMonthlyData();
    }
  };

  const data = getChartData();
  
  const getChartTitle = () => {
    switch (period) {
      case 'week':
        return 'Доходы и расходы по дням за неделю';
      case 'month':
        return 'Доходы и расходы по дням за месяц';
      case 'quarter':
        return 'Доходы и расходы по месяцам за 3 месяца';
      case 'year':
        return 'Доходы и расходы по месяцам за год';
      case 'custom':
        return 'Доходы и расходы за выбранный период';
      default:
        return 'Доходы и расходы по месяцам';
    }
  };
  
  const getXAxisKey = () => {
    return period === 'week' || period === 'month' ? 'date' : 'month';
  };

  const tooltipFormatter = (value) => [formatCurrency(value), 'Сумма'];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {getChartTitle()}
      </h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={getXAxisKey()} />
            <YAxis />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
            <Bar dataKey="income" name="Доходы" fill="#4ADE80" />
            <Bar dataKey="expense" name="Расходы" fill="#F87171" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyChart; 