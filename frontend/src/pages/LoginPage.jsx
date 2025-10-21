import React, { useState } from "react";
import "./LoginPage.css";

export default function LoginPage() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", confirm: "" });
  const [message, setMessage] = useState(""); // üzenetek megjelenítésére

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(data.message || "Sikeres bejelentkezés!");
        window.location.href = "/expenses";
      } else {
        setMessage(data.message || "Bejelentkezés sikertelen!");
      }
    } catch (err) {
      setMessage("Hálózati hiba: nem sikerült csatlakozni a szerverhez.");
      console.error(err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    if (registerData.password !== registerData.confirm) {
      setMessage("A jelszavak nem egyeznek!");
      return;
    }

    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(data.message || "Sikeres regisztráció!");
        window.location.href = "/expenses";
      } else {
        setMessage(data.message || "Regisztráció sikertelen!");
      }
    } catch (err) {
      setMessage("Hálózati hiba: nem sikerült csatlakozni a szerverhez.");
      console.error(err);
    }
  };

  return (
    <div className="login-view-container">
      <div className="form-box left">
        <h2>Bejelentkezés</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email cím"
            value={loginData.email}
            onChange={handleLoginChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Jelszó"
            value={loginData.password}
            onChange={handleLoginChange}
            required
          />
          <button type="submit">Bejelentkezés</button>
        </form>
      </div>

      <div className="form-box right">
        <h2>Regisztráció</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="name"
            placeholder="Név"
            value={registerData.name}
            onChange={handleRegisterChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email cím"
            value={registerData.email}
            onChange={handleRegisterChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Jelszó"
            value={registerData.password}
            onChange={handleRegisterChange}
            required
          />
          <input
            type="password"
            name="confirm"
            placeholder="Jelszó megerősítése"
            value={registerData.confirm}
            onChange={handleRegisterChange}
            required
          />
          <button type="submit">Regisztráció</button>
        </form>
      </div>

      {message && (
        <div className="message-box">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
