import brevo from '@getbrevo/brevo';
import dotenv from 'dotenv';

dotenv.config();

console.log('Email Configuration:', {
  service: 'Brevo (Sendinblue)',
  apiKey: process.env.BREVO_API_KEY ? 'Set' : 'Not Set'
});

// Initialize Brevo
const apiInstance = new brevo.TransactionalEmailsApi();

// Configure API key
if (process.env.BREVO_API_KEY) {
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
}

// Base email template with professional styling
const baseEmailTemplate = (content, headerColor = '#2563eb') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JobConnect Email</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f8fafc;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
        }
        
        .email-header {
            background: linear-gradient(135deg, ${headerColor}, ${headerColor}dd);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .email-header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.025em;
        }
        
        .email-header .icon {
            font-size: 48px;
            margin-bottom: 16px;
            display: block;
        }
        
        .email-body {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 24px;
        }
        
        .content {
            color: #6b7280;
            font-size: 16px;
            line-height: 1.7;
            margin-bottom: 32px;
        }
        
        .content strong {
            color: #111827;
            font-weight: 600;
        }
        
        .info-box {
            background: #f8fafc;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            border-left: 4px solid ${headerColor};
        }
        
        .info-box h3 {
            color: #111827;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
        }
        
        .info-box ul {
            list-style: none;
            padding: 0;
        }
        
        .info-box li {
            padding: 8px 0;
            color: #6b7280;
            position: relative;
            padding-left: 24px;
        }
        
        .info-box li:before {
            content: "•";
            color: ${headerColor};
            font-weight: bold;
            position: absolute;
            left: 8px;
        }
        
        .button-container {
            text-align: center;
            margin: 32px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, ${headerColor}, ${headerColor}dd);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
        }
        
        .email-footer {
            text-align: center;
            padding: 32px 30px;
            background: #f8fafc;
            border-top: 1px solid #e5e7eb;
            color: #9ca3af;
            font-size: 14px;
        }
        
        .footer-logo {
            font-size: 20px;
            font-weight: 700;
            color: #2563eb;
            margin-bottom: 16px;
        }
        
        .security-notice {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            color: #dc2626;
            font-size: 14px;
        }
        
        .success-notice {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            color: #16a34a;
            font-size: 14px;
        }
        
        @media (max-width: 600px) {
            .email-header, .email-body, .email-footer {
                padding: 30px 20px;
            }
            
            .email-header h1 {
                font-size: 24px;
            }
            
            .cta-button {
                padding: 12px 24px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <span class="icon">{{ICON}}</span>
            <h1>{{TITLE}}</h1>
        </div>
        
        <div class="email-body">
            <div class="greeting">Hello {{USERNAME}},</div>
            <div class="content">
                {{CONTENT}}
            </div>
            {{ACTION_BUTTON}}
            {{INFO_BOX}}
        </div>
        
        <div class="email-footer">
            <div class="footer-logo">JobConnect</div>
            <p>Connecting Talent with Opportunity Across South Africa</p>
            <p style="margin-top: 12px; font-size: 12px;">
                If you have any questions, feel free to reply to this email.<br>
                © 2024 JobConnect South Africa. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`;

// Helper function to send emails
const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.log('📧 SIMULATED EMAIL:', { to, subject });
      return { success: true, simulated: true };
    }

    const emailData = {
      sender: {
        name: 'JobConnect South Africa',
        email: 'hireconnectapp8@gmail.com'
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html
    };

    console.log('📤 Attempting to send email via Brevo API to:', to);
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify(emailData)
    });

    const responseData = await response.json();
    
    if (response.ok) {
      console.log('✅ Email sent successfully!');
      console.log('📨 Message ID:', responseData.messageId);
      console.log('👤 From:', emailData.sender.email);
      return { success: true, data: responseData };
    } else {
      console.error('❌ Brevo API error:', responseData);
      console.error('📊 Status code:', response.status);
      return { 
        success: false, 
        error: responseData.message,
        status: response.status
      };
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
    return { success: false, error: error.message };
  }
};

// ===== WELCOME EMAIL =====
export const sendWelcomeEmail = async (userEmail, userName, role) => {
  const subject = `Welcome to JobConnect, ${userName}! 🎉`;
  
  const roleSpecificContent = role === 'candidate' ? `
    <p>We're thrilled to welcome you to JobConnect South Africa! As a <strong>candidate</strong>, you've taken the first step toward finding your dream career opportunity.</p>
    
    <div class="info-box">
      <h3>🚀 Your Journey Starts Here</h3>
      <ul>
        <li><strong>Complete your profile</strong> - Showcase your skills, experience, and education to stand out</li>
        <li><strong>Upload your resume</strong> - Make it easy for top employers to discover you</li>
        <li><strong>Browse opportunities</strong> - Explore positions that match your expertise and aspirations</li>
        <li><strong>Set job alerts</strong> - Get notified about new relevant positions automatically</li>
      </ul>
    </div>
  ` : `
    <p>Welcome to JobConnect South Africa! As an <strong>employer</strong>, you're now connected to our pool of exceptional talent ready to drive your business forward.</p>
    
    <div class="info-box">
      <h3>🏢 Build Your Dream Team</h3>
      <ul>
        <li><strong>Complete company profile</strong> - Showcase your culture and attract the right talent</li>
        <li><strong>Post job opportunities</strong> - Reach qualified candidates across South Africa</li>
        <li><strong>Review applications</strong> - Access detailed candidate profiles and resumes</li>
        <li><strong>Connect directly</strong> - Build relationships with potential team members</li>
      </ul>
    </div>
  `;

  const html = baseEmailTemplate
    .replace('{{ICON}}', '🎯')
    .replace('{{TITLE}}', 'Welcome to JobConnect!')
    .replace('{{USERNAME}}', userName)
    .replace('{{CONTENT}}', roleSpecificContent)
    .replace('{{ACTION_BUTTON}}', `
      <div class="button-container">
        <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}" class="cta-button">
          Explore Your Dashboard
        </a>
      </div>
    `)
    .replace('{{INFO_BOX}}', '');

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== PASSWORD RESET EMAIL =====
export const sendPasswordResetEmail = async (userEmail, userName, resetURL) => {
  const subject = 'Reset Your JobConnect Password';
  
  const cleanResetURL = resetURL.replace('//reset-password', '/reset-password');
  
  const html = baseEmailTemplate
    .replace('{{ICON}}', '🔒')
    .replace('{{TITLE}}', 'Password Reset')
    .replace('{{USERNAME}}', userName)
    .replace('{{CONTENT}}', `
      <p>We received a request to reset your JobConnect account password. Click the button below to create a new secure password.</p>
    `)
    .replace('{{ACTION_BUTTON}}', `
      <div class="button-container">
        <a href="${cleanResetURL}" class="cta-button">
          Reset Your Password
        </a>
      </div>
      <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 16px;">
        This link will expire in <strong>10 minutes</strong> for security reasons.
      </p>
    `)
    .replace('{{INFO_BOX}}', `
      <div class="security-notice">
        <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
      </div>
    `);

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== PASSWORD RESET CONFIRMATION =====
export const sendPasswordResetConfirmation = async (userEmail, userName) => {
  const subject = 'Password Successfully Reset';
  
  const html = baseEmailTemplate
    .replace('{{ICON}}', '✅')
    .replace('{{TITLE}}', 'Password Updated')
    .replace('{{USERNAME}}', userName)
    .replace('{{CONTENT}}', `
      <p>Your JobConnect password has been successfully reset. You can now sign in with your new password.</p>
    `)
    .replace('{{ACTION_BUTTON}}', `
      <div class="button-container">
        <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/login" class="cta-button">
          Sign In to Your Account
        </a>
      </div>
    `)
    .replace('{{INFO_BOX}}', `
      <div class="security-notice">
        <strong>Important:</strong> If you did not make this change, please contact our support team immediately.
      </div>
    `);

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== PASSWORD CHANGE CONFIRMATION =====
export const sendPasswordChangeConfirmation = async (userEmail, userName) => {
  const subject = 'Password Updated Successfully';
  
  const html = baseEmailTemplate
    .replace('{{ICON}}', '🔐')
    .replace('{{TITLE}}', 'Password Changed')
    .replace('{{USERNAME}}', userName)
    .replace('{{CONTENT}}', `
      <p>Your JobConnect password has been successfully updated. You'll need to use your new password for future sign-ins.</p>
    `)
    .replace('{{ACTION_BUTTON}}', '')
    .replace('{{INFO_BOX}}', `
      <div class="success-notice">
        <strong>Note:</strong> For security reasons, you've been signed out of all other devices. Please sign in again with your new password.
      </div>
    `);

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== APPLICATION CONFIRMATION =====
export const sendApplicationConfirmation = async (candidateEmail, jobTitle, companyName) => {
  const subject = `Application Confirmed: ${jobTitle} at ${companyName}`;
  
  const html = baseEmailTemplate
    .replace('{{ICON}}', '📨')
    .replace('{{TITLE}}', 'Application Submitted')
    .replace('{{USERNAME}}', '')
    .replace('{{CONTENT}}', `
      <p>Thank you for applying for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. Your application has been received successfully.</p>
    `)
    .replace('{{ACTION_BUTTON}}', `
      <div class="button-container">
        <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/jobs" class="cta-button">
          Browse More Opportunities
        </a>
      </div>
    `)
    .replace('{{INFO_BOX}}', `
      <div class="info-box">
        <h3>📋 What Happens Next?</h3>
        <ul>
          <li>The employer will review your application carefully</li>
          <li>You'll be notified via email if you're shortlisted</li>
          <li>Keep your profile updated for better opportunities</li>
          <li>Continue exploring other positions that match your skills</li>
        </ul>
      </div>
    `);

  const result = await sendEmail(candidateEmail, subject, html);
  return result.success;
};

// ===== NEW APPLICATION NOTIFICATION =====
export const sendNewApplicationNotification = async (employerEmail, candidateName, jobTitle) => {
  const subject = `New Application: ${jobTitle}`;
  
  const html = baseEmailTemplate
    .replace('{{ICON}}', '👤')
    .replace('{{TITLE}}', 'New Candidate Application')
    .replace('{{USERNAME}}', '')
    .replace('{{CONTENT}}', `
      <p>You have received a new application for your job posting: <strong>${jobTitle}</strong>.</p>
    `)
    .replace('{{ACTION_BUTTON}}', `
      <div class="button-container">
        <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/employer/dashboard" class="cta-button">
          Review Application
        </a>
      </div>
    `)
    .replace('{{INFO_BOX}}', `
      <div class="info-box">
        <h3>Candidate Details</h3>
        <p><strong>Name:</strong> ${candidateName}</p>
        <p><strong>Position:</strong> ${jobTitle}</p>
        <p><strong>Applied:</strong> ${new Date().toLocaleDateString('en-ZA')}</p>
      </div>
    `);

  const result = await sendEmail(employerEmail, subject, html);
  return result.success;
};

// ===== APPLICATION STATUS NOTIFICATION =====
export const sendApplicationStatusNotification = async (candidateEmail, candidateName, jobTitle, companyName, status, employerName) => {
  let subject, icon, title, content, infoBox, buttonColor;
  
  const frontendURL = process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app';

  switch (status) {
    case 'accepted':
      subject = `Congratulations! Your application for ${jobTitle} has been accepted`;
      icon = '🎉';
      title = 'Application Accepted!';
      buttonColor = '#10b981';
      content = `
        <p>Congratulations, <strong>${candidateName}</strong>! Your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been accepted!</p>
        <p>The employer, <strong>${employerName}</strong>, will contact you shortly to discuss the next steps in the hiring process.</p>
      `;
      infoBox = `
        <div class="info-box">
          <h3>📅 Next Steps</h3>
          <ul>
            <li>Expect contact from the employer within the next few days</li>
            <li>Prepare for interviews and further discussions</li>
            <li>Review the company and position details</li>
            <li>Be ready to discuss your availability and start date</li>
          </ul>
        </div>
      `;
      break;
    
    case 'rejected':
      subject = `Update on your application for ${jobTitle}`;
      icon = '💼';
      title = 'Application Update';
      buttonColor = '#6b7280';
      content = `
        <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
        <p>After careful consideration, we regret to inform you that your application was not successful at this time.</p>
      `;
      infoBox = `
        <div class="info-box">
          <h3>🚀 Continue Your Journey</h3>
          <ul>
            <li>Don't be discouraged - persistence is key in job searching</li>
            <li>Continue enhancing your skills and qualifications</li>
            <li>Explore other opportunities that match your profile</li>
            <li>Consider requesting feedback to improve future applications</li>
          </ul>
        </div>
      `;
      break;
    
    case 'reviewed':
      subject = `Your application for ${jobTitle} is under review`;
      icon = '👀';
      title = 'Application Reviewed';
      buttonColor = '#0ea5e9';
      content = `
        <p>Great news! Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been reviewed and is being actively considered.</p>
        <p>The hiring team is currently evaluating all applications and will provide further updates soon.</p>
      `;
      infoBox = `
        <div class="info-box">
          <h3>⏳ While You Wait</h3>
          <ul>
            <li>Keep your contact information current and accessible</li>
            <li>Prepare for potential interviews or assessments</li>
            <li>Research the company and industry trends</li>
            <li>Continue exploring other suitable opportunities</li>
          </ul>
        </div>
      `;
      break;
    
    default:
      return false;
  }

  const html = baseEmailTemplate
    .replace(/{{ICON}}/g, icon)
    .replace('{{TITLE}}', title)
    .replace('{{USERNAME}}', candidateName)
    .replace('{{CONTENT}}', content)
    .replace('{{ACTION_BUTTON}}', `
      <div class="button-container">
        <a href="${frontendURL}/jobs" class="cta-button" style="background: linear-gradient(135deg, ${buttonColor}, ${buttonColor}dd);">
          Browse More Jobs
        </a>
      </div>
    `)
    .replace('{{INFO_BOX}}', infoBox)
    .replace(/#2563eb/g, buttonColor);

  const result = await sendEmail(candidateEmail, subject, html);
  return result.success;
};