
import React from 'react';
import { COURSE_CATALOG } from '../courses';

interface FiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedRegion: string;
  onRegionChange: (value: string) => void;
  minRating: number;
  onRatingChange: (value: number) => void;
  regions: string[];
  selectedArea: string;
  onAreaChange: (value: string) => void;
  selectedDegree: string;
  onDegreeChange: (value: string) => void;
}

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const DEGREES = {
  '1': 'Bacharelado',
  '2': 'Licenciatura',
  '3': 'Tecnólogo',
};

const areas = [...new Set(COURSE_CATALOG.map(item => item.area))];

const Filters: React.FC<FiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  minRating,
  onRatingChange,
  regions,
  selectedArea,
  onAreaChange,
  selectedDegree,
  onDegreeChange,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg mb-8 space-y-4">
      <div className="relative flex-grow">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por universidade, curso ou polo..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <select
          value={selectedRegion}
          onChange={(e) => onRegionChange(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as Regiões</option>
          {regions.map((region) => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>

        <select
          value={selectedArea}
          onChange={(e) => onAreaChange(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as Áreas</option>
          {areas.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>

        <select
          value={selectedDegree}
          onChange={(e) => onDegreeChange(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os Graus</option>
          {Object.entries(DEGREES).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        
        <div className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-between">
            <label className="text-slate-600 dark:text-slate-300">Nota mínima:</label>
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rate) => (
                    <button key={rate} onClick={() => onRatingChange(rate)} className="focus:outline-none">
                         <StarIcon className={`w-5 h-5 transition-colors ${minRating >= rate ? 'text-amber-400' : 'text-slate-300 dark:text-slate-500 hover:text-amber-300'}`} />
                    </button>
                ))}
                 {minRating > 0 && (
                    <button onClick={() => onRatingChange(0)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 ml-1">
                        Limpar
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
