import PDFDocument from "pdfkit";
import { Response } from "express";

// DESIGN SYSTEM CONSTANTS
// Modern, accessible color palette
const COLORS = {
  primary: "#4F46E5",    // Indigo 600
  secondary: "#4338ca",  // Indigo 700 (for accents)
  textDark: "#111827",   // Gray 900
  textMedium: "#374151", // Gray 700
  textLight: "#9CA3AF",  // Gray 400
  bgLight: "#F9FAFB",    // Gray 50
  border: "#E5E7EB",     // Gray 200
  success: "#059669",    // Emerald 600
  successBg: "#D1FAE5",  // Emerald 100
  error: "#DC2626",      // Red 600
  errorBg: "#FEE2E2",    // Red 100
  white: "#FFFFFF",
};

const FONTS = {
  bold: "Helvetica-Bold",
  regular: "Helvetica",
};

export const generateAttemptPDF = (attempt: any, res: Response) => {
  // enable bufferPages to allow editing headers/footers after content generation
  const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });

  // -- HTTP Headers --
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=attempt-${attempt._id}.pdf`
  );

  doc.pipe(res);

  // HELPER FUNCTIONS
  // Check if we need a new page
  const checkPageBreak = (heightNeeded: number) => {
    if (doc.y + heightNeeded > doc.page.height - 50) {
      doc.addPage();
    }
  };

  // Draw a colored status pill (Badge)
  const drawBadge = (text: string, x: number, y: number, color: string, bgColor: string) => {
    const width = 60;
    const height = 20;
    doc.roundedRect(x, y, width, height, 10).fill(bgColor);
    doc
      .fillColor(color)
      .font(FONTS.bold)
      .fontSize(9)
      .text(text, x, y + 5, { width: width, align: "center" });
  };

  // HEADER SECTION
  // Top Accent Line
  doc.rect(0, 0, doc.page.width, 6).fill(COLORS.primary);

  // Logo / Brand
  doc.moveDown(2);
  doc.fillColor(COLORS.primary).font(FONTS.bold).fontSize(20).text("AURORA", 50);
  doc.fillColor(COLORS.textLight).font(FONTS.regular).fontSize(10).text("INTERACTIVE LEARNING", 50, doc.y + 2, { characterSpacing: 1.5 });

  // Right Side: Report Meta
  doc.font(FONTS.bold).fontSize(24).fillColor(COLORS.textDark).text("Attempt Report", 0, 70, { align: "right" });
  doc.font(FONTS.regular).fontSize(10).fillColor(COLORS.textLight).text(`#${attempt._id.toString().slice(-8).toUpperCase()}`, 0, 100, { align: "right" });

  doc.moveDown(3);

  // SUMMARY CARD (Grid Layout)
  const startY = doc.y;
  
  // Background box for summary
  doc.roundedRect(50, startY, 495, 110, 8).fill(COLORS.bgLight);
  doc.strokeColor(COLORS.border).lineWidth(1).stroke();

  // -- Left Column: Student Details --
  const infoX = 70;
  let infoY = startY + 20;
  
  const drawLabelValue = (label: string, value: string) => {
    doc.font(FONTS.bold).fontSize(9).fillColor(COLORS.textLight).text(label.toUpperCase(), infoX, infoY);
    doc.font(FONTS.bold).fontSize(11).fillColor(COLORS.textMedium).text(value, infoX, infoY + 12);
    infoY += 35; // Spacing
  };

  // Calculate generic data
  const studentName = attempt.student?.name || "Unknown Student";
  const quizTitle = attempt.quizRoom?.quiz?.title || "Untitled Quiz";
  const dateStr = new Date(attempt.submittedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Row 1
  drawLabelValue("Student Name", studentName);
  drawLabelValue("Quiz Title", quizTitle);
  
  // Reset Y for second column of text, Shift X
  infoY = startY + 20;
  const col2X = 250;
  
  // Row 2 (Column 2)
  doc.font(FONTS.bold).fontSize(9).fillColor(COLORS.textLight).text("SUBMITTED AT", col2X, infoY);
  doc.font(FONTS.bold).fontSize(11).fillColor(COLORS.textMedium).text(dateStr, col2X, infoY + 12);
  
  infoY += 35;
  doc.font(FONTS.bold).fontSize(9).fillColor(COLORS.textLight).text("ATTEMPT #", col2X, infoY);
  doc.font(FONTS.bold).fontSize(11).fillColor(COLORS.textMedium).text(attempt.attemptNumber.toString(), col2X, infoY + 12);

  // -- Right Column: Visual Score --
  const totalQuestions = attempt.responses.length;
  const percentage = Math.round((attempt.score / totalQuestions) * 100);
  const isPass = percentage >= 50;
  
  const scoreCenterX = 480;
  const scoreCenterY = startY + 55;
  const radius = 35;

  // Draw Circle Background
  doc.lineWidth(4).strokeColor(COLORS.border)
     .circle(scoreCenterX, scoreCenterY, radius).stroke();
  
  // Draw Progress Arc (Approximate)
  doc.lineWidth(4).strokeColor(isPass ? COLORS.success : COLORS.error)
     .path(`M ${scoreCenterX} ${scoreCenterY - radius} A ${radius} ${radius} 0 ${percentage > 50 ? 1 : 0} 1 ${scoreCenterX + radius * Math.sin(percentage * 3.6 * Math.PI / 180)} ${scoreCenterY - radius * Math.cos(percentage * 3.6 * Math.PI / 180)}`)
     .stroke();

  // Score Text
  doc.font(FONTS.bold).fontSize(18).fillColor(COLORS.textDark)
     .text(`${percentage}%`, scoreCenterX - 20, scoreCenterY - 8, { width: 40, align: "center" });
     
  doc.font(FONTS.regular).fontSize(8).fillColor(COLORS.textLight)
     .text("SCORE", scoreCenterX - 20, scoreCenterY + 12, { width: 40, align: "center" });

  doc.moveDown(4); // Move cursor past the summary box

  // QUESTIONS SECTION  
  doc.font(FONTS.bold).fontSize(14).fillColor(COLORS.textDark).text("Response Details", 50);
  doc.moveDown(1);
  doc.strokeColor(COLORS.border).lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1.5);

  attempt.responses.forEach((r: any, index: number) => {
    const cardHeight = 60;
    checkPageBreak(cardHeight + 20);

    const currentY = doc.y;
    const isCorrect = r.correct;

    // Card Background (Subtle)
    doc.roundedRect(50, currentY, 495, cardHeight, 6).fill(COLORS.white);
    doc.roundedRect(50, currentY, 4, cardHeight, 2).fill(isCorrect ? COLORS.success : COLORS.error);

    // Question Number
    doc.fillColor(COLORS.textLight).font(FONTS.bold).fontSize(14)
       .text((index + 1).toString().padStart(2, '0'), 70, currentY + 22);

    // Question / Answer Text
    const questionLabel = `QID: ${r.question.toString().substring(0, 16)}...`;
    
    doc.font(FONTS.bold).fontSize(10).fillColor(COLORS.textDark)
       .text(questionLabel, 110, currentY + 15);

    doc.font(FONTS.regular).fontSize(10).fillColor(COLORS.textMedium)
       .text(`Selected Answer: `, 110, currentY + 32, { continued: true })
       .font(FONTS.bold).text(r.selected);

    // Status Badge (Right aligned)
    drawBadge(
      isCorrect ? "CORRECT" : "WRONG", 
      470, 
      currentY + 20, 
      isCorrect ? COLORS.success : COLORS.error, 
      isCorrect ? COLORS.successBg : COLORS.errorBg
    );

    // Bottom Divider (Light)
    doc.moveDown();
    doc.y = currentY + cardHeight + 10;
    doc.strokeColor(COLORS.bgLight).lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);
  });

  // FOOTER
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    
    // Bottom Border
    doc.rect(0, doc.page.height - 20, doc.page.width, 20).fill(COLORS.bgLight);
    
    doc.fillColor(COLORS.textLight).fontSize(8).font(FONTS.regular);
    
    // Left Footer
    doc.text("Generated by Aurora Quiz System", 50, doc.page.height - 15, { lineBreak: false });
    
    // Right Footer
    doc.text(`Page ${i + 1} of ${range.count}`, 0, doc.page.height - 15, { align: "right", width: 545 });
  }

  doc.end();
};