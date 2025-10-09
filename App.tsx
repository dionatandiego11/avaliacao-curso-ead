import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Review, Course } from './types';
import { REGIONS, DEGREES, uniqueAreas, courseClassifications, courseDetailsMap } from './constants';
import Header from './components/Header';
import Filters from './components/Filters';
import CourseList from './components/CourseList';
import ReviewFormModal from './components/ReviewFormModal';
import CourseDetailModal from './components/CourseDetailModal';
import { supabase } from './lib/supabaseClient';

const App = () => {
  const [reviews, setReviews] = useState([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [uniqueUniversities, setUniqueUniversities] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedGrau, setSelectedGrau] = useState('');
  const [selectedCurso, setSelectedCurso] = useState('');

  // Estados de controle da UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 9;

  // Efeito para buscar os dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [reviewsRes, unisRes] = await Promise.all([
          supabase.from('reviews').select('*').order('createdAt', { ascending: false }),
          supabase.from('instituicoes').select('nome').order('nome', { ascending: true })
        ]);
        
        if (reviewsRes.error) throw new Error(`Erro ao buscar avaliações: ${reviewsRes.error.message}`);
        if (unisRes.error) throw new Error(`Erro ao buscar instituições: ${unisRes.error.message}`);
        
        const formattedReviews = reviewsRes.data?.map(r => ({ ...r, createdAt: new Date(r.createdAt) })) || [];
        setReviews(formattedReviews);
        setUniqueUniversities(unisRes.data?.map(i => i.nome) || []);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addReview = async (newReviewData) => {
    const { data, error } = await supabase
        .from('reviews')
        .insert([newReviewData])
        .select()
        .single();

    if (error) {
        console.error('Error adding review:', error);
        // Em uma app real, usaríamos um toast/notificação em vez de alert
        alert('Ocorreu um erro ao enviar sua avaliação. Tente novamente.');
    } else if (data) {
        const newReview = { ...data, createdAt: new Date(data.createdAt) };
        setReviews(prevReviews => [newReview, ...prevReviews]);
    }
  };

  const processedCourses = useMemo(() => {
    const coursesMap = {};

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
      
      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
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
      const selectedGrauKey = Object.keys(DEGREES).find(key => DEGREES[key] === selectedGrau);
      if (selectedGrauKey) {
          coursesData = coursesData.filter(c => c.grauKey === selectedGrauKey);
      }
    }
    const courseNames = [...new Set(coursesData.flatMap(c => c.cursos))];
    return courseNames.sort();
  }, [selectedArea, selectedGrau]);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredCoursesBase = useMemo(() => {
    return processedCourses
      .filter(course => {
        const searchLower = debouncedSearchTerm.toLowerCase();
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
  }, [processedCourses, debouncedSearchTerm, selectedRegion, minRating, selectedArea, selectedGrau, selectedCurso]);

  const paginatedCourses = useMemo(() => {
    return filteredCoursesBase.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [filteredCoursesBase, currentPage]);

  const handleAreaChange = (area) => {
    setSelectedArea(area);
    setSelectedCurso('');
    setCurrentPage(1);
  };

  const handleGrauChange = (grau) => {
    setSelectedGrau(grau);
    setSelectedCurso('');
    setCurrentPage(1);
  };
  
  useEffect(() => {
      setCurrentPage(1);
  }, [debouncedSearchTerm, selectedRegion, minRating, selectedArea, selectedGrau, selectedCurso]);

  const handleSelectCourse = useCallback((course) => {
    setSelectedCourse(course);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setSelectedCourse(null);
  }, []);

  const totalPages = Math.ceil(filteredCoursesBase.length / PAGE_SIZE);

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

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-900 dark:text-red-200 dark:border-red-700" role="alert">{error}</div>}
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg h-40" />
            ))}
          </div>
        ) : (
          <CourseList courses={paginatedCourses} onCourseSelect={handleSelectCourse} />
        )}
        
        {!loading && filteredCoursesBase.length > PAGE_SIZE && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300">Página {currentPage} de {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próximo
            </button>
          </div>
        )}

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