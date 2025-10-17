import React, { useState } from "react";
import "./LoginPage.css";

export default function LoginPage(){
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", confirm: "" });


  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

const handleLogin = (e) => {
  e.preventDefault();
  // Átirányítás Flask route-ra
  window.location.href = "/expenses";
};

  const handleRegister = (e) => {
    e.preventDefault();
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
            //required
          />
          <input
            type="password"
            name="password"
            placeholder="Jelszó"
            value={loginData.password}
            onChange={handleLoginChange}
            //required
          />
          <button type="submit">Bejelentkezés</button>
        </form>
      </div>

      <div className="form-box right">
        <h2>Regisztráció</h2>
        <form onSubmit={handleRegister}>
          <input
            type="name"
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
    </div>
  );
};
