import { z } from 'zod';

export const AIJobAnalysisSchema = z.object({
  jobSummary: z.string().min(10),
  responsibilities: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  programmingLanguages: z.array(z.string()).default([]),
  frameworks: z.array(z.string()).default([]),
  databases: z.array(z.string()).default([]),
  cloudPlatforms: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  educationRequirements: z.string().default('Not explicitly mentioned'),
  experienceRequirements: z.string().default('0-2 years'),
  softSkills: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  importantRequirements: z.array(z.string()).default([])
});

export const AIMatchScoreSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  relevantProjects: z.array(z.string()).default([]),
  relevantInternships: z.array(z.string()).default([]),
  educationCompatibility: z.string(),
  experienceCompatibility: z.string(),
  locationCompatibility: z.string(),
  strengths: z.array(z.string()),
  potentialGaps: z.array(z.string()),
  aiRecommendation: z.string()
});

