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
            <h2 className="text-center text-purple-500">Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        placeholder="ID"
                        value={ID}
                        onChange={(e) => setID(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </div>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;
