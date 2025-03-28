// app/utils/db.server.ts
import bcrypt from "bcryptjs";

const users: Array<{
  id: string;
  username: string;
  passwordHash: string;
}> = [];

let tasks: Array<{
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}> = [];

/** Create a user (with hashed password) */
export async function createUser(username: string, password: string) {
  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ id, username, passwordHash });
  return { id, username };
}

/** Find a user by username */
export function findUserByUsername(username: string) {
  return users.find(u => u.username === username);
}

/** Validate user password */
export async function validateUserPassword(username: string, password: string) {
  const user = findUserByUsername(username);
  if (!user) return null;
  const matches = await bcrypt.compare(password, user.passwordHash);
  return matches ? user : null;
}

/** Get tasks for a user */
export function getTasksForUser(userId: string) {
  return tasks.filter(t => t.userId === userId);
}

/** Add a task */
export function addTask(userId: string, title: string, priority: 'high' | 'medium' | 'low' = 'medium') {
  const newTask = {
    id: crypto.randomUUID(),
    userId,
    title,
    completed: false,
    priority
  };
  tasks.push(newTask);
  return newTask;
}

/** Update a task */
export function updateTask(taskId: string, title?: string, completed?: boolean, priority?: 'high' | 'medium' | 'low') {
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx < 0) return null;
  if (title !== undefined) tasks[idx].title = title;
  if (completed !== undefined) tasks[idx].completed = completed;
  if (priority !== undefined) tasks[idx].priority = priority;
  return tasks[idx];
}

/** Delete a task */
export function deleteTask(taskId: string) {
  tasks = tasks.filter(t => t.id !== taskId);
}
