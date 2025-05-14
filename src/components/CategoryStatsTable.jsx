import { useSelector } from 'react-redux';
import { formatCurrency } from '../utils/formatters';

const CategoryStatsTable = ({ period, dateRange }) => {
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

  // Подготавливаем статистику по категориям
  const prepareStatsData = () => {
    // Фильтруем транзакции по выбранному периоду
    const filteredTransactions = filterTransactionsByPeriod(transactions);
    
    // Группируем транзакции по типу (доход/расход) и категориям
    const stats = {
      expense: {},
      income: {}
    };

    // Общие суммы
    const totals = {
      expense: 0,
      income: 0
    };

    // Обрабатываем все транзакции
    filteredTransactions.forEach(transaction => {
      const { type, categoryId, amount } = transaction;
      if (!stats[type][categoryId]) {
        stats[type][categoryId] = {
          amount: 0,
          count: 0
        };
      }
      
      stats[type][categoryId].amount += amount;
      stats[type][categoryId].count += 1;
      totals[type] += amount;
    });

    // Создаем итоговый массив данных с процентами
    const expenseData = Object.entries(stats.expense).map(([categoryId, data]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        categoryId,
        categoryName: category ? category.name : 'Неизвестная категория',
        color: category ? category.color : '#CBD5E0',
        amount: data.amount,
        count: data.count,
        percentage: totals.expense > 0 ? (data.amount / totals.expense * 100).toFixed(1) : 0,
        type: 'expense'
      };
    }).sort((a, b) => b.amount - a.amount);

    const incomeData = Object.entries(stats.income).map(([categoryId, data]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        categoryId,
        categoryName: category ? category.name : 'Неизвестная категория',
        color: category ? category.color : '#CBD5E0',
        amount: data.amount,
        count: data.count,
        percentage: totals.income > 0 ? (data.amount / totals.income * 100).toFixed(1) : 0,
        type: 'income'
      };
    }).sort((a, b) => b.amount - a.amount);

    return {
      expenses: expenseData,
      incomes: incomeData,
      totals
    };
  };

  const { expenses, incomes, totals } = prepareStatsData();

  // Получаем заголовок периода для отображения
  const getPeriodTitle = () => {
    if (!period || period === 'all') return '';
    
    if (period === 'custom' && dateRange) {
      const startDate = new Date(dateRange.startDate).toLocaleDateString();
      const endDate = new Date(dateRange.endDate).toLocaleDateString();
      return ` за период ${startDate} - ${endDate}`;
    }
    
    return ` за ${
      period === 'week' ? 'неделю' : 
      period === 'month' ? 'месяц' : 
      period === 'quarter' ? 'квартал' : 'год'
    }`;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Детальная статистика по категориям{getPeriodTitle()}
      </h2>

      {/* Таблица расходов */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Расходы</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сумма
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Кол-во транзакций
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % от общих расходов
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((item) => (
                <tr key={item.categoryId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      <div className="text-sm font-medium text-gray-900">{item.categoryName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(item.amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.count}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.percentage}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="h-2 rounded-full bg-red-500"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    Нет данных о расходах{period !== 'all' ? ' за выбранный период' : ''}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-3 text-left text-sm font-medium text-gray-700">Итого</td>
                <td className="px-6 py-3 text-left text-sm font-medium text-gray-700">{formatCurrency(totals.expense)}</td>
                <td colSpan="2" className="px-6 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Таблица доходов */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Доходы</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сумма
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Кол-во транзакций
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % от общих доходов
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incomes.map((item) => (
                <tr key={item.categoryId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      <div className="text-sm font-medium text-gray-900">{item.categoryName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(item.amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.count}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.percentage}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
              {incomes.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    Нет данных о доходах{period !== 'all' ? ' за выбранный период' : ''}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-3 text-left text-sm font-medium text-gray-700">Итого</td>
                <td className="px-6 py-3 text-left text-sm font-medium text-gray-700">{formatCurrency(totals.income)}</td>
                <td colSpan="2" className="px-6 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoryStatsTable; 