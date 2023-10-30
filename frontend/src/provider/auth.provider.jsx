import { createContext, useContext, useState, useEffect, useMemo } from "react";
import api from "../config/api";

// reference: https://dev.to/sanjayttg/jwt-authentication-in-react-with-react-router-1d03

const AuthContext = createContext({})

const AuthProvider = ({children}) => {

    const [token, setToken] = useState(localStorage.getItem("token"))

    // toggle local storage and axios settings when token changes
    useEffect(()=>{
        if(token){
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            localStorage.setItem('token', token)
        }else{
            delete api.defaults.headers.common['Authorization'];
            localStorage.removeItem('token')
        }
    }, [token])

    // Expose the setAuthToken function to the auth context
    const loginSuccess = (newToken) => setToken(newToken);

    const logout = ()=>setToken(null);
    

    return <AuthContext.Provider value={{token, loginSuccess, logout}}>{children}</AuthContext.Provider>
}

// So that the rest of the application can "useAuth()" to get the token & setToken function
export const useAuth = () => useContext(AuthContext);

export default AuthProvider;

