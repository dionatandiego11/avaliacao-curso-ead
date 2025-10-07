import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Review, Course } from './types';
import { REGIONS } from './constants';
import { findCourseInfo } from './courses';
import Header from './components/Header';
import Filters from './components/Filters';
import CourseList from './components/CourseList';
import ReviewFormModal from './components/ReviewFormModal';
import CourseDetailModal from './components/CourseDetailModal';
import { initDatabase, getReviewsFromDb, addReviewToDb } from './database';

const App: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('');

  useEffect(() => {
    const loadDb = async () => {
      try {
        await initDatabase();
        setReviews(getReviewsFromDb());
      } catch (error) {
        console.error("Error loading database:", error);
      } finally {
        setIsDbLoading(false);
      }
    };
    loadDb();
  }, []);

  const addReview = (newReviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...newReviewData,
      id: `review_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date(),
    };
    addReviewToDb(newReview);
    setReviews(getReviewsFromDb());
  };

  const processedCourses = useMemo<Course[]>(() => {
    const coursesMap: { [key: string]: Review[] } = {};

    reviews.forEach(review => {
      const key = `${review.university}|${review.course}|${review.degree}`;
      if (!coursesMap[key]) {
        coursesMap[key] = [];
      }
      coursesMap[key].push(review);
    });

    return Object.entries(coursesMap).map(([key, courseReviews]) => {
      const [university, courseName, degreeStr] = key.split('|');
      const degree = parseInt(degreeStr, 10);
      const courseInfo = findCourseInfo(courseName);

      const totalReviews = courseReviews.length;
      
      const totalRating = courseReviews.reduce((sum, review) => {
          const avgReviewRating = (review.courseQuality + review.professorQuality + review.studySupport + review.onSiteSupport + review.didacticMaterial) / 5;
          return sum + avgReviewRating;
      }, 0);
      
      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
      
      return {
        university,
        course: courseName,
        area: courseInfo?.area || 'Não Classificada',
        degree,
        averageRating,
        reviewCount: totalReviews,
        reviews: courseReviews,
      };
    });
  }, [reviews]);
  
  const filteredCourses = useMemo(() => {
    return processedCourses
      .filter(course => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          course.university.toLowerCase().includes(searchLower) ||
          course.course.toLowerCase().includes(searchLower) ||
          course.reviews.some(r => r.campus.toLowerCase().includes(searchLower));
        
        const matchesRegion = selectedRegion ? course.reviews.some(r => r.region === selectedRegion) : true;
        
        const matchesRating = course.averageRating >= minRating;

        const matchesArea = selectedArea ? course.area === selectedArea : true;

        const matchesDegree = selectedDegree ? course.degree === parseInt(selectedDegree, 10) : true;

        return matchesSearch && matchesRegion && matchesRating && matchesArea && matchesDegree;
      })
      .sort((a, b) => b.averageRating - a.averageRating);
  }, [processedCourses, searchTerm, selectedRegion, minRating, selectedArea, selectedDegree]);

  const uniqueUniversities = useMemo(() => {
    const universitySet = new Set(reviews.map(r => r.university));
    return Array.from(universitySet).sort();
  }, [reviews]);


  const handleSelectCourse = useCallback((course: Course) => {
    setSelectedCourse(course);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setSelectedCourse(null);
  }, []);
  
  if (isDbLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">Carregando banco de dados...</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Isso pode levar um momento na primeira visita.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <Header onAddReviewClick={() => setIsFormModalOpen(true)} />
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Encontre Avaliações de Cursos EAD</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">A opinião de estudantes reais para te ajudar a escolher.</p>
        </div>

        <Filters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
          minRating={minRating}
          onRatingChange={setMinRating}
          regions={REGIONS}
          selectedArea={selectedArea}
          onAreaChange={setSelectedArea}
          selectedDegree={selectedDegree}
          onDegreeChange={setSelectedDegree}
        />

        <CourseList courses={filteredCourses} onCourseSelect={handleSelectCourse} />
      </main>

      <ReviewFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={addReview}
        universities={uniqueUniversities}
        regions={REGIONS}
      />

      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          isOpen={!!selectedCourse}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
};

export default App;