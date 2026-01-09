import PDFDocument from "pdfkit";
import { Response } from "express";

// --- CONSTANTS ---
const COLORS = {
  primary: "#4F46E5",
  textDark: "#111827",
  textMedium: "#374151",
  textLight: "#9CA3AF",
  bgLight: "#F9FAFB",
  border: "#E5E7EB",
  success: "#059669",
  successBg: "#ECFDF5",
  error: "#DC2626",
  errorBg: "#FEF2F2",
  white: "#FFFFFF",
};

const FONTS = {
  bold: "Helvetica-Bold",
  regular: "Helvetica",
};

const PAGE_MARGIN = 50;
const PAGE_WIDTH = 595.28; // A4 standard width
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

export const generateAttemptPDF = (attempt: any, res: Response) => {
  const doc = new PDFDocument({ margin: PAGE_MARGIN, size: "A4", bufferPages: true });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=attempt-${attempt._id}.pdf`
  );

  doc.pipe(res);

  // --- HELPER FUNCTIONS ---

  // Check if we need a new page based on estimated height of the next item
  const checkPageBreak = (heightNeeded: number) => {
    if (doc.y + heightNeeded > doc.page.height - PAGE_MARGIN) {
      doc.addPage();
    }
  };

  // 1. HEADER
  doc.rect(0, 0, doc.page.width, 6).fill(COLORS.primary);
  doc.moveDown(2);

  // Brand
  doc.fillColor(COLORS.primary).font(FONTS.bold).fontSize(20).text("AURORA", PAGE_MARGIN);
  doc.fillColor(COLORS.textLight).font(FONTS.regular).fontSize(10).text("INTERACTIVE LEARNING", { characterSpacing: 1 });

  // Meta Title
  doc.font(FONTS.bold).fontSize(24).fillColor(COLORS.textDark).text("Attempt Report", 0, 70, { align: "right", width: PAGE_WIDTH - PAGE_MARGIN });
  doc.font(FONTS.regular).fontSize(10).fillColor(COLORS.textLight).text(`#${attempt._id.toString().toUpperCase().slice(-8)}`, 0, 100, { align: "right", width: PAGE_WIDTH - PAGE_MARGIN });

  doc.moveDown(3);

  // 2. SUMMARY SECTION
  const startY = doc.y;
  
  // Draw Summary Box
  doc.roundedRect(PAGE_MARGIN, startY, CONTENT_WIDTH, 100, 8).fill(COLORS.bgLight);
  doc.strokeColor(COLORS.border).lineWidth(1).stroke();

  // Student Info
  const studentName = attempt.student?.name || "Unknown Student";
  const quizTitle = attempt.quizRoom?.quiz?.title || "Untitled Quiz";
  const dateStr = new Date(attempt.submittedAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  doc.fillColor(COLORS.textDark).fontSize(12).font(FONTS.bold).text(studentName, PAGE_MARGIN + 20, startY + 20);
  doc.fillColor(COLORS.textMedium).fontSize(10).font(FONTS.regular).text(quizTitle, PAGE_MARGIN + 20, startY + 40);
  doc.fillColor(COLORS.textLight).fontSize(9).text(dateStr, PAGE_MARGIN + 20, startY + 70);

  // Score Circle logic
  const totalQuestions = attempt.responses.length;
  const percentage = Math.round((attempt.score / totalQuestions) * 100);
  const isPass = percentage >= 50;

  const circleX = 500;
  const circleY = startY + 50;
  const radius = 30;

  doc.lineWidth(4).strokeColor(COLORS.border).circle(circleX, circleY, radius).stroke();
  doc.lineWidth(4).strokeColor(isPass ? COLORS.success : COLORS.error)
     .path(`M ${circleX} ${circleY - radius} A ${radius} ${radius} 0 ${percentage > 50 ? 1 : 0} 1 ${circleX + radius * Math.sin(percentage * 3.6 * Math.PI / 180)} ${circleY - radius * Math.cos(percentage * 3.6 * Math.PI / 180)}`)
     .stroke();

  doc.font(FONTS.bold).fontSize(14).fillColor(COLORS.textDark)
     .text(`${percentage}%`, circleX - 20, circleY - 6, { width: 40, align: "center" });

  doc.moveDown(6);

  // 3. QUESTIONS LIST
  doc.font(FONTS.bold).fontSize(14).fillColor(COLORS.textDark).text("Detailed Responses", PAGE_MARGIN);
  doc.moveDown(0.5);
  doc.strokeColor(COLORS.border).lineWidth(1).moveTo(PAGE_MARGIN, doc.y).lineTo(PAGE_WIDTH - PAGE_MARGIN, doc.y).stroke();
  doc.moveDown(1.5);

  attempt.responses.forEach((r: any, index: number) => {
    // A. PREPARE DATA
    const qIndex = (index + 1).toString().padStart(2, '0');
    const questionText = r.question ? r.question.question : "Question content no longer available";
    const selectedText = r.selected;
    const isCorrect = r.correct;

    // B. CALCULATE HEIGHTS (To prevent page break inside a question)
    doc.font(FONTS.bold).fontSize(10);
    const qTextHeight = doc.heightOfString(questionText, { width: 380 }); // Width for question text column
    const boxHeight = qTextHeight + 45; // Buffer for padding and answer text

    // C. CHECK PAGE BREAK
    checkPageBreak(boxHeight + 20);
    
    const currentY = doc.y;

    // D. DRAW ROW
    
    // Status Bar (Left side color strip)
    doc.rect(PAGE_MARGIN, currentY, 4, boxHeight).fill(isCorrect ? COLORS.success : COLORS.error);
    
    // Question Number
    doc.fillColor(COLORS.textLight).font(FONTS.bold).fontSize(12)
       .text(qIndex, PAGE_MARGIN + 15, currentY + 5);

    // Question Text
    doc.fillColor(COLORS.textDark).font(FONTS.bold).fontSize(10)
       .text(questionText, PAGE_MARGIN + 50, currentY + 5, { width: 380 });

    // Answer Section
    const answerY = currentY + qTextHeight + 10;
    
    doc.font(FONTS.regular).fontSize(10).fillColor(COLORS.textMedium)
       .text("You selected: ", PAGE_MARGIN + 50, answerY, { continued: true })
       .font(FONTS.bold).fillColor(isCorrect ? COLORS.success : COLORS.error)
       .text(selectedText);

    // Status Badge (Right aligned)
    const badgeColor = isCorrect ? COLORS.success : COLORS.error;
    const badgeBg = isCorrect ? COLORS.successBg : COLORS.errorBg;
    const badgeText = isCorrect ? "CORRECT" : "WRONG";

    // Draw badge background
    doc.roundedRect(480, currentY, 60, 20, 10).fill(badgeBg);
    // Draw badge text
    doc.fillColor(badgeColor).font(FONTS.bold).fontSize(8)
       .text(badgeText, 480, currentY + 6, { width: 60, align: "center" });

    // Move cursor for next item + spacing
    doc.y = currentY + boxHeight + 15;
    
    // Divider
    doc.strokeColor(COLORS.bgLight).lineWidth(1)
       .moveTo(PAGE_MARGIN, doc.y - 7).lineTo(PAGE_WIDTH - PAGE_MARGIN, doc.y - 7).stroke();
  });

  // 4. FOOTER
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.fillColor(COLORS.textLight).fontSize(8).font(FONTS.regular)
       .text("Generated by Aurora Quiz System", PAGE_MARGIN, doc.page.height - 20)
       .text(`Page ${i + 1} of ${range.count}`, 0, doc.page.height - 20, { align: "right", width: PAGE_WIDTH - PAGE_MARGIN });
  }

  doc.end();
};