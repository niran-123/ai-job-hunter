export class JobVerifier {
  /**
   * Verify listing availability and validity.
   *
   * @param {Object} job
   * @returns {Promise<{
   *   status: 'ACTIVE' | 'EXPIRED' | 'CLOSED' | 'UNAVAILABLE' | 'NEEDS_REVIEW',
   *   isAccessible: boolean,
   *   reason: string,
   *   checkedAt: string
   * }>}
   */
  async verifyJob(job) {
    const targetUrl = job.applicationUrl || job.sourceUrl;
    const checkedAt = new Date().toISOString();

    if (!targetUrl) {
      return {
        status: 'NEEDS_REVIEW',
        isAccessible: false,
        reason: 'Missing application and source URL',
        checkedAt
      };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(targetUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AI-Job-Hunter-Verifier/1.0'
        }
      });
      clearTimeout(timeout);

      if (response.status === 404 || response.status === 410) {
        return {
          status: 'EXPIRED',
          isAccessible: false,
          reason: `Job posting returned HTTP ${response.status} (Not Found / Gone)`,
          checkedAt
        };
      }

      if (response.status === 403 || response.status === 429) {
        // Rate limit or bot challenge: Do not mark as expired! Mark as ACTIVE or UNAVAILABLE temporarily
        return {
          status: job.status || 'ACTIVE',
          isAccessible: true,
          reason: `Access restricted (HTTP ${response.status}), assumed active`,
          checkedAt
        };
      }

      if (response.ok || response.status < 400) {
        return {
          status: 'ACTIVE',
          isAccessible: true,
          reason: 'Application URL is reachable and active',
          checkedAt
        };
      }

      return {
        status: 'NEEDS_REVIEW',
        isAccessible: false,
        reason: `Unexpected status code: HTTP ${response.status}`,
        checkedAt
      };
    } catch (err) {
      // Temporary network error or timeout -> Do NOT assume expired!
      return {
        status: job.status || 'ACTIVE',
        isAccessible: false,
        reason: `Verification connection timed out (${err.message}). Retained prior status.`,
        checkedAt
      };
    }
  }
}

export const jobVerifier = new JobVerifier();
export default jobVerifier;

