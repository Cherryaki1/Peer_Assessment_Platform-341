import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../_StudentSidebar';
import axios from 'axios';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]); // Cart items
    const [riceGrains, setRiceGrains] = useState(0); // Current grains
    const [showModal, setShowModal] = useState(false); // Modal visibility
    const [modalMessage, setModalMessage] = useState(''); // Modal message
    const [modalButtonText, setModalButtonText] = useState(''); // Button text in modal
    const navigate = useNavigate();

    const [userID, setUserID] = useState(''); // User ID
    const [userStudent, setUserStudent] = useState(null); // Student data
    const [message, setMessage] = useState(''); // Feedback message

    useEffect(() => {
        // Retrieve cart items from localStorage
        const storedCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        setCartItems(storedCartItems);
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/index', {
                    withCredentials: true,
                });

                if (response.data.user && response.data.user.ID) {
                    const userID = response.data.user.ID;
                    setUserID(userID);
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
                console.error('Error fetching student data:', error);
                setMessage('Error fetching student data.');
            }
        };

        fetchUserData();
    }, []);

    const updateCartItemQuantity = (item, quantity) => {
        const updatedCartItems = cartItems.map(cartItem =>
            cartItem.id === item.id ? { ...cartItem, quantity } : cartItem
        );
        setCartItems(updatedCartItems);
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
    };

    const removeFromCart = (item) => {
        const updatedCartItems = cartItems.filter(cartItem => cartItem.id !== item.id);
        setCartItems(updatedCartItems);
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
    };

    const calculateTotal = () =>
        cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const handlePlaceOrder = async () => {
        const totalCost = calculateTotal();

        if (riceGrains >= totalCost) {
            try {
                const response = await axios.post('http://localhost:3000/placeOrder', {
                    items: cartItems,
                    totalCost,
                }, {
                    withCredentials: true,
                });

                setModalMessage('Your order will be delivered shortly! You have worked hard and earned it!');
                setModalButtonText('Awesome!');
                setRiceGrains(response.data.remainingGrains);
            } catch (error) {
                setModalMessage(error.response?.data?.message || 'An error occurred while placing your order.');
                setModalButtonText('I understand');
            }
        } else {
            setModalMessage('Not enough grains to place the order.');
            setModalButtonText('I understand');
        }

        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        if (modalButtonText === 'Awesome!') {
            setCartItems([]);
            localStorage.removeItem('cartItems');
        }
        navigate('/shop');
    };

    const totalCost = calculateTotal();
    const remainingBalance = riceGrains - totalCost;

    return (
        <div className="cart flex">
            <StudentSidebar />
            <div className="content p-5 flex-1">
                <div className="flex justify-between items-center mb-5">
                    <h1 className="text-3xl font-bold">Your Cart</h1>
                    <button
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
                        onClick={() => navigate('/shop')}
                    >
                        Continue Shopping
                    </button>
                </div>
                <div className="cart-items-list">
                    {cartItems.map(item => (
                        <div key={item.id} className="cart-item flex justify-between items-center border-b border-gray-300 py-2">
                            <div className="item-details flex items-center">
                                <img src={item.photo} alt={item.name} className="w-30 h-20 mr-4 rounded-md" />
                                <div>
                                    <h3>{item.name}</h3>
                                    <p>{item.price} grains</p>
                                </div>
                            </div>
                            <div className="item-quantity flex items-center">
                                <button
                                    className="bg-white py-0.5 px-2.5 rounded-l hover:bg-gray-200 transition duration-300 border border-gray-300 border-r-0"
                                    onClick={() => updateCartItemQuantity(item, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateCartItemQuantity(item, parseInt(e.target.value))}
                                    className="w-8 text-center border border-gray-300 py-0.5"
                                    style={{ appearance: 'textfield', borderLeft: '0', borderRight: '0' }}
                                />
                                <button
                                    className="bg-white py-0.5 px-2 rounded-r hover:bg-gray-200 transition duration-300 border border-gray-300 border-l-0"
                                    onClick={() => updateCartItemQuantity(item, item.quantity + 1)}
                                >
                                    +
                                </button>
                            </div>
                            <div className="item-total">
                                <p>{item.price * item.quantity} grains</p>
                            </div>
                            <button
                                className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-700 transition duration-300 ml-4"
                                onClick={() => removeFromCart(item)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
                <div className="checkout-summary mt-5 text-right">
                    <h2 className="text-xl font-bold">Checkout Summary</h2>
                    <p>Current Grains: {riceGrains}</p>
                    <p>Total Cost: {totalCost} grains</p>
                    <p>Remaining Balance: {remainingBalance >= 0 ? remainingBalance : 0} grains</p>
                </div>
                <div className="place-order mt-5 text-right">
                    <button
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-300"
                        onClick={handlePlaceOrder}
                    >
                        Place Order
                    </button>
                </div>
                {showModal && (
                    <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-5 rounded shadow-lg text-center">
                            <p>{modalMessage}</p>
                            <button
                                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
                                onClick={handleModalClose}
                            >
                                {modalButtonText}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
