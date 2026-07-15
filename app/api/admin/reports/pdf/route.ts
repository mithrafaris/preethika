import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import PDFDocument from 'pdfkit';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return false;
  const decoded = verifyToken(token);
  return decoded && decoded.isadmin;
}

export async function GET() {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const orders = await Order.find({}).populate({
      path: 'user',
      model: User,
      select: 'name email',
    });

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Uint8Array[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    // Wait for document to finish writing
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    // Document header
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#8b5cf6').text('Preethika Store', { align: 'center' });
    doc.fontSize(12).font('Helvetica').fillColor('#6b7280').text('SALES LEDGER AUDIT REPORT', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1f2937').text('Order ID', 50, doc.y, { width: 90 });
    doc.text('Customer', 140, doc.y - 12, { width: 120 });
    doc.text('Payment', 260, doc.y - 12, { width: 80 });
    doc.text('Date', 340, doc.y - 12, { width: 90 });
    doc.text('Total', 430, doc.y - 12, { width: 90, align: 'right' });
    doc.moveDown(0.5);

    // Divider line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e5e7eb').lineWidth(1).stroke();
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(9).fillColor('#4b5563');

    let runningTotal = 0;

    orders.forEach((order: any) => {
      const customerName = order.user?.name || 'Unregistered User';
      const orderDate = new Date(order.purchaseDate).toLocaleDateString('en-IN');
      const orderTotal = `Rs. ${order.totalAmount.toLocaleString('en-IN')}`;

      doc.text(`#${order.orderId}`, 50, doc.y, { width: 90 });
      doc.text(customerName, 140, doc.y - 10, { width: 120 });
      doc.text(order.paymentMethod.toUpperCase(), 260, doc.y - 10, { width: 80 });
      doc.text(orderDate, 340, doc.y - 10, { width: 90 });
      doc.text(orderTotal, 430, doc.y - 10, { width: 90, align: 'right' });
      doc.moveDown(0.5);

      runningTotal += order.totalAmount;
    });

    doc.moveDown(1.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#8b5cf6').lineWidth(1.5).stroke();
    doc.moveDown(1);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#1f2937').text(`Cumulative Gross Revenue: Rs. ${runningTotal.toLocaleString('en-IN')}`, { align: 'right' });

    doc.end();

    const pdfBuffer = await pdfPromise;

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="preethika_sales_report.pdf"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
