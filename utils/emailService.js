const Mailjet = require('node-mailjet');

// Initialize Mailjet with credentials from .env
const mailjet = Mailjet.apiConnect(
  process.env['Mailjet-API-Key'],
  process.env['Mailjet-Secret-Key']
);

const FROM_EMAIL = process.env['from-email'] || 'info@nextglidesolutions.com';
const FROM_NAME = process.env['email-name'] || 'NextGlide Solutions';

const sendEmail = async (messages) => {
  try {
    const result = await mailjet
      .post("send", { 'version': 'v3.1' })
      .request({
        "Messages": messages
      });
    console.log('✅ Mailjet sent successfully');
    return true;
  } catch (err) {
    console.error('❌ Mailjet Error:', err.statusCode, err.message);
    return false;
  }
};

const sendWelcomeEmail = async (toName, toEmail) => {
  const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(to right, #2563eb, #22c55e); padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">NextGlide</h1>
        </div>
        <div style="padding: 30px; border: 1px solid #e9ecef; border-top: none;">
          <h2 style="color: #333;">Hello ${toName},</h2>
          <p style="font-size: 16px; line-height: 1.5;">
            Thank you for submitting our form. We have successfully received your message!
          </p>
          <p style="font-size: 16px; line-height: 1.5;">
            Our team will contact you within <strong>6 hours</strong>.
          </p>
          <p style="font-size: 16px; line-height: 1.5;">
            In the meantime, please feel free to <a href="https://nextglide.com" style="color: #2563eb; text-decoration: none;">explore our website</a> to learn more about our services.
          </p>
          <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
             <p style="margin: 0; font-style: italic; color: #166534;">"Transforming your enterprise with excellence."</p>
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
    `;

  return sendEmail([
    {
      "From": {
        "Email": FROM_EMAIL,
        "Name": FROM_NAME
      },
      "To": [
        {
          "Email": toEmail,
          "Name": toName
        }
      ],
      "Subject": "We Received Your Message - NextGlide",
      "HTMLPart": htmlContent,
      "CustomID": "WelcomeEmail"
    }
  ]);
};

const sendCustomEmail = async (toEmail, subject, message) => {
  const htmlContent = `
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
    `;

  return sendEmail([
    {
      "From": {
        "Email": FROM_EMAIL,
        "Name": FROM_NAME
      },
      "To": [
        {
          "Email": toEmail
        }
      ],
      "Subject": subject,
      "HTMLPart": htmlContent,
      "CustomID": "CustomEmail"
    }
  ]);
};

const sendApplicationReceiptEmail = async (inquiryData) => {
  const { fullName, email, customResponses, requirements } = inquiryData;
  const displayName = inquiryData.serviceName || inquiryData.solutionName || 'Application';
  const typeLabel = inquiryData.solutionName ? 'Solution' : 'Service';

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

  const htmlContent = `
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
    `;

  return sendEmail([
    {
      "From": {
        "Email": FROM_EMAIL,
        "Name": FROM_NAME
      },
      "To": [
        {
          "Email": email,
          "Name": fullName
        }
      ],
      "Subject": `Application Received: ${displayName}`,
      "HTMLPart": htmlContent,
      "CustomID": "ApplicationReceipt"
    }
  ]);
};

const sendJobApplicationReceipt = async (toEmail, toName, jobTitle) => {
  const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #007bff;">
          <h1 style="color: #007bff; margin: 0;">NextGlide</h1>
        </div>
        <div style="padding: 30px; border: 1px solid #e9ecef; border-top: none;">
          <h2 style="color: #333;">Hello ${toName},</h2>
          <p style="font-size: 16px; line-height: 1.5;">
            Thank you for applying for the position of <strong>${jobTitle}</strong> at NextGlide.
          </p>
          <p style="font-size: 16px; line-height: 1.5;">
            We have successfully received your application. Our recruitment team will review your qualifications and get back to you if there is a match.
          </p>
          <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
             <p style="margin: 0; font-style: italic;">"Join us in building the future."</p>
          </div>
          <p style="font-size: 16px; line-height: 1.5;">
            Best regards,<br>
            <strong>NextGlide Talent Acquisition</strong>
          </p>
        </div>
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #888;">
          &copy; ${new Date().getFullYear()} NextGlide. All rights reserved.
        </div>
      </div>
    `;

  return sendEmail([
    {
      "From": {
        "Email": FROM_EMAIL,
        "Name": FROM_NAME
      },
      "To": [
        {
          "Email": toEmail,
          "Name": toName
        }
      ],
      "Subject": `Application Received: ${jobTitle}`,
      "HTMLPart": htmlContent,
      "CustomID": "JobApplicationReceipt"
    }
  ]);
};

module.exports = { sendWelcomeEmail, sendCustomEmail, sendApplicationReceiptEmail, sendJobApplicationReceipt };
