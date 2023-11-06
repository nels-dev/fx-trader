import {Outlet, useNavigate} from "react-router";
import {useAuth} from "../../provider/auth.provider";
import {useEffect} from "react";

const Protected = () => {
  const { token, apiSetupComplete } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (apiSetupComplete && !token) {
      navigate(`/login`)
    }
  }, [token])

  return apiSetupComplete && (
      <Outlet/>
  );
}

export default Protected;