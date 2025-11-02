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

// Enhanced base email template with dark mode support and improved headers
const getBaseTemplate = (content, options = {}) => {
  const { 
    preheader = '', 
    designType = 'default',
    accentColor = '#2563eb',
    headerGradient = 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    icon = '💼',
    pattern = 'geometric',
    headerStyle = 'default'
  } = options;
  
  const patterns = {
    geometric: `
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%);
    `,
    dots: `
      background-image: 
        radial-gradient(rgba(255,255,255,0.2) 1.5px, transparent 1.5px),
        radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 30px 30px, 20px 20px;
      background-position: 0 0, 15px 15px;
    `,
    lines: `
      background: 
        linear-gradient(90deg, transparent 49%, rgba(255,255,255,0.1) 50%, transparent 51%),
        linear-gradient(transparent 49%, rgba(255,255,255,0.1) 50%, transparent 51%);
      background-size: 30px 30px;
    `,
    waves: `
      background-image: 
        radial-gradient(circle at 100% 50%, rgba(255,255,255,0.1) 20%, transparent 21%),
        radial-gradient(circle at 0% 50%, rgba(255,255,255,0.05) 20%, transparent 21%);
      background-size: 40px 40px;
    `,
    grid: `
      background-image: 
        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 20px 20px;
    `,
    none: ''
  };

  const headerStyles = {
    default: `
      background: ${headerGradient};
      padding: 50px 40px 40px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
      ${patterns[pattern]}
    `,
    modern: `
      background: ${headerGradient};
      padding: 60px 40px 50px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
      clip-path: polygon(0 0, 100% 0, 100% 90%, 0 100%);
      ${patterns[pattern]}
    `,
    elegant: `
      background: ${headerGradient};
      padding: 50px 40px 40px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
      border-bottom: 4px solid rgba(255,255,255,0.2);
      ${patterns[pattern]}
    `,
    bold: `
      background: ${headerGradient};
      padding: 50px 40px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
      border-radius: 0 0 30px 30px;
      ${patterns[pattern]}
    `
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>JobConnect Email</title>
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
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        @media (prefers-color-scheme: dark) {
            body {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                color: #e2e8f0;
            }
            
            .email-wrapper {
                background: #1e293b;
                border-color: #334155;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
            }
            
            .email-body {
                background: #1e293b;
            }
            
            .greeting {
                color: #f1f5f9;
                border-bottom-color: ${accentColor}40;
            }
            
            .content-section p {
                color: #cbd5e1;
            }
            
            .feature-card {
                background: linear-gradient(135deg, #334155 0%, #475569 100%);
                border-color: #475569;
                color: #e2e8f0;
            }
            
            .feature-card h3 {
                color: #f1f5f9;
            }
            
            .feature-card li {
                color: #e2e8f0;
                border-bottom-color: #475569;
            }
            
            .security-alert {
                background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
                border-color: #dc2626;
                color: #fecaca;
            }
            
            .security-alert h3 {
                color: #fecaca;
            }
            
            .success-highlight {
                background: linear-gradient(135deg, #14532d 0%, #166534 100%);
                border-color: #16a34a;
                color: #bbf7d0;
            }
            
            .success-highlight h3 {
                color: #bbf7d0;
            }
        }
        
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border: 1px solid #e2e8f0;
        }
        
        .email-header {
            ${headerStyles[headerStyle] || headerStyles.default}
        }
        
        .email-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
            animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .header-icon {
            font-size: 56px;
            margin-bottom: 20px;
            display: block;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
            animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
        }
        
        .email-header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 12px;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 8px rgba(0,0,0,0.2);
            color: white;
        }
        
        .email-header .subtitle {
            font-size: 18px;
            opacity: 0.95;
            font-weight: 500;
            position: relative;
            z-index: 1;
            color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .email-body {
            padding: 50px 40px;
            background: white;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 3px solid ${accentColor}40;
        }
        
        .content-section {
            margin-bottom: 32px;
        }
        
        .content-section p {
            margin-bottom: 20px;
            font-size: 16px;
            color: #475569;
            line-height: 1.7;
        }
        
        .feature-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 30px;
            margin: 32px 0;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        
        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 5px;
            height: 100%;
            background: ${accentColor};
            border-radius: 5px 0 0 5px;
        }
        
        .feature-card h3 {
            color: #0f172a;
            margin-bottom: 16px;
            font-size: 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .feature-card ul {
            list-style: none;
            padding: 0;
        }
        
        .feature-card li {
            padding: 12px 0;
            padding-left: 32px;
            position: relative;
            color: #475569;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .feature-card li:last-child {
            border-bottom: none;
        }
        
        .feature-card li:before {
            content: '✓';
            position: absolute;
            left: 0;
            color: ${accentColor};
            font-weight: bold;
            font-size: 16px;
            background: ${accentColor}15;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .action-button {
            display: inline-block;
            background: ${accentColor};
            color: white !important;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px ${accentColor}40;
            border: 2px solid ${accentColor};
            text-shadow: 0 1px 1px rgba(0,0,0,0.2);
        }
        
        .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px ${accentColor}60;
            background: ${accentColor}ee;
        }
        
        .button-center {
            text-align: center;
            margin: 40px 0;
        }
        
        .security-alert {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 1px solid #fecaca;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            border-left: 5px solid #dc2626;
        }
        
        .security-alert h3 {
            color: #dc2626;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .success-highlight {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 1px solid #bbf7d0;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            border-left: 5px solid #16a34a;
        }
        
        .success-highlight h3 {
            color: #166534;
            margin-bottom: 8px;
        }
        
        .footer {
            text-align: center;
            padding: 40px;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #cbd5e1;
        }
        
        .footer-logo {
            font-size: 24px;
            font-weight: 700;
            color: white;
            margin-bottom: 16px;
        }
        
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 24px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        
        .footer-links a {
            color: #94a3b8;
            text-decoration: none;
            transition: color 0.2s ease;
        }
        
        .footer-links a:hover {
            color: white;
        }
        
        .footer-copyright {
            margin-top: 24px;
            font-size: 14px;
            color: #64748b;
        }
        
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background: ${accentColor}15;
            color: ${accentColor};
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            margin: 10px 0;
            border: 1px solid ${accentColor}30;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .email-header {
                padding: 40px 20px 30px;
            }
            
            .email-body {
                padding: 40px 20px;
            }
            
            .email-header h1 {
                font-size: 26px;
            }
            
            .header-icon {
                font-size: 48px;
            }
            
            .footer-links {
                flex-direction: column;
                gap: 12px;
            }
            
            .greeting {
                font-size: 22px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-header">
            <span class="header-icon">${icon}</span>
            <h1>${options.title || 'JobConnect'}</h1>
            ${preheader ? `<div class="subtitle">${preheader}</div>` : ''}
        </div>
        
        <div class="email-body">
            ${content}
        </div>
        
        <div class="footer">
            <div class="footer-logo">JobConnect South Africa</div>
            <p>Connecting exceptional talent with extraordinary opportunities</p>
            
            <div class="footer-links">
                <a href="${EMAIL_CONFIG.company.website}">Visit Website</a>
                <a href="${EMAIL_CONFIG.company.website}/jobs">Browse Jobs</a>
                <a href="${EMAIL_CONFIG.company.website}/contact">Contact Support</a>
            </div>
            
            <div class="footer-copyright">
                &copy; ${new Date().getFullYear()} JobConnect South Africa. All rights reserved.<br>
                ${EMAIL_CONFIG.company.address}
            </div>
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
    <div class="feature-card">
      <h3>🎯 Your Path to Career Success</h3>
      <ul>
        <li><strong>Complete your professional profile</strong> - Showcase your unique skills and experience</li>
        <li><strong>Upload your resume</strong> - Let top employers discover your potential</li>
        <li><strong>Explore opportunities</strong> - Browse roles that match your ambitions</li>
        <li><strong>Set smart alerts</strong> - Get instant notifications about perfect matches</li>
      </ul>
    </div>
  ` : `
    <div class="feature-card">
      <h3>🚀 Build Your Dream Team</h3>
      <ul>
        <li><strong>Create your company profile</strong> - Showcase your culture and values</li>
        <li><strong>Post compelling job openings</strong> - Attract top-tier talent</li>
        <li><strong>Review qualified candidates</strong> - Find your perfect hires faster</li>
        <li><strong>Streamline your hiring</strong> - Manage everything in one place</li>
      </ul>
    </div>
  `;

  const content = `
    <div class="greeting">Welcome to JobConnect, ${userName}! 🎉</div>
    
    <div class="content-section">
      <p>We're absolutely thrilled to welcome you to <strong>JobConnect South Africa</strong>! You've just taken the first step toward ${isCandidate ? 'transforming your career journey' : 'revolutionizing your hiring process'}.</p>
      
      <p>At JobConnect, we believe in creating meaningful connections that drive success. Whether you're ${isCandidate ? 'seeking your next career move' : 'looking for exceptional talent'}, our platform is designed to make the process seamless and rewarding.</p>
    </div>
    
    ${nextSteps}
    
    <div class="button-center">
      <a href="${EMAIL_CONFIG.company.website}/dashboard" class="action-button">
        Launch Your Dashboard 🚀
      </a>
    </div>
    
    <div class="content-section">
      <p><strong>Need help getting started?</strong> Our dedicated support team is here to ensure your success.</p>
      <p>Welcome to the future of ${isCandidate ? 'career growth' : 'talent acquisition'}!</p>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'Welcome to JobConnect',
    preheader: `Your ${isCandidate ? 'dream career' : 'perfect team'} journey begins now`,
    icon: isCandidate ? '🎓' : '🏢',
    accentColor: isCandidate ? '#7c3aed' : '#059669',
    headerGradient: isCandidate 
      ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' 
      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    pattern: isCandidate ? 'waves' : 'geometric',
    headerStyle: 'modern'
  });

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== PASSWORD RESET EMAIL =====
export const sendPasswordResetEmail = async (userEmail, userName, resetURL) => {
  const subject = 'Secure Password Reset - JobConnect';
  
  const content = `
    <div class="greeting">Security Action Required, ${userName} 🔒</div>
    
    <div class="content-section">
      <p>We've received a request to reset your JobConnect account password. Your security is our top priority.</p>
      
      <p>Click the button below to create a new password and regain access to your account:</p>
    </div>
    
    <div class="button-center">
      <a href="${resetURL}" class="action-button">
        Reset My Password 🔑
      </a>
    </div>
    
    <div class="content-section">
      <p><strong>Important:</strong> This secure reset link will expire in <strong>10 minutes</strong> for your protection.</p>
    </div>
    
    <div class="security-alert">
      <h3>🛡️ Security Notice</h3>
      <p>If you did not initiate this password reset request, please disregard this email immediately. Your account remains secure.</p>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'Password Reset',
    preheader: 'Secure your account access - Action required',
    icon: '🔐',
    accentColor: '#dc2626',
    headerGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    pattern: 'grid',
    headerStyle: 'bold'
  });

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== PASSWORD RESET CONFIRMATION =====
export const sendPasswordResetConfirmation = async (userEmail, userName) => {
  const subject = 'Password Successfully Reset - JobConnect';
  
  const content = `
    <div class="greeting">Security Update Confirmed, ${userName} ✅</div>
    
    <div class="content-section">
      <p>Your JobConnect account password has been successfully reset and updated across all our systems.</p>
    </div>
    
    <div class="success-highlight">
      <h3>🔄 Password Update Complete</h3>
      <p>Your new password is now active. All previous login sessions have been automatically terminated for security.</p>
    </div>
    
    <div class="security-alert">
      <h3>⚠️ Security Verification</h3>
      <p>If you did not authorize this password change, please contact our support team immediately.</p>
    </div>
    
    <div class="button-center">
      <a href="${EMAIL_CONFIG.company.website}/security" class="action-button">
        Review Security Settings
      </a>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'Password Reset Complete',
    preheader: 'Your account security has been successfully restored',
    icon: '✅',
    accentColor: '#059669',
    headerGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    pattern: 'lines',
    headerStyle: 'elegant'
  });

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== PASSWORD CHANGE CONFIRMATION =====
export const sendPasswordChangeConfirmation = async (userEmail, userName) => {
  const subject = 'Password Updated Successfully - JobConnect';
  
  const content = `
    <div class="greeting">Security Settings Updated, ${userName} 🔐</div>
    
    <div class="content-section">
      <p>This email confirms that your JobConnect account password has been successfully updated and secured.</p>
    </div>
    
    <div class="success-highlight">
      <h3>✅ Password Change Confirmed</h3>
      <p>Your new password is now active across all devices and sessions.</p>
    </div>
    
    <div class="security-alert">
      <h3>🔒 Important Security Note</h3>
      <p>If you did not make this password change, please contact our support team immediately.</p>
    </div>
    
    <div class="button-center">
      <a href="${EMAIL_CONFIG.company.website}/security" class="action-button">
        Review Account Security
      </a>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'Password Updated',
    preheader: 'Your account security has been enhanced',
    icon: '🔒',
    accentColor: '#2563eb',
    headerGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    pattern: 'geometric',
    headerStyle: 'modern'
  });

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== APPLICATION CONFIRMATION =====
export const sendApplicationConfirmation = async (candidateEmail, jobTitle, companyName) => {
  const subject = `Application Confirmed: ${jobTitle} - ${companyName}`;
  
  const content = `
    <div class="greeting">Application Successfully Submitted! 🎉</div>
    
    <div class="content-section">
      <p>Congratulations! Your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been received and is now with the hiring team.</p>
    </div>
    
    <div class="feature-card">
      <h3>📈 What Happens Next?</h3>
      <ul>
        <li><strong>Application Review</strong> - The hiring team will review your qualifications</li>
        <li><strong>Candidate Screening</strong> - Initial assessments and profile matching</li>
        <li><strong>Direct Communication</strong> - You'll hear from ${companyName} regarding next steps</li>
        <li><strong>Interview Process</strong> - Potential interviews or additional assessments</li>
      </ul>
    </div>
    
    <div class="button-center">
      <a href="${EMAIL_CONFIG.company.website}/jobs" class="action-button">
        Discover More Opportunities ✨
      </a>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'Application Submitted',
    preheader: `Your journey with ${companyName} begins now`,
    icon: '📨',
    accentColor: '#3b82f6',
    headerGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    pattern: 'dots',
    headerStyle: 'elegant'
  });

  const result = await sendEmail(candidateEmail, subject, html);
  return result.success;
};

// ===== NEW APPLICATION NOTIFICATION =====
export const sendNewApplicationNotification = async (employerEmail, candidateName, jobTitle) => {
  const subject = `🌟 New Talent Alert: ${candidateName} for ${jobTitle}`;
  
  const content = `
    <div class="greeting">Exciting New Candidate! 🎯</div>
    
    <div class="content-section">
      <p>Great news! You have a new qualified candidate application for your <strong>${jobTitle}</strong> position.</p>
    </div>
    
    <div class="feature-card">
      <h3>👤 Candidate Snapshot</h3>
      <ul>
        <li><strong>Candidate Name:</strong> ${candidateName}</li>
        <li><strong>Position Applied:</strong> ${jobTitle}</li>
        <li><strong>Application Date:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
        <li><strong>Response Time:</strong> Recommended within 48 hours</li>
      </ul>
    </div>
    
    <div class="button-center">
      <a href="${EMAIL_CONFIG.company.website}/employer/dashboard" class="action-button">
        Review Application Now 📋
      </a>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'New Application',
    preheader: `Fresh talent for ${jobTitle} - Review now`,
    icon: '🌟',
    accentColor: '#f59e0b',
    headerGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    pattern: 'grid',
    headerStyle: 'modern'
  });

  const result = await sendEmail(employerEmail, subject, html);
  return result.success;
};

// ===== APPLICATION STATUS NOTIFICATION =====
export const sendApplicationStatusNotification = async (candidateEmail, candidateName, jobTitle, companyName, status, employerName) => {
  let subject, content, designConfig;

  switch (status) {
    case 'accepted':
      subject = `Congratulations! You're Moving Forward: ${jobTitle} at ${companyName}`;
      designConfig = {
        icon: '🎊',
        accentColor: '#059669',
        headerGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        pattern: 'waves',
        headerStyle: 'modern'
      };
      content = `
        <div class="greeting">Outstanding News, ${candidateName}! 🎉</div>
        
        <div class="content-section">
          <p>We are delighted to inform you that your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been <strong style="color: #059669;">accepted</strong>!</p>
          
          <p>The hiring team at ${companyName}, led by ${employerName}, was impressed with your qualifications.</p>
          
          <div class="status-badge">Status: Advanced to Next Stage</div>
        </div>
        
        <div class="feature-card">
          <h3>🚀 Your Next Career Milestone</h3>
          <ul>
            <li><strong>Direct Contact</strong> - Expect to hear from ${employerName} within 2-3 business days</li>
            <li><strong>Interview Preparation</strong> - Start preparing for the next stage</li>
            <li><strong>Company Research</strong> - Deep dive into ${companyName}'s culture</li>
            <li><strong>Availability Planning</strong> - Consider your schedule for interviews</li>
          </ul>
        </div>
        
        <div class="button-center">
          <a href="${EMAIL_CONFIG.company.website}/preparation/interview" class="action-button">
            Prepare for Success 📚
          </a>
        </div>
      `;
      break;
    
    case 'rejected':
      subject = `Update on Your Application: ${jobTitle} at ${companyName}`;
      designConfig = {
        icon: '💫',
        accentColor: '#6b7280',
        headerGradient: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
        pattern: 'lines',
        headerStyle: 'elegant'
      };
      content = `
        <div class="greeting">Dear ${candidateName},</div>
        
        <div class="content-section">
          <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
          
          <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates.</p>
          
          <div class="status-badge">Status: Not Selected for This Role</div>
        </div>
        
        <div class="feature-card">
          <h3>🌟 Your Journey Continues</h3>
          <ul>
            <li><strong>This Isn't The End</strong> - This decision is specific to this role</li>
            <li><strong>Valuable Experience</strong> - Each application strengthens your skills</li>
            <li><strong>Network Growth</strong> - You've made a connection with ${companyName}</li>
            <li><strong>Future Opportunities</strong> - Your profile remains in their database</li>
          </ul>
        </div>
        
        <div class="button-center">
          <a href="${EMAIL_CONFIG.company.website}/jobs" class="action-button">
            Discover New Opportunities 🔍
          </a>
        </div>
      `;
      break;
    
    case 'reviewed':
      subject = `Great News! Your Application is Being Actively Reviewed: ${jobTitle}`;
      designConfig = {
        icon: '📊',
        accentColor: '#3b82f6',
        headerGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        pattern: 'geometric',
        headerStyle: 'modern'
      };
      content = `
        <div class="greeting">Progress Update, ${candidateName}! 📈</div>
        
        <div class="content-section">
          <p>Excellent news! Your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has passed initial screening and is now under active review.</p>
          
          <div class="status-badge">Status: Under Active Review</div>
        </div>
        
        <div class="feature-card">
          <h3>⏳ Current Status: In Active Consideration</h3>
          <ul>
            <li><strong>Application Status</strong> - Successfully advanced to review stage</li>
            <li><strong>Next Phase</strong> - Comprehensive evaluation by hiring team</li>
            <li><strong>Expected Timeline</strong> - Typically 1-2 weeks for this stage</li>
            <li><strong>Preparation Advised</strong> - Be ready for potential next steps</li>
          </ul>
        </div>
        
        <div class="button-center">
          <a href="${EMAIL_CONFIG.company.website}/profile" class="action-button">
            Optimize Your Profile ✨
          </a>
        </div>
      `;
      break;
    
    default:
      return false;
  }

  const html = getBaseTemplate(content, {
    title: 'Application Status Update',
    preheader: `Important update regarding ${jobTitle}`,
    ...designConfig
  });

  const result = await sendEmail(candidateEmail, subject, html);
  return result.success;
};