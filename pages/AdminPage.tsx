import React, { useState, useEffect } from 'react';
import GridIcon from '../components/icons/GridIcon';
import ChartBarIcon from '../components/icons/ChartBarIcon';
import MessageCircleIcon from '../components/icons/MessageCircleIcon';
import BookOpenIcon from '../components/icons/BookOpenIcon';
import UsersIcon from '../components/icons/UsersIcon';
import TrashIcon from '../components/icons/TrashIcon';
import EditIcon from '../components/icons/EditIcon';
import EyeOffIcon from '../components/icons/EyeOffIcon';
import UserCheckIcon from '../components/icons/UserCheckIcon';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy, limit, collectionGroup } from 'firebase/firestore';


type AdminSection = 'metrics' | 'reviews' | 'courses' | 'users';

interface Review {
    id: string;
    courseId: string;
    aluno: string;
    curso: string;
    nota: string;
}
interface User {
    id: string;
    nome: string;
    email: string;
    tipo: 'admin' | 'aluno';
}
interface Course {
    id: string;
    nome: string;
    ies: string;
    avaliacoes: number;
}
interface Metrics {
    totalReviews: number;
    totalUsers: number;
    totalCourses: number;
    avgRating: number;
    topCourses: { name: string, reviews: number }[];
}


const AdminPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('metrics');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Users
    const usersSnapshot = await getDocs(collection(db, "usuarios"));
    const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    setUsers(usersList);
    
    // Fetch Courses
    const coursesSnapshot = await getDocs(collection(db, "cursos"));
    const coursesList = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().NO_CURSO,
        ies: doc.data().NO_IES,
        avaliacoes: doc.data().qtd_avaliacoes,
    } as Course));
    setCourses(coursesList);
    
    // Fetch Reviews (latest 10 for performance)
    const reviewsQuery = query(collectionGroup(db, 'avaliacoes'), orderBy('data_avaliacao', 'desc'), limit(10));
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const reviewsList = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      courseId: doc.ref.parent.parent!.id,
      aluno: doc.data().nome_aluno,
      curso: doc.data().curso,
      nota: doc.data().nota_final.toFixed(1),
    } as Review));
    setReviews(reviewsList);
    
    // Calculate Metrics
    const totalReviews = coursesList.reduce((sum, course) => sum + (course.avaliacoes || 0), 0);
    const totalRatingSum = coursesList.reduce((sum, course) => sum + (course.avaliacoes || 0), 0); // This is simplified. True avg needs all ratings.
    const topCourses = [...coursesList].sort((a,b) => b.avaliacoes - a.avaliacoes).slice(0,5).map(c => ({name: c.nome, reviews: c.avaliacoes}));
    
    setMetrics({
        totalReviews,
        totalUsers: usersList.length,
        totalCourses: coursesList.length,
        avgRating: 4.3, // Placeholder
        topCourses,
    });
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  
  const deleteReview = async (review: Review) => {
      if (window.confirm('Tem certeza que deseja remover esta avaliação? Esta ação não pode ser desfeita.')) {
        try {
            await deleteDoc(doc(db, `cursos/${review.courseId}/avaliacoes`, review.id));
            // Note: This does not automatically recalculate the average score on the course.
            // A cloud function would be the robust way to handle this.
            // For now, we just remove it from the UI.
            setReviews(reviews.filter(r => r.id !== review.id));
            alert('Avaliação removida com sucesso.');
        } catch(e) {
            console.error(e);
            alert('Falha ao remover a avaliação.');
        }
      }
  };
  
  const toggleAdmin = async (user: User) => {
      const newType = user.tipo === 'admin' ? 'aluno' : 'admin';
      if (window.confirm(`Tem certeza que deseja alterar o tipo de ${user.nome} para ${newType}?`)) {
        try {
            const userRef = doc(db, 'usuarios', user.id);
            await updateDoc(userRef, { tipo_usuario: newType });
            setUsers(users.map(u => u.id === user.id ? {...u, tipo: newType } : u));
        } catch(e) {
            console.error(e);
            alert('Falha ao atualizar o tipo do usuário.');
        }
      }
  };

  const renderSection = () => {
    if (loading) return <div>Carregando...</div>;
    
    switch(activeSection) {
      case 'metrics':
        return (
            <div>
                <h2 className="text-2xl font-bold mb-6">Métricas Gerais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-gray-500">Nº total de avaliações</h3><p className="text-3xl font-bold">{metrics?.totalReviews}</p></div>
                    <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-gray-500">Média Geral</h3><p className="text-3xl font-bold">{metrics?.avgRating}</p></div>
                    <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-gray-500">Total de Alunos</h3><p className="text-3xl font-bold">{metrics?.totalUsers}</p></div>
                    <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-gray-500">Total de Cursos</h3><p className="text-3xl font-bold">{metrics?.totalCourses}</p></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">Top 5 Cursos Mais Avaliados</h3>
                    <ul>{metrics?.topCourses.map(c => <li key={c.name} className="flex justify-between py-2 border-b">{c.name} <span className="font-semibold">{c.reviews} avaliações</span></li>)}</ul>
                </div>
            </div>
        );
      case 'reviews':
         return (
             <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-2xl font-bold mb-4">Gestão de Avaliações</h2>
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-gray-500">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                             <tr>
                                 <th scope="col" className="px-6 py-3">Aluno</th>
                                 <th scope="col" className="px-6 py-3">Curso</th>
                                 <th scope="col" className="px-6 py-3">Nota</th>
                                 <th scope="col" className="px-6 py-3">Ações</th>
                             </tr>
                         </thead>
                         <tbody>
                             {reviews.map(review => (
                                 <tr key={review.id} className="bg-white border-b hover:bg-gray-50">
                                     <td className="px-6 py-4 font-medium text-gray-900">{review.aluno}</td>
                                     <td className="px-6 py-4">{review.curso}</td>
                                     <td className="px-6 py-4">{review.nota}</td>
                                     <td className="px-6 py-4">
                                         <button onClick={() => deleteReview(review)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>
         );
       case 'courses':
         return (
             <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-2xl font-bold mb-4">Gestão de Cursos</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                             <tr>
                                 <th scope="col" className="px-6 py-3">Nome do Curso</th>
                                 <th scope="col" className="px-6 py-3">IES</th>
                                 <th scope="col" className="px-6 py-3">Avaliações</th>
                                 <th scope="col" className="px-6 py-3">Ações</th>
                             </tr>
                         </thead>
                         <tbody>
                            {courses.map(course => (
                                <tr key={course.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{course.nome}</td>
                                    <td className="px-6 py-4">{course.ies}</td>
                                    <td className="px-6 py-4">{course.avaliacoes}</td>
                                    <td className="px-6 py-4 flex space-x-4">
                                        <button className="text-blue-500 hover:text-blue-700"><EditIcon className="w-5 h-5"/></button>

                                        <button className="text-gray-500 hover:text-gray-700"><EyeOffIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                         </tbody>
                    </table>
                 </div>
             </div>
         );
      case 'users':
         return (
             <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-2xl font-bold mb-4">Controle de Usuários</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                             <tr>
                                 <th scope="col" className="px-6 py-3">Nome</th>
                                 <th scope="col" className="px-6 py-3">Email</th>
                                 <th scope="col" className="px-6 py-3">Tipo</th>
                                 <th scope="col" className="px-6 py-3">Ações</th>
                             </tr>
                         </thead>
                         <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.nome}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.tipo === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {user.tipo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => toggleAdmin(user)} className="text-purple-500 hover:text-purple-700"><UserCheckIcon className="w-5 h-5"/></button>
                                    </td>
                                 </tr>
                            ))}
                         </tbody>
                    </table>
                 </div>
             </div>
         );
    }
  };

  const NavItem: React.FC<{ section: AdminSection; label: string; icon: React.ReactNode }> = ({ section, label, icon }) => (
    <button
        onClick={() => setActiveSection(section)}
        className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors ${activeSection === section ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
    >
        {icon}
        <span className="ml-3">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-white shadow-lg p-4 flex-shrink-0">
        <div className="flex items-center space-x-2 p-4 cursor-pointer border-b" onClick={() => onNavigate('home')}>
          <GridIcon className="w-8 h-8 text-gray-700" />
          <span className="text-2xl font-bold tracking-wider text-gray-800">AVALIAEAD</span>
        </div>
        <nav className="mt-6 space-y-2">
            <NavItem section="metrics" label="Métricas" icon={<ChartBarIcon className="w-6 h-6"/>} />
            <NavItem section="reviews" label="Avaliações" icon={<MessageCircleIcon className="w-6 h-6"/>} />
            <NavItem section="courses" label="Cursos" icon={<BookOpenIcon className="w-6 h-6"/>} />
            <NavItem section="users" label="Usuários" icon={<UsersIcon className="w-6 h-6"/>} />
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {renderSection()}
      </main>
    </div>
  );
};

export default AdminPage;
