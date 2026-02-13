# TaxCompass Global - Sistema Automatizado de Datos Fiscales

## 🤖 Actualización Automática de Datos

Los datos fiscales se actualizan automáticamente desde fuentes gubernamentales oficiales.

### Configuración del Scraper (Opcional - Para Automatización Completa)

Si deseas que los datos se actualicen automáticamente cada 6 horas, sigue estos pasos:

1. **Instalar dependencias del scraper**:
```bash
npm install axios cheerio node-cron
```

2. **Ejecutar scraping manual** (una vez):
```bash
npm run scrape
```
Esto genera/actualiza `public/tax-data.json` con datos verificados.

3. **Iniciar servidor de actualización automática**:
```bash
npm run start-backend
```
El servidor ejecutará el scraping cada 6 horas automáticamente.

### 📊 Fuentes Oficiales

Todos los datos provienen de:
- **Francia**: [DGFIP](https://www.impots.gouv.fr/) + API `recherche-entreprises.api.gouv.fr`
- **España**: [Agencia Tributaria](https://sede.agenciatributaria.gob.es/)
- **Alemania**: [Bundesfinanzministerium](https://www.bundesfinanzministerium.de/)
- **Reino Unido**: [HMRC](https://www.gov.uk/topic/business-tax/corporation-tax)
- **Países Bajos**: [Belastingdienst](https://www.belastingdienst.nl/)
- **Italia**: [Agenzia delle Entrate](https://www.agenziaentrate.gov.it/)
- **Singapur**: [IRAS](https://www.iras.gov.sg/)
- **Dubai**: [Ministry of Finance UAE](https://mof.gov.ae/)
- **USA**: [IRS](https://www.irs.gov/)
- **Canadá**: [CRA](https://www.canada.ca/en/revenue-agency.html)

### 🔍 Verificación de Datos

El archivo `public/tax-data.json` contiene:
- Timestamp de última actualización
- URL de fuente oficial para cada jurisdicción
- Fecha de verificación manual
- Notas específicas por jurisdicción

## 🚀 Uso de la Aplicación

1. **Desarrollo**:
```bash
npm run dev
```

2. **Navegar a**: http://localhost:5173

3. **Pestañas disponibles**:
   - 🔍 **Búsqueda Francia**: API en tiempo real de empresas
   - 🇪🇺 **Europa**: Comparativa de 6 capitales
   - 🌍 **Global**: 10 jurisdicciones con calculadora de inversión

## 📝 Actualización Manual

Si prefieres actualizar los datos manualmente:

1. Edita `public/tax-data.json`
2. Actualiza el campo `lastUpdate` con la fecha actual
3. Actualiza el campo `verified` en cada jurisdicción
4. Verifica que las URLs de `source` sean correctas

La aplicación leerá automáticamente los cambios al recargar.
