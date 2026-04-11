import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used - do not remove them
    react(),
    tailwindcss(),
    {
      name: 'admin-api',
      configureServer(server) {
        server.middlewares.use('/api/save-info-pages', (req, res, next) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString() });
            req.on('end', () => {
              try {
                const dataPath = path.resolve(__dirname, './src/data/infoPages.json');
                fs.writeFileSync(dataPath, body, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (e) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: String(e) }));
              }
            });
          } else {
            next();
          }
        });

        server.middlewares.use('/api/save-config', (req, res, next) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString() });
            req.on('end', () => {
              try {
                const dataPath = path.resolve(__dirname, './src/data/storeConfig.json');
                fs.writeFileSync(dataPath, body, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (e) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: String(e) }));
              }
            });
          } else {
            next();
          }
        });

        server.middlewares.use('/api/save-products', (req, res, next) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString() });
            req.on('end', () => {
              try {
                const dataPath = path.resolve(__dirname, './src/data/products.json');
                fs.writeFileSync(dataPath, body, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (e) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: String(e) }));
              }
            });
          } else {
            next();
          }
        });

        server.middlewares.use('/api/upload-image', (req, res, next) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString() });
            req.on('end', () => {
              try {
                const payload = JSON.parse(body);
                const { filename, data } = payload;
                if (!filename || !data) throw new Error('Missing file data');
                
                const uploadsDir = path.resolve(__dirname, './public/uploads');
                if (!fs.existsSync(uploadsDir)) {
                  fs.mkdirSync(uploadsDir, { recursive: true });
                }
                
                const safeFilename = Date.now() + '-' + filename.replace(/[^a-zA-Z0-9.\-]/g, '');
                const filePath = path.join(uploadsDir, safeFilename);
                const base64Data = data.replace(/^data:image\/\w+;base64,/, "");
                
                fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
                
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, url: `/uploads/${safeFilename}` }));
              } catch (e) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: String(e) }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
