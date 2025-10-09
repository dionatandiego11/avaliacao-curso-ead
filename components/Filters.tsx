
import React from 'react';

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
  areas: string[];
  selectedGrau: string;
  onGrauChange: (value: string) => void;
  graus: string[];
  selectedCurso: string;
  onCursoChange: (value: string) => void;
  cursos: string[];
}

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

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
  areas,
  selectedGrau,
  onGrauChange,
  graus,
  selectedCurso,
  onCursoChange,
  cursos,
}) => {
    
  const selectClassName = "w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500";

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
          aria-label="Buscar por universidade, curso ou polo"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <select
          value={selectedRegion}
          onChange={(e) => onRegionChange(e.target.value)}
          className={selectClassName}
          aria-label="Filtrar por região"
        >
          <option value="">Todas as Regiões</option>
          {regions.map((region) => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
        
        <select
          value={selectedArea}
          onChange={(e) => onAreaChange(e.target.value)}
          className={selectClassName}
          aria-label="Filtrar por área de conhecimento"
        >
          <option value="">Todas as Áreas</option>
          {areas.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>

        <select
          value={selectedGrau}
          onChange={(e) => onGrauChange(e.target.value)}
          className={selectClassName}
          aria-label="Filtrar por grau do curso"
        >
          <option value="">Todos os Graus</option>
          {graus.map((grau) => (
            <option key={grau} value={grau}>{grau}</option>
          ))}
        </select>
        
        <select
          value={selectedCurso}
          onChange={(e) => onCursoChange(e.target.value)}
          className={`${selectClassName} disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={cursos.length === 0}
          aria-label="Filtrar por curso"
        >
          <option value="">Todos os Cursos</option>
          {cursos.map((curso) => (
            <option key={curso} value={curso}>{curso}</option>
          ))}
        </select>

        <div className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-between">
            <label htmlFor="rating-filter" className="text-slate-600 dark:text-slate-300 text-sm">Nota Mínima:</label>
            <div id="rating-filter" className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rate) => (
                    <button key={rate} onClick={() => onRatingChange(rate)} className="focus:outline-none" aria-label={`Nota mínima ${rate}`}>
                         <StarIcon className={`w-5 h-5 transition-colors ${minRating >= rate ? 'text-amber-400' : 'text-slate-300 dark:text-slate-500 hover:text-amber-300'}`} />
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
