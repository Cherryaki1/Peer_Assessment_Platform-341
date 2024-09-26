import React from 'react'
import { useState } from 'react'
import { axios } from "axios"

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleForm = (e) => {
    e.preventDefault();
    axios.post("http://localhost:5050/login", {
      username, password
    })
    .then(result=>{

    })
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit = {handleForm} action="/login" method ="POST">
          <div>
              <label htmlFor="username">Username: </label>
              <input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                name="username"
                type="text" 
                required 
              />
          </div>
          <div>
              <label htmlFor="password">Password: </label>
              <input 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                type="password" 
                required 
              />
          </div>
          <button type="submit">Submit</button>
      </form>
      <a href="/register">Register</a>
    </div>
  )
}

export default Login;