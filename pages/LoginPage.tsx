
import React, { useState, useEffect } from 'react';
import GoogleIcon from '../components/icons/GoogleIcon';
import GridIcon from '../components/icons/GridIcon';
import { auth, db } from '../firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { matchesInstitutionType } from '../utils/firestoreUtils';

interface CourseOption {
  id: string;
  name: string;
  area: string;
  grau: string;
}

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for registration form
  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    ra: '',
    uf: '',
    municipio: '',
    type: '',
    university: '',
    courseId: '',
    password: '',
    confirmPassword: '',
  });

  const [options, setOptions] = useState({
    ufs: [] as string[],
    municipios: [] as string[],
    universities: [] as string[],
  });

  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);

  const [loadingOptions, setLoadingOptions] = useState({
    ufs: false,
    municipios: false,
    universities: false,
    courses: false,
  });

  const handleRegFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setRegForm(prev => {
        const newState = { ...prev, [name]: value };
        // Reset dependent fields when a parent field changes
        if (name === 'uf') {
            newState.municipio = '';
            newState.type = '';
            newState.university = '';
            newState.courseId = '';
            setOptions(o => ({...o, municipios: [], universities: []}));
            setCourseOptions([]);
        }
        if (name === 'municipio') {
            newState.type = '';
            newState.university = '';
            newState.courseId = '';
            setOptions(o => ({...o, universities: []}));
            setCourseOptions([]);
        }
        if (name === 'type') {
            newState.university = '';
            newState.courseId = '';
            setOptions(o => ({...o, universities: []}));
            setCourseOptions([]);
        }
        if (name === 'university') {
            newState.courseId = '';
            setCourseOptions([]);
        }
        return newState;
    });
  };

  // Fetch UFs on mount if registering
  useEffect(() => {
    if (!isRegister) return;
    const fetchUFs = async () => {
        setLoadingOptions(prev => ({ ...prev, ufs: true }));
        try {
            const coursesSnapshot = await getDocs(collection(db, "cursos"));
            // FIX: Explicitly set the generic type for `new Set` to `string` to fix type inference issue.
            const ufs = [...new Set<string>(coursesSnapshot.docs.map(doc => doc.data().SG_UF_IES as string))].sort();
            setOptions(prev => ({ ...prev, ufs }));
        } catch (err) {
            setError("Falha ao carregar a lista de estados.");
        }
        setLoadingOptions(prev => ({ ...prev, ufs: false }));
    };
    fetchUFs();
  }, [isRegister]);

  // Fetch Municipios on UF change
  useEffect(() => {
    if (!regForm.uf) return;
    const fetchMunicipios = async () => {
        setLoadingOptions(prev => ({ ...prev, municipios: true }));
        try {
            const q = query(collection(db, "cursos"), where("SG_UF_IES", "==", regForm.uf));
            const querySnapshot = await getDocs(q);
            // FIX: Explicitly set the generic type for `new Set` to `string` to fix type inference issue.
            const municipios = [...new Set<string>(querySnapshot.docs.map(doc => doc.data().NO_MUNICIPIO_IES as string))].sort();
            setOptions(prev => ({ ...prev, municipios }));
        } catch (err) {
            setError("Falha ao carregar a lista de municípios.");
        }
        setLoadingOptions(prev => ({ ...prev, municipios: false }));
    };
    fetchMunicipios();
  }, [regForm.uf]);
  
  // Fetch Universities on UF, Municipio, or Type change
  useEffect(() => {
    if (!regForm.uf || !regForm.municipio || !regForm.type) return;
    const fetchUniversities = async () => {
        setLoadingOptions(prev => ({...prev, universities: true}));
        try {
            const baseQuery = query(collection(db, 'cursos'),
                where('SG_UF_IES', '==', regForm.uf),
                where('NO_MUNICIPIO_IES', '==', regForm.municipio)
            );
            const querySnapshot = await getDocs(baseQuery);
            const filteredDocs = querySnapshot.docs.filter(docSnap =>
                matchesInstitutionType(docSnap.data().IN_GRATUITO, regForm.type as 'Pública' | 'Privada')
            );
            const universities = [...new Set<string>(filteredDocs.map(doc => doc.data().NO_IES as string))].sort();
            setOptions(prev => ({ ...prev, universities }));
        } catch(err) {
            setError("Falha ao carregar as universidades.");
        }
        setLoadingOptions(prev => ({...prev, universities: false}));
    };
    fetchUniversities();
  }, [regForm.uf, regForm.municipio, regForm.type]);
  
    // Fetch Courses on University change
  useEffect(() => {
    if (!regForm.university) return;
    const fetchCourses = async () => {
        setLoadingOptions(prev => ({...prev, courses: true}));
        try {
            const baseQuery = query(collection(db, 'cursos'),
                where('NO_IES', '==', regForm.university),
                where('SG_UF_IES', '==', regForm.uf),
                where('NO_MUNICIPIO_IES', '==', regForm.municipio)
            );
            const querySnapshot = await getDocs(baseQuery);
            const filteredDocs = querySnapshot.docs.filter(docSnap =>
                matchesInstitutionType(docSnap.data().IN_GRATUITO, regForm.type as 'Pública' | 'Privada')
            );
            const courses = filteredDocs
                .map(docSnap => {
                    const data = docSnap.data();
                    return {
                        id: docSnap.id,
                        name: data.NO_CURSO as string,
                        area: (data.NO_CINE_AREA_GERAL as string) || '',
                        grau: (data.TP_GRAU_ACADEMICO as string) || '',
                    } as CourseOption;
                })
                .sort((a, b) => a.name.localeCompare(b.name));
            setCourseOptions(courses);
        } catch(err) {
            setError("Falha ao carregar os cursos.");
        }
        setLoadingOptions(prev => ({...prev, courses: false}));
    };
    fetchCourses();
  }, [regForm.university, regForm.uf, regForm.municipio, regForm.type]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setError(null);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'usuarios', user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          nome: user.displayName,
          email: user.email,
          data_cadastro: new Date(),
          tipo_usuario: 'aluno',
          login_google: true,
          ra: '',
          curso: '',
          cursoId: '',
          universidade: '',
          uf: '',
          municipio: '',
          publica_privada: '',
          grau: '',
          area: ''
        });
      }
      onNavigate('home');
    } catch (error: any) {
      setError(error.message);
    }
  };
  
  const handleEmailPasswordSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      try {
          await signInWithEmailAndPassword(auth, email, password);
          onNavigate('home');
      } catch (error: any) {
          setError('Falha ao entrar. Verifique seu email e senha.');
      }
  };
  
  const handleEmailPasswordRegister = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      if (regForm.password !== regForm.confirmPassword) {
          setError('As senhas não coincidem.');
          return;
      }
      
      try {
        if (!regForm.courseId) {
            setError('Selecione um curso válido.');
            return;
        }

        const selectedCourse = courseOptions.find(course => course.id === regForm.courseId);
        if (!selectedCourse) {
            setError('Não foi possível identificar o curso selecionado. Tente novamente.');
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, regForm.email, regForm.password);
        const user = userCredential.user;

        await setDoc(doc(db, 'usuarios', user.uid), {
            nome: regForm.fullName,
            email: user.email,
            ra: regForm.ra,
            curso: selectedCourse.name,
            cursoId: selectedCourse.id,
            universidade: regForm.university,
            uf: regForm.uf,
            municipio: regForm.municipio,
            publica_privada: regForm.type,
            grau: selectedCourse.grau,
            area: selectedCourse.area,
            data_cadastro: new Date(),
            tipo_usuario: 'aluno',
            login_google: false,
        });

        onNavigate('home');

      } catch (error: any) {
          setError('Falha ao cadastrar. O email pode já estar em uso.');
      }
  };


  const renderLoginInput = (id: string, label: string, type = 'text') => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        id={id}
        name={id}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        required
      />
    </div>
  );

  const loginForm = (
    <form className="space-y-6" onSubmit={handleEmailPasswordSignIn}>
      {renderLoginInput('email', 'Email', 'email')}
      {renderLoginInput('password', 'Senha', 'password')}
       <div className="flex items-center justify-between">
        <div className="text-sm">
          <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
            Esqueceu sua senha?
          </a>
        </div>
      </div>
      <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Entrar
      </button>
    </form>
  );
  
  const renderRegInput = (id: keyof typeof regForm, label: string, type = 'text') => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        id={id}
        name={id}
        value={regForm[id]}
        onChange={handleRegFormChange}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        required
      />
    </div>
  );
  
  const renderRegSelect = (id: keyof typeof regForm, label: string, options: string[], disabled: boolean, loading: boolean) => (
    <div>
       <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
       <select
          id={id}
          name={id}
          value={regForm[id]}
          onChange={handleRegFormChange}
          disabled={disabled || loading}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-200 disabled:cursor-not-allowed"
          required
        >
         <option value="">{loading ? 'Carregando...' : `Selecione`}</option>
         {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
       </select>
    </div>
  );

  const registerForm = (
    <form className="space-y-4" onSubmit={handleEmailPasswordRegister}>
      {renderRegInput('fullName', 'Nome completo')}
      {renderRegInput('email', 'Email', 'email')}
      {renderRegInput('ra', 'R.A. (Registro Acadêmico)')}
      
      {renderRegSelect('uf', 'Estado (UF)', options.ufs, loadingOptions.ufs, loadingOptions.ufs)}
      {renderRegSelect('municipio', 'Município', options.municipios, !regForm.uf || loadingOptions.municipios, loadingOptions.municipios)}
      {renderRegSelect('type', 'Tipo de Instituição', ['Pública', 'Privada'], !regForm.municipio, false)}
      {renderRegSelect('university', 'Universidade', options.universities, !regForm.type || loadingOptions.universities, loadingOptions.universities)}
      <div>
        <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">Curso</label>
        <select
          id="courseId"
          name="courseId"
          value={regForm.courseId}
          onChange={handleRegFormChange}
          disabled={!regForm.university || loadingOptions.courses}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-200 disabled:cursor-not-allowed"
          required
        >
          <option value="">{loadingOptions.courses ? 'Carregando...' : 'Selecione'}</option>
          {courseOptions.map(course => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>
        {regForm.courseId && (
          <div className="mt-2 text-xs text-gray-500">
            {(() => {
              const selectedCourse = courseOptions.find(course => course.id === regForm.courseId);
              if (!selectedCourse) return null;
              const details = [selectedCourse.grau, selectedCourse.area].filter(Boolean).join(' • ');
              return details ? <span>{details}</span> : null;
            })()}
          </div>
        )}
      </div>

      {renderRegInput('password', 'Senha', 'password')}
      {renderRegInput('confirmPassword', 'Confirmar Senha', 'password')}

       <div className="text-xs text-gray-500">
         <p>Grau e Área serão preenchidos automaticamente conforme o curso.</p>
      </div>
      <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Cadastrar
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
         <div 
           className="flex items-center justify-center space-x-2 cursor-pointer"
           onClick={() => onNavigate('home')}
           aria-label="Voltar para a página inicial"
         >
          <GridIcon className="w-8 h-8 text-gray-700" />
          <span className="text-2xl font-bold tracking-wider text-gray-800">AVALIAEAD</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isRegister ? 'Crie sua conta' : 'Acesse sua conta'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          {error && <div className="mb-4 text-center text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</div>}
          <div className="mb-6">
            <button onClick={handleGoogleSignIn} type="button" className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <GoogleIcon className="w-5 h-5 mr-2" />
              {isRegister ? 'Cadastrar com Google' : 'Entrar com Google'}
            </button>
          </div>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou continue com</span>
            </div>
          </div>
          
          <div className="flex justify-center border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
               <button
                  onClick={() => setIsRegister(false)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${!isRegister ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => setIsRegister(true)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${isRegister ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Cadastrar
                </button>
            </nav>
          </div>
            {isRegister ? registerForm : loginForm}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;