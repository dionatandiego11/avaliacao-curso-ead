
import React from 'react';

interface HeaderProps {
    onAddReviewClick: () => void;
}

const GraduationCapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3.33 1.67 6.67 1.67 10 0v-5"/>
    </svg>
);


const Header: React.FC<HeaderProps> = ({ onAddReviewClick }) => {
    return (
        <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <GraduationCapIcon className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                    <span className="text-xl font-bold text-slate-800 dark:text-white">Avalia EAD</span>
                </div>
                <button
                    onClick={onAddReviewClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                >
                    Avaliar Curso
                </button>
            </div>
        </header>
    );
};

export default Header;
