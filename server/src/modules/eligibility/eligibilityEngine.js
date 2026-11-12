import { ROLE_KEYWORD_PATTERNS } from '../../../../shared/constants/roles.js';

export class EligibilityEngine {
  constructor(maxAllowedExperience = 2) {
    this.maxAllowedExperience = maxAllowedExperience;
  }

  /**
   * Deterministically evaluate eligibility of a job posting.
   * Does NOT rely on AI.
   *
   * @param {Object} job
   * @returns {{
   *   status: 'ELIGIBLE' | 'INELIGIBLE' | 'NEEDS_REVIEW',
   *   reason: string,
   *   experienceMin: number | null,
   *   experienceMax: number | null,
   *   mandatoryExperience: number | null,
   *   preferredExperience: number | null,
   *   isITRole: boolean,
   *   evaluatedAt: string
   * }}
   */
  evaluate(job) {
    const title = (job.jobTitle || job.title || '').trim();
    const description = (job.description || '').trim();
    const employmentType = (job.employmentType || '').toLowerCase();
    const evaluatedAt = new Date().toISOString();

    // 1. Validate if it's an IT / Software role
    const isIT = this.isITRole(title, description);
    if (!isIT) {
      return {
        status: 'INELIGIBLE',
        reason: 'Role is outside IT and software engineering categories.',
        experienceMin: null,
        experienceMax: null,
        mandatoryExperience: null,
        preferredExperience: null,
        isITRole: false,
        evaluatedAt
      };
    }

    // 2. Reject explicit senior / lead / executive titles
    const isSeniorTitle = /\b(senior|sr\.?|lead|principal|staff|architect|director|vp|vice president|head of|engineering manager)\b/i.test(title);
    if (isSeniorTitle) {
      // Unless explicitly an intern or trainee title
      if (!/\b(intern|internship|trainee|fresher)\b/i.test(title)) {
        return {
          status: 'INELIGIBLE',
          reason: `Senior/Lead level role detected in title: "${title}".`,
          experienceMin: 3,
          experienceMax: null,
          mandatoryExperience: 3,
          preferredExperience: null,
          isITRole: true,
          evaluatedAt
        };
      }
    }

    // 3. Check for obvious Internship / Fresher / Trainee indicators
    const isInternship = employmentType.includes('intern') || /\b(intern|internship)\b/i.test(title);
    const isFresherOrTrainee = /\b(fresher|entry[\s-]?level|graduate trainee|engineer trainee|apprentice)\b/i.test(title) ||
      /\b(freshers? (welcome|can apply|eligible)|no prior experience required|0 years of experience)\b/i.test(description);

    // 4. Extract experience specifications from description and structured fields
    const parsedExp = this.extractExperience(description, job);

    // 5. Apply deterministic decision matrix
    // RULE A: If mandatory experience is explicitly > maxAllowedExperience -> INELIGIBLE (Title keywords CANNOT override this!)
    if (parsedExp.mandatoryExperience !== null && parsedExp.mandatoryExperience > this.maxAllowedExperience) {
      return {
        status: 'INELIGIBLE',
        reason: `Mandatory experience (${parsedExp.mandatoryExperience} years) exceeds maximum allowed threshold of ${this.maxAllowedExperience} years.`,
        experienceMin: parsedExp.experienceMin,
        experienceMax: parsedExp.experienceMax,
        mandatoryExperience: parsedExp.mandatoryExperience,
        preferredExperience: parsedExp.preferredExperience,
        isITRole: true,
        evaluatedAt
      };
    }

    // RULE B: If upper bound of experience range exceeds threshold (e.g. 1-3 years, 3-5 years)
    if (parsedExp.experienceMax !== null && parsedExp.experienceMax > this.maxAllowedExperience) {
      // Check if description clearly establishes that upper bound is only preferred
      if (parsedExp.mandatoryExperience !== null && parsedExp.mandatoryExperience <= this.maxAllowedExperience) {
        return {
          status: 'ELIGIBLE',
          reason: `Mandatory experience (${parsedExp.mandatoryExperience} yrs) meets threshold (≤ ${this.maxAllowedExperience} yrs). Upper range (${parsedExp.experienceMax} yrs) is preferred.`,
          experienceMin: parsedExp.experienceMin,
          experienceMax: parsedExp.experienceMax,
          mandatoryExperience: parsedExp.mandatoryExperience,
          preferredExperience: parsedExp.preferredExperience,
          isITRole: true,
          evaluatedAt
        };
      }

      // If upper bound > threshold and mandatory is not <= threshold, strictly reject
      return {
        status: 'INELIGIBLE',
        reason: `Experience range (${parsedExp.experienceMin ?? 0}-${parsedExp.experienceMax} years) exceeds strict maximum experience policy of ${this.maxAllowedExperience} years.`,
        experienceMin: parsedExp.experienceMin,
        experienceMax: parsedExp.experienceMax,
        mandatoryExperience: parsedExp.mandatoryExperience ?? parsedExp.experienceMax,
        preferredExperience: parsedExp.preferredExperience,
        isITRole: true,
        evaluatedAt
      };
    }

    // RULE C: If explicit mandatory <= maxAllowedExperience -> ELIGIBLE
    if (parsedExp.mandatoryExperience !== null && parsedExp.mandatoryExperience <= this.maxAllowedExperience) {
      return {
        status: 'ELIGIBLE',
        reason: `Experience requirement (${parsedExp.mandatoryExperience} years) satisfies fresher/0-2 years eligibility policy.`,
        experienceMin: parsedExp.experienceMin ?? 0,
        experienceMax: parsedExp.experienceMax ?? parsedExp.mandatoryExperience,
        mandatoryExperience: parsedExp.mandatoryExperience,
        preferredExperience: parsedExp.preferredExperience,
        isITRole: true,
        evaluatedAt
      };
    }

    // RULE D: Ambiguity or conflicting experience mentions take precedence over default title matching
    if (parsedExp.ambiguityReason) {
      return {
        status: 'NEEDS_REVIEW',
        reason: `Ambiguous experience requirement: ${parsedExp.ambiguityReason}`,
        experienceMin: parsedExp.experienceMin,
        experienceMax: parsedExp.experienceMax,
        mandatoryExperience: parsedExp.mandatoryExperience,
        preferredExperience: parsedExp.preferredExperience,
        isITRole: true,
        evaluatedAt
      };
    }

    // RULE E: Internships and explicit Fresher/College Trainee postings with no conflicting requirements
    if (isInternship) {
      return {
        status: 'ELIGIBLE',
        reason: 'Internship opportunity eligible for students and early talent.',
        experienceMin: 0,
        experienceMax: 1,
        mandatoryExperience: 0,
        preferredExperience: parsedExp.preferredExperience,
        isITRole: true,
        evaluatedAt
      };
    }

    // Explicit Fresher keywords in title/body (e.g. "Fresher", "Graduate Trainee", "0 years")
    const isExplicitFresher = /\b(fresher|graduate trainee|engineer trainee|apprentice)\b/i.test(title) ||
      /\b(freshers? (welcome|can apply|eligible)|no prior experience required|0 years of experience)\b/i.test(description);

    if (isExplicitFresher) {
      return {
        status: 'ELIGIBLE',
        reason: 'Explicit fresher / trainee opportunity eligible under 0-2 years policy.',
        experienceMin: 0,
        experienceMax: 1,
        mandatoryExperience: 0,
        preferredExperience: parsedExp.preferredExperience,
        isITRole: true,
        evaluatedAt
      };
    }

    // For "Junior", "Entry-Level", "Associate" or unspecified roles where experience is omitted from posting:
    // As per Requirement 2.2: "Job E: Experience not mentioned. Result: Needs review until sufficient evidence is available."
    return {
      status: 'NEEDS_REVIEW',
      reason: 'Experience requirement not explicitly mentioned in job posting. Flagged for review.',
      experienceMin: null,
      experienceMax: null,
      mandatoryExperience: null,
      preferredExperience: null,
      isITRole: true,
      evaluatedAt
    };
  }

  isITRole(title, description) {
    const combined = `${title} ${description}`.toLowerCase();
    return ROLE_KEYWORD_PATTERNS.some(pattern => pattern.test(combined));
  }

  extractExperience(description, job = {}) {
    const res = {
      experienceMin: null,
      experienceMax: null,
      mandatoryExperience: null,
      preferredExperience: null,
      ambiguityReason: null
    };

    // 1. Structured overrides if already known
    if (job.mandatoryExperience !== undefined && job.mandatoryExperience !== null) {
      res.mandatoryExperience = Number(job.mandatoryExperience);
    }
    if (job.preferredExperience !== undefined && job.preferredExperience !== null) {
      res.preferredExperience = Number(job.preferredExperience);
    }
    if (job.experienceMin !== undefined && job.experienceMin !== null) {
      res.experienceMin = Number(job.experienceMin);
    }
    if (job.experienceMax !== undefined && job.experienceMax !== null) {
      res.experienceMax = Number(job.experienceMax);
    }

    if (res.mandatoryExperience !== null || res.experienceMax !== null) {
      return res;
    }

    if (!description || typeof description !== 'string') {
      return res;
    }

    // 2. Check for explicit 0-year / fresher indicators
    if (/(?:freshers?\s*welcome|freshers?\s*(?:can\s*)?apply|no\s*(?:prior\s*)?experience\s*required|0\s*(?:-|to)?\s*0\s*years?|zero\s*years?|no\s*experience\s*necessary)/i.test(description)) {
      res.experienceMin = 0;
      res.mandatoryExperience = 0;
      res.experienceMax = 1;

      const prefMatch = description.match(/(\d+)\+?\s*(?:years?|yrs?)[^\n.]{0,35}?(?:preferred|is a plus|bonus|advantageous)/i);
      if (prefMatch) {
        res.preferredExperience = parseInt(prefMatch[1], 10);
      }
      return res;
    }

    // Check if conflicting or ambiguous numbers are mentioned across description
    const multipleMentions = description.match(/\b\d+\+?\s*(?:years?|yrs?)\b/gi);
    if (multipleMentions && multipleMentions.length > 2) {
      res.ambiguityReason = 'Multiple conflicting experience requirements found in job description.';
      return res;
    }

    // 3. Check for range mentions (e.g. "0-2 years", "1 to 3 yrs", "3-5 years of software engineering experience")
    const rangeRegex = /(\d+)\s*(?:-|to)\s*(\d+)\+?\s*(?:years?|yrs?)(?:(?:\s*(?:of|in)?\s*[a-z0-9\s/,-]{0,35}?)experience)?/gi;
    let rangeMatch;
    const foundRanges = [];
    while ((rangeMatch = rangeRegex.exec(description)) !== null) {
      foundRanges.push({
        min: parseInt(rangeMatch[1], 10),
        max: parseInt(rangeMatch[2], 10),
        index: rangeMatch.index,
        full: rangeMatch[0]
      });
    }

    if (foundRanges.length > 0) {
      // Pick the most relevant range (usually the first qualification requirement)
      const primaryRange = foundRanges[0];
      const snippet = description.substring(Math.max(0, primaryRange.index - 60), primaryRange.index + primaryRange.full.length + 60).toLowerCase();
      const isPref = /preferred|plus|nice to have|bonus|desired|advantage/i.test(snippet);

      res.experienceMin = primaryRange.min;
      res.experienceMax = primaryRange.max;

      if (isPref) {
        res.preferredExperience = primaryRange.max;
        res.mandatoryExperience = primaryRange.min;
      } else {
        res.mandatoryExperience = primaryRange.max;
      }
      return res;
    }

    // 4. Check for preferred experience explicitly stated
    const prefRegex = /(\d+)\+?\s*(?:years?|yrs?)[^\n.]{0,40}?(?:preferred|is a plus|bonus|desired|advantageous|nice to have)/i;
    const prefMatch = description.match(prefRegex);
    if (prefMatch) {
      res.preferredExperience = parseInt(prefMatch[1], 10);
    }

    // 5. Check for single minimum / mandatory / unqualified experience mentions
    // e.g., "3+ years of experience in React", "minimum 2 years experience", "requires 4 years of experience", "at least 3 years"
    const reqRegex = /(?:minimum|at least|mandatory|requires?|must have|have|with)\s*(\d+)\+?\s*(?:years?|yrs?)(?:\s*(?:of|in)?\s*[a-z0-9\s/,-]{0,35}?)experience/gi;
    const generalExpRegex = /(\d+)\+?\s*(?:years?|yrs?)(?:\s*(?:of|in)?\s*[a-z0-9\s/,-]{0,35}?)experience/gi;

    let match;
    const foundReqs = [];
    while ((match = reqRegex.exec(description)) !== null) {
      foundReqs.push(parseInt(match[1], 10));
    }
    if (foundReqs.length === 0) {
      while ((match = generalExpRegex.exec(description)) !== null) {
        const num = parseInt(match[1], 10);
        // Exclude if this exact number is already recorded as preferredExperience
        if (res.preferredExperience !== null && num === res.preferredExperience) {
          continue;
        }
        foundReqs.push(num);
      }
    }

    if (foundReqs.length > 0) {
      const distinct = [...new Set(foundReqs)];
      if (distinct.length > 2) {
        res.ambiguityReason = 'Multiple conflicting experience requirements found in job description.';
        return res;
      }
      res.mandatoryExperience = distinct[0];
      res.experienceMin = distinct[0];
      return res;
    }

    // If only preferred experience was specified, mandatory experience is 0
    if (res.preferredExperience !== null) {
      res.mandatoryExperience = 0;
      res.experienceMin = 0;
      return res;
    }

    // 6. Check for qualitative experience mentions without years (e.g. "prior experience required", "extensive experience necessary")
    if (/\b(prior experience required|relevant experience required|extensive experience|significant experience)\b/i.test(description)) {
      res.ambiguityReason = 'Experience is stated as required but without specific numeric years.';
      return res;
    }

    return res;
  }
}

export const eligibilityEngine = new EligibilityEngine(2);
export default eligibilityEngine;

