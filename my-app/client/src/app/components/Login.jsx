import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BiUser } from 'react-icons/bi';
import { AiOutlineUnlock } from 'react-icons/ai';
import Background from './images/rice.jpg';
import BackgroundVideo from './images/login.mp4';
import React from 'react';

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
        <div className=" text-white h-[100vh] flex justify-center items-center">
            <video autoPlay loop muted className="absolute w-full h-full object-cover">
                <source src={BackgroundVideo} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className="bg-slate-800 border boarder-slate-600 rounded-md p-8 shadow-lg backdrop-filter backdrop-blur-sm bg-opacity-30 relative">
                <h1 className="text-4xl text-white font-bold text-center mb-6">Rice++ Login</h1>
                <form onSubmit={handleSubmit}>

                    <div className="relative my-4">
                        <input
                            type="text"
                            id="ID" // Added ID for input
                            className="block w-72 py-2 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
                            placeholder=""
                            value={ID}
                            onChange={(e) => setID(e.target.value)}
                            required
                        />
                        <label htmlFor="ID" // Correctly linked to input ID
                            className="absolute text-sm text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">ID</label>
                        <BiUser className="absolute top-4 right-4"/>
                    </div>

                    <div className="relative my-4">
                        <input
                            type="password"
                            id="password" // Added ID for input
                            className="block w-72 py-2 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
                            placeholder=""
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <label htmlFor="password" // Correctly linked to input ID
                            className="absolute text-sm text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Password</label>
                        <AiOutlineUnlock className="absolute top-4 right-4"/>
                    </div>

                    <div className="flex">
                        <input type="checkbox" id="remember" name="remember" />
                        <label htmlFor="remember">Remember me</label>
                    </div>
                    
                    <button 
                        className="w-full mb-4 text-[18px] mt-6 rounded-full bg-white text-blue-800 hover:bg-blue-600 hover:text-white py-2 transition-colors duration-300"
                        type="submit">Login</button>
                </form>
                {message && <p className="text-red-500">{message}</p>}
            </div>
        </div>
    );
};

export default Login;
