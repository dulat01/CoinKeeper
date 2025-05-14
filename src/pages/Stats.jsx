import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchTransactions, fetchTransactionsStats } from '../store/slices/transactionsSlice';
import { fetchCategories } from '../store/slices/categoriesSlice';
import ExpenseChart from '../components/ExpenseChart';
import IncomeChart from '../components/IncomeChart';
import MonthlyChart from '../components/MonthlyChart';
import CategoryStatsTable from '../components/CategoryStatsTable';
import BarChartComponent from '../components/BarChartComponent';

const Stats = () => {
  const dispatch = useDispatch();
  const [periodFilter, setPeriodFilter] = useState('month');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [activeTab, setActiveTab] = useState('pie'); // 'pie', 'bar', 'table'

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchCategories());
    
    // Обновляем статистику при изменении периода
    if (isCustomRange) {
      // Если выбран произвольный период, используем конкретные даты
      dispatch(fetchTransactionsStats({ 
        dateRange: {
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate
        }
      }));
    } else {
      // Иначе используем предопределенный период
      dispatch(fetchTransactionsStats({ period: periodFilter }));
    }
  }, [dispatch, periodFilter, isCustomRange, customDateRange]);

  const handlePeriodChange = (period) => {
    setPeriodFilter(period);
    setIsCustomRange(false);
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setCustomDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCustomRangeSubmit = (e) => {
    e.preventDefault();
    if (customDateRange.startDate && customDateRange.endDate) {
      setIsCustomRange(true);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="py-6">
      <div className="space-y-8">
        {/* Фильтры периода */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="inline-flex shadow-lg rounded-md">
              <button
                onClick={() => handlePeriodChange('week')}
                className={`px-6 py-3 text-sm font-medium rounded-l-md transition-colors duration-200 ${
                  periodFilter === 'week' && !isCustomRange
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Неделя
              </button>
              <button
                onClick={() => handlePeriodChange('month')}
                className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                  periodFilter === 'month' && !isCustomRange
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Месяц
              </button>
              <button
                onClick={() => handlePeriodChange('quarter')}
                className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                  periodFilter === 'quarter' && !isCustomRange
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                3 месяца
              </button>
              <button
                onClick={() => handlePeriodChange('year')}
                className={`px-6 py-3 text-sm font-medium rounded-r-md transition-colors duration-200 ${
                  periodFilter === 'year' && !isCustomRange
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Год
              </button>
            </div>
            
            <form onSubmit={handleCustomRangeSubmit} className="flex flex-wrap items-center space-x-2">
              <div className="flex flex-col">
                <label htmlFor="startDate" className="text-sm text-gray-700 mb-1">С</label>
                <input 
                  type="date" 
                  id="startDate"
                  name="startDate" 
                  value={customDateRange.startDate}
                  onChange={handleDateRangeChange}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="endDate" className="text-sm text-gray-700 mb-1">По</label>
                <input 
                  type="date" 
                  id="endDate" 
                  name="endDate"
                  value={customDateRange.endDate}
                  onChange={handleDateRangeChange}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <button 
                type="submit"
                className={`px-4 py-2 mt-5 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isCustomRange
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={!customDateRange.startDate || !customDateRange.endDate}
              >
                Применить
              </button>
            </form>
          </div>
          
          {isCustomRange && (
            <div className="mt-4 text-center text-sm text-indigo-600">
              Статистика за период: {new Date(customDateRange.startDate).toLocaleDateString()} - {new Date(customDateRange.endDate).toLocaleDateString()}
            </div>
          )}
        </div>
        
        {/* График по месяцам */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <MonthlyChart period={isCustomRange ? 'custom' : periodFilter} dateRange={isCustomRange ? customDateRange : null} />
        </div>
        
        {/* Вкладки с разными типами визуализации */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-4">
              <button
                onClick={() => handleTabChange('pie')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'pie'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Круговые диаграммы
              </button>
              <button
                onClick={() => handleTabChange('bar')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'bar'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Столбчатые диаграммы
              </button>
              <button
                onClick={() => handleTabChange('table')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'table'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Табличный вид
              </button>
            </nav>
          </div>
          
          {/* Отображение соответствующего контента в зависимости от выбранной вкладки */}
          {activeTab === 'pie' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ExpenseChart period={isCustomRange ? 'custom' : periodFilter} dateRange={isCustomRange ? customDateRange : null} />
              <IncomeChart period={isCustomRange ? 'custom' : periodFilter} dateRange={isCustomRange ? customDateRange : null} />
            </div>
          )}
          
          {activeTab === 'bar' && (
            <div className="grid grid-cols-1 gap-6">
              <BarChartComponent 
                period={isCustomRange ? 'custom' : periodFilter} 
                dateRange={isCustomRange ? customDateRange : null} 
                type="expense" 
              />
              <BarChartComponent 
                period={isCustomRange ? 'custom' : periodFilter} 
                dateRange={isCustomRange ? customDateRange : null} 
                type="income" 
              />
            </div>
          )}
          
          {activeTab === 'table' && (
            <CategoryStatsTable period={isCustomRange ? 'custom' : periodFilter} dateRange={isCustomRange ? customDateRange : null} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats; 