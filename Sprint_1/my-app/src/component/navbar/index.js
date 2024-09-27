import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css"

const VerticalNavbar = () => {
    return (
        <nav className="navbar  ">
            <ul className="navbar-nav d-flex flex-column">
                <li className="nav-item"><a className="nav-link" href="#">Home</a></li>
                <li className="nav-item"><a className="nav-link" href="#">My Courses</a></li>
                <li className="nav-item"><a className="nav-link" href="#">Manage Teams</a></li>
                <li className="nav-item"><a className="nav-link" href="#">Import Student List</a></li>
                <li className="nav-item"><a className="nav-link" href="#">Add Student to Team</a></li>
            </ul>
        </nav>
    );
};

export default VerticalNavbar;