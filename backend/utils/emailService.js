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

// Base email template with design variations
const getBaseTemplate = (content, options = {}) => {
  const { 
    preheader = '', 
    designType = 'default',
    accentColor = '#2563eb',
    headerGradient = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    pattern = 'none'
  } = options;
  
  const patterns = {
    dots: `background-image: radial-gradient(${accentColor}20 1px, transparent 1px); background-size: 20px 20px;`,
    lines: `background: linear-gradient(90deg, transparent 50%, ${accentColor}08 50%); background-size: 20px 100%;`,
    grid: `background-image: linear-gradient(${accentColor}10 1px, transparent 1px), linear-gradient(90deg, ${accentColor}10 1px, transparent 1px); background-size: 20px 20px;`,
    none: ''
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
        
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04);
            border: 1px solid #e2e8f0;
        }
        
        .email-header {
            background: ${headerGradient};
            padding: 50px 40px 40px;
            text-align: center;
            color: white;
            position: relative;
            overflow: hidden;
            ${patterns[pattern]}
        }
        
        .email-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
            animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .header-icon {
            font-size: 48px;
            margin-bottom: 20px;
            display: block;
        }
        
        .email-header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 12px;
            position: relative;
            z-index: 1;
        }
        
        .email-header .subtitle {
            font-size: 18px;
            opacity: 0.95;
            font-weight: 400;
            position: relative;
            z-index: 1;
        }
        
        .email-body {
            padding: 50px 40px;
        }
        
        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 24px;
            border-bottom: 2px solid ${accentColor}20;
            padding-bottom: 16px;
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
        }
        
        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: ${accentColor};
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
            font-size: 18px;
        }
        
        .action-button {
            display: inline-block;
            background: ${accentColor};
            color: white;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            border: 2px solid transparent;
        }
        
        .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            background: transparent;
            color: ${accentColor};
            border-color: ${accentColor};
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
            border-left: 4px solid #dc2626;
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
            border-left: 4px solid #16a34a;
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
                font-size: 28px;
            }
            
            .header-icon {
                font-size: 40px;
            }
            
            .footer-links {
                flex-direction: column;
                gap: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-header">
            <span class="header-icon">${options.icon || '💼'}</span>
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
      <h3>🎯 Your Path to Success</h3>
      <ul>
        <li><strong>Complete your professional profile</strong> - Showcase your unique skills and experience</li>
        <li><strong>Upload your resume</strong> - Let employers discover your potential</li>
        <li><strong>Explore opportunities</strong> - Find roles that match your ambitions</li>
        <li><strong>Set smart alerts</strong> - Get notified about perfect matches</li>
      </ul>
    </div>
  ` : `
    <div class="feature-card">
      <h3>🚀 Build Your Dream Team</h3>
      <ul>
        <li><strong>Create your company profile</strong> - Showcase your culture and values</li>
        <li><strong>Post compelling job openings</strong> - Attract top-tier talent</li>
        <li><strong>Review qualified candidates</strong> - Find your perfect match efficiently</li>
        <li><strong>Streamline hiring</strong> - Use our tools to manage the process</li>
      </ul>
    </div>
  `;

  const content = `
    <div class="greeting">Welcome aboard, ${userName}! 👋</div>
    
    <div class="content-section">
      <p>We're absolutely thrilled to welcome you to <strong>JobConnect South Africa</strong>! As a ${role}, you're about to embark on an exciting journey that will transform ${isCandidate ? 'your career path' : 'your hiring experience'}.</p>
      
      <p>Our platform is built with one goal in mind: to create meaningful connections between exceptional talent and forward-thinking companies. We believe you'll find exactly what you're looking for here.</p>
    </div>
    
    ${nextSteps}
    
    <div class="button-center">
      <a href="${EMAIL_CONFIG.company.website}/dashboard" class="action-button">
        Launch Your Dashboard 🚀
      </a>
    </div>
    
    <div class="content-section">
      <p>Our dedicated support team is here to ensure your success. Don't hesitate to reach out if you need any guidance along the way.</p>
      <p>Welcome to the future of ${isCandidate ? 'career growth' : 'talent acquisition'}!</p>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'Welcome to JobConnect',
    preheader: `Your ${isCandidate ? 'dream career' : 'perfect team'} awaits`,
    icon: isCandidate ? '🎓' : '🏢',
    accentColor: isCandidate ? '#7c3aed' : '#059669',
    headerGradient: isCandidate 
      ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' 
      : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    pattern: 'dots'
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
      <p>We've received a request to reset your JobConnect account password. To ensure the security of your account, please use the secure link below to create a new password:</p>
    </div>
    
    <div class="button-center">
      <a href="${resetURL}" class="action-button">
        Reset Password Now 🔑
      </a>
    </div>
    
    <div class="content-section">
      <p><strong>Important Security Notice:</strong> This reset link is a one-time use token that will expire in <strong>10 minutes</strong> for your protection.</p>
    </div>
    
    <div class="security-alert">
      <h3>🛡️ Security Advisory</h3>
      <p>If you did not initiate this password reset request, please disregard this email immediately. Your account remains secure, and no changes have been made. For added security, we recommend enabling two-factor authentication in your account settings.</p>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'Password Reset',
    preheader: 'Secure your account access',
    icon: '🔐',
    accentColor: '#dc2626',
    headerGradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    pattern: 'grid'
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
      <p>Your account security has been successfully restored. All previous sessions have been logged out, and you'll need to use your new password for future sign-ins.</p>
    </div>
    
    <div class="security-alert">
      <h3>⚠️ Security Verification Request</h3>
      <p>If you did not authorize this password change, please contact our support team immediately. We take account security seriously and will help you secure your account.</p>
    </div>
    
    <div class="button-center">
      <a href="${EMAIL_CONFIG.company.website}/security" class="action-button">
        Review Security Settings
      </a>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'Password Reset Complete',
    preheader: 'Your account security has been restored',
    icon: '✅',
    accentColor: '#059669',
    headerGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    pattern: 'lines'
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
      <p>Congratulations! Your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been received and is now in the hands of the hiring team.</p>
    </div>
    
    <div class="feature-card">
      <h3>📈 What Happens Next?</h3>
      <ul>
        <li><strong>Application Review</strong> - The hiring team will carefully review your qualifications</li>
        <li><strong>Candidate Screening</strong> - Initial assessments and profile matching</li>
        <li><strong>Direct Communication</strong> - You'll hear directly from ${companyName} regarding next steps</li>
        <li><strong>Interview Process</strong> - Potential interviews or additional assessments</li>
      </ul>
    </div>
    
    <div class="content-section">
      <p>While you await a response, why not explore other exciting opportunities that match your profile? The perfect role might be just one click away!</p>
    </div>
    
    <div class="button-center">
      <a href="${EMAIL_CONFIG.company.website}/jobs" class="action-button">
        Discover More Opportunities ✨
      </a>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'Application Submitted',
    preheader: `Your journey with ${companyName} begins`,
    icon: '📨',
    accentColor: '#3b82f6',
    headerGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    pattern: 'dots'
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
    
    <div class="content-section">
      <p>Prompt responses significantly improve candidate experience and increase your chances of securing top talent. Don't let this exceptional candidate slip away!</p>
    </div>
    
    <div class="button-center">
      <a href="${EMAIL_CONFIG.company.website}/employer/dashboard" class="action-button">
        Review Application Now 📋
      </a>
    </div>
    
    <div class="content-section">
      <p><strong>Pro Tip:</strong> Use our smart matching tools to quickly compare this candidate's qualifications with your role requirements.</p>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'New Application',
    preheader: `Fresh talent for ${jobTitle}`,
    icon: '🌟',
    accentColor: '#f59e0b',
    headerGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    pattern: 'grid'
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
        headerGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        pattern: 'dots'
      };
      content = `
        <div class="greeting">Outstanding News, ${candidateName}! 🎉</div>
        
        <div class="content-section">
          <p>We are absolutely delighted to inform you that your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been <strong style="color: #059669;">accepted</strong>!</p>
          
          <p>The hiring team at ${companyName}, led by ${employerName}, was particularly impressed with your qualifications and believes you could be a great fit for their organization.</p>
        </div>
        
        <div class="feature-card">
          <h3>🚀 Your Next Career Milestone</h3>
          <ul>
            <li><strong>Direct Contact</strong> - Expect to hear from ${employerName} within the next 2-3 business days</li>
            <li><strong>Interview Preparation</strong> - Start preparing for the next stage of the process</li>
            <li><strong>Company Research</strong> - Deep dive into ${companyName}'s culture and recent achievements</li>
            <li><strong>Availability Planning</strong> - Consider your schedule for potential interviews</li>
          </ul>
        </div>
        
        <div class="content-section">
          <p>This is an exciting step forward in your career journey! The ${companyName} team is looking forward to learning more about how you can contribute to their success.</p>
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
        headerGradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
        pattern: 'lines'
      };
      content = `
        <div class="greeting">Dear ${candidateName},</div>
        
        <div class="content-section">
          <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> and for the time and effort you invested in your application.</p>
          
          <p>After careful consideration of many qualified applicants, we regret to inform you that we have decided to move forward with other candidates whose experience more closely aligns with our current needs.</p>
        </div>
        
        <div class="feature-card">
          <h3>🌟 Your Journey Continues</h3>
          <ul>
            <li><strong>This Isn't The End</strong> - This decision is specific to this role and timing</li>
            <li><strong>Valuable Experience</strong> - Each application strengthens your interview skills</li>
            <li><strong>Network Growth</strong> - You've made a connection with ${companyName}</li>
            <li><strong>Future Opportunities</strong> - Your profile remains in their talent database</li>
          </ul>
        </div>
        
        <div class="content-section">
          <p>We encourage you to view this as a stepping stone rather than a setback. The right opportunity is out there, and we're committed to helping you find it.</p>
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
        headerGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        pattern: 'grid'
      };
      content = `
        <div class="greeting">Progress Update, ${candidateName}! 📈</div>
        
        <div class="content-section">
          <p>Excellent news! Your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has passed initial screening and is now under active review by the hiring team.</p>
        </div>
        
        <div class="feature-card">
          <h3>⏳ Current Status: In Active Consideration</h3>
          <ul>
            <li><strong>Application Status</strong> - Successfully advanced to review stage</li>
            <li><strong>Next Phase</strong> - Detailed evaluation by ${companyName}'s team</li>
            <li><strong>Expected Timeline</strong> - Typically 1-2 weeks for this stage</li>
            <li><strong>Preparation Advised</strong> - Be ready for potential next steps</li>
          </ul>
        </div>
        
        <div class="content-section">
          <p>This is a positive indication that your qualifications have caught their attention. Now is the perfect time to ensure you're prepared for potential follow-up communication.</p>
        </div>
        
        <div class="button-center">
          <a href="${EMAIL_CONFIG.company.website}/profile" class="action-button">
            Optimize Your Profile ✨
          </a>
        </div>
        
        <div class="content-section">
          <p><strong>Stay Accessible:</strong> Please keep your phone and email accessible, as ${companyName} may reach out directly for additional information or to schedule an interview.</p>
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