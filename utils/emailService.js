const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true for 46a5, false for other ports
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

const sendWelcomeEmail = async (toName, toEmail) => {
  const mailOptions = {
    from: `"NextGlide Support" <${process.env.SMTP_EMAIL}>`, // Validated sender
    to: toEmail,
    subject: 'We Received Your Message - NextGlide',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #007bff;">
          <h1 style="color: #007bff; margin: 0;">NextGlide</h1>
        </div>
        <div style="padding: 30px; border: 1px solid #e9ecef; border-top: none;">
          <h2 style="color: #333;">Hello ${toName},</h2>
          <p style="font-size: 16px; line-height: 1.5;">
            Thank you for reaching out to us! We have successfully received your message.
          </p>
          <p style="font-size: 16px; line-height: 1.5;">
            Our team is currently reviewing your inquiry and will get back to you within <strong>24 hours</strong>.
          </p>
          <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
             <p style="margin: 0; font-style: italic;">"We are committed to transforming your enterprise with excellence."</p>
          </div>
          <p style="font-size: 16px; line-height: 1.5;">
            Best regards,<br>
            <strong>The NextGlide Team</strong>
          </p>
        </div>
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #888;">
          &copy; ${new Date().getFullYear()} NextGlide. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return false;
  }
};

const sendCustomEmail = async (toEmail, subject, message) => {
  const mailOptions = {
    from: `"NextGlide Support" <${process.env.SMTP_EMAIL}>`,
    to: toEmail,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #007bff;">
          <h1 style="color: #007bff; margin: 0;">NextGlide</h1>
        </div>
        <div style="padding: 30px; border: 1px solid #e9ecef; border-top: none;">
          <h2 style="color: #333;">Hello,</h2>
          <p style="font-size: 16px; line-height: 1.5;">${message.replace(/\n/g, '<br>')}</p>
           <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
             <p style="margin: 0; font-style: italic;">"We are committed to transforming your enterprise with excellence."</p>
          </div>
          <p style="font-size: 16px; line-height: 1.5;">
            Best regards,<br>
            <strong>The NextGlide Team</strong>
          </p>
        </div>
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #888;">
          &copy; ${new Date().getFullYear()} NextGlide. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Custom email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending custom email:', error);
    return false;
  }
};

const sendApplicationReceiptEmail = async (inquiryData) => {
  // Support both serviceName and solutionName
  const { fullName, email, customResponses, requirements } = inquiryData;
  const displayName = inquiryData.serviceName || inquiryData.solutionName || 'Application';
  const typeLabel = inquiryData.solutionName ? 'Solution' : 'Service';

  // Format custom responses validation
  let customRows = '';
  if (customResponses && customResponses.length > 0) {
    customResponses.forEach(r => {
      customRows += `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%; color: #555;">${r.question}</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${r.answer}</td>
            </tr>
          `;
    });
  }

  const mailOptions = {
    from: `"NextGlide Support" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: `Application Received: ${displayName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; color: #444; background-color: #f4f4f4; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">NextGlide</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">Transforming Ideas into Reality</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h2 style="color: #1f2937; margin-top: 0;">Hello ${fullName},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
            Thank you for choosing NextGlide! We have received your application for <strong>${displayName}</strong>. Our team is excited to review your requirements.
          </p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin: 25px 0;">
            <div style="background-color: #f1f5f9; padding: 10px 20px; font-weight: bold; color: #475569; border-bottom: 1px solid #e2e8f0;">
              Application Summary
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%; color: #555;">${typeLabel}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; color: #000;">${displayName}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%; color: #555;">Email</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; color: #000;">${email}</td>
              </tr>
              ${customRows}
              <tr>
                <td style="padding: 12px; font-weight: bold; color: #555; vertical-align: top;">Requirements</td>
                <td style="padding: 12px; color: #333; line-height: 1.4;">${requirements}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
            We aim to respond to all inquiries within <strong>24 hours</strong>. If you have any urgent details to add, feel free to reply to this email.
          </p>

          <div style="text-align: center; margin-top: 40px; border-top: 1px solid #eee; pt: 30px;">
             <p style="margin-bottom: 15px; font-weight: bold; color: #333;">Connect With Us</p>
             <div style="display: inline-block;">
                <!-- Social Placeholders -->
                <a href="#" style="display: inline-block; width: 32px; height: 32px; background-color: #1877f2; color: white; text-decoration: none; border-radius: 50%; line-height: 32px; margin: 0 5px;">FB</a>
                <a href="#" style="display: inline-block; width: 32px; height: 32px; background-color: #0077b5; color: white; text-decoration: none; border-radius: 50%; line-height: 32px; margin: 0 5px;">LN</a>
                <a href="#" style="display: inline-block; width: 32px; height: 32px; background-color: #e4405f; color: white; text-decoration: none; border-radius: 50%; line-height: 32px; margin: 0 5px;">IG</a>
                <a href="#" style="display: inline-block; width: 32px; height: 32px; background-color: #1da1f2; color: white; text-decoration: none; border-radius: 50%; line-height: 32px; margin: 0 5px;">TW</a>
             </div>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #888;">
          &copy; ${new Date().getFullYear()} NextGlide Solutions. All rights reserved.<br>
          <a href="#" style="color: #6366f1; text-decoration: none;">Privacy Policy</a> | <a href="#" style="color: #6366f1; text-decoration: none;">Terms of Service</a>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Application receipt email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending application receipt:', error);
    return false;
  }
};

module.exports = { sendWelcomeEmail, sendCustomEmail, sendApplicationReceiptEmail };
