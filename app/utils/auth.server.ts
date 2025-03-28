// app/utils/auth.server.ts
import { createCookieSessionStorage, redirect } from "@remix-run/cloudflare";
// Removed comment since we're now explicitly using cloudflare
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { validateUserPassword, createUser, findUserByUsername } from "./db.server";

// In production, store this in an ENV variable
const sessionSecret = "SUPER_SECRET_SESSION_KEY";

// Create session storage
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secure: false, // set to true in production/HTTPS
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true
  }
});

// Create the Authenticator (v4 no longer takes sessionStorage in constructor)
export const authenticator = new Authenticator<string>();

// Set up the "FormStrategy" for username/password
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const username = form.get("username")?.toString();
    const password = form.get("password")?.toString();
    if (!username || !password) {
      throw new Error("Username and password required");
    }
    const user = await validateUserPassword(username, password);
    if (!user) {
      throw new Error("Invalid credentials");
    }
    return user.id; // The authenticator stores the user ID in the session
  }),
  "user-pass"
);

// A helper to register new users
export async function registerNewUser(username: string, password: string) {
  const existing = findUserByUsername(username);
  if (existing) {
    throw new Error("Username already taken");
  }
  return createUser(username, password);
}

// A helper to log out
export async function logout(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session)
    }
  });
}

// A helper to get the user ID from session
export async function getUserId(request: Request) {
  try {
    // In remix-auth v4, you need to manually manage sessions
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    return session.get("userId");
  } catch {
    return null;
  }
}

// Require user login or redirect
export async function requireUserId(request: Request) {
  const userId = await getUserId(request);
  if (!userId) {
    throw redirect("/_auth/login");
  }
  return userId;
}
