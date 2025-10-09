import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Review, Course } from './types';
import { REGIONS, DEGREES, uniqueAreas, courseClassifications, courseDetailsMap } from './constants';
import Header from './components/Header';
import Filters from './components/Filters';
import CourseList from './components/CourseList';
import ReviewFormModal from './components/ReviewFormModal';
import CourseDetailModal from './components/CourseDetailModal';
import { supabase } from './lib/supabaseClient';

const App: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [uniqueUniversities, setUniqueUniversities] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedGrau, setSelectedGrau] = useState('');
  const [selectedCurso, setSelectedCurso] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews') // NOTE: Assumes a 'reviews' table exists in your Supabase project.
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
      } else if (data) {
        const formattedData = data.map(r => ({ ...r, createdAt: new Date(r.createdAt) }));
        setReviews(formattedData);
      }
    };
    
    const fetchUniversities = async () => {
        const { data, error } = await supabase
            .from('instituicoes')
            .select('nome')
            .order('nome', { ascending: true });

        if (error) {
            console.error('Error fetching universities:', error);
        } else if (data) {
            setUniqueUniversities(data.map(i => i.nome));
        }
    };

    fetchReviews();
    fetchUniversities();
  }, []);

  const addReview = async (newReviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
        .from('reviews')
        .insert([newReviewData])
        .select()
        .single();

    if (error) {
        console.error('Error adding review:', error);
        alert('Ocorreu um erro ao enviar sua avaliação. Tente novamente.');
    } else if (data) {
        const newReview: Review = { ...data, createdAt: new Date(data.createdAt) };
        setReviews(prevReviews => [newReview, ...prevReviews]);
    }
  };

  const processedCourses = useMemo<Course[]>(() => {
    const coursesMap: { [key: string]: Review[] } = {};

    reviews.forEach(review => {
      const key = `${review.university}|${review.course}`;
      if (!coursesMap[key]) {
        coursesMap[key] = [];
      }
      coursesMap[key].push(review);
    });

    return Object.entries(coursesMap).map(([key, courseReviews]) => {
      const [university, courseName] = key.split('|');
      const totalReviews = courseReviews.length;
      
      const totalRating = courseReviews.reduce((sum, review) => {
          const avgReviewRating = (review.courseQuality + review.professorQuality + review.studySupport + review.onSiteSupport + review.didacticMaterial) / 5;
          return sum + avgReviewRating;
      }, 0);
      
      const averageRating = totalRating / totalReviews;
      const details = courseDetailsMap.get(courseName.trim().toLowerCase());
      
      return {
        university,
        course: courseName,
        averageRating,
        reviewCount: totalReviews,
        reviews: courseReviews,
        area: details?.area || 'Não classificado',
        grau: details?.grau || 'Não classificado',
      };
    });
  }, [reviews]);

  const availableCoursesForFilter = useMemo(() => {
    let coursesData = courseClassifications;
    if (selectedArea) {
      coursesData = coursesData.filter(c => c.area === selectedArea);
    }
    if (selectedGrau) {
      const selectedGrauKey = Object.keys(DEGREES).find(key => DEGREES[key as keyof typeof DEGREES] === selectedGrau);
      if (selectedGrauKey) {
          coursesData = coursesData.filter(c => c.grauKey === selectedGrauKey);
      }
    }
    const courseNames = [...new Set(coursesData.flatMap(c => c.cursos))];
    return courseNames.sort();
  }, [selectedArea, selectedGrau]);
  
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
        const matchesGrau = selectedGrau ? course.grau === selectedGrau : true;
        const matchesCurso = selectedCurso ? course.course === selectedCurso : true;

        return matchesSearch && matchesRegion && matchesRating && matchesArea && matchesGrau && matchesCurso;
      })
      .sort((a, b) => b.averageRating - a.averageRating);
  }, [processedCourses, searchTerm, selectedRegion, minRating, selectedArea, selectedGrau, selectedCurso]);

  const handleAreaChange = (area: string) => {
    setSelectedArea(area);
    setSelectedCurso('');
  };

  const handleGrauChange = (grau: string) => {
    setSelectedGrau(grau);
    setSelectedCurso('');
  };

  const handleSelectCourse = useCallback((course: Course) => {
    setSelectedCourse(course);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setSelectedCourse(null);
  }, []);

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
          onAreaChange={handleAreaChange}
          areas={uniqueAreas}
          selectedGrau={selectedGrau}
          onGrauChange={handleGrauChange}
          graus={Object.values(DEGREES)}
          selectedCurso={selectedCurso}
          onCursoChange={setSelectedCurso}
          cursos={availableCoursesForFilter}
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
