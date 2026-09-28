import type { Prisma, PrismaClient } from "@prisma/client";

export const BASE_ALIASES: string[] = [
  "Silent Fox",
  "Blue Raven",
  "Quiet Oak",
  "Hidden Sun",
  "Pale Wolf",
  "Amber Crane",
  "Cedar Lynx",
  "Golden Fern",
  "Silver Birch",
  "Morning Mist",
  "Quiet Brook",
  "Shadow Moss",
  "Echo Pine",
  "Wild Sage",
  "Frost Wren",
];

export const DESCRIPTORS: string[] = [
  "Silent",
  "Blue",
  "Quiet",
  "Hidden",
  "Pale",
  "Amber",
  "Cedar",
  "Golden",
  "Silver",
  "Morning",
  "Shadow",
  "Echo",
  "Wild",
  "Frost",
  "Crimson",
  "Emerald",
  "Velvet",
  "Autumn",
  "Dusk",
  "Mist",
  "Lush",
  "Wandering",
  "Solar",
  "Lunar",
  "Swift",
  "Gentle",
  "Mossy",
  "Starlit",
];

export const NOUNS: string[] = [
  "Fox",
  "Raven",
  "Oak",
  "Sun",
  "Wolf",
  "Crane",
  "Lynx",
  "Fern",
  "Birch",
  "Brook",
  "Moss",
  "Pine",
  "Sage",
  "Wren",
  "Hawk",
  "Owl",
  "Deer",
  "Falcon",
  "River",
  "Willow",
  "Thorn",
  "Breeze",
  "Canyon",
  "Grove",
  "Finch",
  "Clover",
  "Meadow",
  "Spruce",
];

type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * Generates an alias candidate that is not currently in the usedAliases set.
 * Prefers base curated aliases first, then falls back to randomized descriptor + noun combinations.
 */
export function generateCandidateAlias(usedAliases: Set<string>): string {
  // 1. Try base curated aliases first
  const availableBase = BASE_ALIASES.filter((a) => !usedAliases.has(a));
  if (availableBase.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableBase.length);
    return availableBase[randomIndex]!;
  }

  // 2. Mix descriptors and nouns to generate novel organic combinations
  const candidatePool: string[] = [];
  for (const desc of DESCRIPTORS) {
    for (const noun of NOUNS) {
      const combined = `${desc} ${noun}`;
      if (!usedAliases.has(combined)) {
        candidatePool.push(combined);
      }
    }
  }

  if (candidatePool.length > 0) {
    const randomIndex = Math.floor(Math.random() * candidatePool.length);
    return candidatePool[randomIndex]!;
  }

  // Extreme fallback (if hundreds of participants in a single thread exhaust permutations)
  const randomDesc = DESCRIPTORS[Math.floor(Math.random() * DESCRIPTORS.length)]!;
  const randomNoun = NOUNS[Math.floor(Math.random() * NOUNS.length)]!;
  return `${randomDesc} ${randomNoun} ${Math.floor(100 + Math.random() * 900)}`;
}

/**
 * Gets the existing alias for a user in a post or assigns a new unique contextual alias.
 * Enforces UNIQUE(postId, userId) and UNIQUE(postId, alias).
 */
export async function getOrAssignAlias(
  db: DbClient,
  postId: string,
  userId: string,
  maxRetries = 3
): Promise<string> {
  // 1. Check if user already has an alias in this post
  const existingParticipant = await db.postParticipant.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });

  if (existingParticipant) {
    return existingParticipant.alias;
  }

  // 2. Attempt to generate and assign with retry handling for race conditions
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Fetch all currently used aliases for this post
      const participants = await db.postParticipant.findMany({
        where: { postId },
        select: { alias: true },
      });
      const usedAliases = new Set<string>(participants.map((p: { alias: string }) => p.alias));

      const candidateAlias = generateCandidateAlias(usedAliases);

      const created = await db.postParticipant.create({
        data: {
          postId,
          userId,
          alias: candidateAlias,
        },
      });

      return created.alias;
    } catch (error: any) {
      // If code is P2002 (Prisma unique constraint violation):
      if (error?.code === "P2002") {
        // Double check if this user already got assigned an alias in a parallel request
        const concurrentParticipant = await db.postParticipant.findUnique({
          where: {
            postId_userId: {
              postId,
              userId,
            },
          },
        });
        if (concurrentParticipant) {
          return concurrentParticipant.alias;
        }
        // Otherwise it was an alias collision, continue loop to try another candidate
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Failed to assign a unique alias for post ${postId} after ${maxRetries} attempts.`);
}
