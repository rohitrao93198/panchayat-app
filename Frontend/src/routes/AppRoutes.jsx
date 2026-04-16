import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/admin/Dashboard";

import Services from "../pages/user/Services";
import Booking from "../pages/user/Booking";

import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

import Complaints from "../pages/admin/Complaints";
import Bookings from "../pages/admin/Bookings";
import UploadRule from "../pages/admin/UploadRule";
import Users from "../pages/admin/Users";
import Announcement from "../pages/admin/Announcement";

import Complaint from "../pages/user/Complaint";
import MyComplaints from "../pages/user/MyComplaints";

import Home from "../pages/user/Home";
import Support from "../pages/user/Support";

import Chatbot from "../pages/user/Chatbot";
import Notifications from "../pages/user/Notifications";




export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                    path="/user/home"
                    element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/admin/dashboard"
                    element={
                        <AdminRoute>
                            <Dashboard />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/user/services"
                    element={
                        <PrivateRoute>
                            <Services />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/user/bookings"
                    element={
                        <PrivateRoute>
                            <Booking />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/user/complaint"
                    element={
                        <PrivateRoute>
                            <Complaint />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/user/my-complaints"
                    element={
                        <PrivateRoute>
                            <MyComplaints />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/user/support"
                    element={
                        <PrivateRoute>
                            <Support />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/admin/complaints"
                    element={
                        <AdminRoute>
                            <Complaints />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/admin/rules/upload"
                    element={
                        <AdminRoute>
                            <UploadRule />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/admin/users"
                    element={
                        <AdminRoute>
                            <Users />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/admin/bookings"
                    element={
                        <AdminRoute>
                            <Bookings />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/admin/announce"
                    element={
                        <AdminRoute>
                            <Announcement />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/user/chatbot"
                    element={
                        <PrivateRoute>
                            <Chatbot />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/user/notifications"
                    element={
                        <PrivateRoute>
                            <Notifications />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}