import { Form, useActionData, useLoaderData, Link } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/cloudflare";
import { requireUserId } from "../utils/auth.server";
import {
  addTask,
  deleteTask,
  getTasksForUser,
  updateTask
} from "../utils/db.server";
import { useEffect, useState } from "react";

// Define task type
type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
};

// Loader: fetch tasks for the logged-in user
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const tasks = getTasksForUser(userId);
  return { tasks };
};

// Action: handle adding, editing, toggling, deleting
export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const _action = formData.get("_action");

  if (_action === "new") {
    const newTitle = formData.get("title")?.toString() || "";
    const priority = formData.get("priority")?.toString() as Task['priority'] || "medium";
    if (newTitle.trim()) {
      addTask(userId, newTitle, priority);
    }
  } else if (_action === "edit") {
    const taskId = formData.get("taskId")?.toString();
    const updatedTitle = formData.get("updatedTitle")?.toString();
    const priority = formData.get("priority")?.toString() as Task['priority'];
    if (taskId && updatedTitle?.trim()) {
      updateTask(taskId, updatedTitle, undefined, priority);
    }
  } else if (_action === "delete") {
    const taskId = formData.get("taskId")?.toString();
    if (taskId) {
      deleteTask(taskId);
    }
  } else if (_action === "toggle") {
    const taskId = formData.get("taskId")?.toString();
    const completed = formData.get("completed") === "true";
    if (taskId) {
      updateTask(taskId, undefined, completed);
    }
  }

  return null;
};

export default function TasksPage() {
  const { tasks } = useLoaderData<{ tasks: Task[] }>();
  const actionData = useActionData<{ error?: string }>();
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    const data = actionData || {};
    if (data.error) {
      setError(data.error);
    }
  }, [actionData]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // Clear the input field after submission
    setTimeout(() => setTitle(""), 0);
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }} className="px-4">
      <h2 className="text-2xl font-light mb-6 text-notion-gray-700">tasks</h2>
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      <Link to="/" className="notion-button-secondary mb-4 inline-block text-sm">← back to home</Link>
      <hr className="my-6 border-notion-gray-100" />
      
      <Form method="post" className="mb-8" onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input 
            type="text" 
            name="title" 
            placeholder="add a new task..." 
            className="notion-input flex-1 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="flex items-center gap-1 border border-notion-gray-200 rounded-md px-2 py-1">
            <button 
              type="submit" 
              name="_action" 
              value="new"
              className="w-4 h-4 rounded-full transition-colors bg-red-50 hover:bg-red-100"
              onClick={() => {
                const priorityInput = document.querySelector('input[name="priority"]') as HTMLInputElement;
                if (priorityInput) priorityInput.value = 'high';
              }}
            >
              <span className="sr-only">high priority</span>
            </button>
            <button 
              type="submit" 
              name="_action" 
              value="new"
              className="w-4 h-4 rounded-full transition-colors bg-yellow-50 hover:bg-yellow-100"
              onClick={() => {
                const priorityInput = document.querySelector('input[name="priority"]') as HTMLInputElement;
                if (priorityInput) priorityInput.value = 'medium';
              }}
            >
              <span className="sr-only">medium priority</span>
            </button>
            <button 
              type="submit" 
              name="_action" 
              value="new"
              className="w-4 h-4 rounded-full transition-colors bg-green-50 hover:bg-green-100"
              onClick={() => {
                const priorityInput = document.querySelector('input[name="priority"]') as HTMLInputElement;
                if (priorityInput) priorityInput.value = 'low';
              }}
            >
              <span className="sr-only">low priority</span>
            </button>
          </div>
          <input type="hidden" name="priority" value="medium" />
        </div>
      </Form>

      {/* Non-completed tasks */}
      <div className="mb-12">
        <h3 className="text-sm font-medium text-notion-gray-400 mb-3">active</h3>
        {tasks.filter(task => !task.completed).length === 0 ? (
          <p className="text-notion-gray-400 text-sm italic px-4 py-2">no active tasks</p>
        ) : (
          <ul className="space-y-1.5">
            {tasks.filter(task => !task.completed).map((task) => (
              <li key={task.id} className="notion-card group">
                <Form method="post" className="flex gap-2">
                  <input type="hidden" name="taskId" value={task.id} />
                  <input 
                    type="text" 
                    name="updatedTitle" 
                    defaultValue={task.title} 
                    className={`notion-input flex-1 text-sm ${task.completed ? 'line-through text-notion-gray-400' : ''}`}
                  />
                  <div className="flex items-center gap-1 border border-notion-gray-200 rounded-md px-2 py-1">
                    <button 
                      type="submit" 
                      name="_action" 
                      value="edit"
                      className={`w-4 h-4 rounded-full transition-colors ${
                        task.priority === 'high' 
                        ? 'bg-red-200' 
                        : 'bg-red-50 hover:bg-red-100'
                      }`}
                      onClick={(e) => {
                        const form = (e.target as HTMLElement).closest('form');
                        const priorityInput = form?.querySelector('input[name="priority"]') as HTMLInputElement;
                        const titleInput = form?.querySelector('input[name="updatedTitle"]') as HTMLInputElement;
                        if (priorityInput) priorityInput.value = 'high';
                        if (titleInput) titleInput.value = task.title;
                      }}
                    >
                      <span className="sr-only">high priority</span>
                    </button>
                    <button 
                      type="submit" 
                      name="_action" 
                      value="edit"
                      className={`w-4 h-4 rounded-full transition-colors ${
                        task.priority === 'medium' 
                        ? 'bg-yellow-200' 
                        : 'bg-yellow-50 hover:bg-yellow-100'
                      }`}
                      onClick={(e) => {
                        const form = (e.target as HTMLElement).closest('form');
                        const priorityInput = form?.querySelector('input[name="priority"]') as HTMLInputElement;
                        const titleInput = form?.querySelector('input[name="updatedTitle"]') as HTMLInputElement;
                        if (priorityInput) priorityInput.value = 'medium';
                        if (titleInput) titleInput.value = task.title;
                      }}
                    >
                      <span className="sr-only">medium priority</span>
                    </button>
                    <button 
                      type="submit" 
                      name="_action" 
                      value="edit"
                      className={`w-4 h-4 rounded-full transition-colors ${
                        task.priority === 'low' 
                        ? 'bg-green-200' 
                        : 'bg-green-50 hover:bg-green-100'
                      }`}
                      onClick={(e) => {
                        const form = (e.target as HTMLElement).closest('form');
                        const priorityInput = form?.querySelector('input[name="priority"]') as HTMLInputElement;
                        const titleInput = form?.querySelector('input[name="updatedTitle"]') as HTMLInputElement;
                        if (priorityInput) priorityInput.value = 'low';
                        if (titleInput) titleInput.value = task.title;
                      }}
                    >
                      <span className="sr-only">low priority</span>
                    </button>
                    <input type="hidden" name="priority" value={task.priority} />
                  </div>
                  <button 
                    type="submit" 
                    name="_action" 
                    value="toggle" 
                    className="notion-button-secondary text-sm min-w-[80px]"
                  >
                    complete
                  </button>
                  <button 
                    type="submit" 
                    name="_action" 
                    value="delete" 
                    className="notion-button-secondary bg-red-50 hover:bg-red-100 text-red-600 text-sm min-w-[60px]"
                  >
                    delete
                  </button>
                  <input type="hidden" name="completed" value={(!task.completed).toString()} />
                </Form>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Completed tasks */}
      {tasks.some(task => task.completed) && (
        <>
          <h3 className="text-lg font-light mb-4 text-notion-gray-500">completed tasks</h3>
          <ul className="space-y-3">
            {tasks.filter(task => task.completed).map((task: Task) => (
              <li key={task.id} className="notion-card group bg-notion-gray-50">
                <Form method="post" className="flex gap-2">
                  <input type="hidden" name="taskId" value={task.id} />
                  <input 
                    type="text" 
                    name="updatedTitle" 
                    defaultValue={task.title} 
                    className="notion-input flex-1 text-sm line-through text-notion-gray-400"
                  />
                  <div className="flex items-center gap-1 border border-notion-gray-200 rounded-md px-2 py-1">
                    <button 
                      type="submit" 
                      name="_action" 
                      value="edit"
                      className="w-4 h-4 rounded-full transition-colors bg-notion-gray-100"
                      disabled
                    >
                      <span className="sr-only">priority</span>
                    </button>
                  </div>
                  <button 
                    type="submit" 
                    name="_action" 
                    value="toggle" 
                    className="notion-button-secondary text-sm min-w-[80px] bg-notion-gray-100 text-notion-gray-500"
                  >
                    restore
                  </button>
                  <button 
                    type="submit" 
                    name="_action" 
                    value="delete" 
                    className="notion-button-secondary bg-red-50 hover:bg-red-100 text-red-600 text-sm min-w-[60px]"
                  >
                    delete
                  </button>
                  <input type="hidden" name="completed" value={(!task.completed).toString()} />
                  <input type="hidden" name="priority" value={task.priority} />
                </Form>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
