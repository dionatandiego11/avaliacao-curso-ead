
import React, { useState, useEffect, useCallback } from 'react';
import firebase from 'firebase/compat/app';
import { auth, db } from '../firebase';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    state: '',
    city: '',
    university: '',
    course: '',
    ra: ''
  });

  const [cities, setCities] = useState<string[]>([]);
  const [universities, setUniversities] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [unisLoading, setUnisLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const states = [ 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO' ];

  const fetchCities = useCallback(async (state: string) => {
    setCitiesLoading(true);
    try {
      const querySnapshot = await db.collection('cursos').where('SG_UF_IES', '==', state).get();
      // FIX: Cast Firestore document data to string to match state type 'string[]'.
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
        // FIX: Cast Firestore document data to string to match state type 'string[]'.
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

  const fetchCourses = useCallback(async (university: string) => {
    setCoursesLoading(true);
    try {
      const querySnapshot = await db.collection('cursos').where('NO_IES', '==', university).get();
      // FIX: Cast Firestore document data to string to match state type 'string[]'.
      const courseList = querySnapshot.docs.map(doc => doc.data().NO_CURSO as string);
      const uniqueCourses = [...new Set(courseList)].sort();
      setCourses(uniqueCourses);
    } catch (err) {
      console.error('Erro ao buscar cursos:', err);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (formData.state) { fetchCities(formData.state); } 
    else { setCities([]); }
  }, [formData.state, fetchCities]);

  useEffect(() => {
    if (formData.state && formData.city) { fetchUniversities(formData.state, formData.city); } 
    else { setUniversities([]); }
  }, [formData.state, formData.city, fetchUniversities]);
  
  useEffect(() => {
    if (formData.university) { fetchCourses(formData.university); } 
    else { setCourses([]); }
  }, [formData.university, fetchCourses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'state') {
      setFormData(prev => ({ ...prev, city: '', university: '', course: '' }));
      setUniversities([]);
      setCourses([]);
    } else if (name === 'city') {
      setFormData(prev => ({ ...prev, university: '', course: '' }));
      setCourses([]);
    } else if (name === 'university') {
      setFormData(prev => ({ ...prev, course: '' }));
    }
  };

  const validateForm = () => { /* Form validation logic */ return true; };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(formData.email, formData.password);
      const user = userCredential.user;
      if (user) {
        await user.updateProfile({ displayName: formData.name });
        await db.collection('users').doc(user.uid).set({
          name: formData.name,
          email: formData.email,
          state: formData.state,
          city: formData.city,
          university: formData.university,
          course: formData.course,
          ra: formData.ra,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        onNavigate('home');
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') { setError('Este email já está cadastrado.'); } 
      else { setError('Erro ao criar conta. Tente novamente.'); }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <div className="flex justify-center mb-6">
          <span className="font-extrabold text-2xl tracking-wider text-gray-800">AVALIA<span className="font-light">EAD</span></span>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Criar sua conta</h2>
        <p className="text-center text-gray-500 mb-6">Preencha seus dados para se cadastrar</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Nome Completo *</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"/>
                </div>
                <div>
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email *</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"/>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="password"className="block text-gray-700 text-sm font-bold mb-2">Senha *</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"/>
                </div>
                <div>
                    <label htmlFor="confirmPassword"className="block text-gray-700 text-sm font-bold mb-2">Confirmar Senha *</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"/>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="state" className="block text-gray-700 text-sm font-bold mb-2">Estado *</label>
                    <select id="state" name="state" value={formData.state} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"><option value="">Selecione</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select>
                </div>
                <div>
                    <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">Cidade/Polo *</label>
                    <select id="city" name="city" value={formData.city} onChange={handleChange} disabled={!formData.state || citiesLoading} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 disabled:bg-gray-100"><option value="">{citiesLoading ? 'Carregando...' : 'Selecione'}</option>{cities.map(c => <option key={c} value={c}>{c}</option>)}</select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="university" className="block text-gray-700 text-sm font-bold mb-2">Universidade *</label>
                    <select id="university" name="university" value={formData.university} onChange={handleChange} disabled={!formData.city || unisLoading} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 disabled:bg-gray-100"><option value="">{unisLoading ? 'Carregando...' : 'Selecione'}</option>{universities.map(u => <option key={u} value={u}>{u}</option>)}</select>
                </div>
                <div>
                    <label htmlFor="course" className="block text-gray-700 text-sm font-bold mb-2">Curso *</label>
                    <select id="course" name="course" value={formData.course} onChange={handleChange} disabled={!formData.university || coursesLoading} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 disabled:bg-gray-100"><option value="">{coursesLoading ? 'Carregando...' : 'Selecione'}</option>{courses.map(c => <option key={c} value={c}>{c}</option>)}</select>
                </div>
            </div>
            <div>
                <label htmlFor="ra" className="block text-gray-700 text-sm font-bold mb-2">R.A - Registro Acadêmico *</label>
                <input type="text" id="ra" name="ra" value={formData.ra} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"/>
            </div>
            <div className="pt-4"><button type="submit" disabled={loading} className="bg-brand-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded w-full disabled:bg-gray-400">{loading ? 'Criando...' : 'Criar Conta'}</button></div>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">Já tem uma conta? <button onClick={() => onNavigate('login')} className="font-bold text-brand-red hover:text-red-700 ml-1">Entrar</button></p>
      </div>
      <button onClick={() => onNavigate('home')} className="mt-4 text-gray-600 hover:text-gray-800 text-sm">Voltar para a página inicial</button>
    </div>
  );
};

export default RegisterPage;