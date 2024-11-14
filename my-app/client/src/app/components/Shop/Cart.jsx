import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../_StudentSidebar';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [riceGrains, setRiceGrains] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalButtonText, setModalButtonText] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        setCartItems(storedCartItems);
    }, []);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const response = await fetch('/studentData');
                const data = await response.json();
                setRiceGrains(data.riceGrains);
            } catch (error) {
                console.error('Error fetching student data:', error);
            }
        };

        fetchStudentData();
    }, []);

    const updateCartItemQuantity = (item, quantity) => {
        const updatedCartItems = cartItems.map(cartItem => 
            cartItem.id === item.id ? { ...cartItem, quantity: quantity } : cartItem
        );
        setCartItems(updatedCartItems);
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
    };

    const removeFromCart = (item) => {
        const updatedCartItems = cartItems.filter(cartItem => cartItem.id !== item.id);
        setCartItems(updatedCartItems);
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const handlePlaceOrder = () => {
        const totalCost = calculateTotal();
        if (riceGrains >= totalCost) {
            setModalMessage('Your ordered items will be delivered to your address that have provided to the school within 1-2 business days. You have worked hard and earned it!');
            setModalButtonText('Awesome!');
            setShowModal(true);
        } else {
            setModalMessage('Sorry but you have not earned enough points yet to make this purchase.');
            setModalButtonText('I understand');
            setShowModal(true);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        if (modalButtonText === 'Awesome!') {
            setCartItems([]);
            localStorage.removeItem('cartItems');
        }
        navigate('/shop');
    };

    return (
        <div className="cart flex">
            <StudentSidebar />
            <div className="content
             p-5 
             flex-1">
                <div className="flex
                 justify-between 
                 items-center 
                 mb-5">
                    <h1 className="
                    text-3xl 
                    font-bold"
                    >
                        Your Cart
                    </h1>
                    <button 
                        className="
                        bg-blue-500 
                        text-white 
                        py-2 
                        px-4 
                        rounded 
                        hover:bg-blue-700 
                        transition-colors 
                        duration-300"
                        onClick={() => navigate('/shop')}
                    >
                        Continue Shopping
                    </button>
                </div>
                <h2>You have {riceGrains} grains</h2>
                <div className="cart-items-list">
                    {cartItems.map(item => (
                        <div key={item.id} className="
                        cart-item 
                        flex 
                        justify-between 
                        items-center 
                        border-b 
                        border-gray-300 
                        py-2">
                            <div className="
                            item-details 
                            flex 
                            items-center">
                                <img src={item.photo} alt={item.name} className="
                                w-16 
                                h-16 
                                mr-4" />
                                <div>
                                    <h3>{item.name}</h3>
                                    <p>{item.price} grains</p>
                                </div>
                            </div>
                            <div className="
                            item-quantity 
                            flex 
                            items-center">
                                <button 
                                    className="
                                    bg-gray-300 
                                    text-gray-700 
                                    py-1 
                                    px-3 
                                    rounded-l 
                                    hover:bg-gray-400 
                                    transition-colors 
                                    duration-300"
                                    onClick={() => updateCartItemQuantity(item, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </button>
                                <input 
                                    type="number" 
                                    value={item.quantity} 
                                    onChange={(e) => updateCartItemQuantity(item, parseInt(e.target.value))}
                                    className="
                                    w-12 
                                    text-center
                                    border 
                                    border-gray-300"
                                    style={{ appearance: 'textfield' }}
                                />
                                <button 
                                    className="
                                    bg-gray-300 
                                    text-gray-700 
                                    py-1 
                                    px-3 
                                    rounded-r 
                                    hover:bg-gray-400 
                                    transition-colors 
                                    duration-300"
                                    onClick={() => updateCartItemQuantity(item, item.quantity + 1)}
                                >
                                    +
                                </button>
                            </div>
                            <div className="item-total">
                                <p>{item.price * item.quantity} grains</p>
                            </div>
                            <button 
                                className="
                                bg-red-500 
                                text-white 
                                py-1 
                                px-3 
                                rounded 
                                hover:bg-red-700 
                                transition-colors 
                                duration-300 
                                ml-4"
                                onClick={() => removeFromCart(item)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
                <div className="
                cart-total 
                mt-5 
                text-right">
                    <h2 className="
                    text-2xl 
                    font-bold"
                    >
                        Total: {calculateTotal()} grains
                    </h2>
                </div>
                <div className="
                place-order 
                mt-5 
                text-right">
                    <button 
                        className="
                        bg-green-500 
                        text-white 
                        py-2 
                        px-4 
                        rounded 
                        hover:bg-green-700 
                        transition-colors 
                        duration-300"
                        onClick={handlePlaceOrder}
                    >
                        Place Order
                    </button>
                </div>
                {showModal && (
                    <div className="
                    modal 
                    fixed 
                    inset-0 
                    flex 
                    items-center 
                    justify-center 
                    bg-black 
                    bg-opacity-50">
                        <div className="
                        bg-white 
                        p-5 
                        rounded 
                        shadow-lg 
                        text-center">
                            <p>{modalMessage}</p>
                            <button 
                                className="
                                mt-4 
                                bg-blue-500 
                                text-white 
                                py-2 
                                px-4 
                                rounded 
                                hover:bg-blue-700 
                                transition-colors 
                                duration-300"
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