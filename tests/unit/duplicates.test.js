import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DuplicateDetector } from '../../server/src/modules/duplicates/duplicateDetector.js';

describe('DuplicateDetector Suite', () => {
  const detector = new DuplicateDetector();

  const existingJobs = [
    {
      id: 'job-1',
      sourceId: 'gh_meta',
      externalId: '1001',
      companyName: 'Meta',
      normalizedTitle: 'software engineer entry level',
      country: 'United States',
      canonicalUrl: 'https://metacareers.com/jobs/1001',
      applicationUrl: 'https://metacareers.com/apply/1001'
    },
    {
      id: 'job-2',
      sourceId: 'lever_amazon',
      externalId: 'amz-55',
      companyName: 'Amazon',
      normalizedTitle: 'cloud support engineer trainee',
      country: 'India',
      canonicalUrl: 'https://amazon.jobs/55',
      applicationUrl: 'https://amazon.jobs/apply/55'
    }
  ];

  test('Detects exact source ID + external ID duplicate', () => {
    const candidate = {
      sourceId: 'gh_meta',
      externalId: '1001',
      companyName: 'Meta Platforms Inc',
      normalizedTitle: 'Software Engineer Entry Level'
    };

    const res = detector.findDuplicate(candidate, existingJobs);
    assert.equal(res.isDuplicate, true);
    assert.equal(res.reason, 'EXACT_SOURCE_EXTERNAL_ID');
    assert.equal(res.confidence, 1.0);
  });

  test('Detects duplicate via canonical URL match', () => {
    const candidate = {
      sourceId: 'aggregator_feed',
      externalId: 'feed-888',
      canonicalUrl: 'https://metacareers.com/jobs/1001/',
      companyName: 'Meta'
    };

    const res = detector.findDuplicate(candidate, existingJobs);
    assert.equal(res.isDuplicate, true);
    assert.equal(res.reason, 'CANONICAL_URL_MATCH');
  });

  test('Detects duplicate via title similarity and company match', () => {
    const candidate = {
      sourceId: 'other_source',
      externalId: 'oth-99',
      companyName: 'Amazon Web Services',
      normalizedTitle: 'cloud support engineer trainee',
      country: 'India'
    };

    const res = detector.findDuplicate(candidate, existingJobs);
    assert.equal(res.isDuplicate, true);
    assert.equal(res.reason, 'COMPANY_TITLE_SIMILARITY');
  });

  test('Identifies distinct job as non-duplicate', () => {
    const candidate = {
      sourceId: 'lever_google',
      externalId: 'goog-01',
      companyName: 'Google',
      normalizedTitle: 'associate android developer',
      country: 'Canada',
      canonicalUrl: 'https://careers.google.com/jobs/results/01',
      applicationUrl: 'https://careers.google.com/jobs/results/01/apply'
    };

    const res = detector.findDuplicate(candidate, existingJobs);
    assert.equal(res.isDuplicate, false);
    assert.equal(res.matchedJob, null);
  });

  test('Does NOT falsely match company substring collisions (One vs Honeywell)', () => {
    const honeywellJob = [{
      id: 'job-hw',
      companyName: 'Honeywell',
      normalizedTitle: 'software engineer',
      country: 'United States'
    }];
    const candidate = {
      companyName: 'One',
      normalizedTitle: 'software engineer',
      country: 'United States'
    };

    const res = detector.findDuplicate(candidate, honeywellJob);
    assert.equal(res.isDuplicate, false, 'Company One should never falsely match Honeywell');
  });

  test('recordDuplicate properly preserves secondary sources and tracks duplicate history', () => {
    const primaryJob = {
      id: 'job-1',
      companyName: 'Meta',
      applicationUrl: 'https://meta.com/jobs/1'
    };
    const duplicateCandidate = {
      externalId: 'ext-999',
      sourceId: 'src_2',
      sourceType: 'LEVER',
      applicationUrl: 'https://lever.co/meta/job-1'
    };
    const mockStore = { duplicates: [] };

    const record = detector.recordDuplicate(duplicateCandidate, primaryJob, 'COMPANY_TITLE_SIMILARITY', 0.95, mockStore);
    assert.ok(record.id);
    assert.equal(mockStore.duplicates.length, 1);
    assert.equal(primaryJob.secondarySources.length, 1);
    assert.equal(primaryJob.secondarySources[0].url, 'https://lever.co/meta/job-1');
    assert.equal(primaryJob.duplicateCount, 1);
  });
});

