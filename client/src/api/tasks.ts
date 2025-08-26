import api from './axios';

export type TaskStatus = "todo" | "inProgress" | "done";


export interface TaskInput {
    title: string;
    description?: string;
    status?: TaskStatus;
    dueDate?: string;
}

export interface Task extends TaskInput{
    _id: string;
    projectId: string;
    createdAt: string;
    updatedAt: string;
}

export const listTask = (projectId: string) => 
    api.get<Task[]>(`/projects/${projectId}/tasks`)

export const createTask = (projectId: string, data: TaskInput) =>
    api.post<Task>(`/projects/${projectId}/tasks`, data)


export const updateTask = (taskId: string, data: Partial<TaskInput>) =>
  api.put<Task>(`/tasks/${taskId}`, data);

export const deleteTask = (taskId: string) =>
  api.delete<void>(`/tasks/${taskId}`);