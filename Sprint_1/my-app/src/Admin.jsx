import React from 'react'
import { Fragment } from 'react';
import "./index.css"

const Admin = () => {
  return (
    <>
      <h1 className="welcomePage">Welcome</h1>
      <p>This is the administrator home page.</p>
      <ul>
        <button className="adminOptions">Create Team</button><br></br>
        <button className="adminOptions">Manage Teams</button><br></br>
        <button className="adminOptions">Import Student from CSV</button><br></br>
        <button className="adminOptions">Add Student to Team</button><br></br>
      </ul>
    </>
  );
};

export default Admin;
