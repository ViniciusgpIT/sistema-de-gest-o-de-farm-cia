
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Configuração do proxy para evitar problemas de CORS em desenvolvimento.
    proxy: {
      // Qualquer requisição para um caminho que comece com '/api'
      // será redirecionada para o nosso servidor backend.
      '/api': {
        target: 'http://localhost:8080', // O endereço da sua API backend.
        changeOrigin: true, // Necessário para que o backend receba o host correto.
        secure: false,      // Se sua API não usa HTTPS.
      },
    },
  },
});
