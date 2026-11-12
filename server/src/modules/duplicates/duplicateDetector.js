export class DuplicateDetector {
  /**
   * Check if a candidate job is a duplicate of any existing job in the list.
   *
   * @param {Object} candidateJob
   * @param {Array<Object>} existingJobs
   * @returns {{ isDuplicate: boolean, matchedJob: Object | null, reason: string | null, confidence: number }}
   */
  findDuplicate(candidateJob, existingJobs = []) {
    for (const existing of existingJobs) {
      // 1. Exact Source ID + External ID
      if (candidateJob.sourceId && existing.sourceId &&
          candidateJob.sourceId === existing.sourceId &&
          String(candidateJob.externalId) === String(existing.externalId)) {
        return {
          isDuplicate: true,
          matchedJob: existing,
          reason: 'EXACT_SOURCE_EXTERNAL_ID',
          confidence: 1.0
        };
      }

      // 2. Exact Canonical URL or Application URL
      if (candidateJob.canonicalUrl && existing.canonicalUrl &&
          this.normalizeUrl(candidateJob.canonicalUrl) === this.normalizeUrl(existing.canonicalUrl)) {
        return {
          isDuplicate: true,
          matchedJob: existing,
          reason: 'CANONICAL_URL_MATCH',
          confidence: 1.0
        };
      }

      if (candidateJob.applicationUrl && existing.applicationUrl &&
          this.normalizeUrl(candidateJob.applicationUrl) === this.normalizeUrl(existing.applicationUrl)) {
        return {
          isDuplicate: true,
          matchedJob: existing,
          reason: 'APPLICATION_URL_MATCH',
          confidence: 0.98
        };
      }

      // 3. Normalized Company + Normalized Title + Location match
      const cCompany = this.normalizeCompanyName(candidateJob.companyName);
      const eCompany = this.normalizeCompanyName(existing.companyName);

      const isCompanyMatch = this.areCompaniesEqual(cCompany, eCompany);

      if (isCompanyMatch) {
        const cTitle = this.normalizeStr(candidateJob.normalizedTitle || candidateJob.jobTitle || candidateJob.title);
        const eTitle = this.normalizeStr(existing.normalizedTitle || existing.jobTitle || existing.title);

        const titleSimilarity = this.calculateJaccardSimilarity(cTitle, eTitle);
        if (titleSimilarity >= 0.8) {
          const cCountry = (candidateJob.country || '').toLowerCase();
          const eCountry = (existing.country || '').toLowerCase();

          if (!cCountry || !eCountry || cCountry === eCountry) {
            return {
              isDuplicate: true,
              matchedJob: existing,
              reason: 'COMPANY_TITLE_SIMILARITY',
              confidence: Number((0.85 + (titleSimilarity * 0.15)).toFixed(2))
            };
          }
        }
      }
    }

    return {
      isDuplicate: false,
      matchedJob: null,
      reason: null,
      confidence: 0
    };
  }

  normalizeCompanyName(company) {
    if (!company) return '';
    return company
      .toLowerCase()
      .replace(/\b(inc|llc|corp|corporation|ltd|limited|technologies|technology|solutions|group|labs|software|systems|co|company|platforms)\b/gi, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  areCompaniesEqual(cA, cB) {
    if (!cA || !cB) return false;
    if (cA === cB) return true;

    // Tokenized comparison to prevent raw substring false positives (e.g. 'one' matching 'honeywell')
    const tokensA = cA.split(' ').filter(t => t.length > 2);
    const tokensB = cB.split(' ').filter(t => t.length > 2);

    if (tokensA.length === 0 || tokensB.length === 0) {
      return false;
    }

    // Exact single-token match (length > 2)
    if (tokensA.length === 1 && tokensB.length === 1) {
      return tokensA[0] === tokensB[0];
    }

    const setA = new Set(tokensA);
    const setB = new Set(tokensB);

    // If one company name is an extension of the other (e.g. "Amazon Web Services" and "Amazon", or "Stripe Payments" and "Stripe")
    if (tokensA.length === 1 && setB.has(tokensA[0])) return true;
    if (tokensB.length === 1 && setA.has(tokensB[0])) return true;

    // Token Jaccard similarity for multi-word corporate names
    let common = 0;
    for (const t of setA) {
      if (setB.has(t)) common++;
    }
    const similarity = common / (setA.size + setB.size - common);
    return similarity >= 0.5;
  }

  /**
   * Records a detected duplicate relationship, enriches secondary links on the primary job,
   * and preserves source attribution.
   *
   * @param {Object} candidateJob
   * @param {Object} primaryJob
   * @param {string} reason
   * @param {number} confidence
   * @param {Object} store
   * @returns {Object} Enriched primary job
   */
  recordDuplicate(candidateJob, primaryJob, reason, confidence, store = null) {
    if (!primaryJob) return primaryJob;

    if (!primaryJob.secondarySources) {
      primaryJob.secondarySources = [];
    }

    // Retain secondary links and source attribution
    const newSourceLink = candidateJob.applicationUrl || candidateJob.sourceUrl;
    const exists = primaryJob.secondarySources.some(s => s.url === newSourceLink);
    if (!exists && newSourceLink && newSourceLink !== primaryJob.applicationUrl) {
      primaryJob.secondarySources.push({
        sourceId: candidateJob.sourceId,
        sourceType: candidateJob.sourceType,
        url: newSourceLink,
        discoveredAt: candidateJob.discoveredAt || new Date().toISOString()
      });
    }

    // Keep best application URL (prefer direct ATS links over aggregators)
    if (candidateJob.applicationUrl && !primaryJob.applicationUrl) {
      primaryJob.applicationUrl = candidateJob.applicationUrl;
    }

    // Preserve earlier postedAt date if available
    if (candidateJob.postedAt && (!primaryJob.postedAt || new Date(candidateJob.postedAt) < new Date(primaryJob.postedAt))) {
      primaryJob.postedAt = candidateJob.postedAt;
    }

    // Increment duplicate count
    primaryJob.duplicateCount = (primaryJob.duplicateCount || 0) + 1;

    // Track duplicate record in store
    const duplicateRecord = {
      id: `dup_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      primaryJobId: primaryJob.id,
      duplicateExternalId: candidateJob.externalId,
      duplicateSourceId: candidateJob.sourceId,
      duplicateApplicationUrl: candidateJob.applicationUrl,
      reason,
      confidence,
      detectedAt: new Date().toISOString()
    };

    if (store && Array.isArray(store.duplicates)) {
      store.duplicates.push(duplicateRecord);
    }

    return duplicateRecord;
  }

  normalizeStr(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  normalizeUrl(url) {
    if (!url) return '';
    try {
      const u = new URL(url);
      return `${u.hostname}${u.pathname}`.replace(/\/$/, '').toLowerCase();
    } catch {
      return url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    }
  }

  calculateJaccardSimilarity(strA, strB) {
    const tokensA = new Set(strA.split(' ').filter(Boolean));
    const tokensB = new Set(strB.split(' ').filter(Boolean));
    if (tokensA.size === 0 && tokensB.size === 0) return 1.0;
    if (tokensA.size === 0 || tokensB.size === 0) return 0.0;

    let intersectionCount = 0;
    for (const t of tokensA) {
      if (tokensB.has(t)) intersectionCount++;
    }

    const unionCount = tokensA.size + tokensB.size - intersectionCount;
    return intersectionCount / unionCount;
  }
}

export const duplicateDetector = new DuplicateDetector();
export default duplicateDetector;

