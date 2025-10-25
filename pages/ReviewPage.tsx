import React, { useState, useMemo } from 'react';
import GridIcon from '../components/icons/GridIcon';
import StarRating from '../components/StarRating';
import { db } from '../firebase';
import { doc, runTransaction, collection, serverTimestamp, where, query, getDocs, getDoc, updateDoc } from 'firebase/firestore';
import { COURSES_COLLECTION } from '../utils/constants';

interface AppUser {
  uid: string;
  nome: string;
  ra: string;
  estado: string;
  municipio: string;
  publica_privada: string;
  grau: string;
  area: string;
  curso: string;
  cursoId: string;
  universidade: string;
}

interface ReviewPageProps {
  onNavigate: (page: string) => void;
  user: AppUser;
}

const evaluationCriteria = [
    { id: 'conteudo', label: 'Qualidade do conteúdo', weight: 0.25 },
    { id: 'professores', label: 'Qualidade dos professores/tutores', weight: 0.25 },
    { id: 'apoio', label: 'Apoio ao aluno', weight: 0.20 },
    { id: 'polo', label: 'Polo de apoio presencial', weight: 0.15 },
    { id: 'material', label: 'Material didático', weight: 0.15 },
];

const ReviewPage: React.FC<ReviewPageProps> = ({ onNavigate, user }) => {
  const [ratings, setRatings] = useState<{[key: string]: number}>({
    conteudo: 0,
    professores: 0,
    apoio: 0,
    polo: 0,
    material: 0,
  });
  const [comment, setComment] = useState('');
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (id: string, rating: number) => {
    setRatings(prev => ({ ...prev, [id]: rating }));
  };

  const finalScore = useMemo(() => {
    const score = evaluationCriteria.reduce((acc, criterion) => {
        return acc + (ratings[criterion.id] * criterion.weight);
    }, 0);
    return score.toFixed(2);
  }, [ratings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lgpdAccepted || isSubmitting) {
      if (!lgpdAccepted) alert('Você deve aceitar os termos da LGPD para continuar.');
      return;
    }
    setIsSubmitting(true);

    try {
      let courseRef = user.cursoId ? doc(db, COURSES_COLLECTION, user.cursoId) : null;
      let courseSnapshot = courseRef ? await getDoc(courseRef) : null;

      if (!courseSnapshot || !courseSnapshot.exists()) {
        const constraints = [where('NO_CURSO', '==', user.curso)];
        if (user.universidade) {
          constraints.push(where('NO_IES', '==', user.universidade));
        }
        const coursesRef = collection(db, COURSES_COLLECTION);
        const q = query(coursesRef, ...constraints);
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error(`Curso "${user.curso}" não encontrado. Atualize seu cadastro ou tente novamente mais tarde.`);
        }

        const matchedCourse = querySnapshot.docs[0];
        courseRef = matchedCourse.ref;
        courseSnapshot = matchedCourse;

        try {
          await updateDoc(doc(db, 'usuarios', user.uid), {
            cursoId: matchedCourse.id,
            curso: matchedCourse.data().NO_CURSO || user.curso,
            universidade: matchedCourse.data().NO_IES || user.universidade || '',
            grau: matchedCourse.data().TP_GRAU_ACADEMICO || user.grau || '',
            area: matchedCourse.data().NO_CINE_AREA_GERAL || user.area || '',
          });
        } catch (updateError) {
          console.warn('Não foi possível sincronizar o curso com o perfil do usuário.', updateError);
        }
      }

      if (!courseRef || !courseSnapshot) {
        throw new Error('Não foi possível localizar o curso selecionado.');
      }

      const courseId = courseRef.id;

      await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(courseRef!);
        if (!sfDoc.exists()) {
          throw new Error('Course document does not exist!');
        }

        const courseData = sfDoc.data();
        const oldAvg = Number(courseData.media_geral) || 0;
        const oldReviewCount = Number(courseData.qtd_avaliacoes) || 0;
        const newScore = parseFloat(finalScore);

        const newReviewCount = oldReviewCount + 1;
        const newAvg = ((oldAvg * oldReviewCount) + newScore) / newReviewCount;

        transaction.update(courseRef!, {
            media_geral: parseFloat(newAvg.toFixed(2)),
            qtd_avaliacoes: newReviewCount
        });

        const newReviewRef = doc(collection(courseRef!, 'avaliacoes'));
        transaction.set(newReviewRef, {
            uid_usuario: user.uid,
            nome_aluno: user.nome,
            ra: user.ra,
            estado: user.estado,
            municipio: user.municipio,
            publica_privada: user.publica_privada,
            grau: user.grau || (courseData.TP_GRAU_ACADEMICO as string) || '',
            area: user.area || (courseData.NO_CINE_AREA_GERAL as string) || '',
            curso: (courseData.NO_CURSO as string) || user.curso,
            universidade: (courseData.NO_IES as string) || user.universidade || '',
            cursoId: courseId,
            conteudo: ratings.conteudo,
            professores: ratings.professores,
            apoio: ratings.apoio,
            polo: ratings.polo,
            material: ratings.material,
            nota_final: newScore,
            comentario: comment,
            aceitou_lgpd: lgpdAccepted,
            data_avaliacao: serverTimestamp(),
        });
      });

      alert(`Avaliação enviada com sucesso! Nota final: ${finalScore}`);
      onNavigate('home');

    } catch (error) {
      console.error("Error submitting evaluation: ", error);
      alert("Ocorreu um erro ao enviar sua avaliação. Tente novamente.");
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const UserInfo: React.FC<{label: string, value: string}> = ({label, value}) => (
    <div>
        <span className="font-semibold">{label}:</span> {value}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => onNavigate('home')}
              aria-label="Voltar para a página inicial"
            >
             <GridIcon className="w-8 h-8 text-gray-700" />
             <span className="text-2xl font-bold tracking-wider text-gray-800">AVALIAEAD</span>
           </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Deixar uma Avaliação</h1>
            <p className="text-lg text-gray-600 mb-6">Curso: {user.curso}</p>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Seus Dados</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-gray-700">
                    <UserInfo label="Nome" value={user.nome} />
                    <UserInfo label="R.A." value={user.ra} />
                    <UserInfo label="Universidade" value={user.universidade} />
                    <UserInfo label="Estado" value={user.estado} />
                    <UserInfo label="Município" value={user.municipio} />
                    <UserInfo label="Tipo de IES" value={user.publica_privada} />
                    <UserInfo label="Grau" value={user.grau} />
                    <UserInfo label="Área" value={user.area} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Critérios de Avaliação</h2>
                    <div className="space-y-6">
                        {evaluationCriteria.map(criterion => (
                            <div key={criterion.id}>
                                <label className="block text-md font-medium text-gray-700 mb-2">{criterion.label}</label>
                                <StarRating
                                    count={5}
                                    value={ratings[criterion.id]}
                                    onChange={(rating) => handleRatingChange(criterion.id, rating)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="comment" className="block text-md font-medium text-gray-700 mb-2">
                      Comentário geral (opcional)
                    </label>
                    <textarea
                      id="comment"
                      name="comment"
                      rows={4}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Descreva sua experiência com o curso..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="lgpd"
                                name="lgpd"
                                type="checkbox"
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                checked={lgpdAccepted}
                                onChange={(e) => setLgpdAccepted(e.target.checked)}
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="lgpd" className="font-medium text-gray-700">
                                Consentimento LGPD
                            </label>
                            <p className="text-gray-500">
                                Autorizo o uso dos dados acima conforme a Política de Privacidade.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end items-center gap-6">
                    <div className="text-lg font-bold text-gray-800">
                        Nota Final: <span className="text-indigo-600">{finalScore}</span>
                    </div>
                    <button
                        type="submit"
                        disabled={!lgpdAccepted || isSubmitting}
                        className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-md font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                    </button>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
};

export default ReviewPage;
