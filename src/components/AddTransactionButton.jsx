import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

const AddTransactionButton = ({ onOpenForm }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onOpenForm}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-10 right-10 p-5 rounded-full shadow-lg 
                transition-all duration-300 transform
                z-50
                bg-gradient-to-r from-indigo-500 to-purple-600 
                hover:from-indigo-600 hover:to-purple-700
                text-white"
      style={{
        transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0)',
        boxShadow: isHovered 
          ? '0 10px 25px -5px rgba(79, 70, 229, 0.6), 0 8px 10px -6px rgba(79, 70, 229, 0.4)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <PlusIcon className="h-8 w-8" />
      <span className="sr-only">Добавить транзакцию</span>
    </button>
  );
};

export default AddTransactionButton; 