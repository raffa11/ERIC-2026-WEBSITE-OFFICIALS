import { jsPDF } from 'jspdf';
import { Registration } from '../types';
import { COMPETITION_DIVISIONS } from '../data';

export function generateRegistrationPDF(reg: Registration) {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const pageW = 210;
  const pageH = 297;
  const ink = '#00FF88';
  const gold = '#C5A059';
  const dark = '#050505';
  const white = '#FFFFFF';

  const divObj = COMPETITION_DIVISIONS.find(d => d.id === reg.divisionId);

  // ── Background ──
  doc.setFillColor(5, 5, 5);
  doc.rect(0, 0, pageW, pageH, 'F');

  // ── Top accent bar ──
  doc.setFillColor(0, 255, 136);
  doc.rect(0, 0, pageW, 6, 'F');

  // ── ERIC Logo text ──
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(0, 255, 136);
  doc.text('ERIC', 20, 32);
  doc.setFontSize(28);
  doc.setTextColor(197, 160, 89);
  doc.text('2026', 62, 32);

  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('ELECTRONICS & ROBOTICS INNOVATION COMPETITION', 20, 38);

  // ── Ticket Frame ──
  doc.setDrawColor(0, 255, 136);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 45, pageW - 30, 60, 3, 3, 'S');

  // ── Registration Code Label ──
  doc.setFontSize(7);
  doc.setTextColor(197, 160, 89);
  doc.text('REGISTRATION CODE', pageW / 2, 56, { align: 'center' });

  // ── Registration Code (large, prominent) ──
  doc.setFont('Courier', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(0, 255, 136);
  doc.text(reg.refCode, pageW / 2, 72, { align: 'center' });

  // ── Divider line ──
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.2);
  const dividerY = 78;
  doc.line(20, dividerY, pageW - 20, dividerY);

  // ── Team info row ──
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(reg.teamName, 20, 90);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  const divTitle = divObj?.title || reg.divisionId;
  doc.text(`Division: ${divTitle}`, 20, 97);

  // ── Status badge ──
  doc.setFillColor(0, 255, 136);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(5, 5, 5);
  const statusText = reg.paymentStatus === 'PAID' ? 'PAID' : 'PENDING';
  const statusW = doc.getTextWidth(statusText) + 8;
  doc.roundedRect(pageW - 25 - statusW, 85, statusW, 10, 2, 2, 'F');
  doc.text(statusText, pageW - 21 - statusW / 2, 92.5, { align: 'center' });

  // ── Bottom portion - Event Details ──
  const detailsStartY = 120;

  doc.setDrawColor(0, 255, 136);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, detailsStartY, pageW - 30, 90, 3, 3, 'S');

  // ── Event Info ──
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 255, 136);
  doc.text('EVENT INFORMATION', 25, detailsStartY + 14);

  const eventInfo = [
    { label: 'Event', value: 'ERIC 2026 - International Electronics & Robotics Innovation Competition' },
    { label: 'Date', value: '22 - 24 September 2026' },
    { label: 'Venue', value: 'Kampus A, Universitas Negeri Jakarta (UNJ), Jakarta Timur' },
    { label: 'Division', value: `${divTitle}${reg.level ? ` (${reg.level})` : ''}${reg.subCategory ? ` - ${reg.subCategory}` : ''}` },
    { label: 'Leader', value: `${reg.leader.name} (${reg.leader.email})` },
    { label: 'Institution', value: reg.leader.institution },
    { label: 'WhatsApp', value: reg.leader.whatsapp },
  ];

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  eventInfo.forEach((item, i) => {
    const y = detailsStartY + 30 + i * 8;
    doc.setTextColor(197, 160, 89);
    doc.text(item.label, 25, y);
    doc.setTextColor(200, 200, 200);
    doc.text(`:  ${item.value}`, 60, y);
  });

  // ── Team Members ──
  if (reg.members.length > 0) {
    const memberStartY = detailsStartY + 100;
    doc.setDrawColor(0, 255, 136);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, memberStartY, pageW - 30, 12 + reg.members.length * 10, 3, 3, 'S');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 255, 136);
    doc.text('TEAM MEMBERS', 25, memberStartY + 10);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    reg.members.forEach((m, i) => {
      const y = memberStartY + 22 + i * 10;
      doc.setTextColor(200, 200, 200);
      doc.text(`${i + 1}. ${m.name} (${m.whatsapp})`, 25, y);
    });
  }

  // ── Lecturer ──
  if (reg.lecturerName) {
    const lecY = detailsStartY + 100 + (reg.members.length > 0 ? 20 + reg.members.length * 10 : 0);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(197, 160, 89);
    doc.text(`Advisor: ${reg.lecturerName}`, 25, lecY);
  }

  // ── Footer QR style note ──
  const footerY = pageH - 30;
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.2);
  doc.line(20, footerY - 8, pageW - 20, footerY - 8);

  doc.setFont('Courier', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text('Present this ticket at the registration desk to verify your team.', pageW / 2, footerY + 2, { align: 'center' });
  doc.text(`ERIC 2026 // ${new Date().toLocaleDateString('en-GB')} // v1.0`, pageW / 2, footerY + 10, { align: 'center' });

  // ── Side cut marks (simulate ticket stub) ──
  doc.setFillColor(0, 255, 136);
  for (let y = 65; y <= 90; y += 5) {
    doc.circle(15, y, 1.5, 'F');
    doc.circle(pageW - 15, y, 1.5, 'F');
  }

  // ── Save ──
  const safeName = reg.teamName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`ERIC_2026_Ticket_${safeName}.pdf`);
}
