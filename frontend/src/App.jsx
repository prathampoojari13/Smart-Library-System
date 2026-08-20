import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Borrow from "./pages/Borrow";
import Reservations from "./pages/Reservations";
import Fines from "./pages/Fines";
import Settings from "./pages/Settings";

import AdminBooks from "./pages/AdminBooks";
import AddBook from "./pages/AddBook";
import EditBook from "./pages/EditBook";
import AdminBorrowings from "./pages/AdminBorrowings";
import AdminReservations from "./pages/AdminReservations";
import AdminFines from "./pages/AdminFines";

import AdminRoute from "./components/AdminRoute";

import { ToastProvider } from "./context/ToastContext";

function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Authentication Pages */}
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Member Pages */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/books" element={<Books />} />
                    <Route path="/borrow" element={<Borrow />} />
                    <Route path="/reservations" element={<Reservations />} />
                    <Route path="/fines" element={<Fines />} />
                    <Route path="/settings" element={<Settings />} />

                    {/* Protected Admin Routes */}
                    <Route element={<AdminRoute />}>
                        <Route path="/admin-books" element={<AdminBooks />} />
                        <Route path="/add-book" element={<AddBook />} />
                        <Route path="/edit-book/:id" element={<EditBook />} />
                        <Route path="/admin-borrowings" element={<AdminBorrowings />} />
                        <Route path="/admin-reservations" element={<AdminReservations />} />
                        <Route path="/admin-fines" element={<AdminFines />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ToastProvider>
    );
}

export default App;