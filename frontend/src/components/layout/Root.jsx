import Container from '@mui/material/Container'
import { Outlet } from 'react-router';
import Alert from './Alert';
const Root = () => {
    return ( <Container maxWidth="lg">

      <Outlet/>
      <Alert/>
    </Container> );
}
 
export default Root;