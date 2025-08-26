import api from "./axios";

// --- Types that mirror your backend ---
export type ProjectStatus = "planned" | "active" | "done";

export interface TasksSummary {
  todo: number;
  inProgress: number;
  done: number;
  total: number;
}

export interface ProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
  githubRepos?: string[]; // e.g. ["facebook/react"]
}

export interface Project extends ProjectInput {
  _id: string;
  tasksSummary?: TasksSummary;
  createdAt?: string;
  updatedAt?: string;
}

// (Adjust these if your /github response has different fields)
export interface RepoInfo {
  fullName: string; // "owner/repo"
  stars: number;
  forks: number;
  openIssues: number;
  lastCommitSha: string;
  updatedAt: string; // ISO date string for cache timestamp
}

// --- API calls with typed responses ---
export const listProjects = () => api.get<Project[]>("/projects");

export const createProject = (data: ProjectInput) =>
  api.post<Project>("/projects", data);

export const getProject = (id: string) => api.get<Project>(`/projects/${id}`);

export const getGithubForProject = (id: string, forceRefresh = false) =>
  api.get<RepoInfo[]>(`/projects/${id}/github`, { params: { forceRefresh } });
