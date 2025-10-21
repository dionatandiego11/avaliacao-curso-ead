
import React, { useState, useEffect } from 'react';
import type { CourseReviewSummary } from '../types';
import { db } from '../firebase';

const StarIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
);

const CourseReviewItem: React.FC<{ review: CourseReviewSummary }> = ({ review }) => {
    return (
        <div className="bg-white p-3 rounded-md flex items-center space-x-4 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="bg-yellow-400 text-white p-3 rounded-md flex items-center space-x-2">
                <StarIcon className="w-5 h-5"/>
                <span className="font-bold text-lg">{review.rating.toFixed(1)}</span>
            </div>
            <div>
                <h4 className="font-bold text-gray-800">{review.course}</h4>
                <p className="text-sm text-gray-500">{review.university} - {review.reviewCount} avaliações</p>
            </div>
        </div>
    );
};

const FeaturedReviews: React.FC = () => {
  const [courses, setCourses] = useState<CourseReviewSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsRef = db.collection('reviews');
        const q = reviewsRef.orderBy('createdAt', 'desc').limit(50);
        const querySnapshot = await q.get();
        
        const reviews: any[] = [];
        querySnapshot.forEach((doc) => {
            reviews.push(doc.data());
        });

        const aggregated: Record<string, { university: string; course: string; totalScore: number; count: number; }> = {};
        
        for (const review of reviews) {
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
            if (b.reviewCount !== a.reviewCount) {
                return b.reviewCount - a.reviewCount;
            }
            return b.rating - a.rating;
        });
        
        setCourses(summarized.slice(0, 5));

      } catch (error) {
          console.error("Erro ao buscar avaliações: ", error);
      } finally {
          setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-6 text-center">
        <h3 className="text-sm font-bold text-teal-500 uppercase tracking-widest">
            FAÇA UMA ESCOLHA COM BASE EM AVALIAÇÕES ESTUDANTIS INDEPENDENTES
        </h3>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
            Cursos Avaliados Recentemente
        </h2>
        <p className="max-w-3xl mx-auto text-gray-600 mt-4">
            Avaliações são uma ferramenta útil para ajudar estudantes a tomar a decisão certa. É por isso que usamos apenas avaliações 100% verificadas, baseadas nas experiências de estudantes reais de todo o Brasil.
        </p>

        <div className="mt-12 max-w-5xl mx-auto bg-[#2d3748] rounded-lg shadow-xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2">
                    <img 
                        src="https://picsum.photos/id/1062/600/600?grayscale" 
                        alt="Estudante no laptop" 
                        className="rounded-lg object-cover w-full h-full"
                    />
                </div>
                <div className="md:w-1/2 w-full">
                    <div className="space-y-3 text-left">
                       {isLoading ? (
                            <p className="text-white text-center">Carregando avaliações...</p>
                        ) : courses.length > 0 ? (
                            courses.map((course) => (
                               <CourseReviewItem key={`${course.university}-${course.course}`} review={course} />
                            ))
                        ) : (
                            <p className="text-white text-center">Nenhuma avaliação encontrada ainda. Seja o primeiro!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
        <a href="#" className="mt-8 inline-flex items-center font-semibold text-gray-700 hover:text-gray-900">
            Ver todos os Cursos 
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </a>
      </div>
    </section>
  );
};

export default FeaturedReviews;
