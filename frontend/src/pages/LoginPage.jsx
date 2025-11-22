import React, { useState, useEffect } from "react";
import "./LoginPage.css";

export default function LoginPage() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loginMessage, setLoginMessage] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const msg = params.get("msg");
    if (msg) {
      setLoginMessage(`❌ ${msg}`);
      // opcionális: töröld a query-t, hogy újratöltés után ne jelenjen meg újra
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage("");
    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setLoginMessage("✅ Sikeres bejelentkezés!");
        window.location.href = "/expenses";
      } else {
        setLoginMessage(data.message || "❌ Bejelentkezés sikertelen!");
      }
    } catch (err) {
      setLoginMessage("❌ Hálózati hiba: nem sikerült csatlakozni a szerverhez.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterMessage("");

    if (registerData.password !== registerData.confirm) {
      setRegisterMessage("❌ A jelszavak nem egyeznek!");
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
        setRegisterMessage("✅ Sikeres regisztráció!");
        window.location.href = "/expenses";
      } else {
        setRegisterMessage(data.message || "❌ Regisztráció sikertelen!");
      }
    } catch (err) {
      setRegisterMessage("❌ Hálózati hiba: nem sikerült csatlakozni a szerverhez.");
    }
  };

  return (
    <div className="login-view-container">
      <div className="form-box left">
        <h2>Bejelentkezés</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="email"
            placeholder="Email / név cím"
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

          {loginMessage && (
            <p className={`message ${loginMessage.includes("✅") ? "success" : "error"}`}>
              {loginMessage}
            </p>
          )}
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

          {registerMessage && (
            <p className={`message ${registerMessage.includes("✅") ? "success" : "error"}`}>
              {registerMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
