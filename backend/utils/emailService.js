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
  const isCandidate = role === 'candidate';
  const headerColor = isCandidate ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  const buttonColor = isCandidate ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  const icon = isCandidate ? '🎓' : '🏢';
  
  const subject = `Welcome to JobConnect - Begin Your ${isCandidate ? 'Career Journey' : 'Hiring Success'}`;
  const html = `
    <div style="font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background: white; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; background: ${headerColor}; padding: 50px 40px 40px; border-radius: 16px 16px 0 0; color: white; position: relative; overflow: hidden;">
        <div style="font-size: 56px; margin-bottom: 20px; display: block; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">${icon}</div>
        <h1 style="margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">Welcome to JobConnect!</h1>
        <div style="font-size: 18px; opacity: 0.95; font-weight: 500; margin-top: 12px;">Your ${isCandidate ? 'dream career' : 'perfect team'} journey begins now</div>
      </div>
      
      <div style="padding: 50px 40px;">
        <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid ${isCandidate ? '#7c3aed40' : '#05966940'};">Welcome to JobConnect, ${userName}! 🎉</h2>
        
        <div style="color: #475569; line-height: 1.7; font-size: 16px; margin-bottom: 20px;">
          <p>We're absolutely thrilled to welcome you to <strong>JobConnect South Africa</strong>! You've just taken the first step toward ${isCandidate ? 'transforming your career journey' : 'revolutionizing your hiring process'}.</p>
          <p>At JobConnect, we believe in creating meaningful connections that drive success. Whether you're ${isCandidate ? 'seeking your next career move' : 'looking for exceptional talent'}, our platform is designed to make the process seamless and rewarding.</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; margin: 32px 0; position: relative; overflow: hidden; border-left: 5px solid ${isCandidate ? '#7c3aed' : '#059669'};">
          <h3 style="color: #0f172a; margin-bottom: 16px; font-size: 20px; font-weight: 600;">${isCandidate ? '🎯 Your Path to Career Success' : '🚀 Build Your Dream Team'}</h3>
          <ul style="list-style: none; padding: 0; color: #475569;">
            ${isCandidate ? `
            <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
              <strong>Complete your professional profile</strong> - Showcase your unique skills and experience
            </li>
            <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
              <strong>Upload your resume</strong> - Let top employers discover your potential
            </li>
            <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
              <strong>Explore opportunities</strong> - Browse roles that match your ambitions
            </li>
            <li style="padding: 12px 0; padding-left: 32px; position: relative;">
              <strong>Set smart alerts</strong> - Get instant notifications about perfect matches
            </li>
            ` : `
            <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
              <strong>Create your company profile</strong> - Showcase your culture and values
            </li>
            <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
              <strong>Post compelling job openings</strong> - Attract top-tier talent
            </li>
            <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
              <strong>Review qualified candidates</strong> - Find your perfect hires faster
            </li>
            <li style="padding: 12px 0; padding-left: 32px; position: relative;">
              <strong>Streamline your hiring</strong> - Manage everything in one place
            </li>
            `}
          </ul>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/dashboard" 
             style="background: ${buttonColor}; color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; border: 2px solid transparent; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            Launch Your Dashboard 🚀
          </a>
        </div>
        
        <div style="color: #475569; line-height: 1.7; font-size: 16px;">
          <p><strong>Need help getting started?</strong> Our dedicated support team is here to ensure your success.</p>
          <p>Welcome to the future of ${isCandidate ? 'career growth' : 'talent acquisition'}!</p>
        </div>
      </div>
      
      <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #cbd5e1;">
        <div style="font-size: 24px; font-weight: 700; color: white; margin-bottom: 16px;">JobConnect South Africa</div>
        <p>Connecting exceptional talent with extraordinary opportunities</p>
        
        <div style="display: flex; justify-content: center; gap: 24px; margin: 20px 0; flex-wrap: wrap;">
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}" style="color: #94a3b8; text-decoration: none;">Visit Website</a>
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/jobs" style="color: #94a3b8; text-decoration: none;">Browse Jobs</a>
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/contact" style="color: #94a3b8; text-decoration: none;">Contact Support</a>
        </div>
        
        <div style="margin-top: 24px; font-size: 14px; color: #64748b;">
          &copy; ${new Date().getFullYear()} JobConnect South Africa. All rights reserved.<br>
          Cape Town, South Africa
        </div>
      </div>
    </div>
  `;

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== PASSWORD RESET EMAIL =====
export const sendPasswordResetEmail = async (userEmail, userName, resetURL) => {
  const subject = 'Secure Password Reset - JobConnect';
  const html = `
    <div style="font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background: white; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 50px 40px 40px; border-radius: 16px 16px 0 0; color: white; position: relative; overflow: hidden;">
        <div style="font-size: 56px; margin-bottom: 20px; display: block; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">🔐</div>
        <h1 style="margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">Password Reset</h1>
        <div style="font-size: 18px; opacity: 0.95; font-weight: 500; margin-top: 12px;">Secure your account access - Action required</div>
      </div>
      
      <div style="padding: 50px 40px;">
        <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #dc262640;">Security Action Required, ${userName} 🔒</h2>
        
        <div style="color: #475569; line-height: 1.7; font-size: 16px; margin-bottom: 20px;">
          <p>We've received a request to reset your JobConnect account password. Your security is our top priority.</p>
          <p>Click the button below to create a new password and regain access to your account:</p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetURL}" 
             style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; border: 2px solid transparent; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
            Reset My Password 🔑
          </a>
        </div>
        
        <div style="color: #475569; line-height: 1.7; font-size: 16px; margin-bottom: 20px;">
          <p><strong>Important:</strong> This secure reset link will expire in <strong>10 minutes</strong> for your protection.</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin: 32px 0; border-left: 5px solid #dc2626;">
          <h3 style="color: #dc2626; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">🛡️ Security Notice</h3>
          <p style="color: #dc2626; margin: 0;">If you did not initiate this password reset request, please disregard this email immediately. Your account remains secure.</p>
        </div>
      </div>
      
      <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #cbd5e1;">
        <div style="font-size: 24px; font-weight: 700; color: white; margin-bottom: 16px;">JobConnect South Africa</div>
        <p>Connecting exceptional talent with extraordinary opportunities</p>
        
        <div style="display: flex; justify-content: center; gap: 24px; margin: 20px 0; flex-wrap: wrap;">
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}" style="color: #94a3b8; text-decoration: none;">Visit Website</a>
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/jobs" style="color: #94a3b8; text-decoration: none;">Browse Jobs</a>
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/contact" style="color: #94a3b8; text-decoration: none;">Contact Support</a>
        </div>
        
        <div style="margin-top: 24px; font-size: 14px; color: #64748b;">
          &copy; ${new Date().getFullYear()} JobConnect South Africa. All rights reserved.<br>
          Cape Town, South Africa
        </div>
      </div>
    </div>
  `;

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== PASSWORD RESET CONFIRMATION =====
export const sendPasswordResetConfirmation = async (userEmail, userName) => {
  const subject = 'Password Successfully Reset - JobConnect';
  const html = `
    <div style="font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background: white; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 50px 40px 40px; border-radius: 16px 16px 0 0; color: white; position: relative; overflow: hidden;">
        <div style="font-size: 56px; margin-bottom: 20px; display: block; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">✅</div>
        <h1 style="margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">Password Reset Complete</h1>
        <div style="font-size: 18px; opacity: 0.95; font-weight: 500; margin-top: 12px;">Your account security has been successfully restored</div>
      </div>
      
      <div style="padding: 50px 40px;">
        <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #05966940;">Security Update Confirmed, ${userName} ✅</h2>
        
        <div style="color: #475569; line-height: 1.7; font-size: 16px; margin-bottom: 20px;">
          <p>Your JobConnect account password has been successfully reset and updated across all our systems.</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 32px 0; border-left: 5px solid #16a34a;">
          <h3 style="color: #166534; margin-bottom: 8px;">🔄 Password Update Complete</h3>
          <p style="color: #166534; margin: 0;">Your new password is now active. All previous login sessions have been automatically terminated for security.</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin: 32px 0; border-left: 5px solid #dc2626;">
          <h3 style="color: #dc2626; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">⚠️ Security Verification</h3>
          <p style="color: #dc2626; margin: 0;">If you did not authorize this password change, please contact our support team immediately.</p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/security" 
             style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; border: 2px solid transparent; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
            Review Security Settings
          </a>
        </div>
      </div>
      
      <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #cbd5e1;">
        <div style="font-size: 24px; font-weight: 700; color: white; margin-bottom: 16px;">JobConnect South Africa</div>
        <p>Connecting exceptional talent with extraordinary opportunities</p>
        
        <div style="display: flex; justify-content: center; gap: 24px; margin: 20px 0; flex-wrap: wrap;">
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}" style="color: #94a3b8; text-decoration: none;">Visit Website</a>
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/jobs" style="color: #94a3b8; text-decoration: none;">Browse Jobs</a>
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/contact" style="color: #94a3b8; text-decoration: none;">Contact Support</a>
        </div>
        
        <div style="margin-top: 24px; font-size: 14px; color: #64748b;">
          &copy; ${new Date().getFullYear()} JobConnect South Africa. All rights reserved.<br>
          Cape Town, South Africa
        </div>
      </div>
    </div>
  `;

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== PASSWORD CHANGE CONFIRMATION =====
export const sendPasswordChangeConfirmation = async (userEmail, userName) => {
  const subject = 'Password Updated Successfully - JobConnect';
  const html = `
    <div style="font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background: white; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 50px 40px 40px; border-radius: 16px 16px 0 0; color: white; position: relative; overflow: hidden;">
        <div style="font-size: 56px; margin-bottom: 20px; display: block; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">🔒</div>
        <h1 style="margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">Password Updated</h1>
        <div style="font-size: 18px; opacity: 0.95; font-weight: 500; margin-top: 12px;">Your account security has been enhanced</div>
      </div>
      
      <div style="padding: 50px 40px;">
        <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #2563eb40;">Security Settings Updated, ${userName} 🔐</h2>
        
        <div style="color: #475569; line-height: 1.7; font-size: 16px; margin-bottom: 20px;">
          <p>This email confirms that your JobConnect account password has been successfully updated and secured.</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 32px 0; border-left: 5px solid #16a34a;">
          <h3 style="color: #166534; margin-bottom: 8px;">✅ Password Change Confirmed</h3>
          <p style="color: #166534; margin: 0;">Your new password is now active across all devices and sessions.</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin: 32px 0; border-left: 5px solid #dc2626;">
          <h3 style="color: #dc2626; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">🔒 Important Security Note</h3>
          <p style="color: #dc2626; margin: 0;">If you did not make this password change, please contact our support team immediately.</p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/security" 
             style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; border: 2px solid transparent; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
            Review Account Security
          </a>
        </div>
      </div>
      
      <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #cbd5e1;">
        <div style="font-size: 24px; font-weight: 700; color: white; margin-bottom: 16px;">JobConnect South Africa</div>
        <p>Connecting exceptional talent with extraordinary opportunities</p>
        
        <div style="display: flex; justify-content: center; gap: 24px; margin: 20px 0; flex-wrap: wrap;">
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}" style="color: #94a3b8; text-decoration: none;">Visit Website</a>
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/jobs" style="color: #94a3b8; text-decoration: none;">Browse Jobs</a>
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/contact" style="color: #94a3b8; text-decoration: none;">Contact Support</a>
        </div>
        
        <div style="margin-top: 24px; font-size: 14px; color: #64748b;">
          &copy; ${new Date().getFullYear()} JobConnect South Africa. All rights reserved.<br>
          Cape Town, South Africa
        </div>
      </div>
    </div>
  `;

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== APPLICATION CONFIRMATION =====
export const sendApplicationConfirmation = async (candidateEmail, jobTitle, companyName) => {
  const subject = `Application Confirmed: ${jobTitle} - ${companyName}`;
  const html = `
    <div style="font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background: white; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 50px 40px 40px; border-radius: 16px 16px 0 0; color: white; position: relative; overflow: hidden;">
        <div style="font-size: 56px; margin-bottom: 20px; display: block; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">📨</div>
        <h1 style="margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">Application Submitted</h1>
        <div style="font-size: 18px; opacity: 0.95; font-weight: 500; margin-top: 12px;">Your journey with ${companyName} begins now</div>
      </div>
      
      <div style="padding: 50px 40px;">
        <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #2563eb40;">Application Successfully Submitted! 🎉</h2>
        
        <div style="color: #475569; line-height: 1.7; font-size: 16px; margin-bottom: 20px;">
          <p>Congratulations! Your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been received and is now with the hiring team.</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; margin: 32px 0; position: relative; overflow: hidden; border-left: 5px solid #3b82f6;">
          <h3 style="color: #0f172a; margin-bottom: 16px; font-size: 20px; font-weight: 600;">📈 What Happens Next?</h3>
          <ul style="list-style: none; padding: 0; color: #475569;">
            <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
              <strong>Application Review</strong> - The hiring team will review your qualifications
            </li>
            <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
              <strong>Candidate Screening</strong> - Initial assessments and profile matching
            </li>
            <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
              <strong>Direct Communication</strong> - You'll hear from ${companyName} regarding next steps
            </li>
            <li style="padding: 12px 0; padding-left: 32px; position: relative;">
              <strong>Interview Process</strong> - Potential interviews or additional assessments
            </li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/jobs" 
             style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; border: 2px solid transparent; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
            Discover More Opportunities ✨
          </a>
        </div>
      </div>
      
      <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #cbd5e1;">
        <div style="font-size: 24px; font-weight: 700; color: white; margin-bottom: 16px;">JobConnect South Africa</div>
        <p>Connecting exceptional talent with extraordinary opportunities</p>
        
        <div style="display: flex; justify-content: center; gap: 24px; margin: 20px 0; flex-wrap: wrap;">
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}" style="color: #94a3b8; text-decoration: none;">Visit Website</a>
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/jobs" style="color: #94a3b8; text-decoration: none;">Browse Jobs</a>
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/contact" style="color: #94a3b8; text-decoration: none;">Contact Support</a>
        </div>
        
        <div style="margin-top: 24px; font-size: 14px; color: #64748b;">
          &copy; ${new Date().getFullYear()} JobConnect South Africa. All rights reserved.<br>
          Cape Town, South Africa
        </div>
      </div>
    </div>
  `;

  const result = await sendEmail(candidateEmail, subject, html);
  return result.success;
};

// ===== NEW APPLICATION NOTIFICATION =====
export const sendNewApplicationNotification = async (employerEmail, candidateName, jobTitle) => {
  const subject = `🌟 New Talent Alert: ${candidateName} for ${jobTitle}`;
  const html = `
    <div style="font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background: white; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 50px 40px 40px; border-radius: 16px 16px 0 0; color: white; position: relative; overflow: hidden;">
        <div style="font-size: 56px; margin-bottom: 20px; display: block; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">🌟</div>
        <h1 style="margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">New Application</h1>
        <div style="font-size: 18px; opacity: 0.95; font-weight: 500; margin-top: 12px;">Fresh talent for ${jobTitle} - Review now</div>
      </div>
      
      <div style="padding: 50px 40px;">
        <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #d9770640;">Exciting New Candidate! 🎯</h2>
        
        <div style="color: #475569; line-height: 1.7; font-size: 16px; margin-bottom: 20px;">
          <p>Great news! You have a new qualified candidate application for your <strong>${jobTitle}</strong> position.</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; margin: 32px 0; position: relative; overflow: hidden; border-left: 5px solid #f59e0b;">
          <h3 style="color: #0f172a; margin-bottom: 16px; font-size: 20px; font-weight: 600;">👤 Candidate Snapshot</h3>
          <ul style="list-style: none; padding: 0; color: #475569;">
            <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
              <strong>Candidate Name:</strong> ${candidateName}
            </li>
            <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
              <strong>Position Applied:</strong> ${jobTitle}
            </li>
            <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
              <strong>Application Date:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </li>
            <li style="padding: 12px 0; padding-left: 32px; position: relative;">
              <strong>Response Time:</strong> Recommended within 48 hours
            </li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/employer/dashboard" 
             style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; border: 2px solid transparent; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);">
            Review Application Now 📋
          </a>
        </div>
      </div>
      
      <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #cbd5e1;">
        <div style="font-size: 24px; font-weight: 700; color: white; margin-bottom: 16px;">JobConnect South Africa</div>
        <p>Connecting exceptional talent with extraordinary opportunities</p>
        
        <div style="display: flex; justify-content: center; gap: 24px; margin: 20px 0; flex-wrap: wrap;">
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}" style="color: #94a3b8; text-decoration: none;">Visit Website</a>
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/jobs" style="color: #94a3b8; text-decoration: none;">Browse Jobs</a>
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/contact" style="color: #94a3b8; text-decoration: none;">Contact Support</a>
        </div>
        
        <div style="margin-top: 24px; font-size: 14px; color: #64748b;">
          &copy; ${new Date().getFullYear()} JobConnect South Africa. All rights reserved.<br>
          Cape Town, South Africa
        </div>
      </div>
    </div>
  `;

  const result = await sendEmail(employerEmail, subject, html);
  return result.success;
};

// ===== APPLICATION STATUS NOTIFICATION =====
export const sendApplicationStatusNotification = async (candidateEmail, candidateName, jobTitle, companyName, status, employerName) => {
  let subject, headerColor, icon, title, preheader, accentColor;

  switch (status) {
    case 'accepted':
      subject = `Congratulations! You're Moving Forward: ${jobTitle} at ${companyName}`;
      headerColor = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      icon = '🎉';
      title = 'Application Accepted!';
      preheader = 'Great news about your job application';
      accentColor = '#059669';
      break;
    
    case 'rejected':
      subject = `Update on Your Application: ${jobTitle} at ${companyName}`;
      headerColor = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      icon = '❌';
      title = 'Application Status Update';
      preheader = 'Important update regarding your application';
      accentColor = '#dc2626';
      break;
    
    case 'reviewed':
      subject = `Great News! Your Application is Being Actively Reviewed: ${jobTitle}`;
      headerColor = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
      icon = '👀';
      title = 'Application Under Review';
      preheader = 'Your application is progressing to the next stage';
      accentColor = '#2563eb';
      break;
    
    default:
      return false;
  }

  let content = '';
  if (status === 'accepted') {
    content = `
      <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid ${accentColor}40;">Outstanding News, ${candidateName}! 🎉</h2>
      
      <div style="color: #475569; line-height: 1.7; font-size: 16px; margin-bottom: 20px;">
        <p>We are delighted to inform you that your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been <strong style="color: ${accentColor};">accepted</strong>!</p>
        <p>The hiring team at ${companyName}, led by ${employerName}, was impressed with your qualifications.</p>
      </div>
      
      <div style="display: inline-block; padding: 8px 16px; background: ${accentColor}15; color: ${accentColor}; border-radius: 20px; font-weight: 600; font-size: 14px; margin: 10px 0; border: 1px solid ${accentColor}30;">
        Status: Advanced to Next Stage
      </div>
      
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; margin: 32px 0; position: relative; overflow: hidden; border-left: 5px solid ${accentColor};">
        <h3 style="color: #0f172a; margin-bottom: 16px; font-size: 20px; font-weight: 600;">🚀 Your Next Career Milestone</h3>
        <ul style="list-style: none; padding: 0; color: #475569;">
          <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
            <strong>Direct Contact</strong> - Expect to hear from ${employerName} within 2-3 business days
          </li>
          <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
            <strong>Interview Preparation</strong> - Start preparing for the next stage
          </li>
          <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
            <strong>Company Research</strong> - Deep dive into ${companyName}'s culture
          </li>
          <li style="padding: 12px 0; padding-left: 32px; position: relative;">
            <strong>Availability Planning</strong> - Consider your schedule for interviews
          </li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/preparation/interview" 
           style="background: ${headerColor}; color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; border: 2px solid transparent; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          Prepare for Success 📚
        </a>
      </div>
    `;
  } else if (status === 'rejected') {
    content = `
      <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid ${accentColor}40;">Dear ${candidateName},</h2>
      
      <div style="color: #475569; line-height: 1.7; font-size: 16px; margin-bottom: 20px;">
        <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
        <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates.</p>
      </div>
      
      <div style="display: inline-block; padding: 8px 16px; background: ${accentColor}15; color: ${accentColor}; border-radius: 20px; font-weight: 600; font-size: 14px; margin: 10px 0; border: 1px solid ${accentColor}30;">
        Status: Not Selected for This Role
      </div>
      
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; margin: 32px 0; position: relative; overflow: hidden; border-left: 5px solid ${accentColor};">
        <h3 style="color: #0f172a; margin-bottom: 16px; font-size: 20px; font-weight: 600;">🌟 Your Journey Continues</h3>
        <ul style="list-style: none; padding: 0; color: #475569;">
          <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
            <strong>This Isn't The End</strong> - This decision is specific to this role
          </li>
          <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
            <strong>Valuable Experience</strong> - Each application strengthens your skills
          </li>
          <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
            <strong>Network Growth</strong> - You've made a connection with ${companyName}
          </li>
          <li style="padding: 12px 0; padding-left: 32px; position: relative;">
            <strong>Future Opportunities</strong> - Your profile remains in their database
          </li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/jobs" 
           style="background: ${headerColor}; color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; border: 2px solid transparent; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          Discover New Opportunities 🔍
        </a>
      </div>
    `;
  } else if (status === 'reviewed') {
    content = `
      <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid ${accentColor}40;">Progress Update, ${candidateName}! 📈</h2>
      
      <div style="color: #475569; line-height: 1.7; font-size: 16px; margin-bottom: 20px;">
        <p>Excellent news! Your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has passed initial screening and is now under active review.</p>
      </div>
      
      <div style="display: inline-block; padding: 8px 16px; background: ${accentColor}15; color: ${accentColor}; border-radius: 20px; font-weight: 600; font-size: 14px; margin: 10px 0; border: 1px solid ${accentColor}30;">
        Status: Under Active Review
      </div>
      
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; margin: 32px 0; position: relative; overflow: hidden; border-left: 5px solid ${accentColor};">
        <h3 style="color: #0f172a; margin-bottom: 16px; font-size: 20px; font-weight: 600;">⏳ Current Status: In Active Consideration</h3>
        <ul style="list-style: none; padding: 0; color: #475569;">
          <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
            <strong>Application Status</strong> - Successfully advanced to review stage
          </li>
          <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
            <strong>Next Phase</strong> - Comprehensive evaluation by hiring team
          </li>
          <li style="padding: 12px 0; padding-left: 32px; position: relative; border-bottom: 1px solid #e2e8f0;">
            <strong>Expected Timeline</strong> - Typically 1-2 weeks for this stage
          </li>
          <li style="padding: 12px 0; padding-left: 32px; position: relative;">
            <strong>Preparation Advised</strong> - Be ready for potential next steps
          </li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/profile" 
           style="background: ${headerColor}; color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; border: 2px solid transparent; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          Optimize Your Profile ✨
        </a>
      </div>
    `;
  }

  const html = `
    <div style="font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background: white; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; background: ${headerColor}; padding: 50px 40px 40px; border-radius: 16px 16px 0 0; color: white; position: relative; overflow: hidden;">
        <div style="font-size: 56px; margin-bottom: 20px; display: block; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">${icon}</div>
        <h1 style="margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">${title}</h1>
        <div style="font-size: 18px; opacity: 0.95; font-weight: 500; margin-top: 12px;">${preheader}</div>
      </div>
      
      <div style="padding: 50px 40px;">
        ${content}
      </div>
      
      <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #cbd5e1;">
        <div style="font-size: 24px; font-weight: 700; color: white; margin-bottom: 16px;">JobConnect South Africa</div>
        <p>Connecting exceptional talent with extraordinary opportunities</p>
        
        <div style="display: flex; justify-content: center; gap: 24px; margin: 20px 0; flex-wrap: wrap;">
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}" style="color: #94a3b8; text-decoration: none;">Visit Website</a>
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/jobs" style="color: #94a3b8; text-decoration: none;">Browse Jobs</a>
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/contact" style="color: #94a3b8; text-decoration: none;">Contact Support</a>
        </div>
        
        <div style="margin-top: 24px; font-size: 14px; color: #64748b;">
          &copy; ${new Date().getFullYear()} JobConnect South Africa. All rights reserved.<br>
          Cape Town, South Africa
        </div>
      </div>
    </div>
  `;

  const result = await sendEmail(candidateEmail, subject, html);
  return result.success;
};