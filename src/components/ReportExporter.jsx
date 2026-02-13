import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Professional PDF Report Generator for Investment Committees
 * Captures dashboard state and generates executive summary
 */

export const generateInvestmentReport = async (reportData) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;

    // Helper to add page footer
    const addFooter = (pageNum, totalPages) => {
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text('TaxCompass Analytics | Institutional Investment Intelligence | Confidential', margin, pageHeight - 10);
        pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
    };

    // ============ PAGE 1: COVER ============
    pdf.setFillColor(10, 14, 39); // Dark blue background
    pdf.rect(0, 0, pageWidth, 80, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.text('INVESTMENT TAX ANALYSIS', margin, 40);

    pdf.setFontSize(14);
    pdf.setTextColor(100, 200, 255);
    pdf.text('Global Jurisdiction Comparison Report', margin, 52);

    pdf.setTextColor(150);
    pdf.setFontSize(10);
    const reportDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    pdf.text(`Generated: ${reportDate}`, margin, 65);
    pdf.text(`Investment Amount: $${reportData.investmentAmount?.toLocaleString() || 'N/A'}`, margin, 72);

    // Executive Summary Box
    pdf.setTextColor(0);
    pdf.setFontSize(12);
    pdf.text('EXECUTIVE SUMMARY', margin, 100);

    pdf.setFontSize(10);
    pdf.setTextColor(60);

    if (reportData.insights) {
        const { best, savings } = reportData.insights;
        pdf.text(`• Optimal Jurisdiction: ${best?.city || 'N/A'}, ${best?.country || ''}`, margin + 5, 110);
        pdf.text(`• Effective Tax Rate: ${best?.burden?.effectiveRate?.toFixed(2) || 'N/A'}%`, margin + 5, 118);
        pdf.text(`• Potential Savings: $${savings?.toLocaleString() || 'N/A'}`, margin + 5, 126);
        pdf.text(`• Jurisdictions Analyzed: ${reportData.jurisdictionsCount || 10}`, margin + 5, 134);
    }

    // Disclaimer
    pdf.setFontSize(8);
    pdf.setTextColor(120);
    const disclaimer = 'This report is for informational purposes only. Tax rates and regulations are subject to change. Consult with qualified tax professionals before making investment decisions.';
    const disclaimerLines = pdf.splitTextToSize(disclaimer, pageWidth - 2 * margin);
    pdf.text(disclaimerLines, margin, pageHeight - 30);

    addFooter(1, 4);

    // ============ PAGE 2: KPI DASHBOARD ============
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.setTextColor(0);
    pdf.text('KEY PERFORMANCE INDICATORS', margin, 25);

    // Capture KPI dashboard if it exists
    const kpiElement = document.querySelector('.kpi-dashboard');
    if (kpiElement) {
        try {
            const canvas = await html2canvas(kpiElement, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false
            });
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', margin, 35, imgWidth, Math.min(imgHeight, 80));
        } catch (err) {
            console.error('Error capturing KPI dashboard:', err);
            pdf.setFontSize(10);
            pdf.setTextColor(150);
            pdf.text('KPI Dashboard not available for export', margin, 50);
        }
    }

    // Metrics Table
    pdf.setFontSize(14);
    pdf.setTextColor(0);
    pdf.text('TAX BURDEN COMPARISON', margin, 130);

    // Table header
    pdf.setFillColor(99, 102, 241);
    pdf.setTextColor(255);
    pdf.setFontSize(9);
    pdf.rect(margin, 138, pageWidth - 2 * margin, 8, 'F');
    pdf.text('Jurisdiction', margin + 2, 143);
    pdf.text('Corp.Tax', margin + 50, 143);
    pdf.text('Cap.Gains', margin + 75, 143);
    pdf.text('Dividends', margin + 105, 143);
    pdf.text('Effective Rate', margin + 135, 143);

    // Table rows (top 5)
    if (reportData.sortedData && reportData.sortedData.length > 0) {
        pdf.setTextColor(0);
        pdf.setFontSize(8);
        let yPos = 151;

        reportData.sortedData.slice(0, 5).forEach((item, idx) => {
            const bg = idx % 2 === 0 ? 245 : 255;
            pdf.setFillColor(bg);
            pdf.rect(margin, yPos - 4, pageWidth - 2 * margin, 7, 'F');

            pdf.text(item.city, margin + 2, yPos);
            pdf.text(`${(item.corporateTax.standard * 100).toFixed(1)}%`, margin + 50, yPos);
            pdf.text(`${(item.capitalGainsTax * 100).toFixed(1)}%`, margin + 75, yPos);
            pdf.text(`${(item.dividendTax * 100).toFixed(1)}%`, margin + 105, yPos);
            pdf.text(`${item.burden.effectiveRate.toFixed(2)}%`, margin + 135, yPos);

            yPos += 7;
        });
    }

    addFooter(2, 4);

    // ============ PAGE 3: VISUAL CHARTS ============
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.setTextColor(0);
    pdf.text('TAX BURDEN BREAKDOWN', margin, 25);

    // Capture chart section
    const chartElement = document.querySelector('.chart-section');
    if (chartElement) {
        try {
            const canvas = await html2canvas(chartElement, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false
            });
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', margin, 35, imgWidth, Math.min(imgHeight, 180));
        } catch (err) {
            console.error('Error capturing charts:', err);
            pdf.setFontSize(10);
            pdf.setTextColor(150);
            pdf.text('Charts not available for export', margin, 50);
        }
    }

    addFooter(3, 4);

    // ============ PAGE 4: DATA SOURCES & METHODOLOGY ============
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.setTextColor(0);
    pdf.text('DATA SOURCES & METHODOLOGY', margin, 25);

    pdf.setFontSize(10);
    pdf.setTextColor(60);

    pdf.text('Official Government Sources:', margin, 40);
    pdf.setFontSize(8);
    const sources = [
        'France: Direction Générale des Finances Publiques (DGFIP)',
        'Singapore: Inland Revenue Authority of Singapore (IRAS)',
        'Dubai: Ministry of Finance UAE',
        'USA: Internal Revenue Service (IRS)',
        'Canada: Canada Revenue Agency (CRA)',
        'UK: HM Revenue & Customs (HMRC)',
    ];

    let yPos = 48;
    sources.forEach(source => {
        pdf.text(`• ${source}`, margin + 5, yPos);
        yPos += 6;
    });

    pdf.setFontSize(10);
    pdf.text('Calculation Methodology:', margin, yPos + 10);
    pdf.setFontSize(8);

    const methodology = [
        '1. Corporate Tax: Applied on taxable profit at standard/reduced rates',
        '2. Capital Gains Tax: Calculated on 20% of profit (assumed realized gains)',
        '3. Dividend Tax: Applied on 50% of net profit (assumed distribution ratio)',
        '4. Effective Total Rate: Sum of all taxes divided by gross profit',
        '5. Tax Credits: Sector-specific incentives (R&D, Patent Box) where applicable'
    ];

    yPos += 18;
    methodology.forEach(line => {
        pdf.text(line, margin + 5, yPos);
        yPos += 6;
    });

    // Update frequency
    pdf.setFontSize(9);
    pdf.setTextColor(100);
    pdf.text(`Data Last Updated: ${reportData.lastUpdate || 'N/A'}`, margin, yPos + 15);
    pdf.text('Update Frequency: Every 6 hours (automated scraping)', margin, yPos + 22);

    // Important notes
    pdf.setFontSize(10);
    pdf.setTextColor(200, 50, 50);
    pdf.text('IMPORTANT NOTES:', margin, yPos + 35);
    pdf.setFontSize(8);
    pdf.setTextColor(60);
    const notes = [
        '• Tax regulations change frequently. Always verify with current official sources.',
        '• Double taxation treaties may significantly reduce effective rates.',
        '• Sector-specific incentives (R&D credits, IP box regimes) can lower burden.',
        '• Local/state taxes may apply in addition to federal rates.',
        '• Consult with qualified tax advisors before final investment decisions.'
    ];

    yPos += 43;
    notes.forEach(note => {
        const notesLines = pdf.splitTextToSize(note, pageWidth - 2 * margin - 10);
        pdf.text(notesLines, margin + 5, yPos);
        yPos += 6 * notesLines.length;
    });

    addFooter(4, 4);

    // Save PDF
    const filename = `TaxCompass_Investment_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

    return filename;
};

export default generateInvestmentReport;
