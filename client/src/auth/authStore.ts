import type { User } from "../api/auth";

export const auth = {
  get token() {
    return localStorage.getItem("jwt");
  },
  set token(v: string | null) {
    if (v) localStorage.setItem("jwt", v);
    else localStorage.removeItem("jwt");
  },
  get user(): User | null {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  },
  set user(u: User | null) {
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
  },
  isAuthed() {
    return !!this.token;
  },
  logout() {
    this.token = null;
    this.user = null;
  },
};
