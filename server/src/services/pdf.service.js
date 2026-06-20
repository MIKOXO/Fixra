import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Property from '../models/Property.js';

const generateReceipt = async (job, ticket, landlord, contractor) => {
  const property = await Property.findById(ticket.propertyId);

  const doc = await PDFDocument.create();
  const page = doc.addPage([500, 700]);
  const { height } = page.getSize();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const black = rgb(0, 0, 0);
  const gray = rgb(0.4, 0.4, 0.4);
  const green = rgb(0, 0.5, 0);

  let y = height - 50;

  page.drawText('PAYMENT RECEIPT', { x: 50, y, size: 22, font: boldFont, color: black });
  y -= 30;

  const receiptNo = `RCPT-${Date.now()}`;
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  page.drawText(`Receipt #: ${receiptNo}`, { x: 50, y, size: 10, font, color: gray });
  page.drawText(`Date: ${date}`, { x: 350, y, size: 10, font, color: gray });
  y -= 40;

  page.drawLine({ start: { x: 50, y }, end: { x: 450, y }, thickness: 1, color: gray });
  y -= 25;

  page.drawText('TICKET DETAILS', { x: 50, y, size: 14, font: boldFont, color: black });
  y -= 20;
  page.drawText(`Title: ${ticket.title}`, { x: 50, y, size: 11, font });
  y -= 16;
  page.drawText(`Category: ${ticket.category}`, { x: 50, y, size: 11, font });
  y -= 25;

  page.drawText('PROPERTY', { x: 50, y, size: 14, font: boldFont, color: black });
  y -= 20;
  page.drawText(`Name: ${property?.name || 'N/A'}`, { x: 50, y, size: 11, font });
  y -= 16;
  page.drawText(`Unit: ${ticket.unitId || 'N/A'}`, { x: 50, y, size: 11, font });
  y -= 25;

  page.drawText('PARTIES', { x: 50, y, size: 14, font: boldFont, color: black });
  y -= 20;
  page.drawText(`Landlord: ${landlord?.name || 'N/A'}`, { x: 50, y, size: 11, font });
  y -= 16;
  page.drawText(`Contractor: ${contractor?.profile?.businessName || contractor?.name || 'N/A'}`, { x: 50, y, size: 11, font });
  y -= 25;

  page.drawLine({ start: { x: 50, y }, end: { x: 450, y }, thickness: 1, color: gray });
  y -= 25;

  page.drawText('PAYMENT SUMMARY', { x: 50, y, size: 14, font: boldFont, color: black });
  y -= 20;

  page.drawRectangle({
    x: 50, y: y - 8, width: 400, height: 30,
    color: rgb(0.95, 0.95, 0.95), borderColor: gray, borderWidth: 1,
  });
  page.drawText('Estimated Cost:', { x: 60, y: y - 2, size: 12, font: boldFont, color: black });
  page.drawText(`$${job.estimatedCost?.toFixed(2) || '0.00'}`, { x: 350, y: y - 2, size: 12, font: boldFont, color: black });
  y -= 45;

  page.drawText('Status: PAID', { x: 50, y, size: 11, font, color: green });
  y -= 30;

  page.drawLine({ start: { x: 50, y }, end: { x: 450, y }, thickness: 1, color: gray });
  y -= 20;
  page.drawText('Thank you for your business!', { x: 50, y, size: 10, font, color: gray });
  page.drawText('Fixra - Rental Property Maintenance', { x: 50, y: y - 14, size: 9, font, color: gray });

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
};

export { generateReceipt };
