import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";

const StudentSidebar = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(true);
    const Menus = [
        { title: "Dashboard", src: "Chart_fill" },
        { title: "Inbox", src: "Chat" },
        { title: "Accounts", src: "User", gap: true },
        { title: "Schedule ", src: "Calendar" },
        { title: "Search", src: "Search" },
        { title: "Analytics", src: "Chart" },
        { title: "Files ", src: "Folder", gap: true },
        { title: "Setting", src: "Setting" },
    ];
    // Logout handler
    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:3000/logout', {
                method: 'GET', // Or 'POST' depending on your implementation
                credentials: 'include', // Important to include cookies
            });

            if (response.ok) {
                // Logout successful
                console.log('Logout successful');
                navigate('/');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <div className="flex">
            <div className={` ${open ? "w-72" : "w-20 "} 
            bg-blue-500
            h-screen 
            p-5  
            pt-8 
            relative 
            duration-300`}>
                <img src=".\src\app\components\Collapse.jpg"
                    className={`absolute
                    cursor-pointer 
                    -right-3 
                    top-9 
                    w-7 
                    border-dark-purple 
                    border-2 rounded-full  
                    ${!open && "rotate-180"}`} onClick={() => setOpen(!open)}
                />
                <div className="flex gap-x-4 items-center">
                    <img src="./src/assets/logo.png"
                        className={`cursor-pointer duration-500 ${open && "rotate-[360deg]"}`} />
                    <h1 className={`
                    text-white 
                    origin-left 
                    font-medium 
                    text-xl 
                    duration-200 ${!open && "scale-0"}`}>
                        Student
                    </h1>
                </div>

                <ul className="pt-6">
                    <li
                        onClick={() => navigate('/studentDashboard')}
                        className="
                        flex 
                        rounded-md 
                        p-2 
                        cursor-pointer 
                        hover:bg-light-white 
                        text-gray-300 
                        text-sm 
                        items-center 
                        gap-x-4 
                        mt-2 
                        bg-light-white"
                    >
                        <img src="./src/assets/Chart_fill.png" />
                        <span className=
                        {`${!open && "hidden"} 
                        origin-left 
                        duration-200`}>
                            Dashboard
                        </span>
                    </li>
                    <li
                        onClick={() => navigate('/studentManageClasses')}
                        className="
                        flex 
                        rounded-md 
                        p-2 
                        cursor-pointer 
                        hover:bg-light-white 
                        text-gray-300 
                        text-sm 
                        items-center
                         gap-x-4 
                         mt-2"
                    >
                        <img src="./src/assets/Classes.png" />
                        <span className=
                        {`${!open && "hidden"}
                        origin-left 
                        duration-200`}>
                            My Classes
                        </span>
                    </li>
                    <li
                        onClick={() => navigate('/studentReviewRatings')}
                        className="
                        flex 
                        rounded-md 
                        p-2 
                        cursor-pointer 
                        hover:bg-light-white 
                        text-gray-300 
                        text-sm 
                        items-center 
                        gap-x-4 
                        mt-2"
                    >
                        <img src="./src/assets/Ratings.png" />
                        <span className=
                        {`${!open && "hidden"} 
                        origin-left 
                        duration-200`}>
                            Your Ratings
                        </span>
                    </li>
                    <li
                        onClick={() => navigate('/studentRateMyInstructor')}
                        className="
                        flex 
                        rounded-md 
                        p-2 
                        cursor-pointer 
                        hover:bg-light-white 
                        text-gray-300 
                        text-sm 
                        items-center 
                        gap-x-4 mt-2"
                    >
                        <img src="./src/assets/Rate.png" />
                        <span className=
                        {`${!open && "hidden"} 
                        origin-left 
                        duration-200`}>
                            Rate My Instructor
                        </span>
                    </li>
                    <li
                        onClick={handleLogout}
                        className="
                        flex 
                        rounded-md 
                        p-2 
                        cursor-pointer 
                        hover:bg-light-white 
                        text-gray-300 
                        text-sm 
                        items-center 
                        gap-x-4 
                        mt-2"
                    >
                        <img src="./src/assets/Logout.png" />
                        <span className=
                        {`${!open && "hidden"} 
                        origin-left 
                        duration-200`}>
                            Logout
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default StudentSidebar;
