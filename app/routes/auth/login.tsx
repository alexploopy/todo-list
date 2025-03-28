import type { ActionFunction } from "@remix-run/cloudflare";
import { Form, useActionData, Link } from "@remix-run/react";
import { authenticator } from "../../utils/auth.server";
import { sessionStorage } from "../../utils/auth.server";
import { redirect } from "@remix-run/cloudflare";

export const action: ActionFunction = async ({ request }) => {
  try {
    // Authenticate with the form strategy
    const userId = await authenticator.authenticate("user-pass", request);
    
    // Store the userId in the session
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    session.set("userId", userId);
    
    // Redirect to the home page with the session cookie
    return redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session)
      }
    });
  } catch (error) {
    // Return the error for display
    return { error: error instanceof Error ? error.message : "authentication failed" };
  }
};

export default function Login() {
  const actionData = useActionData<{ error?: string }>() || {};
  const error = actionData.error || "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-notion-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-light mb-6 text-notion-gray-700">welcome back</h1>
        {error && (
          <div className="mb-4 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
            {error}
          </div>
        )}
        <Form method="post" className="space-y-4">
          <div className="notion-form-group">
            <label htmlFor="username" className="notion-label mb-1.5 text-sm text-notion-gray-700">
              username
            </label>
            <input 
              id="username" 
              type="text" 
              className="notion-input text-sm w-full rounded-lg" 
              placeholder="enter your username" 
              name="username"
              autoComplete="username"
            />
          </div>
          <div className="notion-form-group">
            <label htmlFor="password" className="notion-label mb-1.5 text-sm text-notion-gray-700">
              password
            </label>
            <input 
              id="password" 
              type="password" 
              className="notion-input text-sm w-full rounded-lg" 
              placeholder="enter your password" 
              name="password"
              autoComplete="current-password"
            />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button type="submit" className="notion-button w-full justify-center text-sm py-2">
              log in
            </button>
            <Link 
              to="/auth/register" 
              className="notion-button-secondary w-full justify-center text-sm py-2 text-center"
            >
              create new account
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
