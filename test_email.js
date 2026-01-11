require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log('--- Email Configuration Test ---');
    console.log('BREVO_SMTP_USER:', process.env.BREVO_SMTP_USER);
    console.log('BREVO_SMTP_KEY:', process.env.BREVO_SMTP_KEY ? '******' + process.env.BREVO_SMTP_KEY.slice(-5) : 'MISSING');
    console.log('SMTP_EMAIL:', process.env.SMTP_EMAIL);

    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_KEY,
        },
    });

    // Verify connection configuration
    try {
        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Verified!');
    } catch (error) {
        console.error('❌ SMTP Connection Failed:', error);
        return;
    }

    // Try sending an email
    const mailOptions = {
        from: `"NextGlide Debug" <${process.env.SMTP_EMAIL}>`, // Use valid sender
        to: 'attellisanjay29@gmail.com',
        subject: 'Test Email from Debug Script (Fixed Sender)',
        text: 'If you receive this, the sender identity is fixed!',
    };

    try {
        console.log('Sending test email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email Sent:', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('❌ Email Send Failed:', error);
    }
};

testEmail();
