# Architecture & UX Review: Feed Dynamics, Discovery-Only Feeds, and "Your Posts" Journal

> **Date:** September 28, 2026  
> **Topic:** Evaluation of excluding user's own posts from the global feed vs. unified feed with ownership indicators and feed tabs.  
> **Status:** Architectural Evaluation & Design Comparison

---

## 1. Executive Summary & Core Comparison

You raised an insightful perspective:
> *"Will removing a user's own posts from their main feed reduce clutter, save server load, and keep the user's content neatly organized in their Profile section?"*

Let us analyze this across **user experience (mental models)**, **server performance (caching & SQL)**, and **product alternatives**.

---

## 2. Technical & Server Load Analysis

### A. Does excluding own posts reduce server load?
* **SQL Query Mechanics:**
  - Standard Feed: `SELECT * FROM post ORDER BY created_at DESC LIMIT 20` (uses single B-Tree index on `createdAt DESC`).
  - Filtered Feed (excluding user): `SELECT * FROM post WHERE author_id != $userId ORDER BY created_at DESC LIMIT 20` (requires composite index scan or row filtering).
* **Caching Impact:**
  - A global feed where everyone sees the same stream can be cached globally in memory/Redis (1 shared cache key for all users).
  - A per-user filtered feed produces a unique query per user session, slightly increasing per-request computation.
* **Conclusion on Performance:** The performance difference for standard traffic is negligible, but from a caching standpoint, a uniform public stream is simpler and lighter on the database.

---

## 3. Product & UX Model Comparison

### Option A: The "Discovery-Only Feed" (Your Proposal)
* **Concept:** The main `/feed` displays exclusively *other* people's posts. Your authored posts live in your private `/profile` under "Your Posts".
* **Pros:**
  - **Zero Confusion:** You never wonder *"Did I write this 'Silent Fox' post or did someone else?"* because your posts simply never appear in your reading feed.
  - **Pure Reading Mode:** Feed acts strictly as a discovery channel for other people's anonymous reflections.
* **Cons / Risks:**
  - **"Did it post?" Anxiety:** Users often expect immediate confirmation in the feed when they hit "Post". Not seeing it in the feed might make them think the server failed.
  - **Loss of Conversation Context:** If someone writes a post in response to a live trend, they cannot see how their post fits into the stream of the feed.

---

### Option B: The "Unified Feed with Private (You) Badge" (Standard Reddit/Twitter Model)
* **Concept:** All posts appear on the feed in chronological order, but posts authored by you have a distinct, private **`(You)`** badge and warm accent ring. The Profile page still contains the full "Your Posts" management hub.
* **Pros:**
  - **Immediate Publishing Confirmation:** You see your post immediately at the top of the feed with your assigned alias.
  - **Clear Ownership:** The `(You)` tag completely prevents alias confusion.
  - **Familiar UX:** Matches established social media conventions (Reddit, Twitter, Threads).
* **Cons:**
  - Your own content is interspersed with everyone else's feed items.

---

### Option C: The "Feed Tabs" Hybrid (Recommended Best-of-Both-Worlds)
* **Concept:** Provide clear top-level tabs on the Feed page:
  - `[Explore / Global Feed]` — Browse all anonymous posts with `(You)` badges on your own.
  - `[Your Posts]` — Instantly filter the feed to show *only* your authored posts, right from the main feed view or profile.
* **Pros:**
  - Gives users full control: read others in "Explore", manage their own in "Your Posts".
  - Solves the clutter problem with a single click without hiding content unexpectedly.

---

## 4. Comparison Matrix

| Dimension | Option A: Discovery-Only | Option B: Unified + `(You)` Badge | Option C: Feed Tabs Hybrid |
| :--- | :--- | :--- | :--- |
| **Alias Confusion** | Eliminated (No own posts) | Eliminated (`(You)` pill) | Eliminated (Full user choice) |
| **Publishing Confirmation** | Weak (Must visit Profile) | Immediate (Visible on Feed) | Immediate |
| **Feed Clutter Control** | High | Standard | High (Switch to Your Posts) |
| **Server / Cache Simplicity** | Lower (Per-user filtering) | High (Global shared feed) | High (Clean indexed endpoints) |
| **User Mental Model** | Journal / Reading App | Social Network | Modern Social App (Reddit/X) |

---

## 5. Recommendation

If your vision for Anonimy is an **intimate, journal-like discovery platform**, Option A (Discovery-Only Feed + Profile Journal) is a distinct and clean direction.

If your vision is a **dynamic, live social feed**, Option C (Unified Feed with `(You)` indicators + "Your Posts" tab on both Feed and Profile) gives the most seamless, clutter-free, and confusion-proof experience.
