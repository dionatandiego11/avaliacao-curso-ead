
import React, { useState } from 'react';
import firebase from 'firebase/compat/app';
import { auth } from '../firebase';

const LoginPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(() => {
        onNavigate('home');
      }).catch((error) => {
        setError(error.message);
      });
  };

  const handleEmailPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            onNavigate('home');
        })
        .catch((error) => {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                setError('Email ou senha inválidos.');
            } else {
                setError('Ocorreu um erro ao fazer login.');
            }
        })
        .finally(() => {
            setLoading(false);
        });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <span className="font-extrabold text-2xl tracking-wider text-gray-800">AVALIA<span className="font-light">EAD</span></span>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Entrar na sua conta</h2>
        <p className="text-center text-gray-500 mb-6">Bem-vindo de volta!</p>

        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
        
        <form onSubmit={handleEmailPassword}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com" 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Senha
            </label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********" 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-brand-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-gray-400"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
        
        <div className="my-4 flex items-center before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
          <p className="text-center font-semibold mx-4 mb-0 text-gray-500">OU</p>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-5 h-5 mr-2"/>
          Continuar com Google
        </button>

        <p className="text-center text-sm text-gray-600 mt-6">
          Não tem uma conta?
          <button onClick={() => onNavigate('register')} className="font-bold text-brand-red hover:text-red-700 ml-1">
            Registre-se
          </button>
        </p>
      </div>
       <button onClick={() => onNavigate('home')} className="mt-4 text-gray-600 hover:text-gray-800 text-sm">Voltar para a página inicial</button>
    </div>
  );
};

export default LoginPage;
