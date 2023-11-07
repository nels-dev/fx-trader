import {createBrowserRouter} from "react-router-dom";
import Protected from "../components/layout/Protected";
import Root from "../components/layout/Root";
import Login from "../components/public/Login";
import UserLayout from "../components/layout/UserLayout";
import PortfolioSummary from "../components/portfolio/PortfolioSummary";
import Funding from "../components/funding/Funding";
import Trade from "../components/trade/Trade";
import Notifications from "../components/notifications/Notifications";
import Register from "../components/public/Register";
import Market from "@/components/market/Market";

const routes = [
  {
    path: "/",
    element: <Root/>,
    children: [
      {
        path: "login",
        element: <Login/>,
      },
      {
        path: "register",
        element: <Register/>,
      },
      {
        path: "/",
        element: <Protected/>,
        children: [
          {
            path: "/",
            element: <UserLayout/>,
            children: [{
              path: "/",
              element: <PortfolioSummary/>
            }, {
              path: "funding",
              element: <Funding/>
            }, {
              path: "trade",
              element: <Trade/>
            }, {
              path: "notification",
              element: <Notifications/>
            }, {
              path: "market",
              element: <Market/>
            }]
          }
        ]
      }
    ]
  }
]
export default createBrowserRouter(routes,
    {basename: import.meta.env.BASE_URL});