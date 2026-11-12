import { z } from 'zod';

export const UserSkillSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['language', 'framework', 'database', 'cloud', 'tool', 'other']).default('other'),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  yearsOfExperience: z.number().nonnegative().default(0)
});

export const UserProfileSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  education: z.string().min(1),
  degree: z.string().min(1),
  department: z.string().optional().nullable(),
  college: z.string().min(1),
  graduationYear: z.number().int().min(1980).max(2035),
  cgpaOrPercentage: z.string().optional().nullable(),
  skills: z.array(UserSkillSchema).default([]),
  certifications: z.array(z.string()).default([]),
  internships: z.array(z.object({
    role: z.string(),
    company: z.string(),
    duration: z.string(),
    description: z.string()
  })).default([]),
  projects: z.array(z.object({
    title: z.string(),
    technologies: z.array(z.string()),
    description: z.string(),
    link: z.string().optional().nullable()
  })).default([]),
  workExperience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    years: z.number().nonnegative(),
    description: z.string()
  })).default([]),
  preferredCountries: z.array(z.string()).default(['United States', 'India']),
  preferredJobCategories: z.array(z.string()).default(['Software Engineering']),
  preferredEmploymentTypes: z.array(z.string()).default(['Full-time', 'Internship']),
  resumeUrl: z.string().optional().nullable()
});

