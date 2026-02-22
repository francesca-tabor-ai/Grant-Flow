/**
 * Word export: proposal content to .docx buffer.
 */

import { Document, Packer, Paragraph, TextRun } from 'docx';

type ParagraphInstance = InstanceType<typeof Paragraph>;

function stripMarkdown(s: string): string {
  return s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').trim();
}

function contentToParagraphs(content: string): ParagraphInstance[] {
  const lines = content.split(/\n+/);
  const paragraphs: ParagraphInstance[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const text = stripMarkdown(trimmed.replace(/^#+\s*/, ''));
    const bold = /^#{1,6}\s+/.test(trimmed);
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: text || ' ', bold })],
      })
    );
  }
  return paragraphs.length ? paragraphs : [new Paragraph({ children: [new TextRun('No content.')] })];
}

export async function proposalToDocxBuffer(content: string, title: string): Promise<Buffer> {
  const children = [
    new Paragraph({
      children: [new TextRun({ text: title, bold: true })],
    }),
    new Paragraph({ children: [new TextRun('')] }),
    ...contentToParagraphs(content),
  ];
  const doc = new Document({
    sections: [{ children }],
  });
  return Packer.toBuffer(doc);
}
