import { Navigate } from "react-router-dom";
import {auth} from './authStore'
import type { JSX } from "react/jsx-dev-runtime";


export default function ProtectedRoute({ children }: { children: JSX.Element }) {
    return auth.isAuthed() ? children : <Navigate to="/login" replace />;
}