/**
 * Anonimy — Structured mock data
 *
 * This module provides realistic mock data for the frontend assessment.
 * It is deliberately separated from JSX so that every usage can later be
 * replaced with real API responses without rewriting any component.
 *
 * Shape: matches the sanitized public response types in src/types/index.ts.
 * Rule:  authorId is never present — only contextual aliases are shown.
 */

import type { Post, Comment, CurrentUser } from '@/types';

// ─── Mock current user (private profile page only) ────────────────────────

export const mockCurrentUser: CurrentUser = {
  email: 'you@example.com',
  createdAt: '2026-08-01T09:00:00.000Z',
};

// ─── Mock posts ───────────────────────────────────────────────────────────

export const mockPosts: Post[] = [
  {
    id: 'post-1',
    content:
      "I finally told my parents that I don't want to become an engineer. It feels terrifying and liberating at the same time.",
    alias: { name: 'Silent Fox' },
    commentCount: 23,
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-2',
    content:
      "What's something you wish you had learned five years earlier? I'll start — how to say no without feeling guilty.",
    alias: { name: 'Blue Raven' },
    commentCount: 41,
    createdAt: new Date(Date.now() - 31 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-3',
    content: "Some days are just harder than others. That's all.",
    alias: { name: 'Quiet Oak' },
    commentCount: 17,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-4',
    content:
      "I've been carrying a secret for three years. Not telling anyone here either — just wanted to acknowledge it existed.",
    alias: { name: 'Hidden Sun' },
    commentCount: 8,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-5',
    content:
      "Unpopular opinion: we spend too much time optimizing things that don't matter and not enough time on the things we're afraid to face.",
    alias: { name: 'Pale Wolf' },
    commentCount: 34,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-6',
    content:
      "Got the promotion I worked towards for two years. I thought I'd feel happier about it.",
    alias: { name: 'Amber Crane' },
    commentCount: 12,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Mock comments (keyed by postId) ─────────────────────────────────────

export const mockComments: Record<string, Comment[]> = {
  'post-1': [
    {
      id: 'c-1-1',
      postId: 'post-1',
      content: 'That takes a lot of courage. Proud of you.',
      alias: { name: 'Blue Raven' },
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
      id: 'c-1-2',
      postId: 'post-1',
      content: 'I can relate to this so much. What are you thinking of doing instead?',
      alias: { name: 'Quiet Oak' },
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: 'c-1-3',
      postId: 'post-1',
      content: 'Hope things get better for you. Rooting for you!',
      alias: { name: 'Hidden Sun' },
      createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    },
  ],
  'post-2': [
    {
      id: 'c-2-1',
      postId: 'post-2',
      content:
        "That boundaries don't make you selfish — they make you sustainable.",
      alias: { name: 'Quiet Oak' },
      createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    },
    {
      id: 'c-2-2',
      postId: 'post-2',
      content: 'How to ask for help. I always thought I had to figure everything out alone.',
      alias: { name: 'Pale Wolf' },
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
  ],
  'post-3': [
    {
      id: 'c-3-1',
      postId: 'post-3',
      content: "Yes. That's enough to say.",
      alias: { name: 'Amber Crane' },
      createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    },
  ],
  'post-4': [],
  'post-5': [
    {
      id: 'c-5-1',
      postId: 'post-5',
      content:
        'This hit differently. I spent all weekend tweaking my morning routine instead of calling my dad.',
      alias: { name: 'Silent Fox' },
      createdAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    },
  ],
  'post-6': [
    {
      id: 'c-6-1',
      postId: 'post-6',
      content: 'Happens more than people talk about. What do you actually want?',
      alias: { name: 'Blue Raven' },
      createdAt: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'c-6-2',
      postId: 'post-6',
      content: 'Congratulations though. Give yourself a moment before chasing the next thing.',
      alias: { name: 'Quiet Oak' },
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

// ─── Landing page preview posts (static subset) ──────────────────────────

export const landingPreviewPosts: Post[] = [mockPosts[0], mockPosts[1]];
