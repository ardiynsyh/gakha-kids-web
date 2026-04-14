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
})
