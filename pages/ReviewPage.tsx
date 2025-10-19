import React, { useState, useMemo } from 'react';
import StarRatingInput from '../components/StarRatingInput';

const reviewCategories = [
    { id: 'courseQuality', label: 'Qualidade do curso', weight: 0.25 },
    { id: 'profQuality', label: 'Qualidade dos professores', weight: 0.25 },
    { id: 'studySupport', label: 'Apoio nos estudos', weight: 0.20 },
    { id: 'campusSupport', label: 'Polo de apoio presencial', weight: 0.15 },
    { id: 'materials', label: 'Material didático', weight: 0.15 },
];

const ReviewPage: React.FC = () => {
    const [ratings, setRatings] = useState<Record<string, number>>({
        courseQuality: 0,
        profQuality: 0,
        studySupport: 0,
        campusSupport: 0,
        materials: 0
    });

    const handleRatingChange = (id: string, value: number) => {
        setRatings(prev => ({ ...prev, [id]: value }));
    };

    const weightedAverage = useMemo(() => {
        const totalScore = reviewCategories.reduce((acc, cat) => {
            return acc + (ratings[cat.id] * cat.weight);
        }, 0);
        return totalScore;
    }, [ratings]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle review submission logic here
        alert(`Avaliação enviada com nota final: ${weightedAverage.toFixed(2)}! (simulação)`);
    };

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 text-center">Avaliação do Curso</h1>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Sua opinião é muito importante para a comunidade acadêmica.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 bg-white p-8 rounded-xl shadow-md space-y-8">
                    {reviewCategories.map(({ id, label }) => (
                        <div key={id} className="flex flex-col sm:flex-row items-center justify-between">
                            <label className="text-lg font-medium text-gray-700 mb-2 sm:mb-0">{label}</label>
                            <StarRatingInput
                                value={ratings[id]}
                                onChange={(value) => handleRatingChange(id, value)}
                            />
                        </div>
                    ))}
                    
                    <div className="border-t pt-6 flex items-center justify-between">
                        <div className="text-lg font-bold text-gray-800">Nota Final Ponderada:</div>
                        <div className="bg-yellow-400 text-white p-3 rounded-md flex items-center space-x-2">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            <span className="font-extrabold text-2xl">{weightedAverage.toFixed(2)}</span>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                            Enviar Avaliação
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewPage;
