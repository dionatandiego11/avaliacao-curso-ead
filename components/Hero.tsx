
import React from 'react';
import Header from './Header';

const GraduationCapIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
  </svg>
);

const DocumentTextIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const MapPinIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);


const Hero: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="relative bg-black text-white">
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{backgroundImage: "url('https://picsum.photos/1600/900?grayscale&blur=2')"}}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-brand-red to-brand-orange opacity-90"></div>
      
      <div className="relative">
        <Header onNavigate={onNavigate} />
        <div className="container mx-auto px-6 pt-32 pb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Leia avaliações autênticas <br/> de <span className="inline-flex items-center">estudantes verificados
              <svg className="w-8 h-8 ml-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a.75.75 0 00-1.06-1.06L9 10.94l-1.72-1.72a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.25-4.25z" clipRule="evenodd"></path></svg>
            </span>
          </h1>

          <div className="max-w-3xl mx-auto my-8">
            <div className="bg-white rounded-lg shadow-lg p-2 flex items-center space-x-2">
              <div className="relative">
                  <select className="appearance-none bg-transparent font-semibold text-gray-700 py-3 pl-4 pr-8 rounded-md focus:outline-none cursor-pointer">
                      <option>Universidade</option>
                      <option>Curso</option>
                      <option>Localização</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <input 
                type="text" 
                placeholder="Digite o que você procura..." 
                className="w-full p-3 text-gray-800 focus:outline-none bg-transparent"
              />
              <button className="bg-brand-red text-white font-bold py-3 px-6 rounded-md hover:bg-red-600 transition-colors flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  Buscar
              </button>
            </div>
          </div>

          <p className="text-lg font-semibold mb-6">AvaliaEAD é a única plataforma de avaliação com todas as opções</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <button className="bg-white text-gray-800 flex items-center justify-center p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow font-semibold">
              <GraduationCapIcon className="w-5 h-5 mr-2 text-gray-600"/>
              Universidade
            </button>
            <button className="bg-white text-gray-800 flex items-center justify-center p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow font-semibold">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-600"/>
              Curso
            </button>
            <button className="bg-white text-gray-800 flex items-center justify-center p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow font-semibold">
              <MapPinIcon className="w-5 h-5 mr-2 text-gray-600"/>
              Localização
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
