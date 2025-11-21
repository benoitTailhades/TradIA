import React from 'react';
import { CrossIcon } from './Icon';
import { Language } from '../types';

interface IntroCardProps {
  onStart: (lang: Language) => void;
}

const IntroCard: React.FC<IntroCardProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8 p-6 bg-vatican-gold/10 rounded-full border-2 border-vatican-gold">
        <CrossIcon className="w-16 h-16 text-cardinal-red" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-display font-bold text-ink mb-4 tracking-wide">
        VOX TRADITIONIS
      </h1>
      
      <p className="text-lg md:text-xl font-serif text-stone-600 mb-8 italic">
        "Stand ye on the ways, and see, and ask for the old paths." — Jeremiah 6:16
      </p>
      
      <p className="text-stone-700 mb-10 leading-relaxed font-sans max-w-lg">
        An intelligent assistant grounded exclusively in the theology, philosophy, and doctrine of the Church prior to the Second Vatican Council.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
        <button 
          onClick={() => onStart('en')}
          className="group relative px-8 py-3 bg-cardinal-red text-white font-display font-semibold tracking-wider rounded-sm shadow-md hover:bg-cardinal-red-dark transition-all duration-300 transform hover:-translate-y-0.5 flex-1"
        >
          <span className="relative z-10">English</span>
          <div className="absolute inset-0 border border-vatican-gold translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300" />
        </button>

        <button 
          onClick={() => onStart('fr')}
          className="group relative px-8 py-3 bg-ink text-white font-display font-semibold tracking-wider rounded-sm shadow-md hover:bg-stone-800 transition-all duration-300 transform hover:-translate-y-0.5 flex-1"
        >
          <span className="relative z-10">Français</span>
          <div className="absolute inset-0 border border-stone-500 translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </div>

      <div className="mt-12 text-sm text-stone-400 font-sans">
        Powered by Gemini 2.5 Flash
      </div>
    </div>
  );
};

export default IntroCard;