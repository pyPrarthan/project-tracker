/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProject, getGithubForProject, type Project } from "../api/projects";
import { listTask, createTask, deleteTask, type Task } from "../api/tasks";

export default function ProjectDetail() {
  const { id = "" } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [github, setGithub] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [p, t, g] = await Promise.all([
      getProject(id),
      listTask(id),
      getGithubForProject(id),
    ]);
    setProject(p.data);
    setTasks(t.data);
    setGithub(g.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask(id, { title, status: "todo" });
    setTitle("");
    load();
  };

  const removeTask = async (taskId: string) => {
    await deleteTask(taskId);
    load();
  };

  if (loading) return <div style={{ margin: "24px" }}>Loading…</div>;
  if (!project) return <div style={{ margin: "24px" }}>Project not found.</div>;

  return (
    <div
      style={{ maxWidth: 900, margin: "24px auto", display: "grid", gap: 16 }}
    >
      <h2>{project.name}</h2>
      {project.tasksSummary && (
        <small>
          Todo: {project.tasksSummary.todo} • In-Progress:{" "}
          {project.tasksSummary.inProgress} • Done: {project.tasksSummary.done}
        </small>
      )}

      <section>
        <h3>Tasks</h3>
        <form onSubmit={addTask} style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <button type="submit">Add Task</button>
        </form>
        <ul>
          {tasks.map((t) => (
            <li key={t._id}>
              {t.title} — {t.status}
              <button
                onClick={() => removeTask(t._id)}
                style={{ marginLeft: 8 }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>GitHub (cached)</h3>
        <pre style={{ background: "#f6f6f6", padding: 12, borderRadius: 8 }}>
          {JSON.stringify(github, null, 2)}
        </pre>
      </section>
    </div>
  );
}
