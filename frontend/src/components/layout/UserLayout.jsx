import {Outlet} from "react-router";
import Header from "./Header";
import Nav from "./Nav";
import Footer from "./Footer";

const UserLayout = () => {
  return (<>
    <Header/>
    <Outlet/>
  </>);
}

export default UserLayout;