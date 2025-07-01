# Email Configuration Setup

To enable email notifications for order confirmations and status updates, add these environment variables to your `.env.local` file:

```env
# Email Configuration (Gmail)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password

# Note: Use Gmail App Password, not your regular Gmail password
# To create an App Password:
# 1. Go to Google Account settings
# 2. Enable 2-Factor Authentication
# 3. Go to Security > App passwords
# 4. Generate a new app password for "Mail"
# 5. Use that 16-character password as EMAIL_PASS
```

## Alternative Email Providers

### SendGrid
```env
SENDGRID_API_KEY=your-sendgrid-api-key
```

### AWS SES
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

### Mailgun
```env
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
```

## Email Templates

The system includes:
1. **Order Confirmation Email** - Sent when payment is successfully processed
2. **Status Update Email** - Sent when order status changes (Shipped, Delivered, Cancelled)

Both emails include:
- Order details with items and pricing
- Shipping information
- Tracking numbers (when available)
- Beautiful HTML formatting with BabyVerse branding

## Testing Email Functionality

1. Set up environment variables
2. Complete a test order
3. Check both your application logs and recipient email
4. For development, consider using Ethereal Email (automatic test account)

## Email Service Features

- **Automatic retries** for failed email sends
- **Fallback text versions** for all HTML emails
- **Error logging** without breaking the main order flow
- **Responsive design** that works on all devices
- **Professional branding** with BabyVerse theme
