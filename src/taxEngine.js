/**
 * Global Tax Engine for Investors (2024/2025 Data)
 * Sources: Official Government Tax Authorities Worldwide
 * Data loaded from public/tax-data.json (auto-updated via scraper)
 */

// Cargar datos desde el JSON generado automáticamente
let GLOBAL_COMPARISON_DATA = null;
let TAX_DATA_METADATA = null;

export async function loadTaxData() {
    try {
        const response = await fetch('/tax-data.json');
        const data = await response.json();
        GLOBAL_COMPARISON_DATA = data.jurisdictions;
        TAX_DATA_METADATA = {
            lastUpdate: data.lastUpdate,
            note: data.note,
            updateFrequency: data.updateFrequency
        };
        return data;
    } catch (error) {
        console.error('Error loading tax data:', error);
        // Fallback a datos quemados si falla
        return null;
    }
}

// FRANCIA (Paris) - Base
export const TAX_DATA = {
    CORPORATE_TAX: {
        name: "Impôt sur les Sociétés (IS)",
        rates: [
            { threshold: 42500, rate: 0.15, label: "Taux réduit (PME)" },
            { threshold: Infinity, rate: 0.25, label: "Taux normal" }
        ],
        source: "https://www.impots.gouv.fr/professionnel/limpot-sur-les-societes",
        description: "S'applique aux bénéfices des sociétés (SARL, SAS, etc.). Le taux réduit s'applique sous conditions de CA et de capital."
    },
    VAT: {
        name: "Taxe sur la Valeur Ajoutée (TVA)",
        standardRate: 0.20,
        reducedRates: [0.10, 0.055, 0.021],
        source: "https://www.service-public.fr/professionnels/vosdroits/F23567",
        description: "Collectée par l'entreprise pour l'État. Le taux normal est de 20% en France métropolitaine."
    },
    MICRO_ENTREPRENEUR: {
        name: "Régime Micro-entrepreneur",
        categories: {
            VENTE: { socialRate: 0.123, taxAllowance: 0.71, label: "Achat / Revente", liberatoire: 0.01 },
            PRESTATION_SERVICE_BIC: { socialRate: 0.212, taxAllowance: 0.50, label: "Prestation de services (BIC)", liberatoire: 0.017 },
            LIBERAL: { socialRate: 0.231, taxAllowance: 0.34, label: "Profession Libérale (BNC)", liberatoire: 0.022 }
        },
        source: "https://www.autoentrepreneur.urssaf.fr/",
        description: "Calculé sur le chiffre d'affaires brut."
    },
    CFE: {
        name: "Cotisation Foncière des Entreprises (CFE)",
        source: "https://www.service-public.fr/professionnels/vosdroits/F23547",
        description: "Taxe locale basée sur la valeur locative. Exonération la première année."
    }
};

// COMPARATIVA EUROPEA
export const EUROPE_COMPARISON = {
    PARIS: {
        city: "París", country: "Francia",
        corporateTax: { standard: 0.25, reduced: 0.15, threshold: 42500, description: "15% hasta €42.500, 25% resto" },
        vat: { standard: 0.20, reduced: [0.10, 0.055] },
        capitalGainsTax: 0.25, dividendTax: 0.30, startupRate: 0.15,
        source: "https://www.impots.gouv.fr/", apiSource: "recherche-entreprises.api.gouv.fr"
    },
    MADRID: {
        city: "Madrid", country: "España",
        corporateTax: { standard: 0.25, reduced: 0.15, threshold: null, description: "25% general, 15% nuevas empresas (2 años)" },
        vat: { standard: 0.21, reduced: [0.10, 0.04] },
        capitalGainsTax: 0.25, dividendTax: 0.19, startupRate: 0.15,
        source: "https://sede.agenciatributaria.gob.es/", apiSource: "Agencia Tributaria"
    },
    BERLIN: {
        city: "Berlín", country: "Alemania",
        corporateTax: { standard: 0.30, reduced: null, threshold: null, description: "~30% combinado (15% + 5.5% + ~9.5%)" },
        vat: { standard: 0.19, reduced: [0.07] },
        capitalGainsTax: 0.26, dividendTax: 0.26, startupRate: 0.30,
        source: "https://www.bundesfinanzministerium.de/", apiSource: "BMF Datenportal"
    },
    LONDON: {
        city: "Londres", country: "Reino Unido",
        corporateTax: { standard: 0.25, reduced: 0.19, threshold: 50000, description: "19% hasta £50k, 25% sobre £250k" },
        vat: { standard: 0.20, reduced: [0.05, 0] },
        capitalGainsTax: 0.20, dividendTax: 0.339, startupRate: 0.19,
        source: "https://www.gov.uk/topic/business-tax/corporation-tax", apiSource: "HMRC"
    },
    AMSTERDAM: {
        city: "Ámsterdam", country: "Países Bajos",
        corporateTax: { standard: 0.258, reduced: 0.19, threshold: 200000, description: "19% hasta €200k, 25.8% resto" },
        vat: { standard: 0.21, reduced: [0.09] },
        capitalGainsTax: 0.258, dividendTax: 0.15, startupRate: 0.19,
        source: "https://www.belastingdienst.nl/", apiSource: "Belastingdienst"
    },
    ROME: {
        city: "Roma", country: "Italia",
        corporateTax: { standard: 0.24, reduced: null, threshold: null, description: "24% IRES + 3.9% IRAP" },
        vat: { standard: 0.22, reduced: [0.10, 0.05, 0.04] },
        capitalGainsTax: 0.26, dividendTax: 0.26, startupRate: 0.24,
        source: "https://www.agenziaentrate.gov.it/", apiSource: "Agenzia delle Entrate"
    }
};

// COMPARATIVA GLOBAL - Nuevas Jurisdicciones
export const GLOBAL_COMPARISON = {
    ...EUROPE_COMPARISON,
    SINGAPORE: {
        city: "Singapur", country: "Singapur",
        corporateTax: { standard: 0.17, reduced: 0.085, threshold: 200000, description: "17% estándar, exenciones para startups" },
        vat: { standard: 0.09, reduced: [] },
        capitalGainsTax: 0, dividendTax: 0, startupRate: 0.085,
        source: "https://www.iras.gov.sg/", apiSource: "IRAS Tax Authority",
        notes: "0% capital gains, 0% dividendos (sistema one-tier)"
    },
    DUBAI: {
        city: "Dubái", country: "Emiratos Árabes Unidos",
        corporateTax: { standard: 0.09, reduced: 0, threshold: 375000, description: "0% hasta AED 375k, 9% resto" },
        vat: { standard: 0.05, reduced: [] },
        capitalGainsTax: 0, dividendTax: 0, startupRate: 0,
        source: "https://mof.gov.ae/", apiSource: "Ministry of Finance UAE / FTA",
        notes: "0% capital gains, 0% dividendos, Free Zones con 0%"
    },
    NEW_YORK: {
        city: "Nueva York", country: "Estados Unidos",
        corporateTax: { standard: 0.2825, reduced: null, threshold: null, description: "21% federal + 7.25% NY = 28.25%" },
        vat: { standard: 0.08875, reduced: [] },
        capitalGainsTax: 0.21, dividendTax: 0.238, startupRate: 0.2825,
        source: "https://www.irs.gov/", apiSource: "IRS + NY Department of Taxation",
        notes: "Sales tax varía por condado"
    },
    TORONTO: {
        city: "Toronto", country: "Canadá",
        corporateTax: { standard: 0.265, reduced: 0.122, threshold: 500000, description: "15% federal + 11.5% Ontario" },
        vat: { standard: 0.13, reduced: [] },
        capitalGainsTax: 0.1325, dividendTax: 0.3953, startupRate: 0.122,
        source: "https://www.canada.ca/en/revenue-agency.html", apiSource: "Canada Revenue Agency (CRA)",
        notes: "HST 13% en Ontario, tasa pequeñas empresas 12.2%"
    }
};

export const calculateCorporateTax = (profit) => {
    if (profit <= 0) return 0;
    let tax = 0;
    if (profit <= 42500) {
        tax = profit * 0.15;
    } else {
        tax = (42500 * 0.15) + ((profit - 42500) * 0.25);
    }
    return tax;
};

export const calculateMicroSocial = (turnover, category) => {
    const cat = TAX_DATA.MICRO_ENTREPRENEUR.categories[category];
    if (!cat) return 0;
    return turnover * cat.socialRate;
};

// CÁLCULO DE CARGA TRIBUTARIA TOTAL
export const calculateTotalTaxBurden = (profit, jurisdiction) => {
    const j = GLOBAL_COMPARISON[jurisdiction];
    if (!j) return 0;

    const corporateTax = profit * j.corporateTax.standard;
    const capitalGains = profit * 0.2 * j.capitalGainsTax; // Asume 20% del profit como ganancias
    const dividends = (profit - corporateTax) * 0.5 * j.dividendTax; // Asume 50% distribuido

    return {
        corporate: corporateTax,
        capitalGains: capitalGains,
        dividends: dividends,
        total: corporateTax + capitalGains + dividends,
        effectiveRate: ((corporateTax + capitalGains + dividends) / profit) * 100
    };
};

export const getInvestorMetrics = () => {
    const jurisdictions = Object.values(GLOBAL_COMPARISON);
    return {
        labels: jurisdictions.map(j => j.city),
        corporateTax: jurisdictions.map(j => j.corporateTax.standard * 100),
        capitalGains: jurisdictions.map(j => j.capitalGainsTax * 100),
        dividendTax: jurisdictions.map(j => j.dividendTax * 100),
        vat: jurisdictions.map(j => j.vat.standard * 100)
    };
};

export const getComparisonChartData = () => getInvestorMetrics();
