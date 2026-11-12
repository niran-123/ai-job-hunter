import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { EligibilityEngine } from '../../server/src/modules/eligibility/eligibilityEngine.js';

describe('EligibilityEngine Suite', () => {
  const engine = new EligibilityEngine(2);

  test('0 years experience -> ELIGIBLE', () => {
    const job = {
      title: 'Junior Software Engineer',
      description: 'Requirements: 0 years of experience. Strong fundamental knowledge of JavaScript.',
      employmentType: 'Full-time'
    };
    const res = engine.evaluate(job);
    assert.equal(res.status, 'ELIGIBLE');
  });

  test('0-1 years experience -> ELIGIBLE', () => {
    const job = {
      title: 'Frontend Developer',
      description: 'Looking for a developer with 0-1 years of experience in React and CSS.',
      employmentType: 'Full-time'
    };
    const res = engine.evaluate(job);
    assert.equal(res.status, 'ELIGIBLE');
  });

  test('0-2 years experience -> ELIGIBLE', () => {
    const job = {
      title: 'Associate Software Developer',
      description: 'Candidate should possess 0 to 2 years of relevant experience in Node.js and SQL.',
      employmentType: 'Full-time'
    };
    const res = engine.evaluate(job);
    assert.equal(res.status, 'ELIGIBLE');
  });

  test('Internship -> ELIGIBLE', () => {
    const job = {
      title: 'Software Engineering Intern',
      description: 'Summer internship for computer science students. Work on cloud backend APIs.',
      employmentType: 'Internship'
    };
    const res = engine.evaluate(job);
    assert.equal(res.status, 'ELIGIBLE');
  });

  test('3 years mandatory -> INELIGIBLE', () => {
    const job = {
      title: 'Software Developer',
      description: 'Candidate must have at least 3 years of experience in Python and Django.',
      employmentType: 'Full-time'
    };
    const res = engine.evaluate(job);
    assert.equal(res.status, 'INELIGIBLE');
    assert.match(res.reason, /exceeds maximum allowed threshold/i);
  });

  test('1-3 years mandatory -> INELIGIBLE', () => {
    const job = {
      title: 'Full Stack Engineer',
      description: 'We require 1-3 years of experience in React and Node.js.',
      employmentType: 'Full-time'
    };
    const res = engine.evaluate(job);
    assert.equal(res.status, 'INELIGIBLE');
    assert.match(res.reason, /exceeds (maximum allowed threshold|strict maximum experience policy)/i);
  });

  test('2 years mandatory and 3 years preferred -> ELIGIBLE', () => {
    const job = {
      title: 'Software Engineer',
      description: 'Minimum 2 years of experience required. 3 years experience preferred.',
      mandatoryExperience: 2,
      preferredExperience: 3,
      employmentType: 'Full-time'
    };
    const res = engine.evaluate(job);
    assert.equal(res.status, 'ELIGIBLE');
  });

  test('Freshers welcome, 2 years preferred -> ELIGIBLE', () => {
    const job = {
      title: 'Java Developer',
      description: 'Freshers welcome to apply. 2 years preferred for faster onboarding.',
      employmentType: 'Full-time'
    };
    const res = engine.evaluate(job);
    assert.equal(res.status, 'ELIGIBLE');
  });

  test('Missing experience -> NEEDS_REVIEW', () => {
    const job = {
      title: 'Software Engineer',
      description: 'Join our high performing core engineering team building distributed systems.',
      employmentType: 'Full-time'
    };
    const res = engine.evaluate(job);
    assert.equal(res.status, 'NEEDS_REVIEW');
    assert.match(res.reason, /not explicitly mentioned/i);
  });

  test('Ambiguous / conflicting experience numbers -> NEEDS_REVIEW', () => {
    const job = {
      title: 'DevOps Engineer',
      description: 'Requires 1 year AWS. Need 4 years Linux administration. Must have 5 years scripting.',
      employmentType: 'Full-time'
    };
    const res = engine.evaluate(job);
    assert.equal(res.status, 'NEEDS_REVIEW');
    assert.match(res.reason, /ambiguous/i);
  });

  test('Non-IT role -> INELIGIBLE', () => {
    const job = {
      title: 'Senior Registered Nurse',
      description: 'Hospital patient care and medical charts management.',
      employmentType: 'Full-time'
    };
    const res = engine.evaluate(job);
    assert.equal(res.status, 'INELIGIBLE');
    assert.match(res.reason, /outside IT and software/i);
  });

  test('Senior / Lead title -> INELIGIBLE', () => {
    const job = {
      title: 'Lead Software Architect',
      description: 'Architect large scale cloud native systems in Java and Go.',
      employmentType: 'Full-time'
    };
    const res = engine.evaluate(job);
    assert.equal(res.status, 'INELIGIBLE');
    assert.match(res.reason, /Senior\/Lead/i);
  });

  test('Entry Level title with 3+ years experience in description -> strictly INELIGIBLE', () => {
    const job = {
      title: 'Entry Level Software Engineer',
      description: 'Requirements: 3+ years of experience in Java and Spring Boot. Strong background in microservices.',
      employmentType: 'Full-time'
    };
    const res = engine.evaluate(job);
    assert.equal(res.status, 'INELIGIBLE', 'Title alone cannot override mandatory experience >= 3 years');
  });

  test('3+ years experience in React -> strictly INELIGIBLE', () => {
    const job = {
      title: 'Software Engineer',
      description: 'Requirements: 3+ years of experience in React and Node.js.',
      employmentType: 'Full-time'
    };
    const res = engine.evaluate(job);
    assert.equal(res.status, 'INELIGIBLE');
  });

  test('3-5 years range of software development experience -> strictly INELIGIBLE', () => {
    const job = {
      title: 'Full Stack Developer',
      description: 'Looking for 3-5 years of software development experience in cloud environments.',
      employmentType: 'Full-time'
    };
    const res = engine.evaluate(job);
    assert.equal(res.status, 'INELIGIBLE');
  });

  test('Junior title with 4+ years experience -> strictly INELIGIBLE', () => {
    const job = {
      title: 'Junior Software Engineer',
      description: 'We need 4+ years of experience with Python and Django.',
      employmentType: 'Full-time'
    };
    const res = engine.evaluate(job);
    assert.equal(res.status, 'INELIGIBLE');
  });

  test('Qualitative experience without numbers -> NEEDS_REVIEW', () => {
    const job = {
      title: 'Full Stack Engineer',
      description: 'Relevant experience required in full stack web development.',
      employmentType: 'Full-time'
    };
    const res = engine.evaluate(job);
    assert.equal(res.status, 'NEEDS_REVIEW');
  });
});
