import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { GroupedGroceryList } from '../db/models';

export function generateGroceryPdf(
  groceryList: GroupedGroceryList[],
  weekLabel: string
): void {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.setTextColor(15, 118, 110); // primary-700
  doc.text('Grocery List', 14, 22);

  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128); // gray-500
  doc.text(weekLabel, 14, 30);

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
