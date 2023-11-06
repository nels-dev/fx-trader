import {RouterProvider} from 'react-router-dom'
import AuthProvider from './provider/auth.provider'
import router from './router/router'
import {ThemeProvider} from '@mui/material'
import theme from './config/theme'
import AlertProvider from './provider/alert.provider'

const App = () => {

  return (
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <AlertProvider>
            <RouterProvider router={router}></RouterProvider>
          </AlertProvider>
        </ThemeProvider>
      </AuthProvider>
  )
}

export default App
