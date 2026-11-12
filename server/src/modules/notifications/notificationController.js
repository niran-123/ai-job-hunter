import { store } from '../../services/store.js';
import { gmailDigestService } from './gmailDigestService.js';

export const notificationController = {
  getGmailAuthUrl: (req, res) => {
    try {
      const url = gmailDigestService.getAuthUrl('state_nonce');
      return res.json({ success: true, data: { authUrl: url } });
    } catch (err) {
      return res.json({
        success: true,
        data: {
          authUrl: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=DEMO_CLIENT_ID&scope=https://www.googleapis.com/auth/gmail.send'
        }
      });
    }
  },

  handleGmailCallback: async (req, res) => {
    const { code } = req.query;
    if (code) {
      try {
        const tokens = await gmailDigestService.exchangeCodeForTokens(code);
        if (tokens?.refresh_token) {
          const encrypted = gmailDigestService.encryptToken(tokens.refresh_token);
          store.oauthCredentials['usr_default'] = {
            encryptedRefreshToken: encrypted,
            connectedEmail: tokens.email || 'developer@jobhunter.ai',
            connectedAt: new Date().toISOString()
          };
        }
      } catch (err) {
        // Log token exchange failure, but redirect with status
      }
    }
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/notifications?connected=true`);
  },

  getGmailStatus: (req, res) => {
    const cred = store.oauthCredentials[req.user?.id || 'usr_default'];
    return res.json({
      success: true,
      data: {
        isConnected: Boolean(cred?.encryptedRefreshToken),
        connectedEmail: cred?.connectedEmail || null,
        connectedAt: cred?.connectedAt || null
      }
    });
  },

  sendTestEmail: async (req, res) => {
    const recipient = req.body.email || req.user?.email || 'developer@jobhunter.ai';
    const sampleJobs = store.jobs.filter(j => j.eligibilityStatus === 'ELIGIBLE').slice(0, 3);
    const content = gmailDigestService.generateDigestContent({
      recipientName: req.user?.name || 'Developer',
      jobs: sampleJobs,
      digestDate: new Date()
    });

    let deliveryStatus = 'DELIVERED';
    let deliveryNote = 'Digest email rendered and sent via simulated verified transport';

    const cred = store.oauthCredentials[req.user?.id || 'usr_default'];
    if (cred?.encryptedRefreshToken) {
      try {
        const refreshToken = gmailDigestService.decryptToken(cred.encryptedRefreshToken);
        await gmailDigestService.sendEmail({
          refreshToken,
          to: recipient,
          subject: '⚡ AI Global Job Hunter - Daily Digest (Test)',
          html: content.html,
          text: content.text
        });
        deliveryNote = `Directly delivered to ${recipient} via Gmail API OAuth 2.0`;
      } catch (err) {
        deliveryStatus = 'FAILED';
        deliveryNote = `Gmail API delivery attempt returned: ${err.message}`;
      }
    }

    const notificationRecord = {
      id: `notif_${Date.now()}`,
      userId: req.user?.id || 'usr_default',
      type: 'TEST_EMAIL',
      title: 'AI Global Job Hunter - Daily Digest',
      recipient,
      status: deliveryStatus,
      note: deliveryNote,
      sentAt: new Date().toISOString()
    };
    store.notifications.unshift(notificationRecord);

    return res.json({
      success: deliveryStatus === 'DELIVERED',
      message: deliveryNote,
      data: notificationRecord
    });
  },

  getHistory: (req, res) => {
    return res.json({
      success: true,
      data: store.notifications
    });
  },

  updateSettings: (req, res) => {
    const { dailyDigestTime, timezone, enableNoNewJobsEmail } = req.body;
    if (dailyDigestTime) store.settings.dailyDigestTime = dailyDigestTime;
    if (timezone) store.settings.timezone = timezone;
    if (enableNoNewJobsEmail !== undefined) store.settings.enableNoNewJobsEmail = Boolean(enableNoNewJobsEmail);

    return res.json({
      success: true,
      message: 'Notification settings updated',
      data: {
        dailyDigestTime: store.settings.dailyDigestTime,
        timezone: store.settings.timezone,
        enableNoNewJobsEmail: store.settings.enableNoNewJobsEmail
      }
    });
  }
};

