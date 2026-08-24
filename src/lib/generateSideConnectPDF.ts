import { jsPDF } from 'jspdf';
import { SideConnectRegistration } from '../types';
import { SIDE_CONNECT_DIVISIONS } from '../data';

export function buildSideConnectPdf(reg: SideConnectRegistration): jsPDF {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const pw = 210;
  const ph = 297;
  const ml = 18;
  const mr = 18;
  const cw = pw - ml - mr;

  const subObj = SIDE_CONNECT_DIVISIONS.find(d => d.id === reg.subCompetition);
  const subTitle = subObj?.title || reg.subCompetition;

  let cursor = 0;

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
    setText(0, 200, 100);
    doc.text(label.toUpperCase(), ml + 4, y);
  }

  function fieldRow(label: string, value: string, y: number) {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    setText(100, 100, 100);
    doc.text(label, ml + 6, y);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    setText(220, 220, 220);
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

  // Right tag
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  setText(0, 255, 136);
  doc.text('SIDE CONNECT', pw - mr, cursor - 2, { align: 'right' });
  setText(70, 70, 70);
  doc.setFontSize(5.5);
  doc.text('REGISTRATION TICKET', pw - mr, cursor + 3, { align: 'right' });

  cursor = 38;

  setFill(30, 30, 30);
  doc.rect(ml, cursor, cw, 0.5, 'F');

  // ══════════════════════════════════════════
  //  REFERENCE CODE – HERO
  // ══════════════════════════════════════════
  cursor += 10;

  setFill(10, 10, 10);
  doc.roundedRect(ml, cursor, cw, 36, 3, 3, 'F');
  doc.setDrawColor(0, 255, 136);
  doc.setLineWidth(0.3);
  doc.roundedRect(ml, cursor, cw, 36, 3, 3, 'S');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  setText(0, 200, 100);
  doc.text('REFERENCE CODE', pw / 2, cursor + 10, { align: 'center' });

  doc.setFont('Courier', 'bold');
  doc.setFontSize(22);
  setText(0, 255, 136);
  doc.text(reg.refCode, pw / 2, cursor + 27, { align: 'center' });

  cursor += 36 + 6;

  // ══════════════════════════════════════════
  //  PARTICIPANT INFO
  // ══════════════════════════════════════════
  const infoH = 52;
  sectionBox(cursor, infoH);

  // Left column
  setText(0, 255, 136);
  sectionTitle('PARTICIPANT DETAILS', cursor + 8);

  const leftItems = [
    ['Name', reg.leader.name],
    ['Email', reg.leader.email],
    ['WhatsApp', reg.leader.whatsapp],
    ['Institution', reg.leader.institution],
    ['Country', reg.leader.country],
  ];

  leftItems.forEach(([l, v], i) => {
    fieldRow(l, v, cursor + 18 + i * 7);
  });

  // Right column
  const sepX = ml + cw * 0.48;
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.3);
  doc.line(sepX, cursor + 4, sepX, cursor + infoH - 4);

  setText(0, 255, 136);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('EVENT', sepX + 5, cursor + 8);
  setText(197, 160, 89);
  doc.text('INFO', pw - mr - 12, cursor + 8, { align: 'right' });

  const rightItems = [
    ['Sub-Competition', subTitle],
    ['Type', reg.participationType === 'team' ? 'Team' : 'Individual'],
    ['Team Name', reg.teamName],
    ['Age', String(reg.leader.age)],
    ['Status', 'REGISTERED'],
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

  cursor += infoH + 8;

  // ══════════════════════════════════════════
  //  TEAM MEMBERS (if team)
  // ══════════════════════════════════════════
  if (reg.participationType === 'team' && reg.members.length > 0) {
    const memberBoxH = 16 + reg.members.length * 9;
    sectionBox(cursor, memberBoxH);
    sectionTitle('TEAM MEMBERS', cursor + 8);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6.5);
    setText(80, 80, 80);
    doc.text('#', ml + 6, cursor + 17);
    doc.text('NAME', ml + 13, cursor + 17);
    doc.text('WHATSAPP', ml + 80, cursor + 17);

    setFill(30, 30, 30);
    doc.rect(ml + 4, cursor + 19, cw - 8, 0.3, 'F');

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

    cursor += memberBoxH + 8;
  }

  // ══════════════════════════════════════════
  //  ABSTRACT INFO
  // ══════════════════════════════════════════
  const abstractH = 20;
  sectionBox(cursor, abstractH);
  sectionTitle('ABSTRACT', cursor + 8);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  setText(100, 100, 100);
  doc.text('Title:', ml + 6, cursor + 16);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  setText(220, 220, 220);
  doc.text(reg.abstractTitle, ml + 20, cursor + 16);

  cursor += abstractH + 8;

  // ══════════════════════════════════════════
  //  REGISTRATION STATUS BOX
  // ══════════════════════════════════════════
  const statusH = 16;
  sectionBox(cursor, statusH);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  setText(200, 200, 200);
  doc.text('SIDE CONNECT — Free Registration', ml + 6, cursor + 12);

  setFill(0, 255, 136);
  doc.roundedRect(pw - mr - 28, cursor + 4, 24, 10, 3, 3, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  setText(5, 5, 5);
  doc.text('CONFIRMED', pw - mr - 16, cursor + 11.5, { align: 'center' });

  cursor += statusH + 12;

  // ══════════════════════════════════════════
  //  FOOTER
  // ══════════════════════════════════════════
  setFill(30, 30, 30);
  doc.rect(ml, cursor, cw, 0.3, 'F');

  cursor += 5;

  doc.setFont('Courier', 'bold');
  doc.setFontSize(6.5);
  setText(80, 80, 80);
  doc.text('This ticket confirms your registration for SIDE CONNECT ERIC 2026.', pw / 2, cursor, { align: 'center' });

  cursor += 5;

  doc.setFontSize(5.5);
  setText(60, 60, 60);
  const idShort = reg.id.length > 15 ? reg.id.slice(-15) : reg.id;
  doc.text(`ERIC 2026 SIDE CONNECT // ${new Date().toISOString().slice(0, 10)} // ID: ${idShort}`, pw / 2, cursor, { align: 'center' });

  return doc;
}

export function sideConnectPdfSafeName(reg: SideConnectRegistration) {
  return reg.teamName.replace(/[^a-zA-Z0-9]/g, '_');
}

export function generateSideConnectPDF(reg: SideConnectRegistration) {
  const doc = buildSideConnectPdf(reg);
  doc.save(`ERIC_2026_SideConnect_${sideConnectPdfSafeName(reg)}.pdf`);
}

export function sideConnectToPdfBase64(reg: SideConnectRegistration): string {
  return buildSideConnectPdf(reg).output('datauristring');
}
