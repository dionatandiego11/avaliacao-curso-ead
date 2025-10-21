
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import type { CourseReviewSummary } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';

const StarIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
);

const RankingPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
    const [allCourses, setAllCourses] = useState<CourseReviewSummary[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<CourseReviewSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [filterArea, setFilterArea] = useState('');
    const [filterGratis, setFilterGratis] = useState<boolean | null>(null);
    const [filterGrau, setFilterGrau] = useState('');
    const [filterUF, setFilterUF] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // TODO: This data fetching and aggregation is done on the client-side, which is not scalable.
        // A better approach would be to use a Cloud Function to perform the aggregation on the backend
        // and only fetch the aggregated data on the client.
        const fetchRankings = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // 1. Fetch all reviews
                const reviewsSnapshot = await db.collection('reviews').orderBy('createdAt', 'desc').get();
                const reviews = reviewsSnapshot.docs.map(doc => doc.data());

                // 2. Aggregate review data
                const reviewStats: Record<string, { totalScore: number; count: number }> = {};
                for (const review of reviews) {
                    if (!review.CO_CURSO) continue;
                    const key = String(review.CO_CURSO);
                    if (!reviewStats[key]) {
                        reviewStats[key] = { totalScore: 0, count: 0 };
                    }
                    reviewStats[key].totalScore += review.weightedAverage;
                    reviewStats[key].count += 1;
                }

                // 3. Fetch all courses
                const coursesSnapshot = await db.collection('cursos').get();
                const allCourses = coursesSnapshot.docs.map(doc => doc.data());
                
                // 4. Combine course data with review stats
                const summarized = allCourses.map(course => {
                    const stats = reviewStats[String(course.CO_CURSO)];
                    return {
                        CO_CURSO: course.CO_CURSO,
                        university: course.NO_IES,
                        course: course.NO_CURSO,
                        rating: stats ? stats.totalScore / stats.count : 0,
                        reviewCount: stats ? stats.count : 0,
                        city: course.NO_MUNICIPIO_IES,
                        uf: course.SG_UF_IES,
                        isFree: course.IN_GRATUITO === 1,
                        area: course.NO_CINE_AREA_GERAL,
                        degree: course.TP_GRAU_ACADEMICO,
                    };
                });

                // 5. Sort the combined list
                summarized.sort((a, b) => {
                    if (b.rating !== a.rating) {
                        return b.rating - a.rating;
                    }
                    return b.reviewCount - a.reviewCount;
                });
                
                setAllCourses(summarized);
                setFilteredCourses(summarized);

            } catch (err) {
                console.error("Error fetching rankings: ", err);
                setError("Não foi possível carregar os rankings. Tente novamente mais tarde.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRankings();
    }, []);

    useEffect(() => {
        let updatedCourses = [...allCourses];

        if (filterGratis !== null) {
            updatedCourses = updatedCourses.filter(c => c.isFree === filterGratis);
        }
        if (filterUF) {
            updatedCourses = updatedCourses.filter(c => c.uf === filterUF);
        }
        if (filterArea) {
            updatedCourses = updatedCourses.filter(c => c.area === filterArea);
        }
        if (filterGrau) {
            updatedCourses = updatedCourses.filter(c => String(c.degree) === filterGrau);
        }
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            updatedCourses = updatedCourses.filter(c =>
                c.course.toLowerCase().includes(lowercasedTerm) ||
                c.university.toLowerCase().includes(lowercasedTerm)
            );
        }

        setFilteredCourses(updatedCourses);
    }, [filterArea, filterGratis, filterGrau, filterUF, searchTerm, allCourses]);
    
    const ufs = [...new Set(allCourses.map(c => c.uf))].sort();
    const areas = [...new Set(allCourses.map(c => c.area))].sort();
    const degrees = [...new Set(allCourses.map(c => c.degree))].sort();

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <div className="relative bg-gray-800 text-white">
                <div className="relative">
                    <Header onNavigate={onNavigate} />
                    <div className="container mx-auto px-6 pt-24 pb-12 text-center">
                        <h1 className="text-4xl font-bold">Ranking de Cursos</h1>
                        <p className="text-lg text-gray-300 mt-2">Veja os cursos mais bem avaliados por estudantes como você.</p>
                    </div>
                </div>
            </div>
            
            <main className="container mx-auto p-6 -mt-10 flex-grow">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-6xl mx-auto">

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Buscar por curso ou universidade..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="p-2 border rounded col-span-1 md:col-span-3"
                        />
                        <select value={filterUF} onChange={e => setFilterUF(e.target.value)} className="p-2 border rounded">
                            <option value="">Todos os Estados</option>
                            {ufs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                        </select>
                         <select value={filterArea} onChange={e => setFilterArea(e.target.value)} className="p-2 border rounded">
                            <option value="">Todas as Áreas</option>
                            {areas.map(area => <option key={area} value={area}>{area}</option>)}
                        </select>
                        <select value={filterGrau} onChange={e => setFilterGrau(e.target.value)} className="p-2 border rounded">
                            <option value="">Todos os Graus</option>
                            {degrees.map(degree => <option key={degree} value={degree}>{degree}</option>)}
                        </select>
                        <select onChange={e => setFilterGratis(e.target.value === '' ? null : e.target.value === 'true')} className="p-2 border rounded">
                            <option value="">Gratuito ou Pago</option>
                            <option value="true">Gratuito</option>
                            <option value="false">Pago</option>
                        </select>
                         <button onClick={() => { setSearchTerm(''); setFilterUF(''); setFilterGratis(null); setFilterArea(''); setFilterGrau(''); }} className="p-2 bg-gray-300 rounded col-span-1 md:col-span-3">Limpar Filtros</button>
                    </div>


                    {isLoading && <p className="text-center text-gray-600">Carregando rankings...</p>}
                    {error && <p className="text-center text-red-600">{error}</p>}
                    {!isLoading && !error && (
                        filteredCourses.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Universidade</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avaliação</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº de Avaliações</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modalidade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredCourses.map((course, index) => (
                                            <tr key={course.CO_CURSO} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.course}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.university}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${course.city}, ${course.uf}`}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
                                                        <span className="font-bold text-gray-800">{course.rating.toFixed(1)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.reviewCount}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.isFree ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {course.isFree ? 'Gratuito' : 'Pago'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                           <p className="text-center text-gray-600">Nenhuma avaliação encontrada para gerar o ranking.</p>
                        )
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default RankingPage;
