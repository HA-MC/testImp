import React, { useState } from 'react';

/**
 * Bloomberg-Style Side-by-Side Comparison Component
 * Permite comparar 2 jurisdicciones en paralelo con cálculo de diferencias
 */
export const SideBySideComparison = ({ taxData }) => {
    const [cityA, setCityA] = useState('SINGAPORE');
    const [cityB, setCityB] = useState('DUBAI');
    const [investmentAmount, setInvestmentAmount] = useState(1000000);

    if (!taxData || !taxData.jurisdictions) return null;

    const jurisdictions = Object.keys(taxData.jurisdictions);
    const dataA = taxData.jurisdictions[cityA];
    const dataB = taxData.jurisdictions[cityB];

    if (!dataA || !dataB) return null;

    // Calcular burden para ambas ciudades
    const calculateBurden = (data) => {
        const corporate = investmentAmount * data.corporateTax.standard;
        const capitalGains = investmentAmount * 0.2 * data.capitalGainsTax;
        const dividends = (investmentAmount - corporate) * 0.5 * data.dividendTax;
        const total = corporate + capitalGains + dividends;
        return {
            corporate,
            capitalGains,
            dividends,
            total,
            effectiveRate: (total / investmentAmount) * 100
        };
    };

    const burdenA = calculateBurden(dataA);
    const burdenB = calculateBurden(dataB);

    // Calcular diferencias
    const diff = {
        corporate: burdenB.corporate - burdenA.corporate,
        capitalGains: burdenB.capitalGains - burdenA.capitalGains,
        dividends: burdenB.dividends - burdenA.dividends,
        total: burdenB.total - burdenA.total,
        effectiveRate: burdenB.effectiveRate - burdenA.effectiveRate
    };

    const getDiffColor = (value) => {
        if (Math.abs(value) < 100) return '#94a3b8'; // neutral
        return value > 0 ? '#ef4444' : '#10b981'; // red if B is worse, green if better
    };

    const formatDiff = (value) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    };

    return (
        <div className="side-by-side-container">
            <div className="terminal-header">
                <h2>⚡ Comparative Terminal Analysis</h2>
                <div className="terminal-subtitle">Institutional-grade side-by-side comparison</div>
            </div>

            {/* Investment amount input */}
            <div className="terminal-input-row">
                <label>Investment Amount (USD):</label>
                <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                    className="terminal-input"
                />
            </div>

            {/* City selectors */}
            <div className="comparison-selectors">
                <div className="selector-group">
                    <label>Jurisdiction A</label>
                    <select value={cityA} onChange={(e) => setCityA(e.target.value)} className="terminal-select">
                        {jurisdictions.map(key => (
                            <option key={key} value={key}>{taxData.jurisdictions[key].city}</option>
                        ))}
                    </select>
                </div>

                <div className="vs-divider">VS</div>

                <div className="selector-group">
                    <label>Jurisdiction B</label>
                    <select value={cityB} onChange={(e) => setCityB(e.target.value)} className="terminal-select">
                        {jurisdictions.map(key => (
                            <option key={key} value={key}>{taxData.jurisdictions[key].city}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Comparison Grid */}
            <div className="comparison-grid-side">
                {/* Column A */}
                <div className="terminal-column">
                    <div className="terminal-column-header">
                        <h3>{dataA.city}</h3>
                        <span className="country-badge-terminal">{dataA.country}</span>
                    </div>

                    <div className="terminal-metrics">
                        <MetricRow label="Corporate Tax" value={`${(dataA.corporateTax.standard * 100).toFixed(1)}%`} amount={burdenA.corporate} />
                        <MetricRow label="Capital Gains" value={`${(dataA.capitalGainsTax * 100).toFixed(1)}%`} amount={burdenA.capitalGains} />
                        <MetricRow label="Dividend Tax" value={`${(dataA.dividendTax * 100).toFixed(1)}%`} amount={burdenA.dividends} />
                        <div className="metric-row-total">
                            <span>Total Tax Burden</span>
                            <span className="metric-value-large">${burdenA.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="metric-row-effective">
                            <span>Effective Rate</span>
                            <span className="metric-value-effective">{burdenA.effectiveRate.toFixed(2)}%</span>
                        </div>
                    </div>

                    {/* Incentives */}
                    {dataA.incentives && (
                        <div className="terminal-incentives">
                            <div className="incentives-title">💡 Tax Incentives</div>
                            {dataA.incentives.rdTaxCredit && (
                                <div className="incentive-item">
                                    <strong>R&D Credit:</strong> {dataA.incentives.rdTaxCredit.rate * 100}%
                                </div>
                            )}
                            {dataA.effectiveRateContext && (
                                <div className="incentive-note">{dataA.effectiveRateContext}</div>
                            )}
                        </div>
                    )}

                    {/* DTT */}
                    {dataA.doubleTaxTreaties && (
                        <div className="terminal-dtt">
                            <div className="dtt-title">🌐 Tax Treaties</div>
                            <div className="dtt-count">{dataA.doubleTaxTreaties.count} countries</div>
                            <div className="dtt-withholding">
                                Div: {dataA.doubleTaxTreaties.withholding.dividends * 100}% |
                                Int: {dataA.doubleTaxTreaties.withholding.interest * 100}% |
                                Roy: {dataA.doubleTaxTreaties.withholding.royalties * 100}%
                            </div>
                        </div>
                    )}
                </div>

                {/* Diff Column */}
                <div className="terminal-diff-column">
                    <div className="diff-header">ΔDELTA</div>

                    <div className="diff-metrics">
                        <DiffRow label="Corporate" diff={diff.corporate} />
                        <DiffRow label="Cap.Gains" diff={diff.capitalGains} />
                        <DiffRow label="Dividends" diff={diff.dividends} />
                        <div className="diff-row-total" style={{ color: getDiffColor(diff.total) }}>
                            <div className="diff-label">Total</div>
                            <div className="diff-value">${formatDiff(diff.total)}</div>
                        </div>
                        <div className="diff-row-effective" style={{ color: getDiffColor(diff.effectiveRate * 1000) }}>
                            <div className="diff-label">Eff.Rate</div>
                            <div className="diff-value">{formatDiff(diff.effectiveRate)}%</div>
                        </div>
                    </div>

                    <div className="diff-verdict">
                        {diff.total < -1000 ? (
                            <div className="verdict-winner">
                                ✓ {dataA.city} saves <strong>${Math.abs(diff.total).toLocaleString()}</strong>
                            </div>
                        ) : diff.total > 1000 ? (
                            <div className="verdict-loser">
                                ✗ {dataA.city} costs <strong>${Math.abs(diff.total).toLocaleString()}</strong> more
                            </div>
                        ) : (
                            <div className="verdict-neutral">≈ Equivalent tax burden</div>
                        )}
                    </div>
                </div>

                {/* Column B */}
                <div className="terminal-column">
                    <div className="terminal-column-header">
                        <h3>{dataB.city}</h3>
                        <span className="country-badge-terminal">{dataB.country}</span>
                    </div>

                    <div className="terminal-metrics">
                        <MetricRow label="Corporate Tax" value={`${(dataB.corporateTax.standard * 100).toFixed(1)}%`} amount={burdenB.corporate} />
                        <MetricRow label="Capital Gains" value={`${(dataB.capitalGainsTax * 100).toFixed(1)}%`} amount={burdenB.capitalGains} />
                        <MetricRow label="Dividend Tax" value={`${(dataB.dividendTax * 100).toFixed(1)}%`} amount={burdenB.dividends} />
                        <div className="metric-row-total">
                            <span>Total Tax Burden</span>
                            <span className="metric-value-large">${burdenB.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="metric-row-effective">
                            <span>Effective Rate</span>
                            <span className="metric-value-effective">{burdenB.effectiveRate.toFixed(2)}%</span>
                        </div>
                    </div>

                    {/* Incentives */}
                    {dataB.incentives && (
                        <div className="terminal-incentives">
                            <div className="incentives-title">💡 Tax Incentives</div>
                            {dataB.incentives.rdTaxCredit && (
                                <div className="incentive-item">
                                    <strong>R&D Credit:</strong> {dataB.incentives.rdTaxCredit.rate * 100}%
                                </div>
                            )}
                            {dataB.effectiveRateContext && (
                                <div className="incentive-note">{dataB.effectiveRateContext}</div>
                            )}
                        </div>
                    )}

                    {/* DTT */}
                    {dataB.doubleTaxTreaties && (
                        <div className="terminal-dtt">
                            <div className="dtt-title">🌐 Tax Treaties</div>
                            <div className="dtt-count">{dataB.doubleTaxTreaties.count} countries</div>
                            <div className="dtt-withholding">
                                Div: {dataB.doubleTaxTreaties.withholding.dividends * 100}% |
                                Int: {dataB.doubleTaxTreaties.withholding.interest * 100}% |
                                Roy: {dataB.doubleTaxTreaties.withholding.royalties * 100}%
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Sub-components
const MetricRow = ({ label, value, amount }) => (
    <div className="metric-row-terminal">
        <span className="metric-label-terminal">{label}</span>
        <div className="metric-values">
            <span className="metric-rate">{value}</span>
            <span className="metric-amount">${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
        </div>
    </div>
);

const DiffRow = ({ label, diff }) => {
    const color = diff > 100 ? '#ef4444' : diff < -100 ? '#10b981' : '#94a3b8';
    const sign = diff >= 0 ? '+' : '';

    return (
        <div className="diff-row" style={{ color }}>
            <div className="diff-label">{label}</div>
            <div className="diff-value">{sign}${diff.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
        </div>
    );
};

export default SideBySideComparison;
