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

// Enhanced base email template with unique design variations
const getBaseTemplate = (content, options = {}) => {
  const { 
    preheader = '', 
    designType = 'default',
    accentColor = '#2563eb',
    headerGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon = '💼',
    pattern = 'geometric'
  } = options;
  
  const patterns = {
    geometric: `
      background-image: 
        radial-gradient(circle at 20% 80%, ${accentColor}15 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${accentColor}10 0%, transparent 50%),
        linear-gradient(45deg, transparent 40%, ${accentColor}08 50%, transparent 60%);
    `,
    dots: `
      background-image: 
        radial-gradient(${accentColor}20 1.5px, transparent 1.5px),
        radial-gradient(${accentColor}15 1px, transparent 1px);
      background-size: 30px 30px, 20px 20px;
      background-position: 0 0, 15px 15px;
    `,
    lines: `
      background: 
        linear-gradient(90deg, transparent 49%, ${accentColor}08 50%, transparent 51%),
        linear-gradient(transparent 49%, ${accentColor}08 50%, transparent 51%);
      background-size: 30px 30px;
    `,
    waves: `
      background-image: 
        radial-gradient(circle at 100% 50%, ${accentColor}10 20%, transparent 21%),
        radial-gradient(circle at 0% 50%, ${accentColor}08 20%, transparent 21%);
      background-size: 40px 40px;
    `,
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
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
        }
        
        .email-header {
            background: ${headerGradient};
            padding: 60px 40px 40px;
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
            font-size: 64px;
            margin-bottom: 20px;
            display: block;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
            animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
        }
        
        .email-header h1 {
            font-size: 36px;
            font-weight: 800;
            margin-bottom: 12px;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
            background: white;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 3px solid ${accentColor}30;
            background: linear-gradient(135deg, ${accentColor}, #0f172a);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
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
            border-radius: 16px;
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
            width: 6px;
            height: 100%;
            background: ${accentColor};
            border-radius: 6px 0 0 6px;
        }
        
        .feature-card h3 {
            color: #0f172a;
            margin-bottom: 16px;
            font-size: 20px;
            font-weight: 700;
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
            transition: all 0.3s ease;
        }
        
        .feature-card li:hover {
            background: rgba(255, 255, 255, 0.5);
            transform: translateX(5px);
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
            background: ${accentColor}15;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .action-button {
            display: inline-block;
            background: ${accentColor};
            color: white;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px ${accentColor}40;
            border: 2px solid transparent;
            position: relative;
            overflow: hidden;
        }
        
        .action-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s;
        }
        
        .action-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px ${accentColor}60;
        }
        
        .action-button:hover::before {
            left: 100%;
        }
        
        .button-center {
            text-align: center;
            margin: 40px 0;
        }
        
        .security-alert {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 1px solid #fecaca;
            border-radius: 16px;
            padding: 24px;
            margin: 32px 0;
            border-left: 6px solid #dc2626;
            position: relative;
            overflow: hidden;
        }
        
        .security-alert::before {
            content: '⚠️';
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 24px;
            opacity: 0.1;
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
            border-radius: 16px;
            padding: 24px;
            margin: 32px 0;
            border-left: 6px solid #16a34a;
            position: relative;
            overflow: hidden;
        }
        
        .success-highlight::before {
            content: '✅';
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 24px;
            opacity: 0.1;
        }
        
        .footer {
            text-align: center;
            padding: 40px;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #cbd5e1;
            position: relative;
            overflow: hidden;
        }
        
        .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, ${accentColor}, transparent);
        }
        
        .footer-logo {
            font-size: 24px;
            font-weight: 800;
            color: white;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #fff, ${accentColor});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
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
            transition: all 0.3s ease;
            padding: 8px 16px;
            border-radius: 8px;
        }
        
        .footer-links a:hover {
            color: white;
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
        }
        
        .footer-copyright {
            margin-top: 24px;
            font-size: 14px;
            color: #64748b;
        }
        
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background: ${accentColor}20;
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
                font-size: 28px;
            }
            
            .header-icon {
                font-size: 48px;
            }
            
            .footer-links {
                flex-direction: column;
                gap: 12px;
            }
            
            .greeting {
                font-size: 20px;
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
                <a href="${EMAIL_CONFIG.company.website}/privacy">Privacy Policy</a>
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
        <li><strong>Complete your professional profile</strong> - Showcase your unique skills and experience with a compelling profile</li>
        <li><strong>Upload your resume</strong> - Let top employers discover your potential and reach out to you</li>
        <li><strong>Explore opportunities</strong> - Browse thousands of roles that match your ambitions and skills</li>
        <li><strong>Set smart alerts</strong> - Get instant notifications about perfect job matches</li>
        <li><strong>Build your network</strong> - Connect with industry professionals and recruiters</li>
      </ul>
    </div>
  ` : `
    <div class="feature-card">
      <h3>🚀 Build Your Dream Team</h3>
      <ul>
        <li><strong>Create your company profile</strong> - Showcase your culture, values, and what makes you unique</li>
        <li><strong>Post compelling job openings</strong> - Attract top-tier talent with engaging job descriptions</li>
        <li><strong>Review qualified candidates</strong> - Use our smart matching to find your perfect hires faster</li>
        <li><strong>Streamline your hiring process</strong> - Manage applications, interviews, and communications in one place</li>
        <li><strong>Access premium talent</strong> - Reach passive candidates who aren't actively looking</li>
      </ul>
    </div>
  `;

  const content = `
    <div class="greeting">Welcome to JobConnect, ${userName}! 🎉</div>
    
    <div class="content-section">
      <p>We're absolutely thrilled to welcome you to <strong>JobConnect South Africa</strong>! You've just taken the first step toward ${isCandidate ? 'transforming your career journey' : 'revolutionizing your hiring process'}.</p>
      
      <p>At JobConnect, we believe in creating meaningful connections that drive success. Whether you're ${isCandidate ? 'seeking your next career move' : 'looking for exceptional talent'}, our platform is designed to make the process seamless, efficient, and rewarding.</p>
    </div>
    
    ${nextSteps}
    
    <div class="button-center">
      <a href="${EMAIL_CONFIG.company.website}/dashboard" class="action-button">
        Launch Your Dashboard 🚀
      </a>
    </div>
    
    <div class="content-section">
      <p><strong>Need help getting started?</strong> Our dedicated support team is here to ensure your success. Don't hesitate to reach out if you need any guidance along the way.</p>
      <p>Welcome to the future of ${isCandidate ? 'career growth' : 'talent acquisition'} - we can't wait to see what you'll achieve!</p>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'Welcome to JobConnect',
    preheader: `Your ${isCandidate ? 'dream career' : 'perfect team'} journey begins now`,
    icon: isCandidate ? '🎓' : '🏢',
    accentColor: isCandidate ? '#7c3aed' : '#059669',
    headerGradient: isCandidate 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    pattern: isCandidate ? 'waves' : 'geometric'
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
      <p>We've received a request to reset your JobConnect account password. Your security is our top priority, so we've generated a secure reset link just for you.</p>
      
      <p>Click the button below to create a new, strong password and regain access to your account:</p>
    </div>
    
    <div class="button-center">
      <a href="${resetURL}" class="action-button">
        Reset My Password 🔑
      </a>
    </div>
    
    <div class="content-section">
      <p><strong>Important:</strong> This secure reset link will expire in <strong>10 minutes</strong> for your protection. If you don't use it within this time, you'll need to request another reset link.</p>
    </div>
    
    <div class="security-alert">
      <h3>🛡️ Security Notice</h3>
      <p>If you did not initiate this password reset request, please disregard this email immediately. Your account remains secure, and no changes have been made. For enhanced security, we recommend enabling two-factor authentication in your account settings.</p>
    </div>
    
    <div class="content-section">
      <p>Stay secure,<br><strong>The JobConnect Security Team</strong></p>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'Password Reset',
    preheader: 'Secure your account access - Action required',
    icon: '🔐',
    accentColor: '#dc2626',
    headerGradient: 'linear-gradient(135deg, #fc8181 0%, #e53e3e 100%)',
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
      <p>Your JobConnect account password has been successfully reset and updated across all our systems. Your account security has been restored.</p>
    </div>
    
    <div class="success-highlight">
      <h3>🔄 Password Update Complete</h3>
      <p>Your new password is now active. For security purposes, all previous login sessions have been automatically terminated. You'll need to use your new password for all future sign-ins.</p>
    </div>
    
    <div class="security-alert">
      <h3>⚠️ Security Verification</h3>
      <p>If you did not authorize this password change, please contact our support team immediately. We take account security seriously and will help you secure your account right away.</p>
    </div>
    
    <div class="button-center">
      <a href="${EMAIL_CONFIG.company.website}/security" class="action-button">
        Review Security Settings
      </a>
    </div>
    
    <div class="content-section">
      <p>Thank you for helping us keep your account secure. We're committed to protecting your information and providing a safe platform for your ${userName.includes('@') ? 'job search or hiring needs' : 'professional journey'}.</p>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'Password Reset Complete',
    preheader: 'Your account security has been successfully restored',
    icon: '✅',
    accentColor: '#059669',
    headerGradient: 'linear-gradient(135deg, #68d391 0%, #38a169 100%)',
    pattern: 'lines'
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
      <p>This email confirms that your JobConnect account password has been successfully updated and secured. Your proactive approach to security helps protect your account and personal information.</p>
    </div>
    
    <div class="success-highlight">
      <h3>✅ Password Change Confirmed</h3>
      <p>Your new password is now active across all devices and sessions. You will be required to use these updated credentials for all future sign-ins to your account.</p>
    </div>
    
    <div class="content-section">
      <p>For security purposes, this change has been logged in our system. All existing sessions have been terminated to ensure your account remains protected across all devices.</p>
    </div>
    
    <div class="security-alert">
      <h3>🔒 Important Security Note</h3>
      <p>If you did not make this password change, please contact our support team immediately so we can help secure your account and investigate this activity.</p>
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
    headerGradient: 'linear-gradient(135deg, #63b3ed 0%, #3182ce 100%)',
    pattern: 'geometric'
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
      
      <p>Your application has been timestamped and added to their candidate pipeline. The ${companyName} recruitment team will review your qualifications and get back to you soon.</p>
    </div>
    
    <div class="feature-card">
      <h3>📈 What Happens Next?</h3>
      <ul>
        <li><strong>Application Review</strong> - The hiring team will carefully review your qualifications against their requirements</li>
        <li><strong>Candidate Screening</strong> - Initial assessments and profile matching to shortlist candidates</li>
        <li><strong>Direct Communication</strong> - You'll hear directly from ${companyName} regarding next steps if you're shortlisted</li>
        <li><strong>Interview Process</strong> - Potential interviews, assessments, or additional evaluation stages</li>
        <li><strong>Final Decision</strong> - The hiring team will make their selection and notify all candidates</li>
      </ul>
    </div>
    
    <div class="content-section">
      <p><strong>Tip:</strong> While you await a response, why not explore other exciting opportunities that match your profile? The perfect role might be just one click away!</p>
    </div>
    
    <div class="button-center">
      <a href="${EMAIL_CONFIG.company.website}/jobs" class="action-button">
        Discover More Opportunities ✨
      </a>
    </div>
    
    <div class="content-section">
      <p>We wish you the best of luck with your application! Remember, every application is a step forward in your career journey.</p>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'Application Submitted',
    preheader: `Your journey with ${companyName} begins now`,
    icon: '📨',
    accentColor: '#3b82f6',
    headerGradient: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
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
      <p>Great news! You have a new qualified candidate application for your <strong>${jobTitle}</strong> position. This could be your next great hire!</p>
    </div>
    
    <div class="feature-card">
      <h3>👤 Candidate Snapshot</h3>
      <ul>
        <li><strong>Candidate Name:</strong> ${candidateName}</li>
        <li><strong>Position Applied:</strong> ${jobTitle}</li>
        <li><strong>Application Date:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
        <li><strong>Application Time:</strong> ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</li>
        <li><strong>Recommended Action:</strong> Review within 48 hours for best candidate experience</li>
      </ul>
    </div>
    
    <div class="content-section">
      <p>Prompt responses significantly improve candidate experience and increase your chances of securing top talent. Don't let this exceptional candidate slip away!</p>
      
      <p><strong>Best Practice:</strong> Aim to review applications within 48 hours to maintain candidate engagement and competitive advantage in the talent market.</p>
    </div>
    
    <div class="button-center">
      <a href="${EMAIL_CONFIG.company.website}/employer/dashboard" class="action-button">
        Review Application Now 📋
      </a>
    </div>
    
    <div class="content-section">
      <p><strong>Pro Tip:</strong> Use our smart matching tools to quickly compare this candidate's qualifications with your role requirements and identify the best fits faster.</p>
    </div>
  `;

  const html = getBaseTemplate(content, {
    title: 'New Application',
    preheader: `Fresh talent for ${jobTitle} - Review now`,
    icon: '🌟',
    accentColor: '#f59e0b',
    headerGradient: 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)',
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
        headerGradient: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
        pattern: 'waves'
      };
      content = `
        <div class="greeting">Outstanding News, ${candidateName}! 🎉</div>
        
        <div class="content-section">
          <p>We are absolutely delighted to inform you that your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been <strong style="color: #059669;">accepted</strong>!</p>
          
          <p>The hiring team at ${companyName}, led by ${employerName}, was particularly impressed with your qualifications and believes you could be a great fit for their organization.</p>
          
          <div class="status-badge">Status: Advanced to Next Stage</div>
        </div>
        
        <div class="feature-card">
          <h3>🚀 Your Next Career Milestone</h3>
          <ul>
            <li><strong>Direct Contact</strong> - Expect to hear from ${employerName} or their team within the next 2-3 business days</li>
            <li><strong>Interview Preparation</strong> - Start preparing for the next stage of the selection process</li>
            <li><strong>Company Research</strong> - Deep dive into ${companyName}'s culture, values, and recent achievements</li>
            <li><strong>Availability Planning</strong> - Consider your schedule for potential interviews or assessments</li>
            <li><strong>Questions Preparation</strong> - Prepare thoughtful questions about the role and company</li>
          </ul>
        </div>
        
        <div class="content-section">
          <p>This is an exciting step forward in your career journey! The ${companyName} team is looking forward to learning more about how you can contribute to their success.</p>
          
          <p><strong>Remember:</strong> This is your opportunity to learn about them as much as they're learning about you. Make sure it's the right fit for your career goals too!</p>
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
        headerGradient: 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)',
        pattern: 'lines'
      };
      content = `
        <div class="greeting">Dear ${candidateName},</div>
        
        <div class="content-section">
          <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> and for the time and effort you invested in your application.</p>
          
          <p>After careful consideration of many qualified applicants, we regret to inform you that we have decided to move forward with other candidates whose experience more closely aligns with our current needs.</p>
          
          <div class="status-badge">Status: Not Selected for This Role</div>
        </div>
        
        <div class="feature-card">
          <h3>🌟 Your Journey Continues</h3>
          <ul>
            <li><strong>This Isn't The End</strong> - This decision is specific to this role and timing, not a reflection of your potential</li>
            <li><strong>Valuable Experience</strong> - Each application strengthens your interview skills and market understanding</li>
            <li><strong>Network Growth</strong> - You've made a connection with ${companyName} that could be valuable in the future</li>
            <li><strong>Future Opportunities</strong> - Your profile remains in their talent database for future roles</li>
            <li><strong>Continuous Improvement</strong> - Use this experience to refine your approach for next time</li>
          </ul>
        </div>
        
        <div class="content-section">
          <p>We encourage you to view this as a stepping stone rather than a setback. The right opportunity is out there, and we're committed to helping you find it.</p>
          
          <p><strong>Remember:</strong> Even the most successful professionals faced rejection on their path to finding the perfect role.</p>
        </div>
        
        <div class="button-center">
          <a href="${EMAIL_CONFIG.company.website}/jobs" class="action-button">
            Discover New Opportunities 🔍
          </a>
        </div>
        
        <div class="content-section">
          <p>Stay persistent and keep refining your approach. The perfect role that matches your unique skills and aspirations is waiting for you.</p>
        </div>
      `;
      break;
    
    case 'reviewed':
      subject = `Great News! Your Application is Being Actively Reviewed: ${jobTitle}`;
      designConfig = {
        icon: '📊',
        accentColor: '#3b82f6',
        headerGradient: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
        pattern: 'geometric'
      };
      content = `
        <div class="greeting">Progress Update, ${candidateName}! 📈</div>
        
        <div class="content-section">
          <p>Excellent news! Your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has passed initial screening and is now under active review by the hiring team.</p>
          
          <div class="status-badge">Status: Under Active Review</div>
        </div>
        
        <div class="feature-card">
          <h3>⏳ Current Status: In Active Consideration</h3>
          <ul>
            <li><strong>Application Status</strong> - Successfully advanced to detailed review stage</li>
            <li><strong>Next Phase</strong> - Comprehensive evaluation by ${companyName}'s hiring team</li>
            <li><strong>Expected Timeline</strong> - Typically 1-2 weeks for this detailed assessment stage</li>
            <li><strong>Preparation Advised</strong> - Be ready for potential next steps including interviews</li>
            <li><strong>Communication</strong> - You'll be notified as soon as there's an update</li>
          </ul>
        </div>
        
        <div class="content-section">
          <p>This is a positive indication that your qualifications have caught their attention. Now is the perfect time to ensure you're prepared for potential follow-up communication.</p>
          
          <p><strong>Tip:</strong> Use this time to research ${companyName} more deeply and prepare thoughtful questions about the role and team.</p>
        </div>
        
        <div class="button-center">
          <a href="${EMAIL_CONFIG.company.website}/profile" class="action-button">
            Optimize Your Profile ✨
          </a>
        </div>
        
        <div class="content-section">
          <p><strong>Stay Accessible:</strong> Please keep your phone and email accessible, as ${companyName} may reach out directly for additional information or to schedule an interview.</p>
          
          <p>We'll continue to keep you updated on any progress. Best of luck as you move through this process!</p>
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