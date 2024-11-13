import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentSidebar from '../_StudentSidebar';

const Shop = () => {

    // const navigate = useNavigate();
    return (
        <div className="manage-groups-container" style={{ display: 'flex' }}>
            <StudentSidebar />
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                <h1 className="text-3xl font-bold">Earn rewards by working hard!</h1>
                <h2>Points: </h2>
                

                </div>
        </div>
    );
};

export default Shop;