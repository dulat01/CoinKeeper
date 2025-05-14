/**
 * Функция для форматирования чисел в денежный формат
 * @param {number} value - Число для форматирования
 * @param {string} currency - Код валюты (по умолчанию KZT)
 * @returns {string} - Отформатированная строка с валютой
 */
export const formatCurrency = (value, currency = 'KZT') => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Функция для форматирования даты в локализованный формат
 * @param {string|Date} date - Дата для форматирования
 * @param {string} format - Формат отображения (short, medium, long)
 * @returns {string} - Отформатированная строка с датой
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  let options;
  switch(format) {
    case 'short':
      options = { day: 'numeric', month: 'numeric', year: 'numeric' };
      break;
    case 'medium':
      options = { day: 'numeric', month: 'long', year: 'numeric' };
      break;
    case 'long':
      options = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        weekday: 'long' 
      };
      break;
    default:
      options = { day: 'numeric', month: 'numeric', year: 'numeric' };
  }
  
  return dateObj.toLocaleDateString('ru-RU', options);
};

/**
 * Функция для сокращения длинного текста
 * @param {string} text - Исходный текст
 * @param {number} maxLength - Максимальная длина (по умолчанию 50)
 * @returns {string} - Сокращенный текст
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
};

/**
 * Функция для форматирования процентов
 * @param {number} value - Число для форматирования в процент
 * @param {number} decimals - Количество десятичных знаков (по умолчанию 0)
 * @returns {string} - Отформатированная строка с процентом
 */
export const formatPercent = (value, decimals = 0) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}; 