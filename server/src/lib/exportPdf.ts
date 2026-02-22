/**
 * PDF export: turn proposal/budget text into a simple PDF buffer.
 */

import PDFDocument from 'pdfkit';

function stripMarkdown(s: string): string {
  return s
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^[-*]\s+/gm, '  • ')
    .trim();
}

export function proposalToPdfBuffer(content: string, title: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text(title, { align: 'left' });
    doc.moveDown();
    const plain = stripMarkdown(content);
    doc.fontSize(11).text(plain, { align: 'left', lineGap: 4 });
    doc.end();
  });
}
