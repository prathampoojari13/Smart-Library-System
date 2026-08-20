const TOKEN_KEY = "token";

export function getToken() {
return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn() {
const token = getToken();
return Boolean(token);
}

function decodeToken() {
const token = getToken();


if (!token) {
    return null;
}

try {
    const payload = token.split(".")[1];

    if (!payload) {
        return null;
    }

    const decoded = atob(
        payload.replace(/-/g, "+").replace(/_/g, "/")
    );

    return JSON.parse(decoded);

} catch (error) {
    console.error("JWT decode error:", error);
    return null;
}


}

export function getUserId() {
const payload = decodeToken();

return payload?.user_id ?? null;

}

export function getUserEmail() {
const payload = decodeToken();

return payload?.email ?? null;


}

export function getUserRole() {
const payload = decodeToken();


return payload?.role ?? null;


}

export function isAdmin() {
const role = getUserRole();


return role === "admin";


}

export function logout() {
localStorage.removeItem(TOKEN_KEY);
localStorage.removeItem("user");
}
