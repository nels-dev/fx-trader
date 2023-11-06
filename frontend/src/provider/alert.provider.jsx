import {createContext, useContext, useEffect, useState} from "react";

const AlertContext = createContext({})

const AlertProvider = ({children}) => {

  const [payload, setPayload] = useState({})

  useEffect(() => {
    console.log('Payload in AlertProvider changed:', payload);
  }, [payload]);

  const doAlert = ({message, type, title}) => setPayload(
      {message, type, title, time: new Date()})

  return <AlertContext.Provider
      value={{payload, doAlert}}>{children}</AlertContext.Provider>
}

// So that the rest of the application can "useAuth()" to get the token & setToken function
export const useAlert = () => useContext(AlertContext);

export default AlertProvider;

