/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  appDirectory: "app",
  ignoredRouteFiles: ["**/.*"],
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  serverBuildPath: "build/index.js",
  routes: async (defineRoutes) => {
    return defineRoutes((route) => {
      // Explicitly define your routes
      route("/", "routes/_index.tsx");
      route("/auth/login", "routes/auth/login.tsx");
      route("/auth/register", "routes/auth/register.tsx");
      route("/tasks", "routes/tasks.tsx");
    });
  },
}; 