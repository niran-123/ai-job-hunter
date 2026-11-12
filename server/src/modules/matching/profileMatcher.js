import { MATCH_WEIGHTS } from '../../../../shared/constants/weights.js';
import { AIMatchScoreSchema } from '../../../../shared/validators/ai.schema.js';

export class ProfileMatcher {
  constructor(weights = MATCH_WEIGHTS) {
    this.weights = weights;
  }

  /**
   * Matches a job against a user profile and calculates the 100-point score
   *
   * @param {Object} job Normalized job with analysis/skills
   * @param {Object} profile User profile object
   * @returns {import('../../../../shared/validators/ai.schema.js').AIMatchScore}
   */
  match(job, profile) {
    if (!profile) {
      return this.getDefaultMatchScore();
    }

    // 1. Technical Skills (35%)
    const userSkills = (profile.skills || []).map(s => (typeof s === 'string' ? s : s.name).toLowerCase());
    const jobSkills = [
      ...(job.requiredSkills || []),
      ...(job.preferredSkills || []),
      ...(job.analysis?.programmingLanguages || []),
      ...(job.analysis?.frameworks || [])
    ].map(s => s.toLowerCase());

    const uniqueJobSkills = [...new Set(jobSkills)];
    const matchingSkills = [];
    const missingSkills = [];

    for (const skill of uniqueJobSkills) {
      const isMatched = userSkills.some(us => this.isSkillMatch(us, skill));
      if (isMatched) {
        matchingSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    }

    let skillsScore = 0;
    if (uniqueJobSkills.length === 0) {
      skillsScore = this.weights.TECHNICAL_SKILLS; // No restrictive skills requested
    } else {
      const matchRatio = matchingSkills.length / uniqueJobSkills.length;
      skillsScore = Math.round(matchRatio * this.weights.TECHNICAL_SKILLS);
    }

    // 2. Education Eligibility (20%)
    let educationScore = this.weights.EDUCATION_ELIGIBILITY;
    let educationCompatibility = 'Education qualifications fully align with IT/Engineering requirements.';
    const userDegree = (profile.degree || profile.education || '').toLowerCase();
    if (userDegree && !/(b\.?tech|b\.?e|b\.?s|bca|mca|computer|information|software)/i.test(userDegree)) {
      educationScore = Math.round(this.weights.EDUCATION_ELIGIBILITY * 0.7);
      educationCompatibility = 'Degree is outside traditional CS/IT fields, but technical profile provides eligibility.';
    }

    // 3. Experience Eligibility (20%)
    // Fresher / 0-2 yrs policy
    let experienceScore = this.weights.EXPERIENCE_ELIGIBILITY;
    let experienceCompatibility = 'Candidate experience level (0-2 years) fits perfectly within the role criteria.';
    if (job.mandatoryExperience && job.mandatoryExperience > 2) {
      experienceScore = 0;
      experienceCompatibility = 'Job asks for higher experience than 0-2 years baseline.';
    }

    // 4. Role Relevance (15%)
    let roleScore = 0;
    const prefCategories = (profile.preferredJobCategories || []).map(c => c.toLowerCase());
    const jobCategory = (job.jobCategory || '').toLowerCase();
    const jobTitle = (job.jobTitle || job.title || '').toLowerCase();

    const isDirectCategoryMatch = prefCategories.some(pc => jobCategory.includes(pc) || jobTitle.includes(pc));
    if (isDirectCategoryMatch || prefCategories.length === 0) {
      roleScore = this.weights.ROLE_RELEVANCE;
    } else {
      roleScore = Math.round(this.weights.ROLE_RELEVANCE * 0.75); // General IT role relevance
    }

    // 5. Location Preference (10%)
    let locationScore = 0;
    let locationCompatibility = '';
    const prefCountries = (profile.preferredCountries || []).map(c => c.toLowerCase());
    const jobCountry = (job.country || '').toLowerCase();
    const isRemote = (job.workplaceType || '').toLowerCase() === 'remote';

    if (isRemote) {
      locationScore = this.weights.LOCATION_PREFERENCE;
      locationCompatibility = 'Job is fully remote, matching global applicant flexibility.';
    } else if (prefCountries.length === 0 || prefCountries.includes(jobCountry)) {
      locationScore = this.weights.LOCATION_PREFERENCE;
      locationCompatibility = `Job is located in ${job.country || 'preferred location'}, matching candidate preferences.`;
    } else {
      locationScore = Math.round(this.weights.LOCATION_PREFERENCE * 0.3);
      locationCompatibility = `Job is based in ${job.country}, which differs from configured preferred locations.`;
    }

    // Total Match Score (bounded 0-100)
    const rawTotal = skillsScore + educationScore + experienceScore + roleScore + locationScore;
    const matchScore = Math.min(100, Math.max(0, rawTotal));

    // Relevant projects and internships
    const relevantProjects = (profile.projects || [])
      .filter(p => {
        const text = `${p.title} ${(p.technologies || []).join(' ')} ${p.description}`.toLowerCase();
        return matchingSkills.some(ms => text.includes(ms));
      })
      .map(p => p.title);

    const relevantInternships = (profile.internships || [])
      .map(i => `${i.role} at ${i.company}`);

    // Strengths & Gaps
    const strengths = [];
    if (matchingSkills.length > 0) {
      strengths.push(`Direct alignment on core skills: ${matchingSkills.slice(0, 4).join(', ')}.`);
    }
    if (isRemote) {
      strengths.push('Offers full remote flexibility.');
    }
    if (educationScore === this.weights.EDUCATION_ELIGIBILITY) {
      strengths.push('Candidate degree meets educational prerequisite.');
    }

    const potentialGaps = [];
    if (missingSkills.length > 0) {
      potentialGaps.push(`Missing familiarity with: ${missingSkills.slice(0, 4).join(', ')}.`);
    }

    const aiRecommendation = matchScore >= 75
      ? `Strongly Recommended (${matchScore}% match). Your skills in ${matchingSkills.slice(0, 3).join(', ')} strongly align with this opportunity.`
      : matchScore >= 50
      ? `Good Match (${matchScore}% match). Consider highlighting relevant project experience with ${matchingSkills.slice(0, 2).join(', ')}.`
      : `Eligible Opportunity (${matchScore}% match). Apply if interested in learning ${missingSkills.slice(0, 2).join(', ')}.`;

    const result = {
      matchScore,
      matchingSkills,
      missingSkills,
      relevantProjects,
      relevantInternships,
      educationCompatibility,
      experienceCompatibility,
      locationCompatibility,
      strengths: strengths.length ? strengths : ['Candidate meets minimum baseline requirements.'],
      potentialGaps: potentialGaps.length ? potentialGaps : ['No significant skill gaps identified.'],
      aiRecommendation
    };

    return AIMatchScoreSchema.parse(result);
  }

  getDefaultMatchScore() {
    return {
      matchScore: 50,
      matchingSkills: [],
      missingSkills: [],
      relevantProjects: [],
      relevantInternships: [],
      educationCompatibility: 'Profile not configured yet.',
      experienceCompatibility: 'Eligible under 0-2 years baseline.',
      locationCompatibility: 'Location not evaluated.',
      strengths: ['Eligible fresher / entry-level role.'],
      potentialGaps: ['Complete profile to see personalized match score.'],
      aiRecommendation: 'Set up your profile to receive personalized scoring and gap analysis.'
    };
  }

  isSkillMatch(skillA, skillB) {
    const sA = (skillA || '').toLowerCase().trim();
    const sB = (skillB || '').toLowerCase().trim();
    if (!sA || !sB) return false;
    if (sA === sB) return true;

    // Clean .js, spaces, and non-alphanumeric (except + and #)
    const cleanA = sA.replace(/\.js\b/g, 'js').replace(/[^a-z0-9+#]/g, '');
    const cleanB = sB.replace(/\.js\b/g, 'js').replace(/[^a-z0-9+#]/g, '');
    if (cleanA && cleanB && cleanA === cleanB) return true;

    // Strict guard: Java and JavaScript must NEVER match
    if ((sA === 'java' && sB.startsWith('javascript')) || (sB === 'java' && sA.startsWith('javascript'))) {
      return false;
    }

    // Strict guard: Single-letter languages C and R
    const singleLetterLangs = new Set(['c', 'r', 'c++', 'c#', 'css', 'sql', 'go']);
    if (singleLetterLangs.has(sA) || singleLetterLangs.has(sB)) {
      return sA === sB || cleanA === cleanB;
    }

    // Standard synonym aliases
    const aliases = {
      'js': 'javascript',
      'javascript': 'js',
      'ts': 'typescript',
      'typescript': 'ts',
      'py': 'python',
      'python': 'py',
      'golang': 'go',
      'go': 'golang',
      'react': 'reactjs',
      'reactjs': 'react',
      'node': 'nodejs',
      'nodejs': 'node',
      'vue': 'vuejs',
      'vuejs': 'vue',
      'postgres': 'postgresql',
      'postgresql': 'postgres',
      'k8s': 'kubernetes',
      'kubernetes': 'k8s',
      'aws': 'amazon web services',
      'amazon web services': 'aws',
      'gcp': 'google cloud',
      'google cloud': 'gcp'
    };

    if (aliases[sA] && aliases[sA] === sB) return true;
    if (aliases[sB] && aliases[sB] === sA) return true;
    if (aliases[cleanA] && aliases[cleanA] === cleanB) return true;

    // Word boundary match for multi-word phrases (length >= 4)
    if (sA.length >= 4 && sB.length >= 4) {
      if (sA.includes(sB) || sB.includes(sA)) {
        const regexA = new RegExp(`\\b${sA.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regexA.test(sB)) return true;
        const regexB = new RegExp(`\\b${sB.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regexB.test(sA)) return true;
      }
    }

    return false;
  }
}

export const profileMatcher = new ProfileMatcher();
export default profileMatcher;

