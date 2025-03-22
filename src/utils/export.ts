import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface MassetypeStats {
  massetyper: {
    id: string;
    navn: string;
    weight_per_skuff: number | null;
  };
  sum_skuffer: number;
  total_weight: number | null;
}

interface ProsjektStats {
  prosjekter: {
    id: string;
    navn: string;
  };
  sum_skuffer: number;
}

interface ForbrukEntry {
  id: string;
  antall_skuffer: number;
  dato: string;
  massetyper: {
    id: string;
    navn: string;
    weight_per_skuff: number | null;
  };
  prosjekter: {
    id: string;
    navn: string;
  };
}

interface ExportData {
  month: string;
  massetypeStats: MassetypeStats[];
  prosjektStats: ProsjektStats[];
  forbrukData: ForbrukEntry[];
  totalSkuffer: number;
  totalWeight: number;
}

export const exportToPDF = async (data: ExportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Title
  doc.setFontSize(20);
  doc.text(`Månedsrapport - ${data.month}`, pageWidth / 2, 20, { align: 'center' });

  // Summary
  doc.setFontSize(14);
  doc.text('Sammendrag', 14, 35);
  doc.setFontSize(12);
  doc.text(`Totalt antall skuffer: ${data.totalSkuffer}`, 14, 45);
  doc.text(`Total vekt: ${data.totalWeight.toLocaleString('no-NO')} kg`, 14, 55);

  // Massetype Statistics
  doc.setFontSize(14);
  doc.text('Fordeling per massetype', 14, 70);
  
  const massetypeHeaders = [['Massetype', 'Antall skuffer', 'Vekt per skuff', 'Total vekt']];
  const massetypeData = data.massetypeStats.map(stat => [
    stat.massetyper.navn,
    stat.sum_skuffer.toString(),
    stat.massetyper.weight_per_skuff?.toLocaleString('no-NO') || '-',
    stat.total_weight?.toLocaleString('no-NO') || '-'
  ]);

  (doc as any).autoTable({
    head: massetypeHeaders,
    body: massetypeData,
    startY: 75,
    margin: { left: 14 },
    headStyles: { fillColor: [8, 145, 178] }
  });

  // Project Statistics
  doc.setFontSize(14);
  const projectStartY = (doc as any).lastAutoTable.finalY + 15;
  doc.text('Fordeling per prosjekt', 14, projectStartY);

  const projectHeaders = [['Prosjekt', 'Antall skuffer']];
  const projectData = data.prosjektStats.map(stat => [
    stat.prosjekter.navn,
    stat.sum_skuffer.toString()
  ]);

  (doc as any).autoTable({
    head: projectHeaders,
    body: projectData,
    startY: projectStartY + 5,
    margin: { left: 14 },
    headStyles: { fillColor: [8, 145, 178] }
  });

  // Detailed entries
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Detaljert oversikt', 14, 20);

  const detailHeaders = [['Dato', 'Massetype', 'Prosjekt', 'Antall skuffer']];
  const detailData = data.forbrukData.map(entry => [
    new Date(entry.dato).toLocaleDateString('no-NO'),
    entry.massetyper.navn,
    entry.prosjekter.navn,
    entry.antall_skuffer.toString()
  ]);

  (doc as any).autoTable({
    head: detailHeaders,
    body: detailData,
    startY: 25,
    margin: { left: 14 },
    headStyles: { fillColor: [8, 145, 178] }
  });

  if (Platform.OS === 'web') {
    doc.save(`massetracker-rapport-${data.month.toLowerCase()}.pdf`);
  } else {
    const pdfBytes = doc.output();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    const path = `${FileSystem.documentDirectory}massetracker-rapport-${data.month.toLowerCase()}.pdf`;
    
    await FileSystem.writeAsStringAsync(path, pdfBase64, {
      encoding: FileSystem.EncodingType.Base64
    });

    await Sharing.shareAsync(path, {
      mimeType: 'application/pdf',
      dialogTitle: 'Del rapport'
    });

    await FileSystem.deleteAsync(path);
  }
};

export const exportToExcel = async (data: ExportData) => {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['Månedsrapport', data.month],
    [],
    ['Totalt antall skuffer', data.totalSkuffer],
    ['Total vekt (kg)', data.totalWeight],
    []
  ];

  // Massetype statistics
  summaryData.push(
    ['Fordeling per massetype'],
    ['Massetype', 'Antall skuffer', 'Vekt per skuff', 'Total vekt']
  );

  data.massetypeStats.forEach(stat => {
    summaryData.push([
      stat.massetyper.navn,
      stat.sum_skuffer,
      stat.massetyper.weight_per_skuff || '-',
      stat.total_weight || '-'
    ]);
  });

  summaryData.push([]);

  // Project statistics
  summaryData.push(
    ['Fordeling per prosjekt'],
    ['Prosjekt', 'Antall skuffer']
  );

  data.prosjektStats.forEach(stat => {
    summaryData.push([
      stat.prosjekter.navn,
      stat.sum_skuffer
    ]);
  });

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Sammendrag');

  // Detailed entries sheet
  const detailData = [
    ['Dato', 'Massetype', 'Prosjekt', 'Antall skuffer', 'Vekt per skuff', 'Total vekt']
  ];

  data.forbrukData.forEach(entry => {
    const weight = entry.massetyper.weight_per_skuff || 0;
    detailData.push([
      new Date(entry.dato).toLocaleDateString('no-NO'),
      entry.massetyper.navn,
      entry.prosjekter.navn,
      entry.antall_skuffer,
      weight,
      entry.antall_skuffer * weight
    ]);
  });

  const detailWs = XLSX.utils.aoa_to_sheet(detailData);
  XLSX.utils.book_append_sheet(wb, detailWs, 'Detaljer');

  // Export
  if (Platform.OS === 'web') {
    XLSX.writeFile(wb, `massetracker-rapport-${data.month.toLowerCase()}.xlsx`);
  } else {
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const path = `${FileSystem.documentDirectory}massetracker-rapport-${data.month.toLowerCase()}.xlsx`;
    
    await FileSystem.writeAsStringAsync(path, wbout, {
      encoding: FileSystem.EncodingType.Base64
    });

    await Sharing.shareAsync(path, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Del rapport'
    });

    await FileSystem.deleteAsync(path);
  }
};