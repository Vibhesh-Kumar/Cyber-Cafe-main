import type { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, usersTable, type User } from "@workspace/db";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      dbUser?: User;
    }
  }
}

/**
 * Resolves (and JIT-provisions) the local user record mirrored from Clerk.
 * Returns null when the request is not authenticated.
 */
export async function getOrCreateLocalUser(
  clerkUserId: string,
): Promise<User> {
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, clerkUserId));

  if (existing) {
    return existing;
  }

  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const email = clerkUser.primaryEmailAddress?.emailAddress ?? "";
  const name =
    clerkUser.fullName ||
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    email ||
    "New User";

  // Bootstrap: the very first person to sign in becomes admin, since there is
  // no other way to promote anyone until an admin account exists.
  const [existingAdmin] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.role, "admin"));

  const [created] = await db
    .insert(usersTable)
    .values({
      id: clerkUserId,
      email,
      name,
      phone: clerkUser.primaryPhoneNumber?.phoneNumber ?? null,
      role: existingAdmin ? "customer" : "admin",
    })
    .onConflictDoNothing()
    .returning();

  if (created) {
    return created;
  }

  // Race: another request created it concurrently.
  const [race] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, clerkUserId));
  return race;
}

/** Requires a signed-in user; attaches the mirrored local user to req.dbUser. */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = getAuth(req);
  if (!auth.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    req.dbUser = await getOrCreateLocalUser(auth.userId);
    next();
  } catch (err) {
    req.log.error({ err }, "Failed to resolve local user");
    res.status(500).json({ error: "Failed to resolve user" });
  }
}

/** Requires the resolved local user to have one of the given roles. */
export function requireRole(...roles: Array<"customer" | "operator" | "admin">) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.dbUser || !roles.includes(req.dbUser.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
