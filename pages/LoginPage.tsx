import React from 'react';

const InputField: React.FC<{
  id: string;
  label: string;
  type: string;
  autoComplete?: string;
}> = ({ id, label, type, autoComplete }) => (
  <div>
    <label htmlFor={id} className="sr-only">
      {label}
    </label>
    <input
      id={id}
      name={id}
      type={type}
      autoComplete={autoComplete}
      required
      className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
      placeholder={label}
    />
  </div>
);


const LoginPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    alert('Cadastro realizado com sucesso! (simulação)');
    onNavigate('home');
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
            <h2 className="text-center text-3xl font-extrabold text-gray-900">Criar Conta</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
                Junte-se à comunidade para ajudar outros estudantes!
            </p>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="rounded-md shadow-sm space-y-4">
                    <InputField id="name" label="Nome Completo" type="text" autoComplete="name" />
                    <InputField id="course" label="Curso" type="text" />
                    <InputField id="university" label="Universidade" type="text" />
                    <InputField id="state" label="Estado" type="text" />
                    <InputField id="city" label="Cidade/Polo" type="text" />
                    <InputField id="email" label="E-mail Institucional" type="email" autoComplete="email" />
                    <InputField id="ra" label="R.A - Registro Acadêmico" type="text" />
                </div>

                <div>
                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                        Cadastrar
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
