import { Outlet } from "react-router";
import Header from "./Header";
import Nav from "./Nav";

const UserLayout = () => {
    return ( <>
        <Header/>
        <Nav/>
        <Outlet/>
    </> );
}
 
export default UserLayout;