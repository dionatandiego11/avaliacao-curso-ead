import React, { useState, useEffect } from 'react';
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
  // simple in-memory caches to avoid refetching the same queries in a session
  const citiesCache = React.useRef<Record<string, string[]>>({});
  const unisCache = React.useRef<Record<string, string[]>>({});
  const coursesCache = React.useRef<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados brasileiros
  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Carregar cidades quando o estado mudar
  useEffect(() => {
    if (formData.state) {
      fetchCities(formData.state);
    } else {
      setCities([]);
    }
  }, [formData.state]);

  // Carregar universidades quando a cidade mudar
  useEffect(() => {
    if (formData.city) {
      fetchUniversities(formData.city);
    } else {
      setUniversities([]);
    }
  }, [formData.city]);

  // Carregar cursos quando a universidade mudar
  useEffect(() => {
    if (formData.university) {
      fetchCourses(formData.university);
    } else {
      setCourses([]);
    }
  }, [formData.university]);

  const fetchCities = async (state: string) => {
    if (citiesCache.current[state]) {
      setCities(citiesCache.current[state]);
      return;
    }
    setCitiesLoading(true);
    try {
      const citiesRef = db.collection('cities').where('state', '==', state);
      const snapshot = await citiesRef.get();
      const cityList = snapshot.docs.map(doc => doc.data().name).filter(Boolean) as string[];
      const sorted = cityList.sort();
      citiesCache.current[state] = sorted;
      setCities(sorted);
    } catch (err) {
      console.error('Erro ao buscar cidades:', err);
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  };

  const fetchUniversities = async (city: string) => {
    if (unisCache.current[city]) {
      setUniversities(unisCache.current[city]);
      return;
    }
    setUnisLoading(true);
    try {
      const universitiesRef = db.collection('universities').where('city', '==', city);
      const snapshot = await universitiesRef.get();
      const uniList = snapshot.docs.map(doc => doc.data().name).filter(Boolean) as string[];
      const sorted = uniList.sort();
      unisCache.current[city] = sorted;
      setUniversities(sorted);
    } catch (err) {
      console.error('Erro ao buscar universidades:', err);
      setUniversities([]);
    } finally {
      setUnisLoading(false);
    }
  };

  const fetchCourses = async (university: string) => {
    if (coursesCache.current[university]) {
      setCourses(coursesCache.current[university]);
      return;
    }
    setCoursesLoading(true);
    try {
      const coursesRef = db.collection('courses').where('university', '==', university);
      const snapshot = await coursesRef.get();
      const courseList = snapshot.docs.map(doc => doc.data().name).filter(Boolean) as string[];
      const sorted = courseList.sort();
      coursesCache.current[university] = sorted;
      setCourses(sorted);
    } catch (err) {
      console.error('Erro ao buscar cursos:', err);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Resetar campos dependentes
    if (name === 'state') {
      setFormData(prev => ({ ...prev, city: '', university: '', course: '' }));
    } else if (name === 'city') {
      setFormData(prev => ({ ...prev, university: '', course: '' }));
    } else if (name === 'university') {
      setFormData(prev => ({ ...prev, course: '' }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Por favor, insira seu nome completo.');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Por favor, insira seu email.');
      return false;
    }
    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return false;
    }
    if (!formData.state) {
      setError('Por favor, selecione seu estado.');
      return false;
    }
    if (!formData.city) {
      setError('Por favor, selecione sua cidade/polo.');
      return false;
    }
    if (!formData.university) {
      setError('Por favor, selecione sua universidade.');
      return false;
    }
    if (!formData.course) {
      setError('Por favor, selecione seu curso.');
      return false;
    }
    if (!formData.ra.trim()) {
      setError('Por favor, insira seu Registro Acadêmico.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Criar usuário no Firebase Auth
      const userCredential = await auth.createUserWithEmailAndPassword(
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      if (user) {
        // Atualizar o perfil do usuário com o nome
        await user.updateProfile({
          displayName: formData.name
        });

        // Salvar informações adicionais no Firestore
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

        // Redirecionar para a home
        onNavigate('home');
      }
    } catch (err: any) {
      console.error('Erro ao criar conta:', err);
      
      // Mensagens de erro personalizadas
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email já está cadastrado. Tente fazer login.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email inválido.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha é muito fraca. Use no mínimo 6 caracteres.');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <div className="flex justify-center mb-6">
          <span className="font-extrabold text-2xl tracking-wider text-gray-800">
            AVALIA<span className="font-light">EAD</span>
          </span>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Criar sua conta
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Preencha seus dados para se cadastrar
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome Completo */}
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Seu nome completo"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {/* Email e Senha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                Senha *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>

          {/* Confirmar Senha */}
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
              Confirmar Senha *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Digite a senha novamente"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {/* Estado e Cidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="state" className="block text-gray-700 text-sm font-bold mb-2">
                Estado *
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Selecione o estado</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">
                Cidade/Polo *
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!formData.state}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-100"
                required
              >
                <option value="">{citiesLoading ? 'Carregando cidades...' : 'Selecione a cidade'}</option>
                {!citiesLoading && cities.length === 0 && formData.state && (
                  <option value="">Nenhuma cidade encontrada</option>
                )}
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Universidade e Curso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="university" className="block text-gray-700 text-sm font-bold mb-2">
                Universidade *
              </label>
              <select
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                disabled={!formData.city}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-100"
                required
              >
                <option value="">{unisLoading ? 'Carregando universidades...' : 'Selecione a universidade'}</option>
                {!unisLoading && universities.length === 0 && formData.city && (
                  <option value="">Nenhuma universidade encontrada</option>
                )}
                {universities.map(uni => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="course" className="block text-gray-700 text-sm font-bold mb-2">
                Curso *
              </label>
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                disabled={!formData.university}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-100"
                required
              >
                <option value="">{coursesLoading ? 'Carregando cursos...' : 'Selecione o curso'}</option>
                {!coursesLoading && courses.length === 0 && formData.university && (
                  <option value="">Nenhum curso encontrado</option>
                )}
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Registro Acadêmico */}
          <div>
            <label htmlFor="ra" className="block text-gray-700 text-sm font-bold mb-2">
              R.A - Registro Acadêmico *
            </label>
            <input
              type="text"
              id="ra"
              name="ra"
              value={formData.ra}
              onChange={handleChange}
              placeholder="Seu número de matrícula"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {/* Botão de Submit */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Já tem uma conta?
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-red-500 hover:text-red-700 ml-1"
          >
            Entrar
          </button>
        </p>
      </div>
      
      <button
        onClick={() => onNavigate('home')}
        className="mt-4 text-gray-600 hover:text-gray-800 text-sm"
      >
        Voltar para a página inicial
      </button>
    </div>
  );
};

export default RegisterPage;