import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css"; // Assuming a CSS file for Profile-specific styles

function Profile() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Compute initials safely
  const initials = user?.name
    ? user.name
        .split(" ")
        .filter((n) => n)
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "?"
    : "?";

  // Fetch user profile on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          console.error("Failed to fetch profile");
          setError("Failed to load profile data.");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("An error occurred while loading your profile.");
      }
    };

    fetchProfile();
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Handle password reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to reset your password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      if (res.ok) {
        setSuccess("Password updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("An error occurred while resetting your password.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile click for dropdown
  const handleProfileClick = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Section 1: Header */}
      <header className="section1-header bg-white shadow-md p-4 flex justify-between items-center">
        <div className="logo text-2xl font-bold text-blue-600">Fit2Go</div>
        <nav className="nav">
          <ul className="flex space-x-4">
            <li>
              <button
                className="text-gray-700 hover:text-blue-600"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                className="text-gray-700 hover:text-blue-600"
                onClick={() => navigate("/nutrition")}
              >
                Nutrition
              </button>
            </li>
            <li>
              <button
                className="text-gray-700 hover:text-blue-600"
                onClick={() => navigate("/fitness")}
              >
                Workouts
              </button>
            </li>
          </ul>
        </nav>
        <div
          className="user-profile flex items-center space-x-2 cursor-pointer relative"
          onClick={handleProfileClick}
        >
          <div className="user-initials w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
            {initials}
          </div>
          <span className="text-gray-700">{user ? user.name : "Guest"}</span>
          {showDropdown && (
            <div className="absolute top-full right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-[120px] py-2">
              <span
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
              >
                Logout
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Section 2: Profile Content */}
      <section className="section2-profile max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Profile</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-4">{success}</div>
        )}
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl">
                {initials}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">Name</h3>
                <p className="text-gray-600">{user.name}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800">Email</h3>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Reset Password</h3>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full p-2 rounded text-white ${
                    isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="text-gray-600">Loading profile...</div>
        )}
      </section>
    </div>
  );
}

export default Profile;