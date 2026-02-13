import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import { scrapeTaxData } from './scraper.js';

import fs from 'fs';

// Configuración de rutas para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000; // Render usa el puerto 10000 por defecto

// --- TU LÓGICA DE SCRAPING ---
console.log('🤖 Servidor de scraping automatizado iniciado');

// Ejecutar inmediatamente al iniciar
scrapeTaxData()
    .then(() => console.log('✅ Scraping inicial completado'))
    .catch(err => console.error('❌ Error en scraping inicial:', err));

// Programar ejecución cada 6 horas
cron.schedule('0 */6 * * *', async () => {
    console.log('⏰ Iniciando scraping programado...');
    try {
        await scrapeTaxData();
        console.log('✅ Scraping programado completado');
    } catch (error) {
        console.error('❌ Error en scraping programado:', error);
    }
});

app.get('/api/tax-data', (req, res) => {
    const dataPath = path.join(__dirname, '../tax-data.json');
    if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, 'utf8');
        res.json(JSON.parse(data));
    } else {
        // Si el archivo no existe aún, envía el fallback inicial
        res.json({ message: "Cargando datos..." });
    }
});

// --- SERVIDOR WEB (Esto es lo que falta para Render) ---

// Servir los archivos estáticos de la carpeta "dist" (donde Vite construye el frontend)
app.use(express.static(path.join(__dirname, '../dist')));

// Cualquier ruta que no sea de la API servirá el index.html de tu React app
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor web activo y escuchando en el puerto ${PORT}`);
});

