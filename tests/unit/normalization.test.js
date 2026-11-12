import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { JobNormalizer } from '../../server/src/modules/normalization/jobNormalizer.js';
import { GreenhouseAdapter } from '../../server/src/collectors/greenhouseAdapter.js';
import { LeverAdapter } from '../../server/src/collectors/leverAdapter.js';

describe('Job Normalization Suite', () => {
  const normalizer = new JobNormalizer();

  test('Normalizes Greenhouse job payload correctly', () => {
    const rawGreenhouse = {
      id: 987654,
      title: 'Associate React Developer - Remote',
      company_name: 'Stripe, Inc.',
      location: { name: 'Bengaluru, India' },
      absolute_url: 'https://boards.greenhouse.io/stripe/jobs/987654',
      updated_at: '2026-03-01T12:00:00Z',
      content: '<p>Join our team. Develop React UI components. Requires JavaScript, React, and CSS.</p>',
      departments: [{ name: 'Frontend Engineering' }]
    };

    const greenhouseAdapter = new GreenhouseAdapter();
    const candidate = greenhouseAdapter.parseRawJob(rawGreenhouse, 'Stripe');
    const normalized = normalizer.normalize(candidate, 'gh_stripe');

    assert.equal(normalized.externalId, '987654');
    assert.equal(normalized.companyName, 'Stripe, Inc.');
    assert.equal(normalized.normalizedTitle, 'associate react developer');
    assert.equal(normalized.country, 'India');
    assert.equal(normalized.countryCode, 'IN');
    assert.equal(normalized.city, 'Bengaluru');
    assert.equal(normalized.workplaceType, 'Remote');
    assert.equal(normalized.applicationUrl, 'https://boards.greenhouse.io/stripe/jobs/987654');
    assert.equal(normalized.postedAt.toISOString(), '2026-03-01T12:00:00.000Z');
    assert.ok(normalized.discoveredAt instanceof Date);
    assert.notEqual(normalized.postedAt.getTime(), normalized.discoveredAt.getTime());
    assert.ok(normalized.requiredSkills.includes('React'));
  });

  test('Normalizes Lever job payload correctly', () => {
    const rawLever = {
      id: 'lever-abc-123',
      text: 'Junior Backend Engineer',
      categories: {
        team: 'Platform Engineering',
        location: 'Toronto, Ontario, Canada',
        commitment: 'Full-time'
      },
      workplaceType: 'Hybrid',
      hostedUrl: 'https://jobs.lever.co/netflix/lever-abc-123',
      applyUrl: 'https://jobs.lever.co/netflix/lever-abc-123/apply',
      createdAt: 1772500000000,
      descriptionPlain: 'Build microservices in Node.js, Express, and PostgreSQL with Docker.'
    };

    const leverAdapter = new LeverAdapter();
    const candidate = leverAdapter.parseRawJob(rawLever, 'Netflix');
    const normalized = normalizer.normalize(candidate, 'lever_netflix');

    assert.equal(normalized.externalId, 'lever-abc-123');
    assert.equal(normalized.jobTitle, 'Junior Backend Engineer');
    assert.equal(normalized.country, 'Canada');
    assert.equal(normalized.countryCode, 'CA');
    assert.equal(normalized.city, 'Toronto');
    assert.equal(normalized.workplaceType, 'Hybrid');
    assert.equal(normalized.applicationUrl, 'https://jobs.lever.co/netflix/lever-abc-123/apply');
    assert.equal(normalized.sourceUrl, 'https://jobs.lever.co/netflix/lever-abc-123');
    assert.ok(normalized.requiredSkills.includes('Node.js'));
    assert.ok(normalized.requiredSkills.includes('PostgreSQL'));
  });

  test('Preserves raw source payload and isolates URLs', () => {
    const raw = {
      id: 'custom-feed-99',
      title: 'Full Stack Trainee',
      company: 'Acme Corp',
      location: 'San Francisco, CA',
      url: 'https://acme.com/careers/99',
      description: 'Acme is looking for a trainee engineer with Python and AWS knowledge. Salary $70,000 to $90,000.',
      postedAt: '2026-02-15T08:00:00Z',
      rawPayload: { internalRef: 'ACME-99-RAW' }
    };

    const normalized = normalizer.normalize(raw, 'custom_feed');
    assert.equal(normalized.country, 'United States');
    assert.equal(normalized.city, 'San Francisco');
    assert.equal(normalized.salaryMin, 70000);
    assert.equal(normalized.salaryMax, 90000);
    assert.equal(normalized.currency, 'USD');
    assert.equal(normalized.rawPayload.internalRef, 'ACME-99-RAW');
  });

  test('Accurately identifies international locations without forcing United States', () => {
    const jobAustralia = normalizer.normalize({
      id: 'job-syd-1',
      title: 'Junior Cloud Developer',
      company: 'Canva',
      location: 'Sydney, Australia',
      description: 'Junior cloud engineering position.'
    });
    assert.equal(jobAustralia.country, 'Australia');
    assert.equal(jobAustralia.countryCode, 'AU');
    assert.equal(jobAustralia.city, 'Sydney');

    const jobNetherlands = normalizer.normalize({
      id: 'job-ams-1',
      title: 'Frontend Engineer',
      company: 'Booking.com',
      location: 'Amsterdam, Netherlands',
      description: 'React developer position.'
    });
    assert.equal(jobNetherlands.country, 'Netherlands');
    assert.equal(jobNetherlands.countryCode, 'NL');
    assert.equal(jobNetherlands.city, 'Amsterdam');

    const jobIreland = normalizer.normalize({
      id: 'job-dub-1',
      title: 'Associate Site Reliability Engineer',
      company: 'Stripe',
      location: 'Dublin, Ireland',
      description: 'SRE role.'
    });
    assert.equal(jobIreland.country, 'Ireland');
    assert.equal(jobIreland.countryCode, 'IE');
    assert.equal(jobIreland.city, 'Dublin');
  });
});
