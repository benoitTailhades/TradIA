import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement depuis .env et le système (Vercel)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // On injecte la clé API : on cherche d'abord 'API_KEY', sinon on prend 'clefAPI' (votre variable Vercel)
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.clefAPI)
    }
  };
});