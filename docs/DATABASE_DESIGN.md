# Anonimy --- Database Design

## 1. Design Goal

The database must preserve a permanent private account identity while
allowing a different contextual public identity for each post.

The core anonymity mapping is:

``` text
User
  |
  +---- Post
  |
  +---- Comment

Post
  |
  +---- PostParticipant
            |
            +---- User
            +---- Alias
```

Authentication/session tables are managed according to Better Auth's
required schema.

------------------------------------------------------------------------

## 2. Core Entities

MVP domain entities:

``` text
User
Post
Comment
PostParticipant
```

Future entities should only be introduced when the corresponding feature
is implemented.

------------------------------------------------------------------------

## 3. User

Purpose:

Stores the permanent internal account identity.

Conceptual fields:

``` text
id
email
createdAt
updatedAt
```

Authentication-specific credentials/session fields are handled by Better
Auth as required.

Important:

> `User.id` is an internal identity and is not a public social identity.

------------------------------------------------------------------------

## 4. Post

Conceptual fields:

``` text
id
authorId
content
createdAt
updatedAt
```

Relationships:

``` text
User 1 ---- N Post
Post 1 ---- N Comment
Post 1 ---- N PostParticipant
```

`authorId` identifies the authenticated owner internally.

The public UI displays the contextual alias, not the account identity.

------------------------------------------------------------------------

## 5. Comment

Conceptual fields:

``` text
id
postId
authorId
content
createdAt
updatedAt
```

Relationships:

``` text
Post 1 ---- N Comment
User 1 ---- N Comment
```

The displayed alias is resolved from the user's `PostParticipant`
mapping for that post.

------------------------------------------------------------------------

## 6. PostParticipant

This is the core anonymity mapping.

Conceptual fields:

``` text
id
postId
userId
alias
createdAt
```

Meaning:

> "Which contextual public identity does this authenticated account use
> inside this post?"

Do not store aliases as an array inside `User`.

------------------------------------------------------------------------

## 7. Required Constraints

### Constraint 1

``` text
UNIQUE(postId, userId)
```

A user can have only one alias within a post.

### Constraint 2

``` text
UNIQUE(postId, alias)
```

Two users cannot have the same alias within the same post.

There is intentionally **no global unique constraint on `alias`**.

Therefore this is valid:

``` text
Post A -> Silent Fox
Post B -> Silent Fox
```

------------------------------------------------------------------------

## 8. Alias Examples

``` text
Post 100
    User 17 -> Silent Fox
    User 42 -> Blue Wolf
    User 88 -> Hidden Owl

Post 200
    User 17 -> Crimson Hawk
    User 42 -> Silent Fox
```

The same alias can exist in separate posts.

------------------------------------------------------------------------

## 9. Alias Generation

The server owns alias generation.

The client must never be treated as authoritative for aliases.

Algorithm:

``` text
1. Authenticate the request.
2. Receive the target post ID.
3. Query PostParticipant(postId, userId).
4. If found, return the existing alias.
5. If not found:
   a. Generate a candidate alias.
   b. Check the post-scoped uniqueness constraint.
   c. Create the mapping.
   d. Retry if a uniqueness collision occurs.
6. Return the contextual alias.
```

Database constraints and transaction/error handling must protect against
race conditions.

------------------------------------------------------------------------

## 10. Indexing

Recommended MVP indexes:

``` text
Post.createdAt
Post.authorId

Comment.postId
Comment.createdAt

PostParticipant(postId, userId)
PostParticipant(postId, alias)
```

Indexes should be validated against actual query patterns.

------------------------------------------------------------------------

## 11. Referential Integrity

Use foreign keys.

Deletion behavior must be intentional.

For MVP, if post deletion is implemented, related comments and
participant mappings should be removed according to the chosen Prisma
relation behavior.

Do not rely on application code alone to maintain relational integrity.

------------------------------------------------------------------------

## 12. Privacy Boundary

The database necessarily contains:

``` text
userId <-> postId <-> alias
```

This is required for contextual anonymity.

The normal public API must not expose that mapping.

Public response:

``` json
{
  "id": "post-id",
  "content": "I finally got my internship.",
  "alias": "Silent Fox",
  "createdAt": "..."
}
```

Do not expose:

``` json
{
  "authorId": "user-17",
  "alias": "Silent Fox"
}
```

Internal moderation/admin functionality, if introduced later, must use
separate authorization rules.

------------------------------------------------------------------------

## 13. Future Entities

Potential future tables:

``` text
Report
Notification
ModerationAction
PostReaction
Media
Tag
AuditLog
```

Do not add these to the MVP schema without implementing the associated
feature.
