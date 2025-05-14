import { useSelector } from 'react-redux';
import CategoryCard from './CategoryCard';

const TopCategories = () => {
  const { transactions } = useSelector((state) => state.transactions);
  const { categories } = useSelector((state) => state.categories);

  // Подсчет сумм для каждой категории по типу (доходы/расходы)
  const calculateCategoryTotals = () => {
    const expenseTotals = {};
    const incomeTotals = {};

    transactions.forEach(transaction => {
      const { categoryId, amount, type } = transaction;
      
      if (type === 'expense') {
        if (!expenseTotals[categoryId]) {
          expenseTotals[categoryId] = 0;
        }
        expenseTotals[categoryId] += amount;
      } else {
        if (!incomeTotals[categoryId]) {
          incomeTotals[categoryId] = 0;
        }
        incomeTotals[categoryId] += amount;
      }
    });

    return { expenseTotals, incomeTotals };
  };

  const { expenseTotals, incomeTotals } = calculateCategoryTotals();

  // Получаем топ-3 категории расходов
  const getTopExpenseCategories = () => {
    return Object.entries(expenseTotals)
      .map(([categoryId, amount]) => ({
        category: categories.find(c => c.id === categoryId),
        amount
      }))
      .filter(item => item.category) // Фильтруем только существующие категории
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  };

  // Получаем топ-3 категории доходов
  const getTopIncomeCategories = () => {
    return Object.entries(incomeTotals)
      .map(([categoryId, amount]) => ({
        category: categories.find(c => c.id === categoryId),
        amount
      }))
      .filter(item => item.category) // Фильтруем только существующие категории
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  };

  const topExpenses = getTopExpenseCategories();
  const topIncomes = getTopIncomeCategories();

  return (
    <div className="space-y-6">
      {/* Топ категорий расходов */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Топ категорий расходов</h2>
        {topExpenses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topExpenses.map(({ category, amount }) => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                totalAmount={amount} 
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Нет данных о расходах</p>
        )}
      </div>

      {/* Топ категорий доходов */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Топ категорий доходов</h2>
        {topIncomes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topIncomes.map(({ category, amount }) => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                totalAmount={amount} 
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Нет данных о доходах</p>
        )}
      </div>
    </div>
  );
};

export default TopCategories; 