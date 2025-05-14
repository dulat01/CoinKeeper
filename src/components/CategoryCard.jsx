import { useState } from 'react';
import { formatCurrency } from '../utils/formatters';

const CategoryCard = ({ category, totalAmount }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-xl shadow-md transition-all duration-300 transform"
      style={{
        backgroundColor: category.color,
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? `0 10px 25px -5px ${category.color}66, 0 8px 10px -6px ${category.color}33` 
          : `0 4px 6px -1px ${category.color}33, 0 2px 4px -1px ${category.color}22`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-5 text-white">
        <h3 className="text-xl font-bold mb-2">{category.name}</h3>
        <p className="text-3xl font-extrabold">{formatCurrency(totalAmount)}</p>
      </div>
      
      {/* Декоративные элементы */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full transform -translate-x-6 translate-y-6"></div>
    </div>
  );
};

export default CategoryCard; 