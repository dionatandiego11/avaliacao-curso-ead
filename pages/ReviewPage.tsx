import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
// Fix: Import firebase for serverTimestamp and use v8 firestore methods
import firebase from 'firebase/compat/app';
import StarRatingInput from '../components/StarRatingInput';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Fix: Define a strict type for rating categories to ensure type safety
type RatingCategory = 'teachers' | 'curriculum' | 'infrastructure' | 'support' | 'market';

const ReviewPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [graduationYear, setGraduationYear] = useState<number>(new Date().getFullYear());
  const [isEAD, setIsEAD] = useState(true);
  const [anonymous, setAnonymous] = useState(false);
  
  // Fix: Add explicit type to ratings state to solve type inference issues
  const [ratings, setRatings] = useState<Record<RatingCategory, number>>({
    teachers: 0,
    curriculum: 0,
    infrastructure: 0,
    support: 0,
    market: 0,
  });

  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
        <p className="mb-4">Você precisa estar logado para deixar uma avaliação.</p>
        <button onClick={() => onNavigate('login')} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600">
          Fazer Login
        </button>
      </div>
    );
  }

  // Fix: Use the strict RatingCategory type for the field parameter
  const handleRatingChange = (field: RatingCategory, value: number) => {
    setRatings(prev => ({ ...prev, [field]: value }));
  };

  // Fix: This function now works correctly due to the typed `ratings` state
  const calculateWeightedAverage = () => {
    const ratingsValues = Object.values(ratings);
    // FIX: Add explicit types for reduce and filter callback parameters to fix type errors.
    const total = ratingsValues.reduce((sum: number, rating: number) => sum + rating, 0);
    const count = ratingsValues.filter((r: number) => r > 0).length;
    return count > 0 ? total / count : 0;
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
      // Fix: Use v8 Firestore syntax
      await db.collection('reviews').add({
        userId: currentUser.uid,
        university: university,
        course: course,
        graduationYear: graduationYear,
        isEAD: isEAD,
        anonymous: anonymous,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        teachersRating: ratings.teachers,
        curriculumRating: ratings.curriculum,
        infrastructureRating: ratings.infrastructure,
        supportRating: ratings.support,
        marketReputationRating: ratings.market,
        pros: pros,
        cons: cons,
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
  
  // Fix: Use the strict RatingCategory type for the id property
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
                  <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">Nome da Universidade *</label>
                  <input type="text" id="university" value={university} onChange={e => setUniversity(e.target.value)} required className="w-full border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Nome do Curso *</label>
                  <input type="text" id="course" value={course} onChange={e => setCourse(e.target.value)} required className="w-full border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                  <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-1">Ano de Conclusão</label>
                  <input type="number" id="graduationYear" value={graduationYear} onChange={e => setGraduationYear(parseInt(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modalidade</label>
                  <div className="flex items-center space-x-4">
                     <label className="flex items-center"><input type="radio" name="modality" checked={isEAD} onChange={() => setIsEAD(true)} className="mr-2"/> EAD</label>
                     <label className="flex items-center"><input type="radio" name="modality" checked={!isEAD} onChange={() => setIsEAD(false)} className="mr-2"/> Presencial</label>
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
                    {/* Fix: Remove type assertion as types are now correct */}
                    <StarRatingInput value={ratings[cat.id]} onChange={value => handleRatingChange(cat.id, value)} />
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Comentários</h2>
              <div>
                <label htmlFor="pros" className="block text-sm font-medium text-gray-700 mb-1">Pontos Positivos</label>
                <textarea id="pros" value={pros} onChange={e => setPros(e.target.value)} rows={3} className="w-full border-gray-300 rounded-md shadow-sm"></textarea>
              </div>
              <div className="mt-4">
                <label htmlFor="cons" className="block text-sm font-medium text-gray-700 mb-1">Pontos a Melhorar</label>
                <textarea id="cons" value={cons} onChange={e => setCons(e.target.value)} rows={3} className="w-full border-gray-300 rounded-md shadow-sm"></textarea>
              </div>
            </section>
            
            <section className="mb-8">
               <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input id="anonymous" name="anonymous" type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="anonymous" className="font-medium text-gray-700">Publicar como anônimo</label>
                    <p className="text-gray-500">Sua avaliação será publicada sem seu nome ou foto.</p>
                  </div>
                </div>
            </section>

            {error && <p className="text-red-600 text-center mb-4">{error}</p>}

            <div className="text-center">
              <button type="submit" disabled={submitting} className="bg-red-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400">
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