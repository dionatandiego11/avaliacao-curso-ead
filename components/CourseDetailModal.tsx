
import React, { useMemo } from 'react';
import { Course, Review, Ratings } from '../types';
import StarRating from './StarRating';
import { RATING_CRITERIA } from '../constants';

interface CourseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{review.fullName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">RA: {review.academicRegistry} | Polo: {review.campus}</p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 ml-4">{review.createdAt.toLocaleDateString()}</p>
      </div>
      {review.comment && (
        <p className="italic text-slate-600 dark:text-slate-300 mt-3 border-l-4 border-blue-500 pl-3">
          "{review.comment}"
        </p>
      )}
       <div className="mt-4 space-y-2 text-sm">
        {(Object.keys(RATING_CRITERIA) as Array<keyof Ratings>).map((key) => (
            <div key={key} className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">{RATING_CRITERIA[key]}:</span>
                <StarRating rating={review[key]} readOnly={true} />
            </div>
        ))}
      </div>
    </div>
  );
};

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({ isOpen, onClose, course }) => {
  const averageCriteriaRatings = useMemo(() => {
    const totals: Record<keyof Ratings, number> = {
        courseQuality: 0,
        professorQuality: 0,
        studySupport: 0,
        onSiteSupport: 0,
        didacticMaterial: 0,
    };
    course.reviews.forEach(review => {
        (Object.keys(totals) as Array<keyof Ratings>).forEach(key => {
            totals[key] += review[key];
        });
    });
     (Object.keys(totals) as Array<keyof Ratings>).forEach(key => {
        totals[key] /= course.reviewCount;
    });
    return totals;
  }, [course]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{course.course}</h2>
            <p className="text-slate-500 dark:text-slate-400">{course.university}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
            <div className="mb-6 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Resumo das Avaliações</h3>
                <div className="space-y-2">
                    <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-800 dark:text-slate-100">Média Geral:</span>
                         <div className="flex items-center gap-2">
                            <StarRating rating={course.averageRating} readOnly={true}/>
                            <span>{course.averageRating.toFixed(1)}</span>
                         </div>
                    </div>
                     {(Object.keys(averageCriteriaRatings) as Array<keyof Ratings>).map((key) => (
                        <div key={key} className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 dark:text-slate-300">{RATING_CRITERIA[key]}:</span>
                            <div className="flex items-center gap-2">
                                <StarRating rating={averageCriteriaRatings[key]} readOnly={true}/>
                                <span>{averageCriteriaRatings[key].toFixed(1)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          
            <h3 className="text-lg font-semibold mb-4">Comentários dos Alunos ({course.reviewCount})</h3>
            <div className="space-y-4">
                {course.reviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailModal;
