import React, { useState, useEffect } from 'react';
import StudentSidebar from '../_StudentSidebar';

const Shop = () => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch('/shopItems.json');
                const data = await response.json();
                setItems(data);
            } catch (error) {
                console.error('Error fetching shop items:', error);
            }
        };

        fetchItems();
    }, []);

    const addToCart = (item) => {
        console.log(`Added ${item.name} to cart`);
        // Implement add to cart functionality here
    };

    return (
        <div className="shop flex">
            <StudentSidebar />
            <div className="content p-5 flex-1">
                <h1 className="text-3xl font-bold">Earn rewards by working hard!</h1>
                <h2>Points: </h2>
                <div className="items-grid grid grid-cols-5 gap-5">
                    {items.map(item => (
                        <div key={item.id} className="item-card border border-gray-300 p-2 text-center transform transition-transform duration-300 hover:scale-105">
                            <img src={item.photo} alt={item.name} className="w-full h-auto" />
                            <h3>{item.name}</h3>
                            <p>${item.price}</p>
                            <button 
                                className="mt-2 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-700 transition-colors duration-300"
                                onClick={() => addToCart(item)}
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Shop;