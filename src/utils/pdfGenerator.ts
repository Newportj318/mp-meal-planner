import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { GroupedGroceryList } from '../db/models';

function drawLogo(doc: jsPDF, x: number, y: number, size: number) {
  const r = size / 2;
  const cx = x + r;
  const cy = y + r;

  // Outer circle
  doc.setFillColor(13, 148, 136);
  doc.circle(cx, cy, r, 'F');

  // Inner circle
  doc.setFillColor(20, 184, 166);
  doc.circle(cx, cy, r * 0.82, 'F');

  // Center ring
  doc.setFillColor(13, 148, 136);
  doc.setGState(new (doc as any).GState({ opacity: 0.3 }));
  doc.circle(cx, cy, r * 0.64, 'F');
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // MP text
  doc.setFontSize(size * 0.42);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('MP', cx, cy + size * 0.08, { align: 'center' });
}

export function generateGroceryPdf(
  groceryList: GroupedGroceryList[],
  weekLabel: string
): void {
  const doc = new jsPDF();

  // Logo
  drawLogo(doc, 14, 10, 18);

  // Title (next to logo)
  doc.setFontSize(20);
  doc.setTextColor(15, 118, 110); // primary-700
  doc.text('Grocery List', 36, 22);

  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128); // gray-500
  doc.text(weekLabel, 36, 30);

  let yPos = 38;

  for (const group of groceryList) {
    // Category header
    autoTable(doc, {
      startY: yPos,
      head: [[group.label, 'Qty', 'Used In']],
      body: group.items.map((item) => [
        item.name,
        `${item.totalQuantity} ${item.unit}`,
        item.fromRecipes.join(', '),
      ]),
      headStyles: {
        fillColor: [13, 148, 136], // primary-600
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [55, 65, 81], // gray-700
      },
      alternateRowStyles: {
        fillColor: [240, 253, 250], // primary-50
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 30 },
        2: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
      theme: 'grid',
    });

    // Get the final Y position after the table
    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    // Add new page if running low on space
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // gray-400
    doc.text(
      `Generated ${new Date().toLocaleDateString('en-AU')} | MP Meal Planner`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Download
  const filename = `grocery-list-${weekLabel.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  doc.save(filename);
}
