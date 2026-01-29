import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ProSolutoFlowRow, ProSolutoSummary } from './proSolutoCalculations';
import type { Client, Property, Intermediary } from '@/types/proposal';
import { formatCurrency, formatDate } from './calculations';

interface PdfData {
  clients: Client[];
  property: Property;
  intermediary: Intermediary;
  summary: ProSolutoSummary;
  flow: ProSolutoFlowRow[];
  simulationDate: string;
  constructionMonths: number;
  entryTermMonths: number;
}

export function generatePaymentFlowPdf(data: PdfData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Simulação de Fluxo de Pagamento', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Documento sem validade contratual - Apenas para fins ilustrativos', pageWidth / 2, 27, { align: 'center' });
  
  let yPos = 40;
  
  // Client Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados do Cliente', 14, yPos);
  yPos += 7;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const mainClient = data.clients.find(c => c.isMainProponent) || data.clients[0];
  if (mainClient) {
    doc.text(`Nome: ${mainClient.full_name}`, 14, yPos);
    yPos += 5;
    doc.text(`CPF: ${mainClient.cpf}`, 14, yPos);
    yPos += 5;
    if (mainClient.phone) {
      doc.text(`Telefone: ${mainClient.phone}`, 14, yPos);
      yPos += 5;
    }
  }
  
  if (data.clients.length > 1) {
    doc.text(`Proponentes adicionais: ${data.clients.length - 1}`, 14, yPos);
    yPos += 5;
  }
  
  yPos += 5;
  
  // Property Info
  doc.setFont('helvetica', 'bold');
  doc.text('Dados do Imóvel', 14, yPos);
  yPos += 7;
  
  doc.setFont('helvetica', 'normal');
  if (data.property.empreendimento_name) {
    doc.text(`Empreendimento: ${data.property.empreendimento_name}`, 14, yPos);
    yPos += 5;
  }
  if (data.property.block && data.property.unit) {
    doc.text(`Bloco/Unidade: ${data.property.block} / ${data.property.unit}`, 14, yPos);
    yPos += 5;
  }
  
  yPos += 5;
  
  // Financial Summary
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Financeiro', 14, yPos);
  yPos += 7;
  
  doc.setFont('helvetica', 'normal');
  
  const summaryData = [
    ['Valor de Venda', formatCurrency(data.summary.saleValue)],
    ['Subsídio', formatCurrency(data.summary.subsidy)],
    ['FGTS', formatCurrency(data.summary.fgts)],
    ['Desconto', formatCurrency(data.summary.discount)],
    ['Documentação (5%)', formatCurrency(data.summary.documentationCost)],
    ['Financiamento', formatCurrency(data.summary.financedValue)],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { halign: 'right', cellWidth: 50 },
    },
    margin: { left: 14 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 5;
  
  // Pró-Soluto Highlight
  doc.setFillColor(59, 130, 246);
  doc.setDrawColor(59, 130, 246);
  doc.roundedRect(14, yPos, pageWidth - 28, 15, 2, 2, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PRÓ-SOLUTO (Valor Total)', 20, yPos + 10);
  doc.text(formatCurrency(data.summary.proSolutoTotal), pageWidth - 20, yPos + 10, { align: 'right' });
  
  doc.setTextColor(0, 0, 0);
  yPos += 25;
  
  // Simulation Parameters
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Data da Simulação: ${formatDate(data.simulationDate)}`, 14, yPos);
  yPos += 5;
  doc.text(`Prazo da Entrada: ${data.entryTermMonths} meses`, 14, yPos);
  yPos += 5;
  doc.text(`Prazo da Obra: ${data.constructionMonths} meses`, 14, yPos);
  yPos += 10;
  
  // Payment Flow Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Fluxo de Pagamento Mês a Mês', 14, yPos);
  yPos += 5;
  
  const tableData = data.flow.map(row => [
    row.month.toString(),
    new Date(row.date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    row.proSolutoPayment > 0 ? formatCurrency(row.proSolutoPayment) : '-',
    row.constructionFee > 0 ? formatCurrency(row.constructionFee) : '-',
    formatCurrency(row.total),
    row.notes || '',
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Mês', 'Data', 'Pró-Soluto', 'Taxa Obra', 'Total', 'Obs.']],
    body: tableData,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'center', cellWidth: 22 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 28 },
      4: { halign: 'right', cellWidth: 30, fontStyle: 'bold' },
      5: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: function(data) {
      // Footer on each page
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        'Este documento não possui validade contratual. Os valores são estimativos e podem variar.',
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    },
  });
  
  // Save PDF
  const clientName = mainClient?.full_name?.replace(/\s+/g, '_') || 'cliente';
  const fileName = `fluxo_pagamento_${clientName}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
