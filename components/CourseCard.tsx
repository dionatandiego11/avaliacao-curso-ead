
import React from 'react';
import { Course } from '../types';
import StarRating from './StarRating';

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden">
      <div className="p-6 flex-grow">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate">{course.course}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{course.university}</p>

        <div className="flex items-center gap-2 mb-4">
          <StarRating rating={course.averageRating} />
          <span className="text-slate-600 dark:text-slate-300 font-semibold">{course.averageRating.toFixed(1)}</span>
          <span className="text-slate-500 dark:text-slate-400 text-sm">({course.reviewCount} avaliações)</span>
        </div>
      </div>
      <div className="bg-slate-50 dark:bg-slate-700/50 p-4">
        <button
          onClick={() => onSelect(course)}
          className="w-full bg-transparent border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-colors"
        >
          Ver Detalhes
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
