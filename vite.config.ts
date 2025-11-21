import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charge les variables depuis le fichier .env
  const env = loadEnv(mode, process.cwd(), '');
  
  // Stratégie de récupération de la clé "bulletproof" :
  // 1. Regarde dans les variables système du processus (Vercel injecte souvent ici)
  // 2. Regarde dans les variables chargées par Vite (.env)
  // 3. Cherche 'clefAPI' (votre nom) ou 'API_KEY' (standard)
  const apiKey = process.env.API_KEY || process.env.clefAPI || env.API_KEY || env.clefAPI;

  return {
    plugins: [react()],
    define: {
      // Injection sécurisée dans le code client
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  };
});