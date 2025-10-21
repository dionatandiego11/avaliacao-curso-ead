
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import type { CourseReviewSummary } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';

const StarIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
);

const RankingPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
    const [courses, setCourses] = useState<CourseReviewSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRankings = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const reviewsRef = db.collection('reviews');
                const q = reviewsRef.orderBy('createdAt', 'desc').limit(200);
                const querySnapshot = await q.get();

                const reviews: any[] = [];
                querySnapshot.forEach((doc) => {
                    reviews.push(doc.data());
                });

                if (reviews.length === 0) {
                    setCourses([]);
                    return;
                }

                const aggregated: Record<string, { university: string; course: string; totalScore: number; count: number; }> = {};
                
                for (const review of reviews) {
                    if(!review.university || !review.course) continue;
                    const key = `${review.university}-${review.course}`.toLowerCase();
                    if (!aggregated[key]) {
                        aggregated[key] = {
                            university: review.university,
                            course: review.course,
                            totalScore: 0,
                            count: 0
                        };
                    }
                    aggregated[key].totalScore += review.weightedAverage;
                    aggregated[key].count += 1;
                }

                const summarized = Object.values(aggregated).map(item => ({
                    university: item.university,
                    course: item.course,
                    rating: item.totalScore / item.count,
                    reviewCount: item.count
                }));
                
                summarized.sort((a, b) => {
                    if (b.rating !== a.rating) {
                        return b.rating - a.rating;
                    }
                    return b.reviewCount - a.reviewCount;
                });
                
                setCourses(summarized);
            } catch (err) {
                console.error("Error fetching rankings: ", err);
                setError("Não foi possível carregar os rankings. Tente novamente mais tarde.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRankings();
    }, []);
    
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
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
                    {isLoading && <p className="text-center text-gray-600">Carregando rankings...</p>}
                    {error && <p className="text-center text-red-600">{error}</p>}
                    {!isLoading && !error && (
                        courses.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Universidade</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avaliação</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº de Avaliações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {courses.map((course, index) => (
                                            <tr key={`${course.university}-${course.course}`} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.course}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.university}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
                                                        <span className="font-bold text-gray-800">{course.rating.toFixed(1)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.reviewCount}</td>
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
