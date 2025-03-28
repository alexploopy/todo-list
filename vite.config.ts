import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: false,
      },
      routes: async (defineRoutes) => {
        return defineRoutes((route) => {
          route("/", "routes/_index.tsx");
          route("/auth/login", "routes/auth/login.tsx");
          route("/auth/register", "routes/auth/register.tsx");
          route("/tasks", "routes/tasks.tsx");
        });
      },
    }),
    tsconfigPaths(),
  ],
});
