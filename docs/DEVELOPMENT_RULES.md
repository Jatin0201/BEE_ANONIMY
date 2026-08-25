# Anonimy --- Development Rules for AI Coding Agents

## 1. Source of Truth

The repository documentation and approved UI reference are the source of
truth.

Desktop is the primary MVP design target. The approved desktop reference images are the primary visual source of truth. Responsive/mobile adaptation is secondary and should not compromise desktop visual fidelity.

Before implementing a feature:

1.  Read the relevant documentation.
2.  Inspect the existing code.
3.  Understand the current architecture.
4.  Reuse existing components and services.
5.  Make the smallest correct change.

Do not silently replace established decisions.

------------------------------------------------------------------------

## 2. Current Stack Is Fixed

The approved MVP stack is:

``` text
React + Vite
TypeScript
Tailwind CSS
Node.js + Express
Better Auth
Zod
Prisma
PostgreSQL
```

Do not switch to Next.js or another full-stack framework.

Do not introduce a new major dependency without a demonstrated
requirement.

------------------------------------------------------------------------

## 3. MVP Priority

Prioritize:

1.  Correctness
2.  End-to-end functionality
3.  Security fundamentals
4.  Database integrity
5.  Clean architecture
6.  Responsive UI
7.  Visual fidelity
8.  Maintainability

Do not prioritize speculative scalability over a working MVP.

------------------------------------------------------------------------

## 4. Do Not Expand Scope

Do not independently add:

-   AI features
-   followers/following
-   recommendation algorithms
-   communities
-   complex notifications
-   microservices
-   Redis
-   Elasticsearch
-   unnecessary state-management libraries
-   unnecessary animation libraries
-   unrelated features

Ask before implementing a feature outside the documented MVP.

------------------------------------------------------------------------

## 5. Preserve the Anonymity Model

These rules are non-negotiable:

-   The authenticated account is the permanent internal identity.
-   Public identity is contextual to a post.
-   Same user + same post = same alias.
-   Same user + different post = different alias.
-   Same alias across different posts is allowed.
-   Same alias for two users inside one post is forbidden.
-   Never expose internal `userId` through normal public post/comment
    responses.
-   Never accept a client-provided alias as authoritative.
-   Never accept a client-provided author ID as authoritative.

------------------------------------------------------------------------

## 6. Backend Rules

Business rules belong on the server.

Never trust: - client-side authorization - client-provided user IDs -
client-provided author IDs - client-provided aliases

Use the authenticated Better Auth session to determine the current user.

Validate all external input with Zod.

Return consistent API errors.

------------------------------------------------------------------------

## 7. Database Rules

Use Prisma for normal database access.

Use: - foreign keys - unique constraints - indexes - transactions where
required

The database must enforce:

``` text
UNIQUE(postId, userId)
UNIQUE(postId, alias)
```

Do not rely solely on application-level checks for uniqueness.

------------------------------------------------------------------------

## 8. TypeScript Rules

-   Use TypeScript throughout.
-   Avoid `any`.
-   Prefer explicit domain types.
-   Keep functions focused.
-   Avoid giant components.
-   Avoid duplicated business logic.
-   Keep domain logic separate from UI components.

------------------------------------------------------------------------

## 9. Frontend Rules

-   Build reusable React components.
-   Keep business logic out of presentation components.
-   Handle loading, empty, success and error states.
-   Build responsive layouts.
-   Maintain consistent spacing and typography.
-   Never expose private backend data in client components.
-   Keep API interaction in clear service/hooks boundaries where
    appropriate.

------------------------------------------------------------------------

## 10. Final UI Direction

The approved **ANONIMY App UI Showcase** is the visual source of truth
for the MVP.

When implementing the UI, reproduce the approved reference as closely as
practical in:

-   layout
-   proportions
-   spacing
-   typography hierarchy
-   colors
-   component placement
-   botanical elements
-   overall visual tone

Do not independently redesign an approved page.

Functional, accessibility, and responsive requirements may require
adaptation, but those adaptations should preserve the original visual
language.

------------------------------------------------------------------------

## 11. Visual Design Restrictions

Do not introduce:

-   neon colors
-   AI-style gradients
-   glowing borders
-   excessive glassmorphism
-   3D UI elements
-   cyberpunk styling
-   dark hacker aesthetics
-   masks or surveillance imagery as generic anonymity symbols
-   excessive rounded cards
-   unnecessary decorative UI
-   generic AI/SaaS dashboard layouts

Anonimy should feel:

``` text
warm
human
calm
modern
editorial
approachable
```

not:

``` text
dark
secretive
cyberpunk
threatening
AI-generated
```

------------------------------------------------------------------------

## 12. Authentication Page Rules

Login and Signup share a common visual system.

The botanical/plant elements shown in the approved reference are
intentional design assets.

Therefore:

-   preserve their composition and visual character
-   do not replace them with generic stock illustrations
-   do not replace them with emoji
-   do not recreate them as crude CSS shapes
-   do not arbitrarily redesign their placement
-   use proper image/SVG assets where appropriate
-   adapt positioning only when required for responsive layouts

------------------------------------------------------------------------

## 13. Animation Rules

The current MVP does **not** include landing-page animation.

Do not add:

-   scroll-triggered landing animations
-   animated aliases
-   live wallpapers
-   moving particle backgrounds
-   animated botanical elements
-   decorative motion effects

Do not add Framer Motion or another animation framework unless animation
is explicitly approved later.

Static visual fidelity is the current priority.

------------------------------------------------------------------------

## 14. Security Rules

Always consider:

-   authentication
-   authorization
-   input validation
-   XSS
-   CSRF where relevant
-   injection
-   rate limiting
-   secret management
-   privacy leakage

Never: - put secrets in client code - commit credentials - trust client
authorization - expose internal identity mappings

------------------------------------------------------------------------

## 15. Change Procedure

When implementing a feature:

1.  State the intended change.
2.  Identify affected files.
3.  Implement the smallest correct change.
4.  Test it.
5.  Check for regressions.
6.  Update documentation if a long-term decision changes.

Do not rewrite unrelated files.

------------------------------------------------------------------------

## 16. AI Agent Behavior

The coding agent should:

-   inspect existing code before editing
-   preserve established architecture
-   reuse existing components
-   avoid unnecessary abstractions
-   avoid unnecessary dependencies
-   keep security boundaries intact
-   keep database constraints intact
-   ask before changing major product/architecture decisions

The coding agent should not: - invent undocumented architecture -
silently change the tech stack - redesign approved UI - add features
outside scope - add animation simply because it is possible - expose
private identity information

------------------------------------------------------------------------

## 17. Definition of Done

A feature is complete when:

-   the intended user flow works
-   validation works
-   authorization works
-   persistence works
-   error states are handled
-   UI states are communicated
-   responsive behavior works
-   no existing feature is broken
-   relevant documentation is updated
