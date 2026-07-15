import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import ExcelJS from 'exceljs';
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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    worksheet.columns = [
      { header: 'Order ID', key: 'orderId', width: 15 },
      { header: 'Customer Name', key: 'customerName', width: 25 },
      { header: 'Customer Email', key: 'customerEmail', width: 30 },
      { header: 'Payment Method', key: 'paymentMethod', width: 15 },
      { header: 'Purchase Date', key: 'purchaseDate', width: 18 },
      { header: 'Total Amount (INR)', key: 'totalAmount', width: 18 },
    ];

    // Style Header Row
    worksheet.getRow(1).font = { name: 'Arial', family: 4, size: 10, bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '8B5CF6' } // violet theme
    };

    orders.forEach((order: any) => {
      worksheet.addRow({
        orderId: `#${order.orderId}`,
        customerName: order.user?.name || 'Unregistered User',
        customerEmail: order.user?.email || 'N/A',
        paymentMethod: order.paymentMethod.toUpperCase(),
        purchaseDate: new Date(order.purchaseDate).toLocaleDateString('en-IN'),
        totalAmount: order.totalAmount,
      });
    });

    const xlsxBuffer = await workbook.xlsx.writeBuffer();

    return new Response(new Uint8Array(xlsxBuffer as ArrayBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="preethika_sales_report.xlsx"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
