import nodemailer from 'nodemailer';

// If SMTP settings are missing, we will gracefully log the email content.
// In production, configure these environment variables.
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = process.env.SMTP_PORT || '587';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

const isConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: parseInt(SMTP_PORT, 10),
  secure: SMTP_PORT === '465',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function sendWelcomeEmail(to: string, name: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #6d28d9; margin: 0;">Welcome to Preethika!</h1>
      </div>
      <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h2 style="color: #333333; margin-top: 0;">Hi ${name},</h2>
        <p style="color: #555555; line-height: 1.6;">
          Thank you for creating an account with Preethika! We are thrilled to have you on board.
        </p>
        <p style="color: #555555; line-height: 1.6;">
          You can now browse our premium catalog, save items to your wishlist, and enjoy a seamless shopping experience.
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/products" style="background-color: #6d28d9; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Start Shopping</a>
        </div>
      </div>
      <div style="text-align: center; padding-top: 20px; color: #999999; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Preethika. All rights reserved.
      </div>
    </div>
  `;

  if (!isConfigured) {
    console.log('\n[MOCK EMAIL] Welcome Email to:', to);
    console.log('[MOCK EMAIL] Subject: Welcome to Preethika!');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Preethika" <${SMTP_USER}>`,
      to,
      subject: 'Welcome to Preethika!',
      html,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

export async function sendOrderConfirmationEmail(to: string, name: string, orderDetails: any) {
  const itemsHtml = orderDetails.orderItems.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee;">${item.productName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #6d28d9; margin: 0;">Order Confirmed!</h1>
      </div>
      <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h2 style="color: #333333; margin-top: 0;">Hi ${name},</h2>
        <p style="color: #555555; line-height: 1.6;">
          Thank you for your order! Your order <strong>#${orderDetails.orderId}</strong> has been successfully placed and is now being processed.
        </p>
        
        <h3 style="color: #333333; margin-top: 30px; border-bottom: 2px solid #6d28d9; padding-bottom: 5px; display: inline-block;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; color: #555555;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
              <td style="padding: 10px; text-align: right;">₹${orderDetails.totalAmount.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Payment Method:</td>
              <td style="padding: 10px; text-align: right; text-transform: uppercase;">${orderDetails.paymentMethod}</td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align: center; margin-top: 40px;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders" style="background-color: #6d28d9; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Order Status</a>
        </div>
      </div>
      <div style="text-align: center; padding-top: 20px; color: #999999; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Preethika. All rights reserved.
      </div>
    </div>
  `;

  if (!isConfigured) {
    console.log('\n[MOCK EMAIL] Order Confirmation to:', to);
    console.log(`[MOCK EMAIL] Subject: Order Confirmed - #${orderDetails.orderId}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Preethika" <${SMTP_USER}>`,
      to,
      subject: `Order Confirmed - #${orderDetails.orderId}`,
      html,
    });
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
}
