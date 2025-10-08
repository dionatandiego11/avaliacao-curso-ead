
import React, { useState, FormEvent, useCallback } from 'react';
import { Review, Ratings } from '../types';
import { RATING_CRITERIA } from '../constants';
import StarRating from './StarRating';

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  universities: string[];
  regions: string[];
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const initialFormData = {
  fullName: '',
  academicRegistry: '',
  university: '',
  course: '',
  degree: 0,
  campus: '',
  region: '',
  comment: '',
};

const DEGREES = {
  '1': 'Bacharelado',
  '2': 'Licenciatura',
  '3': 'Tecnólogo',
};

const initialRatings: Ratings = {
  courseQuality: 0,
  professorQuality: 0,
  studySupport: 0,
  onSiteSupport: 0,
  didacticMaterial: 0,
};

const ReviewFormModal: React.FC<ReviewFormModalProps> = ({ isOpen, onClose, onSubmit, universities, regions }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [ratings, setRatings] = useState<Ratings>(initialRatings);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRatingChange = useCallback((field: keyof Ratings, value: number) => {
    setRatings(prev => ({ ...prev, [field]: value }));
    if(errors[field]) {
        setErrors(prev => ({...prev, [field]: ''}));
    }
  }, [errors]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Nome completo é obrigatório.";
    if (!formData.academicRegistry.trim()) newErrors.academicRegistry = "R.A. é obrigatório.";
    if (!formData.university.trim()) newErrors.university = "Universidade é obrigatória.";
    if (!formData.course.trim()) newErrors.course = "Curso é obrigatório.";
    if (formData.degree === 0) newErrors.degree = "Grau é obrigatório.";
    if (!formData.campus.trim()) newErrors.campus = "Polo é obrigatório.";
    if (!formData.region.trim()) newErrors.region = "Região é obrigatória.";

    Object.keys(ratings).forEach(key => {
        if (ratings[key as keyof Ratings] === 0) {
            newErrors[key] = "Avaliação é obrigatória.";
        }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ ...formData, ...ratings });
      setFormData(initialFormData);
      setRatings(initialRatings);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Avaliar Curso</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                    <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full input-style" />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">R.A. (Registro Acadêmico)</label>
                    <input type="text" value={formData.academicRegistry} onChange={e => setFormData({...formData, academicRegistry: e.target.value})} className="w-full input-style" />
                    {errors.academicRegistry && <p className="text-red-500 text-xs mt-1">{errors.academicRegistry}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Universidade</label>
                    <input type="text" list="universities-list" value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} className="w-full input-style" />
                    <datalist id="universities-list">
                        {universities.map(uni => <option key={uni} value={uni} />)}
                    </datalist>
                    {errors.university && <p className="text-red-500 text-xs mt-1">{errors.university}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Curso</label>
                    <input type="text" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="w-full input-style" />
                    {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Grau</label>
                    <select value={formData.degree} onChange={e => setFormData({...formData, degree: parseInt(e.target.value, 10)})} className="w-full input-style">
                        <option value={0} disabled>Selecione o Grau</option>
                        {Object.entries(DEGREES).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                    {errors.degree && <p className="text-red-500 text-xs mt-1">{errors.degree}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Polo de Apoio</label>
                    <input type="text" value={formData.campus} onChange={e => setFormData({...formData, campus: e.target.value})} className="w-full input-style" />
                    {errors.campus && <p className="text-red-500 text-xs mt-1">{errors.campus}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Região/Estado do Polo</label>
                     <select value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full input-style">
                        <option value="">Selecione a Região</option>
                        {regions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t dark:border-slate-700">
                {(Object.keys(RATING_CRITERIA) as Array<keyof Ratings>).map(key => (
                     <div key={key}>
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{RATING_CRITERIA[key]}</label>
                            <StarRating rating={ratings[key]} onRatingChange={(val) => handleRatingChange(key, val)} readOnly={false} />
                        </div>
                        {errors[key] && <p className="text-red-500 text-xs mt-1 text-right">{errors[key]}</p>}
                     </div>
                ))}
            </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Comentário (Opcional)</label>
                <textarea value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} rows={3} className="w-full input-style" placeholder="Deixe um breve comentário sobre sua experiência..."></textarea>
            </div>
            
            <div className="pt-6 border-t dark:border-slate-700 flex justify-end gap-3">
                 <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors">
                    Cancelar
                </button>
                <button type="submit" className="px-6 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                    Enviar Avaliação
                </button>
            </div>
        </form>
         <style>{`
            .input-style {
                padding: 0.5rem 0.75rem;
                border: 1px solid;
                border-radius: 0.5rem;
                background-color: transparent;
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            .input-style:focus {
                outline: none;
                border-color: #3b82f6; /* blue-500 */
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
            }
            html.dark .input-style {
                border-color: #475569; /* slate-600 */
            }
            html.dark .input-style:focus {
                border-color: #60a5fa; /* blue-400 */
                 box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.4);
            }
            html:not(.dark) .input-style {
                 border-color: #cbd5e1; /* slate-300 */
            }
         `}</style>
      </div>
    </div>
  );
};

export default ReviewFormModal;
