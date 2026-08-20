
import { Navigate, Outlet } from "react-router-dom";

import { isLoggedIn, isAdmin } from "../utils/auth";

function AdminRoute() {

    // User is not logged in
    if (!isLoggedIn()) {
        return <Navigate to="/" replace />;
    }

    // User is logged in but is not admin
    if (!isAdmin()) {
        return <Navigate to="/dashboard" replace />;
    }

    // Admin is allowed
    return <Outlet />;
}

export default AdminRoute;

