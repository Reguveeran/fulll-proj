import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/api";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginUser({
        username: form.username,
        password: form.password,
      });

      if (res.access && res.refresh) {
        localStorage.setItem("access_token", res.access);
        localStorage.setItem("refresh_token", res.refresh);
        if (res.role) localStorage.setItem("userRole", res.role);
        if (res.username) localStorage.setItem("username", res.username);
        navigate("/dashboard");
      } else {
        setError(res.detail || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={handleSubmit}>
        <h1>Login</h1>
        {error && (
          <p 
            className="auth__message error" 
            style={{
              background: "#ffebee", 
              color: "#c62828", 
              padding: "10px", 
              borderRadius: "8px"
            }}
          >
            {error}
          </p>
        )}
        
        <label>
          Username
          <input 
            type="text" 
            name="username" 
            value={form.username} 
            onChange={handleChange} 
            required 
            placeholder="Enter your username"
          />
        </label>
        
        <label>
          Password
          <input 
            type="password" 
            name="password" 
            value={form.password} 
            onChange={handleChange} 
            required 
            placeholder="Enter your password"
          />
        </label>
        
        <button type="submit" disabled={loading} style={{opacity: loading ? 0.7 : 1}}>
          {loading ? "Verifying..." : "Sign In"}
        </button>
        
        <p>
          Need an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </main>
  );
}
