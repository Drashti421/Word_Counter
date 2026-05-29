import fs from "fs";
import { jsPDF } from "jspdf";

const inputPath = "INTERVIEW_GUIDE.txt";
const outputPath = "INTERVIEW_MASTER_GUIDE.pdf";

const content = fs.readFileSync(inputPath, "utf8");
const doc = new jsPDF({ unit: "pt", format: "a4" });

const margin = 40;
const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const maxWidth = pageWidth - margin * 2;
const lineHeight = 16;

let y = margin;
doc.setFont("helvetica", "normal");
doc.setFontSize(11);

const paragraphs = content.split(/\r?\n/);
for (const para of paragraphs) {
  const safe = para.length ? para : " ";
  const lines = doc.splitTextToSize(safe, maxWidth);

  for (const line of lines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  y += 4;
  if (y > pageHeight - margin) {
    doc.addPage();
    y = margin;
  }
}

const totalPages = doc.getNumberOfPages();
for (let i = 1; i <= totalPages; i++) {
  doc.setPage(i);
  doc.setFontSize(9);
  doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 70, pageHeight - 18);
}

const pdfData = doc.output("arraybuffer");
fs.writeFileSync(outputPath, Buffer.from(pdfData));
console.log(`Created ${outputPath}`);
