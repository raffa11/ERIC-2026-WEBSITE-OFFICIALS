import { jsPDF } from 'jspdf';
import { Registration } from '../types';
import { COMPETITION_DIVISIONS } from '../data';

export function generateRegistrationPDF(reg: Registration) {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const pw = 210;
  const ph = 297;
  const ml = 18;
  const mr = 18;
  const cw = pw - ml - mr;

  const divObj = COMPETITION_DIVISIONS.find(d => d.id === reg.divisionId);
  const divTitle = divObj?.title || reg.divisionId;

  let cursor = 0;

  // ══════════════════════════════════════════
  //  UTILITY HELPERS
  // ══════════════════════════════════════════

  function rgb(r: number, g: number, b: number) {
    return { r, g, b };
  }

  const setText = (r: number, g: number, b: number) => doc.setTextColor(r, g, b);
  const setFill = (r: number, g: number, b: number) => doc.setFillColor(r, g, b);

  function sectionBox(y: number, h: number) {
    doc.setDrawColor(0, 255, 136);
    doc.setLineWidth(0.4);
    doc.roundedRect(ml, y, cw, h, 2, 2, 'S');
  }

  function sectionTitle(label: string, y: number) {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    setText(197, 160, 89);
    doc.text(label.toUpperCase(), ml + 4, y);
  }

  function fieldRow(label: string, value: string, y: number, valColor?: { r: number; g: number; b: number }) {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    setText(100, 100, 100);
    doc.text(label, ml + 6, y);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    const c = valColor || rgb(220, 220, 220);
    setText(c.r, c.g, c.b);
    doc.text(value, ml + 44, y);
  }

  // ══════════════════════════════════════════
  //  PAGE BACKGROUND
  // ══════════════════════════════════════════
  setFill(5, 5, 5);
  doc.rect(0, 0, pw, ph, 'F');

  // ══════════════════════════════════════════
  //  TOP GREEN ACCENT BAR
  // ══════════════════════════════════════════
  setFill(0, 255, 136);
  doc.rect(0, 0, pw, 5, 'F');

  // White line below
  setFill(20, 20, 20);
  doc.rect(0, 5, pw, 1, 'F');

  // ══════════════════════════════════════════
  //  HEADER – ERIC BRANDING
  // ══════════════════════════════════════════
  cursor = 18;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(26);
  setText(0, 255, 136);
  doc.text('ERIC', ml, cursor);

  doc.setFontSize(26);
  setText(197, 160, 89);
  doc.text('2026', ml + 38, cursor);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  setText(90, 90, 90);
  doc.text('ELECTRONICS & ROBOTICS INNOVATION COMPETITION', ml, cursor + 6);

  // Right-aligned tag
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  setText(0, 255, 136);
  doc.text('TICKET / ENTRY PASS', pw - mr, cursor - 2, { align: 'right' });
  setText(70, 70, 70);
  doc.setFontSize(5.5);
  doc.text('UNIVERSITAS NEGERI JAKARTA', pw - mr, cursor + 3, { align: 'right' });

  cursor = 38;

  // Thin separator
  setFill(30, 30, 30);
  doc.rect(ml, cursor, cw, 0.5, 'F');

  // ══════════════════════════════════════════
  //  REGISTRATION CODE – HERO
  // ══════════════════════════════════════════
  cursor += 10;

  // Code background box
  setFill(10, 10, 10);
  doc.roundedRect(ml, cursor, cw, 36, 3, 3, 'F');
  doc.setDrawColor(0, 255, 136);
  doc.setLineWidth(0.3);
  doc.roundedRect(ml, cursor, cw, 36, 3, 3, 'S');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  setText(197, 160, 89);
  doc.text('REGISTRATION CODE', pw / 2, cursor + 10, { align: 'center' });

  doc.setFont('Courier', 'bold');
  doc.setFontSize(22);
  setText(0, 255, 136);
  doc.text(reg.refCode, pw / 2, cursor + 27, { align: 'center' });

  cursor += 36 + 6;

  // ══════════════════════════════════════════
  //  TWO-COLUMN INFO SECTION
  // ══════════════════════════════════════════
  const colH = 52;
  sectionBox(cursor, colH);

  // Left column – Team
  setText(0, 255, 136);
  sectionTitle('TEAM DETAILS', cursor + 8);

  const leftItems = [
    ['Team', reg.teamName],
    ['Leader', reg.leader.name],
    ['Email', reg.leader.email],
    ['Institution', reg.leader.institution],
    ['Division', divTitle],
  ];

  leftItems.forEach(([l, v], i) => {
    fieldRow(l, v, cursor + 18 + i * 7);
  });

  // Right column – Event details (draw a vertical separator)
  const sepX = ml + cw * 0.48;
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.3);
  doc.line(sepX, cursor + 4, sepX, cursor + colH - 4);

  setText(0, 255, 136);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('EVENT', sepX + 5, cursor + 8);
  setText(197, 160, 89);
  doc.text('INFO', pw - mr - 12, cursor + 8, { align: 'right' });

  const rightItems = [
    ['Date', '22 – 24 September 2026'],
    ['Venue', 'Kampus A UNJ, Jakarta Timur'],
    ['Level', reg.level || '–'],
    ['Sub-Category', reg.subCategory || '–'],
    ['Status', reg.paymentStatus === 'PAID' ? 'PAID ✓' : 'PENDING'],
  ];

  rightItems.forEach(([l, v], i) => {
    const y = cursor + 18 + i * 7;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    setText(100, 100, 100);
    doc.text(l, sepX + 5, y);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    if (l === 'Status') {
      setText(0, 255, 136);
    } else {
      setText(220, 220, 220);
    }
    doc.text(v, pw - mr - 4, y, { align: 'right' });
  });

  cursor += colH + 8;

  // ══════════════════════════════════════════
  //  TEAM MEMBERS SECTION
  // ══════════════════════════════════════════
  const memberCount = reg.members.length;
  const adviserCount = reg.lecturerName ? 1 : 0;
  const memberBoxH = 16 + Math.max(memberCount, 1) * 9 + adviserCount * 7;

  sectionBox(cursor, memberBoxH);
  sectionTitle('TEAM MEMBERS', cursor + 8);

  if (memberCount === 0) {
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(7.5);
    setText(120, 120, 120);
    doc.text('No additional members registered.', ml + 10, cursor + 20);
  } else {
    // Table header
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6.5);
    setText(80, 80, 80);
    doc.text('#', ml + 6, cursor + 17);
    doc.text('NAME', ml + 13, cursor + 17);
    doc.text('WHATSAPP', ml + 80, cursor + 17);

    setFill(30, 30, 30);
    doc.rect(ml + 4, cursor + 19, cw - 8, 0.3, 'F');

    // Members list
    reg.members.forEach((m, i) => {
      const y = cursor + 28 + i * 9;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7);
      setText(0, 255, 136);
      doc.text(String(i + 1), ml + 6, y);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      setText(220, 220, 220);
      doc.text(m.name, ml + 13, y);
      setText(150, 150, 150);
      doc.text(m.whatsapp, ml + 80, y);
    });
  }

  // Advisor line
  if (reg.lecturerName) {
    const advY = cursor + 28 + Math.max(memberCount, 1) * 9 + 2;
    doc.setDrawColor(40, 40, 40);
    doc.setLineWidth(0.3);
    doc.rect(ml + 4, advY - 4, cw - 8, 0.3, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    setText(197, 160, 89);
    doc.text('ADVISOR', ml + 6, advY + 4);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    setText(200, 200, 200);
    doc.text(reg.lecturerName, ml + 30, advY + 4);
    setText(120, 120, 120);
    doc.text(reg.lecturerWhatsapp || '', ml + 80, advY + 4);
  }

  cursor += memberBoxH + 8;

  // ══════════════════════════════════════════
  //  PAYMENT INFO BOX
  // ══════════════════════════════════════════
  const payH = 16;
  sectionBox(cursor, payH);
  sectionTitle('PAYMENT', cursor + 8);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  setText(200, 200, 200);
  doc.text(reg.paymentMethod, ml + 6, cursor + 14);

  setText(100, 100, 100);
  doc.text('Fee:', ml + 65, cursor + 14);
  setText(0, 255, 136);
  doc.setFont('Helvetica', 'bold');
  doc.text(divObj?.price || reg.amount || '–', ml + 82, cursor + 14);

  const payColor = reg.paymentStatus === 'PAID' ? rgb(0, 255, 136) : rgb(255, 200, 0);
  setFill(payColor.r, payColor.g, payColor.b);
  doc.roundedRect(pw - mr - 28, cursor + 4, 24, 10, 3, 3, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  setText(5, 5, 5);
  doc.text(reg.paymentStatus, pw - mr - 16, cursor + 11.5, { align: 'center' });

  cursor += payH + 12;

  // ══════════════════════════════════════════
  //  FOOTER
  // ══════════════════════════════════════════
  setFill(30, 30, 30);
  doc.rect(ml, cursor, cw, 0.3, 'F');

  cursor += 5;

  doc.setFont('Courier', 'bold');
  doc.setFontSize(6.5);
  setText(80, 80, 80);
  doc.text('Present this ticket at the registration desk on event day.', pw / 2, cursor, { align: 'center' });

  cursor += 5;

  doc.setFontSize(5.5);
  setText(60, 60, 60);
  const idShort = reg.id.length > 12 ? reg.id.slice(-12) : reg.id;
  doc.text(`ERIC 2026 // ${new Date().toISOString().slice(0, 10)} // ID: ${idShort}`, pw / 2, cursor, { align: 'center' });

  // ══════════════════════════════════════════
  //  SAVE
  // ══════════════════════════════════════════
  const safeName = reg.teamName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`ERIC_2026_Ticket_${safeName}.pdf`);
}
