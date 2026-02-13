import React, { useState, useMemo } from 'react';
import { searchBusinesses } from './api';
import { TAX_DATA, GLOBAL_COMPARISON, calculateCorporateTax, calculateTotalTaxBurden } from './taxEngine';

const TaxCard = ({ tax }) => (
  <div className="tax-item">
    <div className="tax-header">
      <span className="tax-title">{tax.name}</span>
      <span className="tax-badge">Official Data</span>
    </div>
    <p className="tax-desc">{tax.description}</p>
    <a href={tax.source} target="_blank" rel="noopener noreferrer" className="source-link">
      📄 Fuente: {tax.source.split('/')[2]} ↗
    </a>
  </div>
);

const BarChart = ({ label, value, maxValue, color }) => {
  const percentage = (value / maxValue) * 100;
  return (
    <div className="bar-chart-item">
      <div className="bar-label">{label}</div>
      <div className="bar-container">
        <div className="bar-fill" style={{ width: `${percentage}%`, backgroundColor: color }}>
          <span className="bar-value">{value.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

const StackedBarChart = ({ label, corporate, capitalGains, dividends, maxValue }) => {
  const total = corporate + capitalGains + dividends;
  const corpPct = (corporate / maxValue) * 100;
  const capPct = (capitalGains / maxValue) * 100;
  const divPct = (dividends / maxValue) * 100;

  return (
    <div className="bar-chart-item">
      <div className="bar-label">{label}</div>
      <div className="bar-container">
        <div className="bar-fill-stacked">
          <div className="bar-segment" style={{ width: `${corpPct}%`, backgroundColor: '#6366f1' }}>
            {corporate > 5 && <span className="bar-value">{corporate.toFixed(1)}%</span>}
          </div>
          <div className="bar-segment" style={{ width: `${capPct}%`, backgroundColor: '#a855f7' }}>
            {capitalGains > 3 && <span className="bar-value">{capitalGains.toFixed(1)}%</span>}
          </div>
          <div className="bar-segment" style={{ width: `${divPct}%`, backgroundColor: '#22d3ee' }}>
            {dividends > 3 && <span className="bar-value">{dividends.toFixed(1)}%</span>}
          </div>
        </div>
        <div className="bar-total">{total.toFixed(1)}% total</div>
      </div>
    </div>
  );
};

// Helper para obtener color según el valor (verde=bajo, rojo=alto)
const getColorByValue = (value, max, reverse = false) => {
  const normalized = value / max;
  if (reverse) {
    // Para métricas donde menor es mejor
    if (normalized < 0.3) return '#10b981'; // verde
    if (normalized < 0.6) return '#f59e0b'; // amarillo
    return '#ef4444'; // rojo
  } else {
    if (normalized < 0.3) return '#ef4444';
    if (normalized < 0.6) return '#f59e0b';
    return '#10b981';
  }
};

const EUComparisonTable = () => {
  const euCities = ['PARIS', 'MADRID', 'BERLIN', 'LONDON', 'AMSTERDAM', 'ROME'];
  const cities = euCities.map(key => GLOBAL_COMPARISON[key]);

  return (
    <div className="comparison-container">
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--accent)' }}>
        📊 Comparativa de Impuestos entre Capitales Europeas
      </h2>
      <div className="comparison-grid">
        {cities.map((city, idx) => (
          <div key={idx} className="city-card">
            <div className="city-header">
              <h3>{city.city}</h3>
              <span className="country-badge">{city.country}</span>
            </div>
            <div className="metric-group">
              <div className="metric-label">Impuesto de Sociedades</div>
              <div className="metric-value">{(city.corporateTax.standard * 100).toFixed(1)}%</div>
              <div className="metric-desc">{city.corporateTax.description}</div>
            </div>
            <div className="metric-group">
              <div className="metric-label">IVA Estándar</div>
              <div className="metric-value">{(city.vat.standard * 100).toFixed(1)}%</div>
            </div>
            <div className="metric-group">
              <div className="metric-label">Tasa Startups</div>
              <div className="metric-value">{(city.startupRate * 100).toFixed(1)}%</div>
            </div>
            <div className="source-section">
              <a href={city.source} target="_blank" rel="noopener noreferrer" className="source-link">
                🔗 {city.source.split('/')[2]}
              </a>
              <div className="api-source">API/Datos: {city.apiSource}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="chart-section">
        <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Gráfica - Impuesto de Sociedades Estándar</h3>
        <div className="chart-container">
          {cities.map((city, idx) => (
            <BarChart key={idx} label={city.city} value={city.corporateTax.standard * 100} maxValue={35} color={`hsl(${idx * 60}, 70%, 60%)`} />
          ))}
        </div>
      </div>
    </div>
  );
};

const GlobalInvestorComparison = () => {
  const [investmentAmount, setInvestmentAmount] = useState(1000000);
  const [taxData, setTaxData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'effectiveRate', direction: 'asc' });

  React.useEffect(() => {
    fetch('/tax-data.json')
      .then(res => res.json())
      .then(data => {
        setTaxData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading tax data:', err);
        setLoading(false);
      });
  }, []);

  const burdenData = useMemo(() => {
    if (!taxData) return [];

    return Object.entries(taxData.jurisdictions).map(([key, j]) => {
      const corporate = investmentAmount * j.corporateTax.standard;
      const capitalGains = investmentAmount * 0.2 * j.capitalGainsTax;
      const dividends = (investmentAmount - corporate) * 0.5 * j.dividendTax;
      const total = corporate + capitalGains + dividends;

      return {
        key,
        ...j,
        burden: {
          corporate,
          capitalGains,
          dividends,
          total,
          effectiveRate: (total / investmentAmount) * 100
        }
      };
    });
  }, [taxData, investmentAmount]);

  const sortedData = useMemo(() => {
    if (!burdenData.length) return [];

    const sorted = [...burdenData].sort((a, b) => {
      let aVal, bVal;

      if (sortConfig.key === 'effectiveRate') {
        aVal = a.burden.effectiveRate;
        bVal = b.burden.effectiveRate;
      } else if (sortConfig.key === 'city') {
        aVal = a.city;
        bVal = b.city;
      } else if (sortConfig.key === 'corporateTax') {
        aVal = a.corporateTax.standard;
        bVal = b.corporateTax.standard;
      } else if (sortConfig.key === 'capitalGainsTax') {
        aVal = a.capitalGainsTax;
        bVal = b.capitalGainsTax;
      } else if (sortConfig.key === 'dividendTax') {
        aVal = a.dividendTax;
        bVal = b.dividendTax;
      }

      if (sortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return sorted;
  }, [burdenData, sortConfig]);

  const insights = useMemo(() => {
    if (!burdenData.length) return null;

    const best = [...burdenData].sort((a, b) => a.burden.effectiveRate - b.burden.effectiveRate)[0];
    const worst = [...burdenData].sort((a, b) => b.burden.effectiveRate - a.burden.effectiveRate)[0];
    const zeroCapGains = burdenData.filter(d => d.capitalGainsTax === 0);
    const zeroDividends = burdenData.filter(d => d.dividendTax === 0);
    const savings = worst.burden.total - best.burden.total;

    return { best, worst, zeroCapGains, zeroDividends, savings };
  }, [burdenData]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (loading) {
    return <div className="comparison-container" style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>⏳ Cargando datos fiscales oficiales...</div>
    </div>;
  }

  if (!taxData) {
    return <div className="comparison-container" style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>❌ Error cargando datos</div>
    </div>;
  }

  return (
    <div className="comparison-container">
      <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--accent)' }}>
        📊 Dashboard de Análisis Fiscal Global
      </h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
        Métricas confiables para decisiones de inversión
      </p>
      <div style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        📅 Última actualización: {new Date(taxData.lastUpdate).toLocaleString('es-ES')}
      </div>

      {/* KPI Dashboard */}
      {insights && (
        <div className="kpi-dashboard">
          <div className="kpi-card best">
            <div className="kpi-label">🏆 Menor Carga Fiscal</div>
            <div className="kpi-value">{insights.best.city}</div>
            <div className="kpi-detail">{insights.best.burden.effectiveRate.toFixed(2)}% efectivo</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">💰 Ahorro Potencial</div>
            <div className="kpi-value">${insights.savings.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            <div className="kpi-detail">vs {insights.worst.city}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">📈 0% Capital Gains</div>
            <div className="kpi-value">{insights.zeroCapGains.length} países</div>
            <div className="kpi-detail">{insights.zeroCapGains.map(d => d.city).join(', ')}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">💵 0% Dividendos</div>
            <div className="kpi-value">{insights.zeroDividends.length} países</div>
            <div className="kpi-detail">{insights.zeroDividends.map(d => d.city).join(', ')}</div>
          </div>
        </div>
      )}

      {/* Investment Calculator */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>💰 Simulador de Inversión</h3>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Capital / Beneficio Anual (USD/EUR):
        </label>
        <input
          type="number"
          className="investment-input"
          value={investmentAmount}
          onChange={(e) => setInvestmentAmount(Number(e.target.value))}
        />
      </div>

      {/* Sortable Table */}
      <div className="data-table-container">
        <h3 style={{ marginBottom: '1rem', color: 'var(--accent)', textAlign: 'center' }}>📋 Tabla Comparativa (Click para ordenar)</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('city')} className="sortable">
                  Ciudad {sortConfig.key === 'city' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('corporateTax')} className="sortable">
                  IS {sortConfig.key === 'corporateTax' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('capitalGainsTax')} className="sortable">
                  Cap. Gains {sortConfig.key === 'capitalGainsTax' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('dividendTax')} className="sortable">
                  Dividendos {sortConfig.key === 'dividendTax' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('effectiveRate')} className="sortable">
                  Tasa Efectiva {sortConfig.key === 'effectiveRate' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th>Carga Total</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'even' : 'odd'}>
                  <td className="city-cell">
                    <strong>{item.city}</strong>
                    <span className="country-sub">{item.country}</span>
                  </td>
                  <td className="metric-cell" style={{ color: getColorByValue(item.corporateTax.standard, 0.35, true) }}>
                    {(item.corporateTax.standard * 100).toFixed(1)}%
                  </td>
                  <td className="metric-cell" style={{ color: getColorByValue(item.capitalGainsTax, 0.30, true) }}>
                    {(item.capitalGainsTax * 100).toFixed(1)}%
                  </td>
                  <td className="metric-cell" style={{ color: getColorByValue(item.dividendTax, 0.40, true) }}>
                    {(item.dividendTax * 100).toFixed(1)}%
                  </td>
                  <td className="metric-cell highlight" style={{ color: getColorByValue(item.burden.effectiveRate, 40, true) }}>
                    <strong>{item.burden.effectiveRate.toFixed(2)}%</strong>
                  </td>
                  <td className="metric-cell">
                    ${item.burden.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className="chart-section" style={{ marginTop: '3rem' }}>
        <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Desglose de Carga Tributaria</h3>
        <div style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span style={{ backgroundColor: '#6366f1', padding: '0.25rem 0.5rem', borderRadius: '4px', marginRight: '0.5rem' }}>■ IS</span>
          <span style={{ backgroundColor: '#a855f7', padding: '0.25rem 0.5rem', borderRadius: '4px', marginRight: '0.5rem' }}>■ Cap. Gains</span>
          <span style={{ backgroundColor: '#22d3ee', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>■ Dividendos</span>
        </div>
        <div className="chart-container">
          {sortedData.map((item, idx) => {
            const corpRate = (item.burden.corporate / investmentAmount) * 100;
            const capRate = (item.burden.capitalGains / investmentAmount) * 100;
            const divRate = (item.burden.dividends / investmentAmount) * 100;
            return (
              <StackedBarChart
                key={idx}
                label={item.city}
                corporate={corpRate}
                capitalGains={capRate}
                dividends={divRate}
                maxValue={60}
              />
            );
          })}
        </div>
      </div>

      {/* Sources Footer */}
      <div style={{ marginTop: '3rem', padding: '1rem', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          📚 Fuentes oficiales verificadas | ✓ Datos actualizados automáticamente | 🔒 Información confiable para decisiones empresariales
        </div>
      </div>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('global');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulatedProfit, setSimulatedProfit] = useState(50000);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    const data = await searchBusinesses(query);
    setResults(data);
    setLoading(false);
  };

  const selectCompany = (company) => {
    setSelectedCompany(company);
    setResults([]);
    setQuery(company.nom_complet);
  };

  const calculatedIS = calculateCorporateTax(simulatedProfit);

  return (
    <div className="container">
      <header>
        <h1>TaxCompass Analytics</h1>
        <p className="subtitle">Plataforma de análisis fiscal global para decisiones de inversión basadas en datos</p>
      </header>

      <div className="tab-navigation">
        <button className={`tab-btn ${activeTab === 'global' ? 'active' : ''}`} onClick={() => setActiveTab('global')}>
          🌍 Dashboard Global
        </button>
        <button className={`tab-btn ${activeTab === 'europe' ? 'active' : ''}`} onClick={() => setActiveTab('europe')}>
          🇪🇺 Europa
        </button>
        <button className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
          🔍 Búsqueda Francia
        </button>
      </div>

      {activeTab === 'search' && (
        <>
          <div className="glass-card">
            <div className="search-container">
              <input
                type="text"
                placeholder="Introduce nombre de empresa o SIREN..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="btn-search" onClick={handleSearch} disabled={loading}>
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>

            {results.length > 0 && (
              <ul className="search-results">
                {results.map((company, index) => (
                  <li key={index} className="search-item" onClick={() => selectCompany(company)}>
                    <span className="company-name">{company.nom_complet}</span>
                    <span className="company-siret">SIREN: {company.siren} — {company.siege.libelle_commune}</span>
                  </li>
                ))}
              </ul>
            )}

            {selectedCompany && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                <h2 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Detalles: {selectedCompany.nom_complet}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                  <div><strong>SIREN:</strong> {selectedCompany.siren}</div>
                  <div><strong>Sede:</strong> {selectedCompany.siege.libelle_commune}</div>
                  <div><strong>Actividad:</strong> {selectedCompany.activite_principale}</div>
                  <div><strong>Forma Jurídica:</strong> {selectedCompany.nature_juridique || 'N/A'}</div>
                </div>
              </div>
            )}
          </div>

          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Tasas Francia (2024/2025)</h2>
          <div className="tax-grid">
            <TaxCard tax={TAX_DATA.CORPORATE_TAX} />
            <TaxCard tax={TAX_DATA.VAT} />
            <TaxCard tax={TAX_DATA.MICRO_ENTREPRENEUR} />
            <TaxCard tax={TAX_DATA.CFE} />
          </div>

          <div className="glass-card" style={{ marginTop: '3rem' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>Simulador IS</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                Beneficio anual estimado (€):
              </label>
              <input
                type="number"
                className="investment-input"
                value={simulatedProfit}
                onChange={(e) => setSimulatedProfit(Number(e.target.value))}
              />
            </div>
            <div className="summary-box">
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Impuesto Estimado</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white' }}>
                {calculatedIS.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                15% hasta €42.500, 25% resto
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'europe' && <EUComparisonTable />}
      {activeTab === 'global' && <GlobalInvestorComparison />}

      <footer style={{ marginTop: '4rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <p>© 2026 TaxCompass Analytics — Data-driven tax intelligence for global investors</p>
      </footer>
    </div>
  );
}

export default App;
