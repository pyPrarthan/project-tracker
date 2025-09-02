import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {login} from '../api/auth'
import { auth } from "../auth/authStore";

export default function Login(){
    const nav = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [err, setErr] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const onSubmit = async (e: React.FormEvent)=>{
        e.preventDefault()
        setErr(null)
        setLoading(true)

        try{
            const {data} = await login({email, password})
            auth.token = data.token
            auth.user = data.user
            nav('/')

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }catch(e: any){
            setErr(e?.response?.data?.message || 'Login Failed')
        }finally{
            setLoading(false)
        }

    }

    return(
         <form onSubmit={onSubmit} style={{ maxWidth: 360, margin: "48px auto", display: "grid", gap: 8 }}>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      <p>New here? <Link to="/register">Create an account</Link></p>
    </form>
    )
}