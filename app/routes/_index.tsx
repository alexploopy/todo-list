import { Form, useLoaderData, Link } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/cloudflare";
import { getUserId, logout } from "../utils/auth.server";
import { getTasksForUser, updateTask } from "../utils/db.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) {
    // Not logged in, show a welcome message
    return { tasks: null, userId: null };
  }
  
  const tasks = getTasksForUser(userId);
  // Sort tasks: first by completion, then by priority
  const sortedTasks = tasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
  });
  return { tasks: sortedTasks, userId };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const _action = formData.get("_action");

  if (_action === "logout") {
    return await logout(request);
  } else if (_action === "toggle") {
    const taskId = formData.get("taskId")?.toString();
    const completed = formData.get("completed") === "true";
    if (taskId) {
      updateTask(taskId, undefined, completed);
    }
  }
  return null;
}

export default function Index() {
  const { tasks, userId } = useLoaderData<{
    tasks: { id: string; title: string; completed: boolean; priority: 'high' | 'medium' | 'low' }[] | null;
    userId: string | null;
  }>();

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-notion-gray-50">
        <div className="max-w-sm w-full text-center">
          <h1 className="text-4xl font-light mb-8 text-notion-gray-700">to-do.io</h1>
          <div className="space-y-3">
            <Link 
              to="/auth/login" 
              className="notion-button w-full py-2 text-sm inline-block"
            >
              log in
            </Link>
            <Link 
              to="/auth/register" 
              className="notion-button-secondary w-full py-2 text-sm inline-block"
            >
              create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "auto" }} className="px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light text-notion-gray-700">your tasks</h1>
        <div className="flex gap-2">
          <Form method="post">
            <button type="submit" name="_action" value="logout" className="notion-button-secondary text-sm px-4">
              log out
            </button>
          </Form>
          <Link to="/tasks" className="notion-button text-sm px-4">edit</Link>
        </div>
      </div>
      
      {/* Non-completed tasks */}
      <div className="mb-12">
        <h3 className="text-sm font-medium text-notion-gray-400 mb-3">active</h3>
        {tasks?.filter(task => !task.completed).length === 0 ? (
          <p className="text-notion-gray-400 text-sm italic px-4 py-2">no active tasks</p>
        ) : (
          <ul className="space-y-1.5">
            {tasks?.filter(task => !task.completed).map((task) => (
              <li key={task.id}>
                <Form method="post" className="contents">
                  <input type="hidden" name="taskId" value={task.id} />
                  <input type="hidden" name="completed" value={(!task.completed).toString()} />
                  <button 
                    type="submit" 
                    name="_action" 
                    value="toggle"
                    className="notion-card w-full text-left px-4 py-2.5 flex items-center gap-3 group hover:bg-notion-gray-50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <span className="flex-1 text-sm">{task.title}</span>
                    <span className="text-xs text-notion-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      click to complete
                    </span>
                  </button>
                </Form>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Completed tasks */}
      <div>
        <h3 className="text-sm font-medium text-notion-gray-400 mb-3">completed</h3>
        {!tasks?.some(task => task.completed) ? (
          <p className="text-notion-gray-400 text-sm italic px-4 py-2">no completed tasks</p>
        ) : (
          <ul className="space-y-1.5">
            {tasks?.filter(task => task.completed).map((task) => (
              <li key={task.id}>
                <Form method="post" className="contents">
                  <input type="hidden" name="taskId" value={task.id} />
                  <input type="hidden" name="completed" value={(!task.completed).toString()} />
                  <button 
                    type="submit" 
                    name="_action" 
                    value="toggle"
                    className="notion-card w-full text-left px-4 py-2.5 flex items-center gap-3 group hover:bg-notion-gray-50 transition-colors text-notion-gray-400 line-through bg-notion-gray-50"
                  >
                    <div className="w-2 h-2 rounded-full bg-notion-gray-200" />
                    <span className="flex-1 text-sm">{task.title}</span>
                    <span className="text-xs text-notion-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      click to restore
                    </span>
                  </button>
                </Form>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Empty state - only show if there are no tasks at all */}
      {(!tasks || tasks.length === 0) && (
        <div className="text-center py-12">
          <p className="text-notion-gray-400 text-sm">
            no tasks yet. click <Link to="/tasks" className="text-notion-gray-600 underline">edit</Link> to add some.
          </p>
        </div>
      )}
    </div>
  );
}
