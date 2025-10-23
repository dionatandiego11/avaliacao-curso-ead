
import React from 'react';
import UniversityIcon from './icons/UniversityIcon';
import DocumentIcon from './icons/DocumentIcon';
import LocationIcon from './icons/LocationIcon';

interface Category {
  name: string;
  icon: React.ReactNode;
}

const categories: Category[] = [
  { name: 'Universidade', icon: <UniversityIcon className="w-6 h-6 mr-3" /> },
  { name: 'Curso', icon: <DocumentIcon className="w-6 h-6 mr-3" /> },
  { name: 'Localização', icon: <LocationIcon className="w-6 h-6 mr-3" /> },
];

const CategoryButton: React.FC<{ category: Category }> = ({ category }) => (
  <button className="bg-white text-gray-900 rounded-lg shadow-lg px-8 py-4 flex items-center justify-center font-semibold text-lg hover:bg-gray-200 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
    {category.icon}
    {category.name}
  </button>
);

const CategoryButtons: React.FC = () => {
  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
      {categories.map((cat) => (
        <CategoryButton key={cat.name} category={cat} />
      ))}
    </div>
  );
};

export default CategoryButtons;
