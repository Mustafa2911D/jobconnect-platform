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

// Base email template with elegant styling
const baseEmailTemplate = (content, headerColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JobConnect</title>
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
            background: ${headerColor};
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .email-header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
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
            font-size: 20px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 20px;
        }
        
        .content {
            color: #6b7280;
            font-size: 16px;
            line-height: 1.7;
            margin-bottom: 24px;
        }
        
        .highlight-box {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            border-left: 4px solid #667eea;
        }
        
        .highlight-box.success {
            border-left-color: #10b981;
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        }
        
        .highlight-box.warning {
            border-left-color: #f59e0b;
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        }
        
        .highlight-box.info {
            border-left-color: #3b82f6;
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        }
        
        .highlight-title {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        .action-button.danger {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }
        
        .action-button.success {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        
        .steps-list {
            list-style: none;
            padding: 0;
        }
        
        .steps-list li {
            padding: 12px 0;
            border-bottom: 1px solid #f1f5f9;
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }
        
        .steps-list li:last-child {
            border-bottom: none;
        }
        
        .step-icon {
            background: #667eea;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            flex-shrink: 0;
            margin-top: 2px;
        }
        
        .step-content {
            flex: 1;
        }
        
        .step-title {
            font-weight: 600;
            color: #111827;
            margin-bottom: 4px;
        }
        
        .step-description {
            color: #6b7280;
            font-size: 14px;
        }
        
        .text-center {
            text-align: center;
        }
        
        .footer {
            border-top: 1px solid #e5e7eb;
            padding: 24px 30px;
            text-align: center;
            color: #9ca3af;
            font-size: 14px;
        }
        
        .footer-logo {
            font-size: 20px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 8px;
        }
        
        @media (max-width: 600px) {
            .email-body {
                padding: 30px 20px;
            }
            
            .email-header {
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
            <span class="icon">${content.icon || '💼'}</span>
            <h1>${content.title}</h1>
            ${content.subtitle ? `<p style="opacity: 0.9; font-size: 16px; margin-top: 8px;">${content.subtitle}</p>` : ''}
        </div>
        
        <div class="email-body">
            <h2 class="greeting">Hello ${content.userName},</h2>
            <div class="content">${content.message}</div>
            
            ${content.highlightBox || ''}
            ${content.steps || ''}
            ${content.button ? `
            <div class="text-center" style="margin: 32px 0;">
                <a href="${content.button.url}" class="action-button ${content.button.variant || ''}">
                    ${content.button.text}
                </a>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <div class="footer-logo">JobConnect</div>
            <p>Connecting Talent with Opportunity Across South Africa</p>
            <p style="margin-top: 8px; font-size: 12px; opacity: 0.7;">
                If you have any questions, feel free to reply to this email.<br>
                &copy; 2025 JobConnect. All rights reserved.
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
  
  const isCandidate = role === 'candidate';
  const roleSpecificContent = isCandidate ? {
    steps: `
      <div class="highlight-box info">
        <h3 class="highlight-title">🚀 Launch Your Job Search</h3>
        <ul class="steps-list">
          <li>
            <div class="step-icon">1</div>
            <div class="step-content">
              <div class="step-title">Complete Your Profile</div>
              <div class="step-description">Showcase your skills, experience, and career aspirations</div>
            </div>
          </li>
          <li>
            <div class="step-icon">2</div>
            <div class="step-content">
              <div class="step-title">Upload Your Resume</div>
              <div class="step-description">Make it easy for top employers to discover you</div>
            </div>
          </li>
          <li>
            <div class="step-icon">3</div>
            <div class="step-content">
              <div class="step-title">Browse Opportunities</div>
              <div class="step-description">Explore jobs that match your skills and interests</div>
            </div>
          </li>
          <li>
            <div class="step-icon">4</div>
            <div class="step-content">
              <div class="step-title">Set Job Alerts</div>
              <div class="step-description">Get notified about new relevant positions</div>
            </div>
          </li>
        </ul>
      </div>
    `,
    message: `Welcome to South Africa's premier job platform! We're thrilled to have you join our community of talented professionals. As a <strong>candidate</strong>, you're now connected to thousands of opportunities from top employers across the country.`
  } : {
    steps: `
      <div class="highlight-box info">
        <h3 class="highlight-title">🏢 Build Your Dream Team</h3>
        <ul class="steps-list">
          <li>
            <div class="step-icon">1</div>
            <div class="step-content">
              <div class="step-title">Complete Company Profile</div>
              <div class="step-description">Showcase your company culture and values</div>
            </div>
          </li>
          <li>
            <div class="step-icon">2</div>
            <div class="step-content">
              <div class="step-title">Post Your First Job</div>
              <div class="step-description">Attract qualified candidates with compelling listings</div>
            </div>
          </li>
          <li>
            <div class="step-icon">3</div>
            <div class="step-content">
              <div class="step-title">Review Applications</div>
              <div class="step-description">Find the perfect fit for your team with our smart matching</div>
            </div>
          </li>
          <li>
            <div class="step-icon">4</div>
            <div class="step-content">
              <div class="step-title">Connect with Talent</div>
              <div class="step-description">Schedule interviews and build your dream team</div>
            </div>
          </li>
        </ul>
      </div>
    `,
    message: `Welcome to South Africa's premier hiring platform! We're excited to help you find exceptional talent for your organization. As an <strong>employer</strong>, you now have access to thousands of qualified professionals ready to contribute to your success.`
  };

  const html = baseEmailTemplate({
    icon: '✨',
    title: 'Welcome to JobConnect',
    subtitle: 'Your journey to amazing opportunities starts here',
    userName: userName,
    message: roleSpecificContent.message,
    steps: roleSpecificContent.steps,
    button: {
      text: 'Explore Dashboard',
      url: `${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}`
    }
  });

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== PASSWORD RESET EMAIL =====
export const sendPasswordResetEmail = async (userEmail, userName, resetURL) => {
  const subject = 'Reset Your JobConnect Password';
  
  const html = baseEmailTemplate({
    icon: '🔒',
    title: 'Password Reset',
    subtitle: 'Secure your account access',
    userName: userName,
    message: `You've requested to reset your password for your JobConnect account. This is a standard security procedure to ensure your account remains protected.`,
    highlightBox: `
      <div class="highlight-box warning">
        <h3 class="highlight-title">⏰ Important Security Notice</h3>
        <p>This password reset link will expire in <strong>10 minutes</strong> for your security. If you didn't request this reset, please ignore this email and ensure your account credentials are secure.</p>
      </div>
    `,
    button: {
      text: 'Reset Password',
      url: resetURL,
      variant: 'danger'
    }
  }, 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)');

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== PASSWORD RESET CONFIRMATION =====
export const sendPasswordResetConfirmation = async (userEmail, userName) => {
  const subject = 'Password Successfully Reset';
  
  const html = baseEmailTemplate({
    icon: '✅',
    title: 'Password Updated',
    subtitle: 'Your security is our priority',
    userName: userName,
    message: `Your JobConnect password has been successfully reset. You can now sign in to your account using your new password.`,
    highlightBox: `
      <div class="highlight-box success">
        <h3 class="highlight-title">🔒 Security Confirmed</h3>
        <p>Your account security has been successfully updated. If you did not make this change, please contact our support team immediately.</p>
      </div>
    `,
    button: {
      text: 'Sign In to Account',
      url: `${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/login`,
      variant: 'success'
    }
  }, 'linear-gradient(135deg, #10b981 0%, #059669 100%)');

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== PASSWORD CHANGE CONFIRMATION =====
export const sendPasswordChangeConfirmation = async (userEmail, userName) => {
  const subject = 'Password Changed Successfully';
  
  const html = baseEmailTemplate({
    icon: '🔐',
    title: 'Password Updated',
    subtitle: 'Security settings confirmed',
    userName: userName,
    message: `Your JobConnect password has been successfully changed. You'll need to use your new password for all future sign-ins.`,
    highlightBox: `
      <div class="highlight-box info">
        <h3 class="highlight-title">ℹ️ Important Note</h3>
        <p>For security reasons, you'll be automatically signed out of all other devices. You'll need to sign in again with your new password.</p>
      </div>
    `,
    button: {
      text: 'Access Your Account',
      url: `${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}`,
      variant: 'success'
    }
  }, 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)');

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== APPLICATION CONFIRMATION =====
export const sendApplicationConfirmation = async (candidateEmail, jobTitle, companyName) => {
  const subject = `Application Submitted: ${jobTitle} at ${companyName}`;
  
  const html = baseEmailTemplate({
    icon: '📨',
    title: 'Application Received',
    subtitle: 'Your journey begins here',
    userName: '',
    message: `Thank you for applying for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. Your application has been received successfully and is now under review.`,
    steps: `
      <div class="highlight-box">
        <h3 class="highlight-title">📋 What Happens Next?</h3>
        <ul class="steps-list">
          <li>
            <div class="step-icon">1</div>
            <div class="step-content">
              <div class="step-title">Application Review</div>
              <div class="step-description">The employer will carefully review your application</div>
            </div>
          </li>
          <li>
            <div class="step-icon">2</div>
            <div class="step-content">
              <div class="step-title">Shortlisting Process</div>
              <div class="step-description">You'll be notified if you're selected for the next stage</div>
            </div>
          </li>
          <li>
            <div class="step-icon">3</div>
            <div class="step-content">
              <div class="step-title">Interview Stage</div>
              <div class="step-description">Potential interviews or assessments may follow</div>
            </div>
          </li>
          <li>
            <div class="step-icon">4</div>
            <div class="step-content">
              <div class="step-title">Final Decision</div>
              <div class="step-description">Keep an eye on your email for updates</div>
            </div>
          </li>
        </ul>
      </div>
    `,
    button: {
      text: 'Browse More Jobs',
      url: `${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/jobs`
    }
  });

  const result = await sendEmail(candidateEmail, subject, html);
  return result.success;
};

// ===== NEW APPLICATION NOTIFICATION =====
export const sendNewApplicationNotification = async (employerEmail, candidateName, jobTitle) => {
  const subject = `New Application: ${jobTitle}`;
  
  const html = baseEmailTemplate({
    icon: '🎯',
    title: 'New Candidate Application',
    subtitle: 'Great talent awaits your review',
    userName: '',
    message: `You have a new candidate application for your job posting: <strong>${jobTitle}</strong>.`,
    highlightBox: `
      <div class="highlight-box info">
        <h3 class="highlight-title">👤 Candidate Profile</h3>
        <div style="padding: 16px; background: white; border-radius: 8px; margin-top: 12px;">
          <p style="margin: 8px 0;"><strong>Applicant Name:</strong> ${candidateName}</p>
          <p style="margin: 8px 0;"><strong>Position Applied:</strong> ${jobTitle}</p>
          <p style="margin: 8px 0;"><strong>Application Date:</strong> ${new Date().toLocaleDateString('en-ZA')}</p>
        </div>
      </div>
    `,
    button: {
      text: 'Review Application',
      url: `${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/employer/dashboard`
    }
  }, 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)');

  const result = await sendEmail(employerEmail, subject, html);
  return result.success;
};

// ===== APPLICATION STATUS NOTIFICATION =====
export const sendApplicationStatusNotification = async (candidateEmail, candidateName, jobTitle, companyName, status, employerName) => {
  let emailConfig = {};

  switch (status) {
    case 'accepted':
      emailConfig = {
        subject: `Congratulations! Your application for ${jobTitle} has been accepted`,
        icon: '🎉',
        title: 'Application Accepted!',
        subtitle: 'Your skills stood out from the crowd',
        headerColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        message: `
          <p>Congratulations, <strong>${candidateName}</strong>! The team at <strong>${companyName}</strong> was impressed with your application for the <strong>${jobTitle}</strong> position and would like to move forward.</p>
        `,
        highlightBox: `
          <div class="highlight-box success">
            <h3 class="highlight-title">📅 Next Steps</h3>
            <p><strong>${employerName}</strong> will contact you shortly to discuss the interview process and next stages. This is your moment to shine - prepare to showcase your talents and learn more about this exciting opportunity!</p>
          </div>
        `,
        button: {
          text: 'Prepare for Interview',
          url: `${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/dashboard`,
          variant: 'success'
        }
      };
      break;
    
    case 'rejected':
      emailConfig = {
        subject: `Update on your application for ${jobTitle}`,
        icon: '💼',
        title: 'Application Update',
        subtitle: 'Your journey continues',
        headerColor: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
        message: `
          <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. We appreciate the time and effort you put into your application.</p>
          <p>After careful consideration, we regret to inform you that your application was not successful at this time.</p>
        `,
        highlightBox: `
          <div class="highlight-box">
            <h3 class="highlight-title">🚀 Keep Moving Forward</h3>
            <p>Every application is a step forward in your career journey. Continue refining your skills, exploring opportunities, and remember that the right role is out there waiting for your unique talents.</p>
          </div>
        `,
        button: {
          text: 'Explore New Opportunities',
          url: `${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/jobs`
        }
      };
      break;
    
    case 'reviewed':
      emailConfig = {
        subject: `Your application for ${jobTitle} is being reviewed`,
        icon: '👀',
        title: 'Application in Review',
        subtitle: 'Great progress on your application',
        headerColor: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
        message: `
          <p>Great news! Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been reviewed and is being actively considered by the hiring team.</p>
        `,
        highlightBox: `
          <div class="highlight-box info">
            <h3 class="highlight-title">⏳ While You Wait</h3>
            <p>The employer is currently evaluating all applications and will provide updates soon. This is a positive step forward in the selection process!</p>
          </div>
        `,
        button: {
          text: 'View Your Applications',
          url: `${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/dashboard`
        }
      };
      break;
    
    default:
      return false;
  }

  const html = baseEmailTemplate({
    ...emailConfig,
    userName: candidateName
  }, emailConfig.headerColor);

  const result = await sendEmail(candidateEmail, emailConfig.subject, html);
  return result.success;
};