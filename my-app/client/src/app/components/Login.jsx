import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [ID, setID] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Hook to navigate programmatically

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/login', {
                ID: ID.trim(),
                Password: password.trim()
            }, {
                withCredentials: true // Allows session cookies to be sent
            });

            setMessage(response.data.message);
            console.log('Logged in user:', response.data.user);
            
            // Navigate to the dashboard on successful login
            (ID.startsWith('1')) ? navigate('/instructorDashboard') : navigate('/studentDashboard');
    
        } catch (error) {
            setMessage(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div>
            <div className="bg-slate-800 border boarder-slate-400 rounded-md p-8 shadow-lg backdrop-filter backdrop-blur-sm bg-opacity-30 relative">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>

                <div>
                    <input
                        type="text"
                        placeholder="ID"
                        value={ID}
                        onChange={(e) => setID(e.target.value)}
                        required
                    />
                    <label htmlFor="ID">ID</label>
                </div>

                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label htmlFor="password">Password</label>
                </div>
                
                <button type="submit">Login</button>

                </form>
            {message && <p>{message}</p>}
            </div>
        </div>
    );
};

export default Login;
