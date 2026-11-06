import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Derivado de leandroloffi/CustodyChain (2024); modificado por Lucas Barros Mota (2026)
export default defineConfig({
  plugins: [svelte()],
  server: {
    host: true,
    port: 5173,
  },
});
