import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { to, orderData } = await request.json();

    if (!to || !orderData) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const { id, status, trackingNumber, totalAmount, shippingAddress } = orderData;

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Get status-specific content
    const getStatusContent = (status: string) => {
      switch (status) {
        case 'Shipped':
          return {
            title: '📦 Your Order Has Shipped!',
            message: 'Great news! Your BabyVerse package is on its way to you.',
            icon: '🚚',
            color: '#3182ce',
            bgColor: '#e6f3ff',
            action: trackingNumber ? `Track your package with tracking number: <strong>${trackingNumber}</strong>` : 'You\'ll receive tracking information soon.'
          };
        case 'Delivered':
          return {
            title: '🎉 Your Order Has Been Delivered!',
            message: 'Your BabyVerse package has been successfully delivered.',
            icon: '📍',
            color: '#38a169',
            bgColor: '#f0fff4',
            action: 'Enjoy your cosmic goodies! Don\'t forget to leave us a review.'
          };
        case 'Cancelled':
          return {
            title: '❌ Your Order Has Been Cancelled',
            message: 'Your order has been cancelled as requested.',
            icon: '🔄',
            color: '#e53e3e',
            bgColor: '#fed7d7',
            action: 'If you paid for this order, your refund will be processed within 3-5 business days.'
          };
        default:
          return {
            title: `📋 Order Status Update: ${status}`,
            message: `Your order status has been updated to: ${status}`,
            icon: '📄',
            color: '#4c51bf',
            bgColor: '#e6fffa',
            action: 'We\'ll keep you updated as your order progresses.'
          };
      }
    };

    const content = getStatusContent(status);

    // Email HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Update</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            padding: 20px; 
            border-radius: 12px; 
          }
          .content { 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding-bottom: 20px; 
            border-bottom: 2px solid #f0f0f0; 
          }
          .header h1 { 
            color: ${content.color}; 
            margin: 0; 
            font-size: 28px; 
            font-weight: 700; 
          }
          .status-badge {
            display: inline-block;
            background: ${content.bgColor};
            color: ${content.color};
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 18px;
            margin: 20px 0;
            border: 2px solid ${content.color};
          }
          .order-info { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 25px; 
            border-left: 4px solid ${content.color}; 
          }
          .order-info h2 { 
            color: #2d3748; 
            margin-top: 0; 
            font-size: 20px; 
          }
          .info-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px; 
            padding: 5px 0; 
          }
          .info-label { 
            font-weight: 600; 
            color: #4a5568; 
          }
          .info-value { 
            color: #2d3748; 
          }
          .action-section { 
            background: ${content.bgColor}; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 25px; 
            border-left: 4px solid ${content.color}; 
            text-align: center;
          }
          .action-section p {
            color: ${content.color};
            font-size: 16px;
            margin: 0;
          }
          .shipping-section { 
            background: #edf2f7; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 25px; 
          }
          .shipping-section h3 { 
            color: #2d3748; 
            margin-top: 0; 
            font-size: 18px; 
          }
          .shipping-address { 
            margin: 10px 0; 
            line-height: 1.8; 
          }
          .tracking-section {
            background: #e6f3ff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            text-align: center;
          }
          .tracking-number {
            font-family: 'Courier New', monospace;
            font-size: 20px;
            font-weight: bold;
            color: #3182ce;
            background: white;
            padding: 10px 20px;
            border-radius: 8px;
            display: inline-block;
            margin: 10px 0;
            border: 2px solid #3182ce;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #e2e8f0; 
          }
          .footer p { 
            color: #718096; 
            font-size: 14px; 
            margin: 5px 0; 
          }
          .footer a { 
            color: #4c51bf; 
            text-decoration: none; 
          }
          .footer a:hover { 
            text-decoration: underline; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="header">
              <div style="font-size: 48px; margin-bottom: 10px;">${content.icon}</div>
              <h1>${content.title}</h1>
              <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">
                ${content.message}
              </p>
              <div class="status-badge">
                Status: ${status.toUpperCase()}
              </div>
            </div>
            
            <div class="order-info">
              <h2>Order Information</h2>
              <div class="info-row">
                <span class="info-label">Order ID:</span>
                <span class="info-value">#${id}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Amount:</span>
                <span class="info-value"><strong>KSH ${(totalAmount * 100).toFixed(2)}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">Status Updated:</span>
                <span class="info-value">${new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>

            ${trackingNumber && status === 'Shipped' ? `
            <div class="tracking-section">
              <h3 style="color: #3182ce; margin-top: 0;">📦 Track Your Package</h3>
              <p>Your tracking number is:</p>
              <div class="tracking-number">${trackingNumber}</div>
              <p style="font-size: 14px; color: #666; margin-top: 15px;">
                Use this tracking number on your courier's website to track your package in real-time.
              </p>
            </div>
            ` : ''}

            <div class="action-section">
              <p><strong>${content.action}</strong></p>
            </div>

            <div class="shipping-section">
              <h3>Shipping Address:</h3>
              <div class="shipping-address">
                <strong>${shippingAddress?.fullName || 'N/A'}</strong><br>
                ${shippingAddress?.address || 'N/A'}<br>
                ${shippingAddress?.city || 'N/A'}, ${shippingAddress?.postalCode || 'N/A'}<br>
                ${shippingAddress?.country || 'Kenya'}
              </div>
            </div>

            <div class="footer">
              <p><strong>Thank you for choosing Zizo BabyVerse! 🌟</strong></p>
              <p>
                Questions? Contact us at 
                <a href="mailto:support@zizobabyverse.com">support@zizobabyverse.com</a>
              </p>
              <p>
                Visit us: <a href="https://zizobabyverse.com">zizobabyverse.com</a>
              </p>
              <p style="margin-top: 20px; font-size: 12px; color: #a0aec0;">
                This is an automated status update for order #${id}.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const textContent = `
Order Status Update - Zizo BabyVerse

${content.title}

${content.message}

Order Information:
- Order ID: #${id}
- Status: ${status}
- Total Amount: KSH ${(totalAmount * 100).toFixed(2)}
- Updated: ${new Date().toLocaleString()}

${trackingNumber ? `Tracking Number: ${trackingNumber}` : ''}

Shipping Address:
${shippingAddress?.fullName || 'N/A'}
${shippingAddress?.address || 'N/A'}
${shippingAddress?.city || 'N/A'}, ${shippingAddress?.postalCode || 'N/A'}
${shippingAddress?.country || 'Kenya'}

${content.action}

Thank you for choosing Zizo BabyVerse!
Support: support@zizobabyverse.com
Website: zizobabyverse.com
    `;

    // Send email
    const mailOptions = {
      from: '"Zizo BabyVerse" <no-reply@zizobabyverse.com>',
      to: to,
      subject: `${content.icon} Order #${id} Status Update - ${status}`,
      html: htmlContent,
      text: textContent,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Status update email sent successfully to ${to} for order ${id} (${status})`);
    
    return NextResponse.json({ 
      success: true, 
      message: "Status update email sent successfully" 
    });

  } catch (error: any) {
    console.error('Status update email service error:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: "Failed to send status update email",
      error: error.message 
    }, { status: 500 });
  }
}
