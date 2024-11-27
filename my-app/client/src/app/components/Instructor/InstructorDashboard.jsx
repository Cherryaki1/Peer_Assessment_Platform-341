import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../_InstructorSidebar";

const InstructorDashboard = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/index", {
          withCredentials: true,
        });
        setUser(response.data.user);
        setMessage(response.data.message || "");
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    const fetchClasses = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/instructorManageClasses",
          { withCredentials: true }
        );
        setClasses(response.data.classes || []);
        if (response.data.classes.length === 0) {
          setMessage("No classes are available (None added).");
        } else {
          setMessage("");
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        setMessage(
          `Error: ${error.response?.data?.message || "Failed to fetch classes."}`
        );
      }
    };

    fetchUser();
    fetchClasses();
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSummaryClick = (classID) => {
    if (parseInt(classID)) {
      navigate(`/studentsSummaryPage/${classID}`);
    } else {
      console.error("No classID found!");
    }
  };

  const handleDetailClick = (classID) => {
    if (parseInt(classID)) {
      navigate(`/detailView/${classID}`);
    } else {
      console.error("No classID found!");
    }
  };

  if (loading) {
    return <div className="loading-indicator">Loading...</div>;
  }

  return (
    <div className="dashboard-container" style={{ display: "flex" }}>
      <Sidebar />
      <div
        className="content"
        style={{
          padding: "20px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "2em", fontWeight: "bold" }}>
            Welcome Instructor, {user?.FirstName || "Loading"}!
          </h2>
          <h3>{currentTime}</h3>
        </div>
        <div style={{ width: "100%", maxWidth: "900px" }}>
          <h3 className="text-xl font-bold mb-4 text-center">Current Classes</h3>
          {classes.length > 0 ? (
            <div className="flex flex-col gap-4">
              {classes.map((classItem, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-200 rounded-md shadow-md"
                  style={{
                    textAlign: "center",
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <h3 className="text-xl font-bold">{classItem.name}</h3>
                  <p>
                    {classItem.subject}, Section: {classItem.section}
                  </p>
                  <p>{classItem.studentCount} Students</p>
                  <div
                    className="mt-4"
                    style={{
                      display: "flex",
                      gap: "10px",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={() => handleSummaryClick(classItem.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                    >
                      Summary View
                    </button>
                    <button
                      onClick={() => handleDetailClick(classItem.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                    >
                      Detailed View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: "center" }}>
              {message || "No classes available."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
