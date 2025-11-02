import ElasticEmail from 'elasticemail';
import dotenv from 'dotenv';

dotenv.config();

console.log('Email Configuration:', {
  service: 'Elastic Email',
  apiKey: process.env.ELASTICEMAIL_API_KEY ? 'Set' : 'Not Set'
});

// Initialize Elastic Email
let elasticEmailClient;
if (process.env.ELASTICEMAIL_API_KEY) {
  elasticEmailClient = ElasticEmail.createClient({
    apiKey: process.env.ELASTICEMAIL_API_KEY
  });
} else {
  console.warn('⚠️ Elastic Email API key not configured. Emails will be simulated.');
}

// Helper function to send emails
const sendEmail = async (to, subject, html) => {
  try {
    // If Elastic Email isn't configured, simulate sending
    if (!elasticEmailClient) {
      console.log('📧 SIMULATED EMAIL:', { to, subject });
      return { success: true, simulated: true };
    }

    const result = await elasticEmailClient.email.send({
      from: 'noreply@jobconnect-platform.com',
      fromName: 'JobConnect South Africa',
      to: to,
      subject: subject,
      bodyHtml: html,
      bodyText: html.replace(/<[^>]*>/g, '').replace(/\n{3,}/g, '\n\n').trim()
    });

    console.log('✅ Email sent successfully via Elastic Email to:', to);
    return { success: true, data: result };
    
  } catch (error) {
    console.error('❌ Elastic Email error:', error);
    return { 
      success: false, 
      error: error.message,
      simulated: false
    };
  }
};

// ===== WELCOME EMAIL =====
export const sendWelcomeEmail = async (userEmail, userName, role) => {
  const subject = 'Welcome to JobConnect - Get Started!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; color: white;">
        <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to JobConnect!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
        <p style="color: #666; line-height: 1.6; font-size: 16px;">
          Thank you for registering as a <strong>${role}</strong> on our platform.
          We're excited to have you on board and help you ${role === 'candidate' ? 'find your dream job' : 'find the perfect candidates for your company'}.
        </p>
        
        ${role === 'candidate' ? `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;">
          <h3 style="color: #28a745; margin-top: 0;">🚀 Next Steps for Candidates:</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li><strong>Complete your profile</strong> - Add your skills, experience, and education</li>
            <li><strong>Upload your resume</strong> - Make it easy for employers to find you</li>
            <li><strong>Browse available jobs</strong> - Find opportunities that match your skills</li>
            <li><strong>Set up job alerts</strong> - Get notified about new relevant positions</li>
          </ul>
        </div>
        ` : `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #007bff;">
          <h3 style="color: #007bff; margin-top: 0;">🏢 Next Steps for Employers:</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li><strong>Complete your company profile</strong> - Showcase your company culture</li>
            <li><strong>Post your first job</strong> - Start attracting qualified candidates</li>
            <li><strong>Review applications</strong> - Find the perfect fit for your team</li>
            <li><strong>Connect with talent</strong> - Build your dream team</li>
          </ul>
        </div>
        `}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Get Started
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
          If you have any questions, feel free to reply to this email.<br>
          Best regards,<br>
          <strong>The JobConnect Team</strong>
        </p>
      </div>
    </div>
  `;

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== PASSWORD RESET EMAIL =====
export const sendPasswordResetEmail = async (userEmail, userName, resetURL) => {
  const subject = 'Password Reset Request - JobConnect';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px 10px 0 0; color: white;">
        <h1 style="margin: 0; font-size: 24px;">🔒 Password Reset Request</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName},</h2>
        <p style="color: #666; line-height: 1.6; font-size: 16px;">
          You requested to reset your password for your JobConnect account. 
          Click the button below to create a new password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetURL}" 
             style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Reset Your Password
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6; font-size: 14px;">
          This password reset link will expire in <strong>10 minutes</strong> for security reasons.
        </p>
        
        <p style="color: #999; font-size: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
          If you didn't request this reset, please ignore this email.<br>
          Your password will remain unchanged.
        </p>
      </div>
    </div>
  `;

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== PASSWORD RESET CONFIRMATION =====
export const sendPasswordResetConfirmation = async (userEmail, userName) => {
  const subject = 'Password Reset Successful - JobConnect';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; background: linear-gradient(135deg, #00b894 0%, #00a085 100%); padding: 30px; border-radius: 10px 10px 0 0; color: white;">
        <h1 style="margin: 0; font-size: 24px;">✅ Password Reset Successful</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName},</h2>
        <p style="color: #666; line-height: 1.6; font-size: 16px;">
          Your JobConnect password has been successfully reset.
        </p>
        
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;">
          <h3 style="color: #155724; margin-top: 0;">🔒 Security Notice</h3>
          <p style="color: #155724; margin: 0;">
            If you did not make this change, please contact our support team immediately.
          </p>
        </div>
        
        <p style="color: #999; font-size: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
          Best regards,<br>
          <strong>The JobConnect Team</strong>
        </p>
      </div>
    </div>
  `;

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== PASSWORD CHANGE CONFIRMATION =====
export const sendPasswordChangeConfirmation = async (userEmail, userName) => {
  const subject = 'Password Changed Successfully - JobConnect';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; background: linear-gradient(135deg, #0984e3 0%, #074b83 100%); padding: 30px; border-radius: 10px 10px 0 0; color: white;">
        <h1 style="margin: 0; font-size: 24px;">🔐 Password Updated</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName},</h2>
        <p style="color: #666; line-height: 1.6; font-size: 16px;">
          Your JobConnect password has been successfully changed.
        </p>
        
        <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #17a2b8;">
          <h3 style="color: #0c5460; margin-top: 0;">ℹ️ Important</h3>
          <p style="color: #0c5460; margin: 0;">
            You'll need to use your new password the next time you sign in.
          </p>
        </div>
        
        <p style="color: #999; font-size: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
          Best regards,<br>
          <strong>The JobConnect Team</strong>
        </p>
      </div>
    </div>
  `;

  const result = await sendEmail(userEmail, subject, html);
  return result.success;
};

// ===== APPLICATION EMAILS =====
export const sendApplicationConfirmation = async (candidateEmail, jobTitle, companyName) => {
  const subject = `Application Confirmation: ${jobTitle} at ${companyName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px 10px 0 0; color: white;">
        <h1 style="margin: 0; font-size: 24px;">✅ Application Submitted!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-bottom: 20px;">Thank You for Your Application</h2>
        <p style="color: #666; line-height: 1.6; font-size: 16px;">
          Your application for the position of <strong>${jobTitle}</strong> at 
          <strong>${companyName}</strong> has been received successfully.
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;">
          <h3 style="color: #28a745; margin-top: 0;">📋 What Happens Next?</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>The employer will review your application</li>
            <li>You'll be notified if you're shortlisted</li>
            <li>Keep an eye on your email for updates</li>
            <li>Continue exploring other opportunities</li>
          </ul>
        </div>
        
        <p style="color: #999; font-size: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
          Best regards,<br>
          <strong>${companyName} Team</strong>
        </p>
      </div>
    </div>
  `;

  const result = await sendEmail(candidateEmail, subject, html);
  return result.success;
};

export const sendNewApplicationNotification = async (employerEmail, candidateName, jobTitle) => {
  const subject = `New Application: ${jobTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); padding: 30px; border-radius: 10px 10px 0 0; color: white;">
        <h1 style="margin: 0; font-size: 24px;">🎯 New Application Received!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-bottom: 20px;">You Have a New Candidate</h2>
        <p style="color: #666; line-height: 1.6; font-size: 16px;">
          A new candidate has applied for your job posting: <strong>${jobTitle}</strong>
        </p>
        
        <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #007bff; margin-top: 0;">👤 Candidate Details</h3>
          <p style="margin: 10px 0;"><strong>Name:</strong> ${candidateName}</p>
          <p style="margin: 10px 0;"><strong>Position:</strong> ${jobTitle}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://jobconnect-platform.vercel.app'}/employer/dashboard" 
             style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Review Application
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
          Best regards,<br>
          <strong>JobConnect Team</strong>
        </p>
      </div>
    </div>
  `;

  const result = await sendEmail(employerEmail, subject, html);
  return result.success;
};

// ===== APPLICATION STATUS NOTIFICATION =====
export const sendApplicationStatusNotification = async (candidateEmail, candidateName, jobTitle, companyName, status, employerName) => {
  let subject = '';
  let message = '';
  let color = '';
  let icon = '';

  switch (status) {
    case 'accepted':
      subject = `Congratulations! Your application for ${jobTitle} has been accepted`;
      color = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
      icon = '🎉';
      message = `
        <p style="color: #666; line-height: 1.6; font-size: 16px;">
          Congratulations, <strong>${candidateName}</strong>! 
          Your application for the position of <strong>${jobTitle}</strong> at 
          <strong>${companyName}</strong> has been <strong style="color: #28a745;">accepted</strong>!
        </p>
        <p style="color: #666; line-height: 1.6; font-size: 16px;">
          The employer, <strong>${employerName}</strong>, will contact you shortly to discuss the next steps.
        </p>
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;">
          <h3 style="color: #155724; margin-top: 0;">📅 What's Next?</h3>
          <ul style="color: #155724; line-height: 1.8;">
            <li>Expect a call or email from the employer within the next few days</li>
            <li>Prepare for the interview process and next steps</li>
            <li>Review the job requirements and company information</li>
            <li>Be ready to discuss your availability and start date</li>
          </ul>
        </div>
      `;
      break;
    
    case 'rejected':
      subject = `Update on your application for ${jobTitle}`;
      color = 'linear-gradient(135deg, #6c757d 0%, #495057 100%)';
      icon = '💼';
      message = `
        <p style="color: #666; line-height: 1.6; font-size: 16px;">
          Thank you for your interest in the <strong>${jobTitle}</strong> position at 
          <strong>${companyName}</strong>.
        </p>
        <p style="color: #666; line-height: 1.6; font-size: 16px;">
          After careful consideration, we regret to inform you that your application was not successful at this time.
        </p>
        <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #dc3545;">
          <h3 style="color: #721c24; margin-top: 0;">🚀 Keep Going!</h3>
          <ul style="color: #721c24; line-height: 1.8;">
            <li>Don't get discouraged - job searching takes time and persistence</li>
            <li>Continue improving your skills and qualifications</li>
            <li>Apply to other relevant positions that match your experience</li>
            <li>Consider asking for feedback to improve future applications</li>
          </ul>
        </div>
      `;
      break;
    
    case 'reviewed':
      subject = `Your application for ${jobTitle} is being reviewed`;
      color = 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)';
      icon = '👀';
      message = `
        <p style="color: #666; line-height: 1.6; font-size: 16px;">
          Great news! Your application for <strong>${jobTitle}</strong> at 
          <strong>${companyName}</strong> has been <strong style="color: #17a2b8;">reviewed</strong> and is being actively considered.
        </p>
        <p style="color: #666; line-height: 1.6; font-size: 16px;">
          The employer is currently evaluating all applications and will provide updates soon.
        </p>
        <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #17a2b8;">
          <h3 style="color: #0c5460; margin-top: 0;">⏳ While You Wait:</h3>
          <ul style="color: #0c5460; line-height: 1.8;">
            <li>Keep your phone and email accessible for potential contact</li>
            <li>Prepare for potential interviews or assessments</li>
            <li>Research the company and recent developments</li>
            <li>Continue applying to other opportunities</li>
          </ul>
        </div>
      `;
      break;
    
    default:
      return false;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; background: ${color}; padding: 30px; border-radius: 10px 10px 0 0; color: white;">
        <h1 style="margin: 0; font-size: 24px;">${icon} Application Status Update</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${candidateName},</h2>
        ${message}
        <p style="color: #999; font-size: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
          Best regards,<br>
          <strong>${companyName} Team</strong>
        </p>
      </div>
    </div>
  `;

  const result = await sendEmail(candidateEmail, subject, html);
  return result.success;
};