# Anonimy --- Project Context

## 1. Product Identity

**Anonimy** is a privacy-first anonymous social platform built around
one core idea:

> People should be able to express thoughts, confessions, advice,
> questions, experiences, or everyday moments without having their
> real-world identity attached to the interaction.

Anonimy is not intended to be a dark, secretive, hacker-style anonymous
network. Its identity should feel **open, calm, safe, human, and
approachable**.

The platform uses **contextual anonymity** rather than one permanent
public alias.

------------------------------------------------------------------------

## 2. Core Anonymity Model

A user's authenticated account is permanent and private.

Their public identity is contextual to a post.

Rules:

-   The same user has the same alias while participating in the same
    post.
-   The same user receives a different alias in another post.
-   Two different users may have the same alias in different posts.
-   Two different users must never have the same alias within the same
    post.
-   The internal account identity must never be exposed through normal
    public post/comment responses.
-   The client must never be trusted to choose the authoritative alias.

Example:

``` text
Post A
  User 1 -> Silent Fox
  User 2 -> Blue Raven

Post B
  User 1 -> Hidden Oak
  User 2 -> Silent Fox
```

The fact that `Silent Fox` appears in both posts does not reveal that it
belongs to the same person.

------------------------------------------------------------------------

## 3. Product Philosophy

Anonimy should feel like a place where people can put down the identity
they normally carry everywhere else.

The product should communicate:

-   freedom of expression
-   comfort
-   contextual identity
-   privacy
-   simplicity
-   human conversation

It should not communicate:

-   surveillance
-   secrecy for malicious activity
-   cyberpunk culture
-   fear
-   darkness
-   "hacker" aesthetics

Anonymity is a product mechanism, not the visual theme of a secret
underground network.

------------------------------------------------------------------------

## 4. Content Model

Anonimy is a **global feed**, not a discussion-only forum.

Posts can be anything meaningful to the user, including:

-   confessions
-   advice
-   questions
-   opinions
-   experiences
-   personal thoughts
-   observations
-   everyday events
-   achievements
-   frustrations
-   stories

Users should not be forced to select a discussion category before
posting.

The feed should therefore feel like an open stream of human expression.

------------------------------------------------------------------------

## 5. Core User Flow

``` text
New visitor
    ↓
Landing Page
    ↓
Sign Up / Login
    ↓
Global Feed
    ↓
Create Post
    ↓
Post receives contextual alias
    ↓
Open Post
    ↓
Read / write comments
```

Returning authenticated users should be able to go directly to the
authenticated application experience.

------------------------------------------------------------------------

## 6. Final MVP Pages

The MVP frontend contains:

1.  Landing Page
2.  Login Page
3.  Signup Page
4.  Global Feed Page
5.  Post Detail Page
6.  Private Profile / Account Page

### Landing Page

Purpose: - introduce Anonimy - communicate the contextual-anonymity
concept - provide clear entry points to Sign Up and Login

The approved UI reference image is the visual source of truth.

### Login / Signup

Both pages share the same authentication visual system.

The approved botanical/plant composition shown in the reference is an
intentional part of the design and should be reproduced faithfully.

The plants are not generic decoration and must not be replaced with
unrelated illustrations, emoji, or CSS-generated substitutes.

### Global Feed

Purpose: - display a chronological global stream - prioritize post
content - show contextual aliases - allow creation of new text posts -
provide access to individual posts

The feed should not become a conventional social-media dashboard.

### Post Detail

Purpose: - display the complete post - display comments - allow
authenticated users to comment - maintain contextual aliases within that
post

### Profile / Account

This is a private account-management page, not a conventional public
social profile.

It may contain: - account information - privacy information - security
controls - logout

It should not expose a public identity history, persistent public
username, followers, or following.

------------------------------------------------------------------------

## 7. Final Visual Direction

The approved **ANONIMY App UI Showcase** is the visual reference for the
MVP.

The implementation should reproduce the reference's: - overall
composition - spacing hierarchy - typography hierarchy - color
relationships - botanical elements - component placement - proportions -
visual tone

The design language is:

> **Warm + editorial + modern + human + restrained**

Preferred characteristics: - warm neutral background - near-black
primary typography - restrained muted accents - clean sans-serif
interface typography - editorial typography where appropriate - thin
borders - subtle or minimal shadows - moderate corner radii - generous
whitespace - simple icons - content-first layouts

Avoid: - neon colors - excessive gradients - glowing UI -
glassmorphism - 3D elements - cyberpunk styling - masks/hooded figures
as anonymity imagery - excessive rounded cards - generic AI/SaaS
dashboard patterns

### Animation status

**No landing-page animation is part of the current implementation
scope.**

Do not add: - scroll animations - animated aliases - moving background
particles - live wallpapers - animated botanical elements

The initial goal is faithful static reproduction of the approved
reference.

Animations can be considered later as a separate product/design
decision.

------------------------------------------------------------------------

## 8. Assessment Context

The immediate objective is an assessment-ready full-stack MVP.

The project must demonstrate: - requirement understanding - system
design - database design - authentication - contextual anonymity -
frontend implementation - backend implementation - GitHub/source-code
organization - a working interactive application

Do not allow long-term feature ideas to delay the working MVP.

------------------------------------------------------------------------

## 9. Success Criteria

The MVP succeeds when a user can:

1.  Register.
2.  Log in.
3.  Maintain an authenticated session.
4.  View the global feed.
5.  Create a post.
6.  Receive a contextual alias for that post.
7.  Open a post.
8.  Comment on the post.
9.  Reuse the same alias within that post.
10. Receive a different alias when participating in another post.
11. See other users only through contextual aliases.
12. Persist the required data in PostgreSQL.
13. Use the application comfortably on desktop and mobile.

------------------------------------------------------------------------

## 10. Non-Goals for the MVP

Do not add unless explicitly approved:

-   followers/following
-   likes/reactions
-   recommendation algorithms
-   communities
-   complex notification systems
-   AI-generated content
-   image/media uploads
-   rich text editor
-   advanced search
-   dedicated search infrastructure
-   Redis
-   microservices
-   public user profiles
-   permanent public aliases

The MVP should prove the core product idea before expanding.
