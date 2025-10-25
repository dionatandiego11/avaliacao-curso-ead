import React, { useState, useMemo, useEffect } from 'react';
import GridIcon from '../components/icons/GridIcon';
import StarIcon from '../components/icons/StarIcon';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getInstitutionTypeLabel } from '../utils/firestoreUtils';

interface RankingPageProps {
  onNavigate: (page: string) => void;
}

interface Course {
    id: string;
    nome: string;
    ies: string;
    uf: string;
    media: number;
    avaliacoes: number;
    area: string;
    grau: string;
    tipo: string;
}

const ITEMS_PER_PAGE = 9;

const RankingPage: React.FC<RankingPageProps> = ({ onNavigate }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        uf: 'all',
        area: 'all',
        grau: 'all',
        tipo: 'all'
    });
    const [sortBy, setSortBy] = useState('media');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, "cursos"));
                const coursesData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        nome: data.NO_CURSO || 'N/A',
                        ies: data.NO_IES || 'N/A',
                        uf: data.SG_UF_IES || 'N/A',
                        media: data.media_geral || 0,
                        avaliacoes: data.qtd_avaliacoes || 0,
                        area: data.NO_CINE_AREA_GERAL || 'N/A',
                        grau: data.TP_GRAU_ACADEMICO || 'N/A',
                        tipo: getInstitutionTypeLabel(data.IN_GRATUITO)
                    };
                });
                setCourses(coursesData);
            } catch (error) {
                console.error("Error fetching courses: ", error);
            }
            setLoading(false);
        };
        fetchCourses();
    }, []);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const filteredAndSortedCourses = useMemo(() => {
        let result = courses.filter(course => {
            return (filters.uf === 'all' || course.uf === filters.uf) &&
                   (filters.area === 'all' || course.area === filters.area) &&
                   (filters.grau === 'all' || course.grau === filters.grau) &&
                   (filters.tipo === 'all' || course.tipo === filters.tipo);
        });

        result.sort((a, b) => {
            switch (sortBy) {
                case 'avaliacoes':
                    return b.avaliacoes - a.avaliacoes;
                case 'alfabetica':
                    return a.nome.localeCompare(b.nome);
                case 'media':
                default:
                    return b.media - a.media;
            }
        });
        return result;
    }, [courses, filters, sortBy]);
    
    const paginatedCourses = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, filteredAndSortedCourses]);

    const totalPages = Math.ceil(filteredAndSortedCourses.length / ITEMS_PER_PAGE);

    const FilterSelect: React.FC<{name: string, label: string, options: {value: string, label: string}[]}> = ({name, label, options}) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-500">{label}</label>
            <select
                id={name}
                name={name}
                onChange={handleFilterChange}
                value={filters[name as keyof typeof filters]}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );
    
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
                        <GridIcon className="w-8 h-8 text-gray-700" />
                        <span className="text-2xl font-bold tracking-wider text-gray-800">AVALIAEAD</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Ranking de Cursos</h1>
                
                <div className="bg-white p-4 rounded-lg shadow-md mb-8 sticky top-[80px] z-10">
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <FilterSelect name="uf" label="UF" options={[{value: 'all', label: 'Todos'}, ...[...new Set(courses.map(c => c.uf))].sort().map(uf => ({value: uf, label: uf}))]} />
                        <FilterSelect name="area" label="Área" options={[{value: 'all', label: 'Todas'}, ...[...new Set(courses.map(c => c.area))].sort().map(area => ({value: area, label: area}))]} />
                        <FilterSelect name="grau" label="Grau" options={[{value: 'all', label: 'Todos'}, ...[...new Set(courses.map(c => c.grau))].sort().map(grau => ({value: grau, label: grau}))]} />
                        <FilterSelect name="tipo" label="Tipo" options={[{value: 'all', label: 'Todos'}, ...[...new Set(courses.map(c => c.tipo))].sort().map(tipo => ({value: tipo, label: tipo}))]} />
                        <div className="col-span-2 md:col-span-1">
                             <label htmlFor="sortBy" className="block text-sm font-medium text-gray-500">Ordenar por</label>
                            <select id="sortBy" name="sortBy" onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }} value={sortBy} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option value="media">Maior nota</option>
                                <option value="avaliacoes">Mais avaliados</option>
                                <option value="alfabetica">Ordem alfabética</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? <div className="text-center">Carregando cursos...</div> : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedCourses.map(course => (
                            <div key={course.id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                               <div className="flex-grow">
                                 <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-semibold bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full">{course.uf}</span>
                                    <div className="flex items-center">
                                        <span className="text-xl font-bold text-amber-500 mr-1">{course.media.toFixed(1)}</span>
                                        <StarIcon className="w-5 h-5" fill="#FBBF24" />
                                    </div>
                                 </div>
                                 <h3 className="text-xl font-bold text-gray-900 mb-1">{course.nome}</h3>
                                 <p className="text-gray-600 text-sm mb-4">{course.ies}</p>
                               </div>
                               <div className="text-xs text-gray-500 border-t pt-3 mt-4">
                                 {course.avaliacoes} avaliações
                               </div>
                            </div>
                        ))}
                    </div>
                    
                     {paginatedCourses.length === 0 && <p className="text-center text-gray-500 col-span-full">Nenhum curso encontrado com os filtros selecionados.</p>}
    
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center items-center space-x-4">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                Anterior
                            </button>
                            <span className="text-sm text-gray-700">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                Próxima
                            </button>
                        </div>
                    )}
                 </>
                )}
            </main>
        </div>
    );
};

export default RankingPage;
