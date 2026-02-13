import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Professional Investment Simulator with Sector-Based Calculations
 * Calcula el beneficio neto final considerando sector específico
 */

const SECTORS = {
    TECH: {
        label: '💻 Technology & Software',
        rdIntensity: 0.15, // 15% revenue en R&D
        ipAdvantages: true,
        applicableCredits: ['rdTaxCredit', 'patentBox'],
        description: 'Software, SaaS, IT services - High R&D intensity'
    },
    REAL_ESTATE: {
        label: '🏢 Real Estate',
        depreciationRate: 0.04, // 4% anual
        propertyTaxImpact: 0.01, // 1% del valor
        applicableCredits: [],
        description: 'Commercial & residential property development'
    },
    INDUSTRIAL: {
        label: '🏭 Industrial & Manufacturing',
        capitalAllowances: 0.20, // 20% sobre capex
        energyCredits: true,
        applicableCredits: [],
        description: 'Manufacturing, heavy industry, production'
    },
    FINANCIAL: {
        label: '💰 Financial Services',
        regulatoryCompliance: 0.03, // 3% overhead
        applicableCredits: [],
        description: 'Banking, investment, insurance'
    }
};

export const ProSimulator = ({ taxData }) => {
    const { t } = useTranslation();
    const [sector, setSector] = useState('TECH');
    const [revenue, setRevenue] = useState(10000000);
    const [costRatio, setCostRatio] = useState(0.60); // 60% costs
    const [distributionRatio, setDistributionRatio] = useState(0.50); // 50% dividends
    const [selectedJurisdiction, setSelectedJurisdiction] = useState('SINGAPORE');

    if (!taxData || !taxData.jurisdictions) return null;

    const sectorConfig = SECTORS[sector];
    const jurisdiction = taxData.jurisdictions[selectedJurisdiction];

    // Cálculo completo del Net-of-Tax Profit
    const calculations = useMemo(() => {
        if (!jurisdiction) return null;

        // 1. Revenue
        const grossRevenue = revenue;

        // 2. Operating Costs (sector-adjusted)
        let operatingCosts = revenue * costRatio;

        // Sector-specific adjustments
        if (sector === 'TECH') {
            const rdExpense = revenue * sectorConfig.rdIntensity;
            operatingCosts += rdExpense;
        }
        if (sector === 'INDUSTRIAL') {
            const energyCosts = revenue * 0.08; // 8% energy
            operatingCosts += energyCosts;
        }
        if (sector === 'FINANCIAL') {
            const complianceCosts = revenue * sectorConfig.regulatoryCompliance;
            operatingCosts += complianceCosts;
        }

        // 3. EBITDA
        const ebitda = grossRevenue - operatingCosts;

        // 4. Depreciation
        let depreciation = 0;
        if (sector === 'REAL_ESTATE') {
            depreciation = revenue * sectorConfig.depreciationRate;
        } else if (sector === 'INDUSTRIAL') {
            depreciation = revenue * 0.05; // 5% standard
        } else {
            depreciation = revenue * 0.02; // 2% minimal for services
        }

        // 5. EBIT (Taxable Profit)
        const ebit = ebitda - depreciation;

        // 6. Corporate Tax
        let corporateTax = ebit * jurisdiction.corporateTax.standard;

        // 7. Tax Credits (sector-specific)
        let taxCredits = 0;
        if (sector === 'TECH' && jurisdiction.incentives?.rdTaxCredit) {
            const rdExpense = revenue * sectorConfig.rdIntensity;
            taxCredits += rdExpense * jurisdiction.incentives.rdTaxCredit.rate;
        }
        if (sector === 'INDUSTRIAL' && jurisdiction.incentives?.energyCredits) {
            taxCredits += revenue * 0.02; // Example 2% energy credit
        }

        // Net Corporate Tax
        const netCorporateTax = Math.max(0, corporateTax - taxCredits);

        // 8. Net Profit Before Distribution
        const netProfitBeforeDistribution = ebit - netCorporateTax;

        // 9. Dividend Distribution
        const dividendsDistributed = netProfitBeforeDistribution * distributionRatio;
        const dividendTax = dividendsDistributed * jurisdiction.dividendTax;

        // 10. Retained Earnings
        const retainedEarnings = netProfitBeforeDistribution - dividendsDistributed;

        // 11. Capital Gains on Exit (simplified: assume 3x multiple on retained)
        const exitValue = retainedEarnings * 3;
        const capitalGain = exitValue - retainedEarnings;
        const capitalGainsTax = capitalGain * jurisdiction.capitalGainsTax;

        // 12. Final Net-of-Tax Profit
        const dividendsAfterTax = dividendsDistributed - dividendTax;
        const exitProceedsAfterTax = exitValue - capitalGainsTax;
        const finalNetProfit = dividendsAfterTax + exitProceedsAfterTax;

        // Effective tax rate on total value
        const totalTaxes = netCorporateTax + dividendTax + capitalGainsTax;
        const effectiveTaxRate = (totalTaxes / grossRevenue) * 100;

        return {
            grossRevenue,
            operatingCosts,
            ebitda,
            ebitdaMargin: (ebitda / grossRevenue) * 100,
            depreciation,
            ebit,
            corporateTax,
            taxCredits,
            netCorporateTax,
            netProfitBeforeDistribution,
            dividendsDistributed,
            dividendTax,
            retainedEarnings,
            capitalGain,
            capitalGainsTax,
            finalNetProfit,
            totalTaxes,
            effectiveTaxRate,
            returnOnRevenue: (finalNetProfit / grossRevenue) * 100
        };
    }, [revenue, costRatio, distributionRatio, sector, jurisdiction, selectedJurisdiction]);

    if (!calculations) return null;

    return (
        <div className="pro-simulator-container">
            <div className="simulator-header">
                <h2>📊 {t('simulator.title')}</h2>
                <div className="simulator-subtitle">{t('simulator.subtitle')}</div>
            </div>

            {/* Configuration Panel */}
            <div className="simulator-config">
                <div className="config-row">
                    <div className="config-group">
                        <label>{t('simulator.sector')}</label>
                        <select value={sector} onChange={(e) => setSector(e.target.value)} className="simulator-select">
                            {Object.entries(SECTORS).map(([key, config]) => (
                                <option key={key} value={key}>{t(`sectors.${key.toLowerCase()}`)}</option>
                            ))}
                        </select>
                        <div className="config-hint">{t(`sectors.${sector.toLowerCase()}Desc`)}</div>
                    </div>

                    <div className="config-group">
                        <label>{t('comparison.jurisdiction')}</label>
                        <select
                            value={selectedJurisdiction}
                            onChange={(e) => setSelectedJurisdiction(e.target.value)}
                            className="simulator-select"
                        >
                            {Object.entries(taxData.jurisdictions).map(([key, j]) => (
                                <option key={key} value={key}>{j.city}, {j.country}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="config-row">
                    <div className="config-group">
                        <label>{t('simulator.annualRevenue')}</label>
                        <input
                            type="number"
                            value={revenue}
                            onChange={(e) => setRevenue(Number(e.target.value))}
                            className="simulator-input"
                        />
                    </div>

                    <div className="config-group">
                        <label>{t('simulator.operatingCosts')}</label>
                        <input
                            type="range"
                            min="0"
                            max="0.9"
                            step="0.05"
                            value={costRatio}
                            onChange={(e) => setCostRatio(Number(e.target.value))}
                            className="simulator-range"
                        />
                        <span className="range-value">{(costRatio * 100).toFixed(0)}%</span>
                    </div>

                    <div className="config-group">
                        <label>{t('simulator.dividendDistribution')}</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={distributionRatio}
                            onChange={(e) => setDistributionRatio(Number(e.target.value))}
                            className="simulator-range"
                        />
                        <span className="range-value">{(distributionRatio * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            {/* P&L Waterfall */}
            <div className="simulator-waterfall">
                <h3>{t('simulator.waterfall')}</h3>
                <div className="waterfall-steps">
                    <WaterfallStep
                        label={t('simulator.grossRevenue')}
                        value={calculations.grossRevenue}
                        type="revenue"
                    />
                    <WaterfallStep
                        label={t('simulator.operatingCosts')}
                        value={-calculations.operatingCosts}
                        type="cost"
                    />
                    <WaterfallStep
                        label="EBITDA"
                        value={calculations.ebitda}
                        type="profit"
                        margin={`${calculations.ebitdaMargin.toFixed(1)}% ${t('simulator.margin')}`}
                    />
                    <WaterfallStep
                        label={t('simulator.depreciation')}
                        value={-calculations.depreciation}
                        type="cost"
                    />
                    <WaterfallStep
                        label={t('simulator.ebit')}
                        value={calculations.ebit}
                        type="profit"
                    />
                    <WaterfallStep
                        label={t('comparison.corporateTax')}
                        value={-calculations.netCorporateTax}
                        type="tax"
                    />
                    {calculations.taxCredits > 0 && (
                        <WaterfallStep
                            label={`${t('comparison.taxIncentives')} (${sector})`}
                            value={calculations.taxCredits}
                            type="credit"
                        />
                    )}
                    <WaterfallStep
                        label={t('simulator.netProfit')}
                        value={calculations.netProfitBeforeDistribution}
                        type="profit"
                    />
                    <WaterfallStep
                        label={t('comparison.dividends')}
                        value={-calculations.dividendTax}
                        type="tax"
                    />
                    <WaterfallStep
                        label={t('comparison.capitalGains')}
                        value={-calculations.capitalGainsTax}
                        type="tax"
                    />
                    <WaterfallStep
                        label={t('simulator.finalNetProfit')}
                        value={calculations.finalNetProfit}
                        type="final"
                        highlight
                        t={t}
                    />
                </div>
            </div>

            {/* Summary KPIs */}
            <div className="simulator-kpis">
                <div className="sim-kpi">
                    <div className="sim-kpi-label">{t('comparison.totalBurden')}</div>
                    <div className="sim-kpi-value tax">${calculations.totalTaxes.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                </div>
                <div className="sim-kpi">
                    <div className="sim-kpi-label">{t('comparison.effectiveRate')}</div>
                    <div className="sim-kpi-value">{calculations.effectiveTaxRate.toFixed(2)}%</div>
                </div>
                <div className="sim-kpi">
                    <div className="sim-kpi-label">{t('simulator.netReturn')}</div>
                    <div className="sim-kpi-value profit">{calculations.returnOnRevenue.toFixed(2)}%</div>
                </div>
                <div className="sim-kpi">
                    <div className="sim-kpi-label">{t('simulator.taxCreditsApplied')}</div>
                    <div className="sim-kpi-value credit">${calculations.taxCredits.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                </div>
            </div>

            {/* Sector-specific insights */}
            {sector === 'TECH' && jurisdiction.incentives?.rdTaxCredit && (
                <div className="sector-insight tech">
                    <strong>💡 {t('simulator.techAdvantage')}:</strong> {t('comparison.rdCredit')} {t('comparison.of')} {jurisdiction.incentives.rdTaxCredit.rate * 100}%
                    {t('simulator.saved')} ${calculations.taxCredits.toLocaleString()} {t('simulator.inTaxes')}
                </div>
            )}
        </div>
    );
};

// Sub-component
const WaterfallStep = ({ label, value, type, margin, highlight, t }) => {
    const getColor = () => {
        if (type === 'revenue') return '#10b981';
        if (type === 'profit') return '#3b82f6';
        if (type === 'cost' || type === 'tax') return '#ef4444';
        if (type === 'credit') return '#10b981';
        if (type === 'final') return '#a855f7';
        return '#64748b';
    };

    return (
        <div className={`waterfall-step ${highlight ? 'highlight' : ''}`}>
            <div className="step-label">{label}</div>
            <div className="step-value" style={{ color: getColor() }}>
                {value >= 0 ? '+' : ''}${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                {margin && <span className="step-margin"> ({margin})</span>}
            </div>
        </div>
    );
};

export default ProSimulator;
