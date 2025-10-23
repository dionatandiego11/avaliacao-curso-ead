
import React from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon';

const SearchBar: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-2xl flex items-center p-2 text-gray-800">
      <div className="flex items-center border-r border-gray-200 pr-4">
        <button className="flex items-center space-x-2 focus:outline-none">
          <span className="font-semibold text-lg">Universidade</span>
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <input
        type="text"
        placeholder="Digite o que você procura..."
        className="w-full text-lg px-4 py-2 bg-transparent focus:outline-none"
      />
    </div>
  );
};

export default SearchBar;
