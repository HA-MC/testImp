import cron from 'node-cron';
import { scrapeTaxData } from './scraper.js';

console.log('🤖 Servidor de scraping automatizado iniciado');
console.log('⏰ Frecuencia: Cada 6 horas');
console.log('📅 Próxima ejecución: ' + new Date(Date.now() + 6 * 60 * 60 * 1000).toLocaleString());

// Ejecutar inmediatamente al iniciar
console.log('\n🔄 Ejecutando scraping inicial...');
scrapeTaxData()
    .then(() => console.log('✅ Scraping inicial completado\n'))
    .catch(err => console.error('❌ Error en scraping inicial:', err));

// Programar ejecución cada 6 horas
cron.schedule('0 */6 * * *', async () => {
    console.log('\n⏰ Iniciando scraping programado...');
    try {
        await scrapeTaxData();
        console.log('✅ Scraping programado completado');
        console.log('📅 Próxima ejecución: ' + new Date(Date.now() + 6 * 60 * 60 * 1000).toLocaleString() + '\n');
    } catch (error) {
        console.error('❌ Error en scraping programado:', error);
    }
});

console.log('✅ Scheduler configurado correctamente');
console.log('💡 El servidor se mantendrá ejecutándose para actualizar datos automáticamente\n');

// Mantener el proceso vivo
process.on('SIGINT', () => {
    console.log('\n👋 Cerrando servidor de scraping...');
    process.exit(0);
});
