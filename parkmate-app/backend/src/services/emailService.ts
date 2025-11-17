import nodemailer from 'nodemailer';
import config from '@config/environment';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"ParkMate" <${config.email.user}>`,
      to: email,
      subject: 'Password Reset Request - ParkMate',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
            }
            .header { 
              background: #1A3C6E; 
              color: white; 
              padding: 30px 20px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
            }
            .content { 
              background: #f9f9f9; 
              padding: 40px 30px; 
            }
            .content h2 {
              color: #1A3C6E;
              margin-top: 0;
            }
            .button { 
              display: inline-block; 
              background: #F9C80E; 
              color: #1A3C6E; 
              padding: 15px 40px; 
              text-decoration: none; 
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
              font-size: 16px;
            }
            .button:hover {
              background: #e0b50c;
            }
            .link-box {
              background: white;
              padding: 15px;
              border-radius: 5px;
              word-break: break-all;
              color: #1A3C6E;
              border-left: 4px solid #F9C80E;
              margin: 20px 0;
            }
            .footer { 
              text-align: center; 
              padding: 30px 20px; 
              color: #666; 
              font-size: 12px;
              background: #f0f0f0;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 3px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ParkMate</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello,</p>
              <p>You recently requested to reset your password for your ParkMate account.</p>
              <p>Click the button below to reset your password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <div class="link-box">
                ${resetUrl}
              </div>
              <div class="warning">
                <strong>⏰ This link will expire in 1 hour.</strong>
              </div>
              <p style="margin-top: 30px;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              <p style="color: #666; font-size: 14px;">For security reasons, this link can only be used once.</p>
            </div>
            <div class="footer">
              <p><strong>© 2025 ParkMate. All rights reserved.</strong></p>
              <p>This is an automated message, please do not reply to this email.</p>
              <p style="margin-top: 10px;">
                Need help? Contact us at support@parkmate.com
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request - ParkMate
        
        You recently requested to reset your password for your ParkMate account.
        
        Click this link to reset your password:
        ${resetUrl}
        
        This link will expire in 1 hour.
        
        If you didn't request a password reset, please ignore this email.
        
        © 2025 ParkMate. All rights reserved.
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent to:', email);
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const mailOptions = {
      from: `"ParkMate" <${config.email.user}>`,
      to: email,
      subject: 'Welcome to ParkMate! 🅿️',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: #1A3C6E; color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 40px 30px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f0f0f0; }
            .button { 
              display: inline-block; 
              background: #F9C80E; 
              color: #1A3C6E; 
              padding: 15px 40px; 
              text-decoration: none; 
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🅿️ Welcome to ParkMate!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}! 👋</h2>
              <p>Thank you for joining ParkMate - your smart parking solution!</p>
              <p>You can now:</p>
              <ul>
                <li>🔍 Find nearby parking spots instantly</li>
                <li>💰 Compare prices and availability</li>
                <li>⭐ Save your favorite locations</li>
                <li>⚡ Locate EV charging stations</li>
              </ul>
              <p style="text-align: center;">
                <a href="${config.frontendUrl}" class="button">Start Parking Smarter</a>
              </p>
            </div>
            <div class="footer">
              <p>© 2025 ParkMate. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent to:', email);
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      // Don't throw error - welcome email is not critical
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
