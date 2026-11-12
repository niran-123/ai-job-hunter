import { google } from 'googleapis';
import crypto from 'crypto';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

export class GmailDigestService {
  constructor() {
    this.clientId = env.GOOGLE_CLIENT_ID;
    this.clientSecret = env.GOOGLE_CLIENT_SECRET;
    this.redirectUri = env.GOOGLE_REDIRECT_URI;
    this.encryptionKey = Buffer.from((env.ENCRYPTION_KEY || '12345678901234567890123456789012').padEnd(32).slice(0, 32));
  }

  getOAuthClient() {
    return new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );
  }

  getAuthUrl(state = '') {
    const oauth2Client = this.getOAuthClient();
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/userinfo.email'],
      state
    });
  }

  async exchangeCodeForTokens(code) {
    const oauth2Client = this.getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  }

  encryptToken(token) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  decryptToken(encryptedToken) {
    const [ivHex, cipherText] = encryptedToken.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let decrypted = decipher.update(cipherText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Generates professional HTML email template and plain text fallback
   */
  generateDigestContent({ recipientName, jobs, digestDate = new Date() }) {
    const dateFormatted = digestDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Group jobs by Country
    const jobsByCountry = {};
    for (const job of jobs) {
      const country = job.country || 'Global / Remote';
      if (!jobsByCountry[country]) jobsByCountry[country] = [];
      jobsByCountry[country].push(job);
    }

    // Sort jobs within each country by matchScore descending
    for (const country in jobsByCountry) {
      jobsByCountry[country].sort((a, b) => (b.matchScore || b.analysis?.matchScore || 0) - (a.matchScore || a.analysis?.matchScore || 0));
    }

    // HTML Generator
    let jobCardsHtml = '';
    let plainTextJobs = '';

    for (const [country, countryJobs] of Object.entries(jobsByCountry)) {
      jobCardsHtml += `
        <div style="margin-top: 28px; margin-bottom: 12px; border-bottom: 2px solid #4f46e5; padding-bottom: 6px;">
          <h2 style="margin: 0; color: #1e1b4b; font-size: 18px; text-transform: uppercase; letter-spacing: 0.5px;">📍 ${country} (${countryJobs.length} opportunities)</h2>
        </div>
      `;
      plainTextJobs += `\n--- 📍 ${country} (${countryJobs.length} Opportunities) ---\n\n`;

      for (const job of countryJobs) {
        const score = Math.round(job.matchScore || job.analysis?.matchScore || 60);
        const matching = (job.matchingSkills || job.analysis?.matchingSkills || []).slice(0, 4).join(', ') || 'General IT Fundamentals';
        const missing = (job.missingSkills || job.analysis?.missingSkills || []).slice(0, 3).join(', ') || 'None identified';
        const scoreColor = score >= 80 ? '#16a34a' : score >= 60 ? '#4f46e5' : '#ea580c';

        jobCardsHtml += `
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
              <tr>
                <td style="vertical-align: top;">
                  <h3 style="margin: 0 0 4px 0; color: #0f172a; font-size: 17px; font-weight: 600;">${job.jobTitle || job.title}</h3>
                  <div style="color: #475569; font-size: 14px; font-weight: 500;">
                    🏢 <strong>${job.companyName || job.company}</strong> &bull; 📍 ${job.location || 'Remote'} &bull; 💼 ${job.employmentType || 'Full-time'}
                  </div>
                </td>
                <td style="vertical-align: top; text-align: right; width: 85px;">
                  <div style="display: inline-block; background-color: ${scoreColor}; color: #ffffff; font-weight: bold; font-size: 13px; padding: 4px 10px; border-radius: 9999px;">
                    ${score}% Match
                  </div>
                </td>
              </tr>
            </table>

            <div style="background-color: #f8fafc; border-radius: 6px; padding: 10px; font-size: 13px; color: #334155; margin-bottom: 12px; line-height: 1.4;">
              ${job.analysis?.jobSummary || job.description?.slice(0, 200) + '...'}
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; margin-bottom: 14px; color: #334155;">
              <tr>
                <td style="padding: 2px 0;"><strong>Eligibility:</strong> <span style="color: #16a34a; font-weight: 600;">${job.eligibilityStatus || 'ELIGIBLE'} (0-2 yrs policy)</span></td>
              </tr>
              <tr>
                <td style="padding: 2px 0;"><strong>Matching Skills:</strong> <span style="color: #4338ca;">${matching}</span></td>
              </tr>
              <tr>
                <td style="padding: 2px 0;"><strong>Missing Skills:</strong> <span style="color: #9a3412;">${missing}</span></td>
              </tr>
            </table>

            <div>
              <a href="${job.applicationUrl}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 8px 18px; border-radius: 6px; margin-right: 10px;">
                🚀 Apply Now
              </a>
              ${job.linkedinPostUrl ? `<a href="${job.linkedinPostUrl}" target="_blank" style="display: inline-block; background-color: #0077b5; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 8px 14px; border-radius: 6px; margin-right: 10px;">LinkedIn</a>` : ''}
              <a href="${job.sourceUrl}" target="_blank" style="display: inline-block; color: #64748b; text-decoration: underline; font-size: 12px;">Original Source</a>
            </div>
          </div>
        `;

        plainTextJobs += `* ${job.jobTitle || job.title} at ${job.companyName || job.company}\n`;
        plainTextJobs += `  Match Score: ${score}% | Location: ${job.location || 'Remote'} | Type: ${job.employmentType || 'Full-time'}\n`;
        plainTextJobs += `  Matching Skills: ${matching}\n`;
        plainTextJobs += `  Application Link: ${job.applicationUrl}\n\n`;
      }
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Global Job Hunter Daily Digest</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a;">
        <table align="center" width="100%" max-width="640" style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #312e81 0%, #4f46e5 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">⚡ AI Global Job Hunter</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Daily Verified Opportunities Digest &bull; ${dateFormatted}</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 24px;">
              <p style="font-size: 15px; color: #334155; margin-top: 0;">
                Hello <strong>${recipientName || 'Job Seeker'}</strong>,<br>
                Here is your curated daily digest of <strong>${jobs.length} freshly verified IT and software job opportunities</strong> meeting your 0-2 years experience criteria.
              </p>
              ${jobCardsHtml}
              <div style="margin-top: 32px; padding: 16px; background-color: #f8fafc; border-radius: 8px; text-align: center; font-size: 12px; color: #64748b;">
                You are receiving this digest because your Gmail is connected to AI Global Job Hunter.<br>
                To adjust your target countries, roles, or notification schedule, visit your Dashboard Settings.
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const text = `AI GLOBAL JOB HUNTER - DAILY DIGEST (${dateFormatted})\n\nHello ${recipientName || 'Job Seeker'},\nHere are ${jobs.length} freshly verified IT opportunities meeting your 0-2 years experience criteria:\n${plainTextJobs}\nManage preferences at your dashboard.`;

    return { html, text };
  }

  /**
   * Send email using Gmail API
   */
  async sendEmail({ refreshToken, to, subject, html, text }) {
    if (!refreshToken) {
      throw new Error('Missing Gmail refresh token for outbound sending');
    }

    const oauth2Client = this.getOAuthClient();
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${to}`,
      'Content-Type: multipart/alternative; boundary="boundary_jobhunter"',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      '--boundary_jobhunter',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      text,
      '',
      '--boundary_jobhunter',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      html,
      '',
      '--boundary_jobhunter--'
    ];

    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    return res.data;
  }
}

export const gmailDigestService = new GmailDigestService();
export default gmailDigestService;

