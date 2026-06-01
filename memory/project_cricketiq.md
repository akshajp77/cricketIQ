---
name: project-cricketiq
description: CricketIQ full-stack AI cricket analytics platform — project context and setup notes
metadata:
  type: project
---

CricketIQ is a Next.js 14 / Prisma 7 / NextAuth v5 cricket performance analytics app built at c:\Users\palam\OneDrive\Desktop\CricketIQ\cricketiq.

**Why:** User requested a complete production-ready platform from scratch.

**Key decisions:**
- Uses Prisma 7 `prisma-client` generator (outputs to `app/generated/prisma/`), NOT `prisma-client-js`
- Requires `@prisma/adapter-pg` driver adapter — PrismaClient constructor takes `{ adapter }`, not `{ log }`
- All imports from `@/app/generated/prisma/client` not `@prisma/client`
- Next.js webpack config maps `node:*` protocol to bare node builtins to handle Prisma 7 generated files
- Middleware is lightweight (no Prisma import) — checks session cookie directly for Edge runtime compatibility
- OpenAI client is lazy-initialized (not at module load) to avoid build-time errors when OPENAI_API_KEY is absent

**Demo account:** demo@cricketiq.com / password123

**How to apply:** When modifying this project, remember the Prisma 7 adapter pattern and import paths.
