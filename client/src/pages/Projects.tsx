import { useEffect, useState } from "react";
import { listProjects, createProject, type Project, type ProjectStatus, type ProjectInput } from "../api/projects";
import { Link } from "react-router-dom";
import { auth } from "../auth/authStore";

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [name, setName] = useState('');  
    const [status, setStatus] = useState<ProjectStatus>("planned");
    const [loading, setLoading] = useState(true)

    const load = async () =>{
        setLoading(true);
        const {data} = await listProjects()
        setProjects(data);
        setLoading(false); 
    }

    useEffect(()=>{load(); },[])

    const onCreate = async (e:React.FormEvent)=>{
        e.preventDefault()
        const payload: ProjectInput = {name, status};
        await createProject(payload);
        setName('');
        setStatus("planned");
        load();
    }
    return (
      <div style={{ maxWidth: 900, margin: "24px auto" }}>
        <header style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <h2 style={{ marginRight: "auto" }}>Projects</h2>
          {auth.user && (
            <>
              <span>Hi, {auth.user.name}</span>
              <button
                onClick={() => {
                  auth.logout();
                  location.href = "/login";
                }}
              >
                Logout
              </button>
            </>
          )}
        </header>

        <form
          onSubmit={onCreate}
          style={{ display: "flex", gap: 8, margin: "12px 0" }}
        >
          <input
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          >
            <option value="planned">planned</option>
            <option value="active">active</option>
            <option value="done">done</option>
          </select>
          <button type="submit">Add</button>
        </form>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <ul
            style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}
          >
            {projects.map((p) => (
              <li
                key={p._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <strong>{p.name}</strong>
                  <span>{p.status}</span>
                </div>
                <Link to={`/projects/${p._id}`}>Open</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
}