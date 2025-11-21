import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charge les variables depuis le fichier .env localement
  const env = loadEnv(mode, process.cwd(), '');
  
  // CRUCIAL : Ordre de priorité pour trouver la clé
  // 1. process.env.clefAPI (Votre configuration spécifique Vercel)
  // 2. process.env.API_KEY (Standard)
  // 3. env.clefAPI (Local .env)
  // 4. env.API_KEY (Local .env)
  const apiKey = process.env.clefAPI || process.env.API_KEY || env.clefAPI || env.API_KEY;

  // Log pour le build (ne montre pas la clé entière par sécurité)
  if (apiKey) {
    console.log(`✅ API Key detected during build (Length: ${apiKey.length})`);
  } else {
    console.warn("⚠️ NO API KEY DETECTED DURING BUILD");
  }

  return {
    plugins: [react()],
    define: {
      // Injection sécurisée dans le code client
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  };
});