import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  integrations: [tailwind(), mdx(), react(), sitemap()],
  output: 'static',
  server: {
    port: 4321,
    host: true
  },
  vite: {
    logLevel: 'warn',
    server: {
      watch: {
        ignored: ['**/.tmp-pdf-pages/**']
      }
    }
  }
});


