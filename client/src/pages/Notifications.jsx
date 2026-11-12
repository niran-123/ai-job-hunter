import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, Send, Clock, Shield, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function Notifications() {
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState({ dailyDigestTime: '08:00', timezone: 'Asia/Kolkata', enableNoNewJobsEmail: false });
  const [gmailStatus, setGmailStatus] = useState({ isConnected: false });
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testStatus, setTestStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchNotificationData = async () => {
    try {
      const [histRes, settRes, statusRes] = await Promise.all([
        api.get('/notifications/history'),
        api.get('/settings'),
        api.get('/notifications/gmail/status')
      ]);
      setHistory(histRes.data?.data || []);
      setSettings(settRes.data?.data || {});
      setGmailStatus(statusRes.data?.data || { isConnected: false });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationData();
  }, []);

  const sendTestDigest = async () => {
    setIsSendingTest(true);
    setTestStatus('Generating HTML email and preparing dispatch...');
    try {
      const res = await api.post('/notifications/test');
      setTestStatus(res.data?.message || 'Test email digest dispatched successfully!');
      fetchNotificationData();
      setTimeout(() => setTestStatus(''), 5000);
    } catch (err) {
      setTestStatus('Failed to send test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  const connectGmail = async () => {
    try {
      const res = await api.get('/notifications/gmail/auth-url');
      if (res.data?.data?.authUrl) {
        window.location.href = res.data.data.authUrl;
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gmail Daily Digest System</h1>
        <p className="text-sm text-slate-500">
          The only notification channel is Gmail API via OAuth 2.0. Receive your daily curated digest of freshly discovered IT jobs meeting your 0–2 years profile.
        </p>
      </div>

      {/* Gmail Connection Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xl shadow-xs">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Google Gmail Integration</h2>
                {gmailStatus.isConnected ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected &bull; {gmailStatus.connectedEmail || 'OAuth 2.0'}
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Ready to Connect &bull; OAuth 2.0 Outbound Scope
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Outbound-only permission (<code className="text-slate-700">gmail.send</code>). Tokens encrypted at rest with AES-256.
              </p>
            </div>
          </div>

          <button
            onClick={connectGmail}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto"
          >
            Connect / Reauthorize Gmail
          </button>
        </div>

        {/* Digest Scheduling Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="text-slate-500 font-medium">Daily Dispatch Time</div>
            <div className="text-sm font-bold text-slate-900 mt-1">{settings.dailyDigestTime || '08:00'} AM</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="text-slate-500 font-medium">Timezone</div>
            <div className="text-sm font-bold text-slate-900 mt-1">{settings.timezone || 'Asia/Kolkata'}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="text-slate-500 font-medium">No-New-Jobs Notification</div>
            <div className="text-sm font-bold text-slate-900 mt-1">{settings.enableNoNewJobsEmail ? 'Enabled' : 'Disabled'}</div>
          </div>
        </div>

        {/* Test Email Trigger */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-800">Verify Digest Dispatch</div>
            <div className="text-xs text-slate-500">Sends a sample formatted HTML & plain-text digest with currently eligible positions.</div>
          </div>

          <button
            onClick={sendTestDigest}
            disabled={isSendingTest}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {isSendingTest ? 'Preparing Digest...' : 'Send Test Digest Now'}
          </button>
        </div>

        {testStatus && (
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-semibold animate-fade-in">
            {testStatus}
          </div>
        )}
      </div>

      {/* Notification Dispatch History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Notification History & Delivery Logs</h2>
        
        {history.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 font-medium">
            No digest emails sent yet. Click 'Send Test Digest Now' above to generate the first log.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {history.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">{item.title}</div>
                  <div className="text-slate-500 mt-0.5">Recipient: {item.recipient}</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {item.status}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {new Date(item.sentAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

