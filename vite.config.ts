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

        server.middlewares.use('/api/shipping', async (req, res, next) => {
          const rajaongkirKey = process.env.RAJAONGKIR_API_KEY;
          if (!rajaongkirKey) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'RAJAONGKIR_API_KEY belum diset di .env.local' }));
            return;
          }

          const url = new URL(req.url!, `http://localhost`);
          const type = url.searchParams.get('type');

          if (req.method === 'GET' && type === 'cities') {
            try {
              const resp = await fetch('https://api.rajaongkir.com/starter/city', {
                headers: { 'key': rajaongkirKey }
              });
              const data = await resp.json();
              res.setHeader('Content-Type', 'application/json');
              if (data.rajaongkir?.status?.code !== 200) {
                res.statusCode = data.rajaongkir?.status?.code || 500;
                res.end(JSON.stringify(data.rajaongkir?.status || { description: 'Unknown Error' }));
              } else {
                res.statusCode = 200;
                res.end(JSON.stringify(data.rajaongkir.results));
              }
            } catch (e) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: String(e) }));
            }
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
              try {
                const { origin, destination, weight } = JSON.parse(body);
                const couriers = ['jne', 'pos', 'tiki'];
                const fetchCosts = couriers.map(async (courier) => {
                  const response = await fetch('https://api.rajaongkir.com/starter/cost', {
                    method: 'POST',
                    headers: { 'key': rajaongkirKey, 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ origin, destination, weight, courier })
                  });
                  const d = await response.json();
                  if (d.rajaongkir.status.code === 200) {
                    return d.rajaongkir.results[0].costs.map((c: any) => ({
                      ...c,
                      courier_name: d.rajaongkir.results[0].name,
                      courier_code: d.rajaongkir.results[0].code
                    }));
                  }
                  return [];
                });
                const allResults = await Promise.all(fetchCosts);
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify(allResults.flat()));
              } catch (e) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: String(e) }));
              }
            });
            return;
          }

          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
        });

        server.middlewares.use('/api/midtrans', async (req, res, next) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString() });
            req.on('end', async () => {
              try {
                const payload = JSON.parse(body);
                const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-XXXXXXXXXXXXXXXXX';
                const authString = Buffer.from(serverKey + ':').toString('base64');
                
                const midRes = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Basic ${authString}`
                  },
                  body: JSON.stringify({
                    transaction_details: {
                      order_id: payload.order_id.toString(),
                      gross_amount: Math.round(payload.gross_amount)
                    },
                    customer_details: payload.customer_details,
                    item_details: (payload.item_details || []).map(item => ({
                         id: item.id.toString(),
                         price: Math.round(item.price),
                         quantity: item.quantity,
                         name: item.name.substring(0, 50)
                    }))
                  })
                });
                
                const data = await midRes.json();
                if (!midRes.ok) throw new Error(data.error_messages ? data.error_messages.join(', ') : 'Midtrans API error');
                
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ token: data.token, redirect_url: data.redirect_url }));
              } catch (e) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
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

  build: {
    // Suppress warning at 1000kb — actual chunks should be well below this after splitting
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split large vendor libraries into separate cacheable chunks
        manualChunks: {
          'vendor-react':      ['react', 'react-dom', 'react-router'],
          'vendor-motion':     ['framer-motion'],
          'vendor-supabase':   ['@supabase/supabase-js'],
          'vendor-ui':         ['lucide-react', 'sonner'],
        }
      }
    }
  }
})
