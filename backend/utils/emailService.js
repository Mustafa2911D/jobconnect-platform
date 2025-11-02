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

// Email configuration
const EMAIL_CONFIG = {
  sender: {
    name: 'JobConnect South Africa',
    email: 'hireconnectapp8@gmail.com'
  },
  company: {
    name: 'JobConnect South Africa',
    address: 'Cape Town, South Africa',
    website: process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'
  },
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    background: '#f8fafc'
  }
};

// Helper function to send emails
const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.log('📧 SIMULATED EMAIL:', { to, subject });
      return { success: true, simulated: true };
    }

    const emailData = {
      sender: EMAIL_CONFIG.sender,
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

// Base email template
const getBaseTemplate = (content, options = {}) => {
  const { preheader = '', headerColor = EMAIL_CONFIG.colors.primary } = options;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #334155;
            background-color: #f8fafc;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        
        .email-header {
            background: ${headerColor};
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .email-header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .email-header .subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .email-body {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 500;
            color: #0f172a;
            margin-bottom: 24px;
        }
        
        .content-section {
            margin-bottom: 32px;
        }
        
        .content-section p {
            margin-bottom: 16px;
            font-size: 16px;
            color: #475569;
        }
        
        .highlight-box {
            background: ${EMAIL_CONFIG.colors.background};
            border-left: 4px solid ${headerColor};
            padding: 24px;
            border-radius: 8px;
            margin: 24px 0;
        }
        
        .highlight-box h3 {
            color: #0f172a;
            margin-bottom: 12px;
            font-size: 18px;
            font-weight: 600;
        }
        
        .highlight-box ul {
            list-style: none;
            padding: 0;
        }
        
        .highlight-box li {
            padding: 8px 0;
            padding-left: 24px;
            position: relative;
            color: #475569;
        }
        
        .highlight-box li:before {
            content: "•";
            color: ${headerColor};
            font-weight: bold;
            position: absolute;
            left: 8px;
        }
        
        .button {
            display: inline-block;
            background: ${headerColor};
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            font-size: 16px;
            transition: all 0.2s ease;
        }
        
        .button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
        }
        
        .button-center {
            text-align: center;
            margin: 32px 0;
        }
        
        .security-notice {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }
        
        .security-notice h3 {
            color: #dc2626;
            margin-bottom: 8px;
        }
        
        .footer {
            text-align: center;
            padding: 32px 30px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
        }
        
        .footer-logo {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 8px;
        }
        
        @media (max-width: 600px) {
            .email-header {
                padding: 30px 20px;
            }
            
            .email-body {
                padding: 30px 20px;
            }
            
            .email-header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>${options.title || 'JobConnect'}</h1>
            ${preheader ? `<div class="subtitle">${preheader}</div>` : ''}
        </div>
        
        <div class="email-body">
            ${content}
        </div>
        
        <div class="footer">
            <div class="footer-logo">JobConnect South Africa</div>
            <p>Connecting Talent with Opportunity</p>
            <p>${EMAIL_CONFIG.company.address}</p>
            <p>
                <a href="${EMAIL_CONFIG.company.website}" style="color: #64748b; text-decoration: none;">Visit our website</a>
            </p>
            <p style="margin-top: 16px; font-size: 12px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} JobConnect South Africa. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

// ===== WELCOME EMAIL =====
export const sendWelcomeEmail = async (userEmail, userName, role) => {
  const isCandidate = role === 'candidate';
  const subject = `Welcome to JobConnect - Begin Your ${isCandidate ? 'Career Journey' : 'Hiring Success'}`;
  
  const nextSteps = isCandidate ? `
    <div class="highlight-box">
      <h3>🚀 Next Steps for Candidates</h3>
      <ul>
        <li><strong>Complete your profile</strong> - Showcase your skills, experience, and education</li>
        <li><strong>Upload your resume</strong> - Increase visibility to top employers</li>
        <li><strong>Browse opportunities</strong> - Discover roles matching your expertise</li>
        <li><strong>Set job alerts</strong> - Never miss relevant opportunities</li>
      </ul>
    </div>
  ` : `
    <div class="highlight-box">
      <h3>🏢 Next Steps for Employers</h3>
      <ul>
        <li><strong>Complete company profile</strong> - Attract the right talent</li>
        <li><strong>Post job openings</strong> - Reach qualified candidates</li>
        <li><strong>Review applications</strong> - Find your ideal team members</li>
        <li><strong>Connect with talent</strong> - Build your dream team efficiently</li>
      </ul>
    </div>
  `;

  const content = `
    <div class="greeting">Dear ${userName},</div>
    
    <div class="content-section">
      <p>Welcome to JobConnect South Africa! We're delighted to have you join our professional network as a <strong>${role}</strong>.</p>
      
      <p>Our platform is designed to ${isCandidate ? 'help you discover exceptional career opportunities that match your skills and aspirations' : 'streamline your hiring process and connect you with top-tier talent'}.</p>
    </div>
    
    ${nextSteps}
    
    <div class="button-center">
      <a href="${EMAIL_CONFIG.company.website}/dashboard" class="button">
        Access Your Dashboard
      </a>
    </div>
    
    <div class="content-section">
      <p>Should you require any assistance, our support team is readily available to ensure your success on our platform.</p>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'Welcome to JobConnect',
    preheader: `Start your ${isCandidate ? 'career journey' : 'hiring success'} today`,
    headerColor: EMAIL_CONFIG.colors.primary
  });

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== PASSWORD RESET EMAIL =====
export const sendPasswordResetEmail = async (userEmail, userName, resetURL) => {
  const subject = 'Secure Password Reset - JobConnect';
  
  const content = `
    <div class="greeting">Hello ${userName},</div>
    
    <div class="content-section">
      <p>We received a request to reset your JobConnect account password. To proceed with creating a new password, please use the secure link below:</p>
    </div>
    
    <div class="button-center">
      <a href="${resetURL}" class="button" style="background: ${EMAIL_CONFIG.colors.warning};">
        Reset Your Password
      </a>
    </div>
    
    <div class="content-section">
      <p><strong>Important:</strong> This reset link is valid for the next 10 minutes for security purposes.</p>
    </div>
    
    <div class="security-notice">
      <h3>🔒 Security Advisory</h3>
      <p>If you did not initiate this password reset request, please disregard this email. Your account security remains intact, and no changes have been made.</p>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'Password Reset',
    preheader: 'Secure your account access',
    headerColor: EMAIL_CONFIG.colors.warning
  });

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== PASSWORD RESET CONFIRMATION =====
export const sendPasswordResetConfirmation = async (userEmail, userName) => {
  const subject = 'Password Successfully Reset - JobConnect';
  
  const content = `
    <div class="greeting">Hello ${userName},</div>
    
    <div class="content-section">
      <p>Your JobConnect account password has been successfully reset and updated.</p>
    </div>
    
    <div class="highlight-box">
      <h3>✅ Password Update Confirmed</h3>
      <p>Your account security has been successfully restored. You may now access your account using your new credentials.</p>
    </div>
    
    <div class="security-notice">
      <h3>⚠️ Security Verification</h3>
      <p>If you did not authorize this password change, please contact our support team immediately to secure your account.</p>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'Password Reset Complete',
    preheader: 'Your account security has been restored',
    headerColor: EMAIL_CONFIG.colors.success
  });

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== PASSWORD CHANGE CONFIRMATION =====
export const sendPasswordChangeConfirmation = async (userEmail, userName) => {
  const subject = 'Password Updated Successfully - JobConnect';
  
  const content = `
    <div class="greeting">Hello ${userName},</div>
    
    <div class="content-section">
      <p>This email confirms that your JobConnect account password has been successfully updated.</p>
    </div>
    
    <div class="highlight-box">
      <h3>🔐 Account Security Updated</h3>
      <p>Your new password is now active. You will be required to use these updated credentials for all future sign-ins.</p>
    </div>
    
    <div class="content-section">
      <p>For security reasons, this change has been logged in our system. If this action was not performed by you, please contact our support team immediately.</p>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'Password Updated',
    preheader: 'Your account security has been enhanced',
    headerColor: EMAIL_CONFIG.colors.primary
  });

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== APPLICATION CONFIRMATION =====
export const sendApplicationConfirmation = async (candidateEmail, jobTitle, companyName) => {
  const subject = `Application Confirmation: ${jobTitle} - ${companyName}`;
  
  const content = `
    <div class="greeting">Thank You for Your Application</div>
    
    <div class="content-section">
      <p>We confirm receipt of your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
    </div>
    
    <div class="highlight-box">
      <h3>📋 Application Process</h3>
      <ul>
        <li>Your application has been forwarded to the hiring team</li>
        <li>The employer will review your qualifications and experience</li>
        <li>You will be notified directly regarding any updates</li>
        <li>Typical response time: 1-2 weeks</li>
      </ul>
    </div>
    
    <div class="content-section">
      <p>While you await a response, we encourage you to explore other opportunities that match your profile.</p>
    </div>
    
    <div class="button-center">
      <a href="${EMAIL_CONFIG.company.website}/jobs" class="button">
        Browse More Opportunities
      </a>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'Application Submitted',
    preheader: `Your application for ${jobTitle} has been received`,
    headerColor: EMAIL_CONFIG.colors.success
  });

  const result = await sendEmail(candidateEmail, subject, html);
  return result.success;
};

// ===== NEW APPLICATION NOTIFICATION =====
export const sendNewApplicationNotification = async (employerEmail, candidateName, jobTitle) => {
  const subject = `New Candidate Application: ${jobTitle}`;
  
  const content = `
    <div class="greeting">New Candidate Application</div>
    
    <div class="content-section">
      <p>You have received a new application for your job posting: <strong>${jobTitle}</strong>.</p>
    </div>
    
    <div class="highlight-box">
      <h3>👤 Candidate Overview</h3>
      <p><strong>Applicant Name:</strong> ${candidateName}</p>
      <p><strong>Position Applied:</strong> ${jobTitle}</p>
      <p><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="content-section">
      <p>Review this application promptly to ensure you don't miss out on potential talent for your organization.</p>
    </div>
    
    <div class="button-center">
      <a href="${EMAIL_CONFIG.company.website}/employer/dashboard" class="button">
        Review Application
      </a>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'New Application',
    preheader: `New candidate for ${jobTitle}`,
    headerColor: EMAIL_CONFIG.colors.primary
  });

  const result = await sendEmail(employerEmail, subject, html);
  return result.success;
};

// ===== APPLICATION STATUS NOTIFICATION =====
export const sendApplicationStatusNotification = async (candidateEmail, candidateName, jobTitle, companyName, status, employerName) => {
  let subject, content, headerColor;

  switch (status) {
    case 'accepted':
      subject = `Congratulations! Your application for ${jobTitle} has been accepted`;
      headerColor = EMAIL_CONFIG.colors.success;
      content = `
        <div class="greeting">Congratulations ${candidateName}!</div>
        
        <div class="content-section">
          <p>We are pleased to inform you that your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been <strong style="color: ${EMAIL_CONFIG.colors.success};">accepted</strong>.</p>
        </div>
        
        <div class="highlight-box">
          <h3>🎉 Next Steps in Your Journey</h3>
          <ul>
            <li>Expect direct communication from ${employerName} within the coming days</li>
            <li>Prepare for subsequent interview stages or assessments</li>
            <li>Review the company's background and recent developments</li>
            <li>Consider your availability and potential start date</li>
          </ul>
        </div>
        
        <div class="content-section">
          <p>The hiring team at ${companyName} recognizes your potential and looks forward to engaging with you further.</p>
        </div>
      `;
      break;
    
    case 'rejected':
      subject = `Update Regarding Your Application: ${jobTitle}`;
      headerColor = EMAIL_CONFIG.colors.secondary;
      content = `
        <div class="greeting">Dear ${candidateName},</div>
        
        <div class="content-section">
          <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
          
          <p>After careful consideration of all applications, we regret to inform you that we have proceeded with other candidates whose qualifications more closely align with our current requirements.</p>
        </div>
        
        <div class="highlight-box">
          <h3>💼 Continue Your Professional Journey</h3>
          <ul>
            <li>This decision is specific to this role and does not reflect on your capabilities</li>
            <li>Consider this valuable experience in your career development</li>
            <li>Continue applying to positions that match your skills and aspirations</li>
            <li>We encourage you to request feedback to enhance future applications</li>
          </ul>
        </div>
        
        <div class="content-section">
          <p>We appreciate the time and effort you invested in your application and wish you success in your job search.</p>
        </div>
      `;
      break;
    
    case 'reviewed':
      subject = `Application Update: ${jobTitle} Under Active Consideration`;
      headerColor = EMAIL_CONFIG.colors.primary;
      content = `
        <div class="greeting">Hello ${candidateName},</div>
        
        <div class="content-section">
          <p>We are writing to inform you that your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> is currently under active review.</p>
        </div>
        
        <div class="highlight-box">
          <h3>⏳ Current Status: In Review</h3>
          <ul>
            <li>Your application has progressed to the evaluation stage</li>
            <li>The hiring team is assessing all candidate profiles</li>
            <li>You will receive further updates as the process advances</li>
            <li>Typical review period: 1-3 weeks</li>
          </ul>
        </div>
        
        <div class="content-section">
          <p>Please ensure your contact information is current and monitor your communication channels for potential follow-up.</p>
        </div>
        
        <div class="button-center">
          <a href="${EMAIL_CONFIG.company.website}/profile" class="button">
            Update Your Profile
          </a>
        </div>
      `;
      break;
    
    default:
      return false;
  }

  const html = getBaseTemplate(content, {
    title: 'Application Status Update',
    preheader: `Update regarding your ${jobTitle} application`,
    headerColor
  });

  const result = await sendEmail(candidateEmail, subject, html);
  return result.success;
};