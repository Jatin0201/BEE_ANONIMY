# Anonimy --- MVP Scope

## 1. Objective

Build the smallest credible, fully functional version of Anonimy that
demonstrates its core technical idea: **contextual anonymity in a global
social feed**.

The MVP must prioritize a complete working flow over feature quantity.

------------------------------------------------------------------------

## 2. P0 --- Must Have

### Authentication

-   Registration
-   Login
-   Logout
-   Secure password handling through Better Auth
-   Authenticated sessions
-   Protected post/comment creation

### Landing Page

-   Approved visual layout
-   Anonimy branding
-   Product explanation
-   Sign Up entry point
-   Login entry point
-   Responsive implementation
-   Static reproduction of the approved reference

### Login Page

-   Approved two-panel authentication layout
-   Botanical elements matching the reference
-   Email field
-   Password field
-   Login action
-   Link to Signup
-   Validation and error states
-   Responsive layout

### Signup Page

-   Approved two-panel authentication layout
-   Botanical elements matching the reference
-   Email field
-   Password field
-   Password confirmation if required by the auth flow
-   Signup action
-   Link to Login
-   Validation and error states
-   Responsive layout

### Global Feed

-   Fetch posts
-   Display posts in reverse chronological order
-   Display contextual alias
-   Display post content
-   Display creation time
-   Display comment count
-   Create a new text post
-   Loading state
-   Empty state
-   Error state

### Posts

-   Create a text post
-   View an individual post
-   Persist the post in PostgreSQL
-   Associate the post internally with the authenticated user
-   Display only the contextual alias publicly

### Comments

-   Add a comment to a post
-   Display comments
-   Persist comments
-   Associate comments internally with the authenticated user
-   Display contextual alias instead of the real identity

### Alias System

-   Generate an alias when a user first participates in a post
-   Reuse the same alias for that user within that post
-   Generate a different alias for the same user in another post
-   Prevent alias collisions within one post
-   Allow the same alias to exist in different posts
-   Keep alias generation authoritative on the server

### Profile / Account

-   View account information
-   View basic privacy information
-   Security/account controls appropriate to the auth implementation
-   Logout

This is a private account page, not a public social profile.

### Database

-   PostgreSQL
-   Prisma ORM
-   Foreign keys
-   Unique constraints
-   Appropriate indexes
-   Auth tables required by Better Auth

### Backend

-   Express server
-   REST API
-   Authentication integration
-   Server-side validation
-   Authorization
-   Post services
-   Comment services
-   Alias services
-   Consistent error handling

------------------------------------------------------------------------

## 3. P1 --- Only After P0 Is Stable

-   Basic post deletion by owner
-   Basic reporting
-   Better empty/loading/error states
-   Basic pagination or cursor-based feed loading
-   Basic rate limiting
-   Improved moderation foundations

P1 features must not delay the core MVP.

------------------------------------------------------------------------

## 4. P2 --- Future Scope

-   Likes/reactions
-   Notifications
-   Search
-   Moderation dashboard
-   Automated moderation
-   Image uploads
-   Rich text
-   Tags
-   Topic discovery
-   Advanced feed ranking
-   Redis caching
-   Dedicated search engine
-   Additional media support

------------------------------------------------------------------------

## 5. MVP Page Structure

``` text
/
    Landing Page

/login
    Login Page

/signup
    Signup Page

/feed
    Global Feed

/post/:id
    Post Detail + Comments

/profile
    Private Account/Profile
```

------------------------------------------------------------------------

## 6. MVP User Flow

``` text
Landing
   ↓
Signup/Login
   ↓
Authenticated Feed
   ↓
Create Post
   ↓
Contextual Alias
   ↓
Post Detail
   ↓
Comment
   ↓
Contextual Alias reused inside the post
```

------------------------------------------------------------------------

## 7. MVP Definition of Done

The MVP is complete when the end-to-end flow works in a real
environment:

``` text
Register
  ↓
Login
  ↓
Session
  ↓
Feed
  ↓
Create Post
  ↓
Alias generated
  ↓
Open Post
  ↓
Comment
  ↓
Alias reused
  ↓
Another Post
  ↓
Different Alias
```

The UI must also match the approved reference closely and work
responsively.

Initial UI validation will be performed on desktop. Mobile responsiveness will be addressed after the desktop implementation and core functionality are stable.
