import { NormalizedJobSchema } from '../../../../shared/validators/job.schema.js';

export class JobNormalizer {
  /**
   * Normalizes an incoming raw job from any source adapter.
   *
   * @param {Object} rawJob
   * @param {string} sourceId
   * @returns {Object} Validated Normalized Job
   */
  normalize(rawJob, sourceId = 'src_default') {
    const title = (rawJob.jobTitle || rawJob.title || 'Untitled Role').trim();
    const rawCompany = (rawJob.companyName || rawJob.company || 'Unknown Company').trim();
    const companyNormalized = this.normalizeCompanyName(rawCompany);
    const titleNormalized = this.normalizeJobTitle(title);
    
    const locationRaw = (rawJob.location || 'Remote / Unspecified').trim();
    const { country, countryCode, city, workplaceType } = this.parseLocation(locationRaw, title, rawJob.description);

    const employmentType = this.normalizeEmploymentType(rawJob.employmentType, title, rawJob.description);
    const jobCategory = this.categorizeRole(title, rawJob.department);

    const description = (rawJob.description || rawJob.descriptionHtml || '').trim();
    const responsibilities = this.extractResponsibilities(description);
    const { requiredSkills, preferredSkills } = this.extractSkills(description);
    const { salaryMin, salaryMax, currency } = this.extractSalary(description);

    const normalizedData = {
      externalId: String(rawJob.externalId || rawJob.id || Math.random().toString(36).substring(7)),
      sourceId: String(sourceId),
      jobTitle: title,
      normalizedTitle: titleNormalized,
      companyName: rawCompany,
      companyWebsite: rawJob.companyWebsite || null,
      country,
      countryCode,
      city,
      location: locationRaw,
      workplaceType: rawJob.workplaceType || workplaceType,
      employmentType,
      jobCategory,
      description,
      responsibilities,
      requiredSkills,
      preferredSkills,
      educationRequirements: rawJob.educationRequirements || null,
      experienceMin: rawJob.experienceMin !== undefined ? rawJob.experienceMin : null,
      experienceMax: rawJob.experienceMax !== undefined ? rawJob.experienceMax : null,
      mandatoryExperience: rawJob.mandatoryExperience !== undefined ? rawJob.mandatoryExperience : null,
      preferredExperience: rawJob.preferredExperience !== undefined ? rawJob.preferredExperience : null,
      salaryMin,
      salaryMax,
      currency,
      postedAt: rawJob.postedAt ? new Date(rawJob.postedAt) : null,
      discoveredAt: new Date(),
      applicationUrl: rawJob.applicationUrl || rawJob.url || 'https://example.com/apply',
      sourceUrl: rawJob.sourceUrl || rawJob.url || 'https://example.com/source',
      linkedinPostUrl: rawJob.linkedinPostUrl || null,
      canonicalUrl: rawJob.canonicalUrl || rawJob.applicationUrl || rawJob.sourceUrl || null,
      eligibilityStatus: 'NEEDS_REVIEW',
      eligibilityReason: null,
      rawPayload: rawJob.rawPayload || rawJob
    };

    return NormalizedJobSchema.parse(normalizedData);
  }

  normalizeCompanyName(company) {
    return company
      .toLowerCase()
      .replace(/\b(inc\.?|llc\.?|corp\.?|corporation|ltd\.?|limited|technologies|solutions|group)\b/gi, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  normalizeJobTitle(title) {
    return title
      .toLowerCase()
      .replace(/\b(immediate hiring|urgent requirement|hiring for|remote|hybrid|onsite|\(m\/f\/d\)|\(all genders\))\b/gi, '')
      .replace(/[-–—/,\s]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  parseLocation(locationStr, title = '', description = '') {
    const loc = locationStr.toLowerCase();
    const combined = `${title} ${loc} ${description}`.toLowerCase();

    let workplaceType = 'Onsite';
    if (combined.includes('remote') || combined.includes('anywhere') || combined.includes('work from home')) {
      workplaceType = 'Remote';
    } else if (combined.includes('hybrid')) {
      workplaceType = 'Hybrid';
    }

    let country = null;
    let countryCode = null;
    let city = null;

    if (loc.includes('india') || loc.includes('bangalore') || loc.includes('bengaluru') || loc.includes('hyderabad') || loc.includes('pune') || loc.includes('noida') || loc.includes('delhi') || loc.includes('chennai') || loc.includes('mumbai') || loc.includes('gurgaon')) {
      country = 'India';
      countryCode = 'IN';
      if (loc.includes('bangalore') || loc.includes('bengaluru')) city = 'Bengaluru';
      else if (loc.includes('hyderabad')) city = 'Hyderabad';
      else if (loc.includes('pune')) city = 'Pune';
      else if (loc.includes('mumbai')) city = 'Mumbai';
      else if (loc.includes('delhi') || loc.includes('noida') || loc.includes('gurgaon')) city = 'Delhi NCR';
    } else if (loc.includes('canada') || loc.includes('toronto') || loc.includes('vancouver') || loc.includes('montreal') || loc.includes('ottawa')) {
      country = 'Canada';
      countryCode = 'CA';
      if (loc.includes('toronto')) city = 'Toronto';
      else if (loc.includes('vancouver')) city = 'Vancouver';
      else if (loc.includes('montreal')) city = 'Montreal';
    } else if (loc.includes('united kingdom') || loc.includes('uk') || loc.includes('london') || loc.includes('manchester') || loc.includes('edinburgh') || loc.includes('birmingham') || loc.includes('cambridge')) {
      country = 'United Kingdom';
      countryCode = 'GB';
      if (loc.includes('london')) city = 'London';
      else if (loc.includes('manchester')) city = 'Manchester';
      else if (loc.includes('cambridge')) city = 'Cambridge';
    } else if (loc.includes('germany') || loc.includes('deutschland') || loc.includes('berlin') || loc.includes('munich') || loc.includes('frankfurt') || loc.includes('hamburg')) {
      country = 'Germany';
      countryCode = 'DE';
      if (loc.includes('berlin')) city = 'Berlin';
      else if (loc.includes('munich')) city = 'Munich';
      else if (loc.includes('frankfurt')) city = 'Frankfurt';
    } else if (loc.includes('singapore')) {
      country = 'Singapore';
      countryCode = 'SG';
      city = 'Singapore';
    } else if (loc.includes('australia') || loc.includes('sydney') || loc.includes('melbourne') || loc.includes('brisbane')) {
      country = 'Australia';
      countryCode = 'AU';
      if (loc.includes('sydney')) city = 'Sydney';
      else if (loc.includes('melbourne')) city = 'Melbourne';
    } else if (loc.includes('netherlands') || loc.includes('amsterdam') || loc.includes('rotterdam')) {
      country = 'Netherlands';
      countryCode = 'NL';
      city = 'Amsterdam';
    } else if (loc.includes('ireland') || loc.includes('dublin')) {
      country = 'Ireland';
      countryCode = 'IE';
      city = 'Dublin';
    } else if (loc.includes('france') || loc.includes('paris')) {
      country = 'France';
      countryCode = 'FR';
      city = 'Paris';
    } else if (loc.includes('switzerland') || loc.includes('zurich') || loc.includes('geneva')) {
      country = 'Switzerland';
      countryCode = 'CH';
      city = 'Zurich';
    } else if (loc.includes('united states') || loc.includes('usa') || loc.includes('u.s.') || loc.includes('san francisco') || loc.includes('new york') || loc.includes('austin') || loc.includes('seattle') || loc.includes('boston') || loc.includes('chicago') || loc.includes('los angeles') || loc.includes('denver') || loc.includes('atlanta')) {
      country = 'United States';
      countryCode = 'US';
      if (loc.includes('san francisco')) city = 'San Francisco';
      else if (loc.includes('new york')) city = 'New York';
      else if (loc.includes('austin')) city = 'Austin';
      else if (loc.includes('seattle')) city = 'Seattle';
      else if (loc.includes('boston')) city = 'Boston';
    } else if (workplaceType === 'Remote' || loc.includes('remote') || loc.includes('anywhere') || loc.includes('worldwide')) {
      country = 'Global / Remote';
      countryCode = 'GLOBAL';
    } else {
      country = 'Unspecified';
      countryCode = 'UN';
    }

    return { country, countryCode, city, workplaceType };
  }

  normalizeEmploymentType(rawType, title = '', description = '') {
    const combined = `${rawType || ''} ${title} ${description}`.toLowerCase();
    if (combined.includes('intern') || combined.includes('internship') || combined.includes('co-op')) {
      return 'Internship';
    }
    if (combined.includes('graduate trainee') || combined.includes('graduate engineer')) {
      return 'Graduate trainee';
    }
    if (combined.includes('apprenticeship')) {
      return 'Apprenticeship';
    }
    if (combined.includes('contract') || combined.includes('temporary')) {
      return 'Contract';
    }
    return 'Full-time';
  }

  categorizeRole(title, department = '') {
    const t = `${title} ${department}`.toLowerCase();
    if (t.includes('frontend') || t.includes('react') || t.includes('ui developer')) return 'Frontend Development';
    if (t.includes('backend') || t.includes('node') || t.includes('java developer') || t.includes('python developer')) return 'Backend Development';
    if (t.includes('full stack') || t.includes('fullstack')) return 'Full-Stack Development';
    if (t.includes('devops') || t.includes('sre') || t.includes('cloud')) return 'Cloud & DevOps';
    if (t.includes('data engineer') || t.includes('data analyst') || t.includes('machine learning') || t.includes('ai engineer')) return 'Data & AI';
    if (t.includes('qa') || t.includes('test') || t.includes('quality')) return 'QA & Testing';
    if (t.includes('cyber') || t.includes('security')) return 'Cybersecurity';
    return 'Software Engineering';
  }

  extractResponsibilities(description) {
    const bulletLines = description
      .split(/\n|\r|\. /)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 250 && /^(develop|build|design|collaborate|write|maintain|participate|assist|work|create)/i.test(s));
    return bulletLines.slice(0, 6);
  }

  extractSkills(description) {
    const commonSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
      'React', 'Node.js', 'Express', 'Angular', 'Vue.js', 'Next.js', 'Django', 'Spring Boot', 'FastAPI',
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'Linux', 'Terraform',
      'REST API', 'GraphQL', 'Tailwind CSS', 'HTML5', 'CSS3', 'Jest', 'Playwright'
    ];

    const foundSkills = [];
    for (const skill of commonSkills) {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(description)) {
        foundSkills.push(skill);
      }
    }

    return {
      requiredSkills: foundSkills.slice(0, 8),
      preferredSkills: foundSkills.slice(8, 14)
    };
  }

  extractSalary(description) {
    const match = description.match(/\$(\d{2,3}(?:,\d{3})*|\d+k?)\s*(?:-|to)\s*\$(\d{2,3}(?:,\d{3})*|\d+k?)/i);
    if (match) {
      const parseVal = (str) => {
        let clean = str.replace(/,/g, '').toLowerCase();
        if (clean.endsWith('k')) return parseFloat(clean) * 1000;
        return parseFloat(clean);
      };
      return {
        salaryMin: parseVal(match[1]),
        salaryMax: parseVal(match[2]),
        currency: 'USD'
      };
    }
    return {
      salaryMin: null,
      salaryMax: null,
      currency: null
    };
  }
}

export const jobNormalizer = new JobNormalizer();
export default jobNormalizer;
