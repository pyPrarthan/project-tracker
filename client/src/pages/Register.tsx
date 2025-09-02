import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {register} from '../api/auth';

export default function Register() {
    const nav = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState<string | null>(null)
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null)
        setLoading(true);
        try{
            await register({name, email, password});
            nav('/login');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }catch(e:any){
            setErr(e?.response?.data?.message || 'Something went wrong')
        }finally{
            setLoading(false);
        }
        
    }
    return (
      <>
        <form
          onSubmit={onSubmit}
          style={{
            maxWidth: 360,
            margin: "48px auto",
            display: "grid",
            gap: 8,
          }}
        >
          <h2>Register</h2>
          <input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
          {err && <p style={{ color: "crimson" }}>{err}</p>}
          <p>
            Have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </>
    );
}