import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../_StudentSidebar';
import axios from 'axios';

const Shop = () => {
    const [items, setItems] = useState([]); // Shop items
    const [cartItems, setCartItems] = useState([]); // Items added to cart
    const [riceGrains, setRiceGrains] = useState(0); // User's grain balance
    const navigate = useNavigate();

    const [userID, setUserID] = useState(''); // ID of the logged-in user
    const [userStudent, setUserStudent] = useState(null); // Student data linked to the user
    const [message, setMessage] = useState(''); // Feedback messages

    // Fetch shop items
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch('/shopItems.json');
                const data = await response.json();
                setItems(data); // Set fetched items
            } catch (error) {
                console.error('Error fetching shop items:', error);
            }
        };

        fetchItems();
    }, []);

    // Retrieve cart items from localStorage
    useEffect(() => {
        const storedCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        setCartItems(storedCartItems);
    }, []);

    // Fetch user and student data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/index', {
                    withCredentials: true,
                });

                if (response.data.user && response.data.user.ID) {
                    setUserID(response.data.user.ID); // Store the user's ID
                    fetchStudentFromUser();
                } else {
                    setMessage('Failed to retrieve student data.');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setMessage('Error fetching user data.');
            }
        };

        const fetchStudentFromUser = async () => {
            try {
                const response = await axios.get('http://localhost:3000/studentFromUser', {
                    withCredentials: true,
                });

                if (response.data.student && response.data.student.Groups) {
                    setUserStudent(response.data.student);
                    setRiceGrains(response.data.student.RiceGrains);
                } else {
                    setMessage('Student not found or no group data available.');
                }
            } catch (error) {
                console.error('Error fetching student from user:', error);
                setMessage('Error fetching student data.');
            }
        };

        fetchUserData();
    }, []);

    // Add an item to the cart
    const addToCart = (item) => {
        const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
        let updatedCartItems;

        if (existingItem) {
            updatedCartItems = cartItems.map(cartItem =>
                cartItem.id === item.id
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            );
        } else {
            updatedCartItems = [...cartItems, { ...item, quantity: 1 }];
        }

        setCartItems(updatedCartItems);
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems)); // Persist cart items
    };

    return (
        <div className="shop flex">
            <StudentSidebar />
            <div className="content p-5 flex-1">
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <div className="w-full bg-emerald-500 text-white py-10 text-center rounded-md" data-testid="shop">
                        <h1 className="text-3xl font-bold">Earn rewards by working hard!</h1>
                    </div>
                </div>

                {/* User grains info */}
                <div className="w-full bg-gray-200 text-black py-4 px-5 mb-5 rounded-md flex justify-between items-center">
                    <h2 className="text-xl font-bold">You have {riceGrains} grains</h2>
                    <p className="text-right">
                        Earn points when you receive a peer rating.<br />
                        Each star gives you 10 grains.<br />
                        Getting a perfect 5 star in all dimensions gives you a bonus of 50 grains (total of 250 grains).
                    </p>
                </div>

                {/* Cart button */}
                <button
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-300 mb-5"
                    onClick={() => navigate('/cart')}
                >
                    Cart
                </button>

                {/* Shop items */}
                <div className="items-grid grid grid-cols-5 gap-5">
                    {items.map(item => (
                        <div
                            key={item.id}
                            className="item-card border border-gray-300 p-2 text-center relative rounded-md bg-gray-200"
                        >
                            <div className="w-full h-45 overflow-hidden rounded-md">
                                <img
                                    src={item.photo}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3>{item.name}</h3>
                            <p>{item.price} grains</p>
                            <button
                                className="mt-2 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-700 transition-colors duration-300"
                                onClick={() => addToCart(item)}
                            >
                                Add to Cart
                            </button>
                            {cartItems.find(cartItem => cartItem.id === item.id) && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl">
                                    {cartItems.find(cartItem => cartItem.id === item.id).quantity} in cart
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Shop;
