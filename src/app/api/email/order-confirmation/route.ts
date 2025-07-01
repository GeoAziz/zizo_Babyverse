import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { to, orderData } = await request.json();

    if (!to || !orderData) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Build items list
    const itemsList = orderData.items?.map((item: any) => 
      `<tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${item.product?.imageUrl || ''}" alt="${item.product?.name || 'Product'}" 
                 style="width: 50px; height: 50px; border-radius: 4px; object-fit: cover;">
            <div>
              <strong>${item.product?.name || 'Unknown Product'}</strong><br>
              <small style="color: #666;">${item.product?.category || ''}</small>
            </div>
          </div>
        </td>
        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">
          ${item.quantity || 1}
        </td>
        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">
          <strong>KSH ${((item.product?.price || 0) * (item.quantity || 1) * 100).toFixed(2)}</strong>
        </td>
      </tr>`
    ).join('') || '<tr><td colspan="3" style="padding: 20px; text-align: center;">No items found</td></tr>';

    // Email HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
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
            color: #4c51bf; 
            margin: 0; 
            font-size: 28px; 
            font-weight: 700; 
          }
          .order-info { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 25px; 
            border-left: 4px solid #4c51bf; 
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
          .status-paid { 
            color: #48bb78; 
            font-weight: bold; 
            background: #f0fff4; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 14px; 
          }
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 25px; 
            border-radius: 8px; 
            overflow: hidden; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
          }
          .items-table th { 
            background: #4c51bf; 
            color: white; 
            padding: 15px 10px; 
            text-align: left; 
            font-weight: 600; 
          }
          .items-table td { 
            padding: 12px 10px; 
            border-bottom: 1px solid #e2e8f0; 
          }
          .items-table tr:hover { 
            background-color: #f7fafc; 
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
          .next-steps { 
            background: #e6fffa; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 25px; 
            border-left: 4px solid #38b2ac; 
          }
          .next-steps h4 { 
            margin-top: 0; 
            color: #234e52; 
            font-size: 18px; 
          }
          .next-steps ul { 
            margin: 15px 0; 
            padding-left: 20px; 
            color: #2c7a7b; 
          }
          .next-steps li { 
            margin-bottom: 8px; 
            position: relative; 
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
          .total-section { 
            background: #f7fafc; 
            padding: 15px; 
            border-radius: 8px; 
            margin-top: 15px; 
            border: 1px solid #e2e8f0; 
          }
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px; 
            padding: 5px 0; 
          }
          .total-final { 
            font-size: 18px; 
            font-weight: bold; 
            color: #4c51bf; 
            border-top: 2px solid #e2e8f0; 
            padding-top: 10px; 
            margin-top: 10px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="header">
              <h1>🚀 Order Confirmed!</h1>
              <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">
                Your BabyVerse package is preparing for its cosmic journey!
              </p>
            </div>
            
            <div class="order-info">
              <h2>Order Details</h2>
              <div class="info-row">
                <span class="info-label">Order ID:</span>
                <span class="info-value">#${orderData.id}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Order Date:</span>
                <span class="info-value">${new Date(orderData.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Amount:</span>
                <span class="info-value"><strong>KSH ${(orderData.totalAmount * 100).toFixed(2)}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">${orderData.paymentMethod === 'paypal' ? 'PayPal' : 'Credit Card'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="status-paid">✓ Confirmed & Paid</span>
              </div>
            </div>

            <div>
              <h3 style="color: #2d3748; margin-bottom: 15px;">Items Ordered:</h3>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
              
              <div class="total-section">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>KSH ${((orderData.totalAmount - 5.99) * 100).toFixed(2)}</span>
                </div>
                <div class="total-row">
                  <span>Shipping:</span>
                  <span>KSH ${(5.99 * 100).toFixed(2)}</span>
                </div>
                <div class="total-row total-final">
                  <span>Total:</span>
                  <span>KSH ${(orderData.totalAmount * 100).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div class="shipping-section">
              <h3>Shipping Address:</h3>
              <div class="shipping-address">
                <strong>${orderData.shippingAddress?.fullName || 'N/A'}</strong><br>
                ${orderData.shippingAddress?.address || 'N/A'}<br>
                ${orderData.shippingAddress?.city || 'N/A'}, ${orderData.shippingAddress?.postalCode || 'N/A'}<br>
                ${orderData.shippingAddress?.country || 'Kenya'}
              </div>
            </div>

            <div class="next-steps">
              <h4>📦 What's Next?</h4>
              <ul>
                <li><strong>Order Processing:</strong> We're preparing your cosmic package with love and care</li>
                <li><strong>Tracking Info:</strong> You'll receive tracking information within 24 hours</li>
                <li><strong>Estimated Delivery:</strong> 1-5 business days depending on your location</li>
                <li><strong>Customer Support:</strong> We're here if you need anything!</li>
              </ul>
            </div>

            <div class="footer">
              <p><strong>Thank you for choosing Zizo BabyVerse! 🌟</strong></p>
              <p>
                Need help? Contact us at 
                <a href="mailto:support@zizobabyverse.com">support@zizobabyverse.com</a>
              </p>
              <p>
                Visit us: <a href="https://zizobabyverse.com">zizobabyverse.com</a>
              </p>
              <p style="margin-top: 20px; font-size: 12px; color: #a0aec0;">
                This email was sent regarding your order #${orderData.id}. 
                Please keep this email for your records.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const textContent = `
Order Confirmation - Zizo BabyVerse

🚀 Order Confirmed!

Order Details:
- Order ID: #${orderData.id}
- Total Amount: KSH ${(orderData.totalAmount * 100).toFixed(2)}
- Payment Method: ${orderData.paymentMethod === 'paypal' ? 'PayPal' : 'Credit Card'}
- Status: Confirmed & Paid

Shipping Address:
${orderData.shippingAddress?.fullName || 'N/A'}
${orderData.shippingAddress?.address || 'N/A'}
${orderData.shippingAddress?.city || 'N/A'}, ${orderData.shippingAddress?.postalCode || 'N/A'}
${orderData.shippingAddress?.country || 'Kenya'}

What's Next:
• We're preparing your cosmic package
• You'll receive tracking info within 24 hours
• Estimated delivery: 1-5 business days

Thank you for choosing Zizo BabyVerse!
Support: support@zizobabyverse.com
Website: zizobabyverse.com
    `;

    // Send email
    const mailOptions = {
      from: '"Zizo BabyVerse" <no-reply@zizobabyverse.com>',
      to: to,
      subject: `🚀 Order Confirmation #${orderData.id} - Zizo BabyVerse`,
      html: htmlContent,
      text: textContent,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Order confirmation email sent successfully to ${to} for order ${orderData.id}`);
    
    return NextResponse.json({ 
      success: true, 
      message: "Email sent successfully" 
    });

  } catch (error: any) {
    console.error('Email service error:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: "Failed to send email",
      error: error.message 
    }, { status: 500 });
  }
}
