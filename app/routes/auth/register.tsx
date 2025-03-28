import type { ActionFunction } from "@remix-run/cloudflare";
import { Form, useActionData, Link } from "@remix-run/react";
import { registerNewUser, sessionStorage } from "../../utils/auth.server";
import { redirect } from "@remix-run/cloudflare";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("username")?.toString();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return { error: "all fields are required" };
  }

  try {
    // Create user in DB
    const user = await registerNewUser(username, password);
    
    // Automatically sign in the user
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    session.set("userId", user.id);
    
    // Redirect to home page with session cookie
    return redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session)
      }
    });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "registration failed" };
  }
}

export default function Register() {
  const actionData = useActionData<{ error?: string }>() || {};
  const error = actionData.error || "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-notion-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-light mb-6 text-notion-gray-700">create account</h1>
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
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button className="notion-button w-full justify-center text-sm py-2">
              create account
            </button>
            <Link 
              to="/auth/login" 
              className="notion-button-secondary w-full justify-center text-sm py-2 text-center"
            >
              already have an account?
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
