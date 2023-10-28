import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../../provider/auth.provider";
import { useEffect } from "react";
const Protected = () => {
    const {token} = useAuth();
    const navigate = useNavigate();
    useEffect(()=>{
        if(!token){
            navigate(`/login`)
        }
    }, [token])
    
    return (
        <Outlet/>
    );
}
 
export default Protected;