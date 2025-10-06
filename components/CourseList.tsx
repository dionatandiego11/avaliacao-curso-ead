
import React from 'react';
import { Course } from '../types';
import CourseCard from './CourseCard';

interface CourseListProps {
  courses: Course[];
  onCourseSelect: (course: Course) => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, onCourseSelect }) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Nenhum curso encontrado</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Tente ajustar seus filtros de busca.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={`${course.university}-${course.course}`} course={course} onSelect={onCourseSelect} />
      ))}
    </div>
  );
};

export default CourseList;
