import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDesc: z.string().optional(),
    featuredImg: z.string().optional(),
    author: z.string().default('Insurance Greece'),
    category: z.string().optional(),
    status: z.enum(['published', 'draft']).default('published'),
    date: z.date(),
    updatedDate: z.date().optional(),
  }),
});

export const collections = { blog };
