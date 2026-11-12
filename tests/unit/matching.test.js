import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ProfileMatcher } from '../../server/src/modules/matching/profileMatcher.js';

describe('ProfileMatcher Suite', () => {
  const matcher = new ProfileMatcher();

  const mockProfile = {
    fullName: 'Jane Doe',
    degree: 'B.Tech Computer Science',
    skills: [
      { name: 'JavaScript' },
      { name: 'React' },
      { name: 'Node.js' },
      { name: 'PostgreSQL' },
      { name: 'Git' }
    ],
    projects: [
      {
        title: 'E-Commerce React Platform',
        technologies: ['React', 'Node.js', 'PostgreSQL'],
        description: 'Built a full stack shopping cart with React and Node.js'
      }
    ],
    internships: [
      {
        role: 'Frontend Intern',
        company: 'TechCorp'
      }
    ],
    preferredCountries: ['United States', 'India'],
    preferredJobCategories: ['Software Engineering', 'Frontend Development']
  };

  test('Calculates high score for well-aligned job', () => {
    const job = {
      title: 'Junior React Developer',
      jobCategory: 'Frontend Development',
      country: 'United States',
      workplaceType: 'Remote',
      requiredSkills: ['React', 'JavaScript', 'Node.js'],
      preferredSkills: ['PostgreSQL', 'Git']
    };

    const res = matcher.match(job, mockProfile);
    assert.ok(res.matchScore >= 90, `Expected matchScore >= 90, got ${res.matchScore}`);
    assert.ok(res.matchingSkills.includes('react'));
    assert.ok(res.matchingSkills.includes('javascript'));
    assert.ok(res.relevantProjects.includes('E-Commerce React Platform'));
    assert.ok(res.relevantInternships.includes('Frontend Intern at TechCorp'));
    assert.ok(res.strengths.length > 0);
  });

  test('Calculates appropriate score for partial skill match with gaps', () => {
    const job = {
      title: 'Junior DevOps Engineer',
      jobCategory: 'Cloud & DevOps',
      country: 'Germany',
      workplaceType: 'Onsite',
      requiredSkills: ['Kubernetes', 'Terraform', 'Docker'],
      preferredSkills: ['AWS', 'Git']
    };

    const res = matcher.match(job, mockProfile);
    assert.ok(res.matchScore < 75, `Expected score < 75, got ${res.matchScore}`);
    assert.ok(res.missingSkills.includes('kubernetes'));
    assert.ok(res.missingSkills.includes('terraform'));
    assert.ok(res.potentialGaps.length > 0);
  });

  test('Returns default safe score if profile is missing', () => {
    const job = {
      title: 'Junior Engineer',
      requiredSkills: ['Java']
    };

    const res = matcher.match(job, null);
    assert.equal(res.matchScore, 50);
  });

  test('Does NOT falsely match Java with JavaScript or React with C', () => {
    const candidateProfile = {
      skills: [{ name: 'Java' }, { name: 'React' }]
    };
    const job = {
      requiredSkills: ['JavaScript', 'C', 'React', 'Node.js']
    };

    const res = matcher.match(job, candidateProfile);
    assert.deepEqual(res.matchingSkills, ['react'], 'Only React should match');
    assert.ok(res.missingSkills.includes('javascript'), 'JavaScript must be listed as missing for Java candidate');
    assert.ok(res.missingSkills.includes('c'), 'C must be listed as missing for React candidate');
    assert.ok(res.missingSkills.includes('node.js'));
  });

  test('Skill aliases properly resolve (Node.js <-> Node, React.js <-> React, AWS)', () => {
    assert.equal(matcher.isSkillMatch('Node.js', 'node'), true);
    assert.equal(matcher.isSkillMatch('React.js', 'react'), true);
    assert.equal(matcher.isSkillMatch('Amazon Web Services', 'aws'), true);
    assert.equal(matcher.isSkillMatch('Java', 'JavaScript'), false);
    assert.equal(matcher.isSkillMatch('C', 'CSS'), false);
  });
});

