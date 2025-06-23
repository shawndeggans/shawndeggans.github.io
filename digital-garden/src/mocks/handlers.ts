import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/content/index.json', () => {
    return HttpResponse.json([
      {
        slug: 'sample-content',
        title: 'Sample Content',
        date: '2024-01-01',
        tags: ['test', 'sample'],
        description: 'Test content for unit testing'
      }
    ]);
  }),

  http.get('/content/:slug.md', ({ params }) => {
    const { slug } = params;
    return HttpResponse.text(`---
title: ${slug}
date: 2024-01-01
tags: [test]
---

# Test Content

This is test content for ${slug}.

[[another-content]]
`);
  }),
];