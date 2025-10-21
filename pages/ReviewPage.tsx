import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import firebase from 'firebase/compat/app';
import StarRatingInput from '../components/StarRatingInput';
import Header from '../components/Header';
import Footer from '../components/Footer';

type RatingCategory = 'teachers' | 'curriculum' | 'infrastructure' | 'support' | 'market';

const ReviewPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  
  // Form state
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [courseId, setCourseId] = useState<number | null>(null);
  const [graduationYear, setGraduationYear] = useState<number>(new Date().getFullYear());
  const [isEAD, setIsEAD] = useState(true);
  const [anonymous, setAnonymous] = useState(false);
  const [ratings, setRatings] = useState<Record<RatingCategory, number>>({
    teachers: 0,
    curriculum: 0,
    infrastructure: 0,
    support: 0,
    market: 0,
  });
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  
  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown selection state
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Dropdown options state
  const [cities, setCities] = useState<string[]>([]);
  const [universities, setUniversities] = useState<string[]>([]);
  const [courses, setCourses] = useState<{ name: string, id: number }[]>([]);
  
  // Dropdown loading state
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [unisLoading, setUnisLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const states = [ 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO' ];

  const fetchCities = useCallback(async (state: string) => {
    setCitiesLoading(true);
    try {
      const querySnapshot = await db.collection('cursos').where('SG_UF_IES', '==', state).get();
      const cityList = querySnapshot.docs.map(doc => doc.data().NO_MUNICIPIO_IES as string);
      const uniqueCities = [...new Set(cityList)].sort();
      setCities(uniqueCities);
    } catch (err) {
      console.error('Erro ao buscar cidades:', err);
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  }, []);

  const fetchUniversities = useCallback(async (state: string, city: string) => {
    setUnisLoading(true);
    try {
        const querySnapshot = await db.collection('cursos').where('SG_UF_IES', '==', state).where('NO_MUNICIPIO_IES', '==', city).get();
        const uniList = querySnapshot.docs.map(doc => doc.data().NO_IES as string);
        const uniqueUnis = [...new Set(uniList)].sort();
        setUniversities(uniqueUnis);
    } catch (err) {
        console.error('Erro ao buscar universidades:', err);
        setUniversities([]);
    } finally {
        setUnisLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async (universityName: string) => {
    setCoursesLoading(true);
    try {
      const querySnapshot = await db.collection('cursos').where('NO_IES', '==', universityName).get();
      const courseList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { name: data.NO_CURSO as string, id: data.CO_CURSO as number };
      });

      // Remove duplicates based on course name, preferring the one with a valid ID
      const uniqueCourses = Array.from(new Map(courseList.map(item => [item.name, item])).values());
      uniqueCourses.sort((a, b) => a.name.localeCompare(b.name));

      setCourses(uniqueCourses);
    } catch (err) {
      console.error('Erro ao buscar cursos:', err);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (currentUser) {
        const fetchUserData = async () => {
            try {
                const userDoc = await db.collection('users').doc(currentUser.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    if (userData) {
                        setSelectedState(userData.state || '');
                        setSelectedCity(userData.city || '');
                        setUniversity(userData.university || '');
                        setCourse(userData.course || '');
                    }
                }
            } catch (err) {
                console.error("Error fetching user data for pre-fill:", err);
            }
        };
        fetchUserData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedState) { fetchCities(selectedState); } 
    else { setCities([]); }
  }, [selectedState, fetchCities]);

  useEffect(() => {
    if (selectedState && selectedCity) { fetchUniversities(selectedState, selectedCity); } 
    else { setUniversities([]); }
  }, [selectedState, selectedCity, fetchUniversities]);
  
  useEffect(() => {
    if (university) { fetchCourses(university); } 
    else { setCourses([]); }
  }, [university, fetchCourses]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
        <p className="mb-4">Você precisa estar logado para deixar uma avaliação.</p>
        <button onClick={() => onNavigate('login')} className="bg-brand-red text-white font-bold py-2 px-4 rounded hover:bg-red-600">
          Fazer Login
        </button>
      </div>
    );
  }

  const handleRatingChange = (field: RatingCategory, value: number) => {
    setRatings(prev => ({ ...prev, [field]: value }));
  };

  const calculateWeightedAverage = () => {
    const ratingsValues = Object.values(ratings);
    const total = ratingsValues.reduce((sum: number, rating: number) => sum + rating, 0);
    const count = ratingsValues.filter((r: number) => r > 0).length;
    return count > 0 ? total / count : 0;
  };
  
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
    setSelectedCity('');
    setUniversity('');
    setCourse('');
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
    setUniversity('');
    setCourse('');
  };
  
  const handleUniversityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUniversity(e.target.value);
    setCourse('');
    setCourseId(null);
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCourseName = e.target.value;
    const selectedCourse = courses.find(c => c.name === selectedCourseName);
    setCourse(selectedCourseName);
    setCourseId(selectedCourse ? selectedCourse.id : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!university || !course || Object.values(ratings).some(r => r === 0)) {
        setError('Por favor, preencha todos os campos e avaliações obrigatórios.');
        return;
    }

    setSubmitting(true);
    
    try {
      await db.collection('reviews').add({
        userId: currentUser.uid,
        university,
        course,
        CO_CURSO: courseId,
        graduationYear,
        isEAD,
        anonymous,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        teachersRating: ratings.teachers,
        curriculumRating: ratings.curriculum,
        infrastructureRating: ratings.infrastructure,
        supportRating: ratings.support,
        marketReputationRating: ratings.market,
        pros,
        cons,
        weightedAverage: calculateWeightedAverage(),
      });
      onNavigate('home');
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao enviar sua avaliação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const ratingCategories: { id: RatingCategory, label: string }[] = [
    { id: 'teachers', label: 'Corpo Docente' },
    { id: 'curriculum', label: 'Grade Curricular' },
    { id: 'infrastructure', label: 'Infraestrutura e Plataforma Online' },
    { id: 'support', label: 'Suporte e Atendimento ao Aluno' },
    { id: 'market', label: 'Reputação no Mercado' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative bg-gray-800 text-white">
        <div className="relative">
          <Header onNavigate={onNavigate} />
          <div className="container mx-auto px-6 pt-24 pb-12 text-center">
            <h1 className="text-4xl font-bold">Deixe sua Avaliação</h1>
            <p className="text-lg text-gray-300 mt-2">Sua opinião ajuda outros estudantes a fazerem a escolha certa!</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto p-6 -mt-10">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl mx-auto">
          <form onSubmit={handleSubmit}>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Sobre o Curso</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                  <select id="state" value={selectedState} onChange={handleStateChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red">
                      <option value="">Selecione o estado</option>
                      {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Cidade/Polo *</label>
                    <select id="city" value={selectedCity} onChange={handleCityChange} disabled={!selectedState || citiesLoading} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red disabled:bg-gray-100">
                        <option value="">{citiesLoading ? 'Carregando...' : 'Selecione a cidade'}</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                  <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">Nome da Universidade *</label>
                   <select id="university" value={university} onChange={handleUniversityChange} disabled={!selectedCity || unisLoading} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red disabled:bg-gray-100">
                        <option value="">{unisLoading ? 'Carregando...' : 'Selecione a universidade'}</option>
                        {universities.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Nome do Curso *</label>
                  <select id="course" value={course} onChange={handleCourseChange} disabled={!university || coursesLoading} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red disabled:bg-gray-100">
                        <option value="">{coursesLoading ? 'Carregando...' : 'Selecione o curso'}</option>
                        {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                  <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-1">Ano de Conclusão</label>
                  <input type="number" id="graduationYear" value={graduationYear} onChange={e => setGraduationYear(parseInt(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modalidade</label>
                  <div className="flex items-center space-x-4">
                     <label className="flex items-center"><input type="radio" name="modality" checked={isEAD} onChange={() => setIsEAD(true)} className="mr-2 text-brand-red focus:ring-brand-orange"/> EAD</label>
                     <label className="flex items-center"><input type="radio" name="modality" checked={!isEAD} onChange={() => setIsEAD(false)} className="mr-2 text-brand-red focus:ring-brand-orange"/> Presencial</label>
                  </div>
                </div>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Sua Avaliação (de 1 a 5 estrelas) *</h2>
              <div className="space-y-4">
                {ratingCategories.map(cat => (
                  <div key={cat.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <label className="text-md font-medium text-gray-700 mb-2 sm:mb-0">{cat.label}</label>
                    <StarRatingInput value={ratings[cat.id]} onChange={value => handleRatingChange(cat.id, value)} />
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Comentários</h2>
              <div>
                <label htmlFor="pros" className="block text-sm font-medium text-gray-700 mb-1">Pontos Positivos</label>
                <textarea id="pros" value={pros} onChange={e => setPros(e.target.value)} rows={3} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"></textarea>
              </div>
              <div className="mt-4">
                <label htmlFor="cons" className="block text-sm font-medium text-gray-700 mb-1">Pontos a Melhorar</label>
                <textarea id="cons" value={cons} onChange={e => setCons(e.target.value)} rows={3} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"></textarea>
              </div>
            </section>
            
            <section className="mb-8">
               <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input id="anonymous" name="anonymous" type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} className="h-4 w-4 text-brand-red border-gray-300 rounded focus:ring-brand-orange" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="anonymous" className="font-medium text-gray-700">Publicar como anônimo</label>
                    <p className="text-gray-500">Sua avaliação será publicada sem seu nome ou foto.</p>
                  </div>
                </div>
            </section>

            {error && <p className="text-red-600 text-center mb-4">{error}</p>}

            <div className="text-center">
              <button type="submit" disabled={submitting} className="bg-brand-red text-white font-bold py-3 px-8 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400">
                {submitting ? 'Enviando...' : 'Enviar Avaliação'}
              </button>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ReviewPage;
