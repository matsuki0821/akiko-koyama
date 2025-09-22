import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string().max(200),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    cover: z.string().optional(),
    readingTime: z.string().optional()
  })
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string().max(200),
    year: z.number(),
    category: z.string(),
    tags: z.array(z.string()).optional(),
    outcome: z.record(z.number()).optional(),
    role: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
    client: z.string().optional(),
    cover: z.string().optional()
  })
});

const testimonials = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    affiliation: z.string().optional(),
    avatar: z.string().optional(),
    quote: z.string(),
    relatedProject: z.string().optional()
  })
});

export const collections = { blog, projects, testimonials };


