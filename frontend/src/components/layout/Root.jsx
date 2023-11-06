import Container from '@mui/material/Container'
import {Outlet} from 'react-router';
import Alert from './Alert';
import { Grid } from '@mui/material';
import Footer from './Footer';

const Root = () => {
  return (
    <Grid container direction='column' height='100%'  alignItems='stretch' wrap='nowrap'>
      <Grid flexGrow={1} flexShrink={0} flexBasis='auto'>
        <Container maxWidth="lg" sx={{height:'100%'}}>
          <Outlet/>
          <Alert/>
        </Container>
      </Grid>
      <Grid flexShrink={0}>
        <Footer/>
      </Grid>
  </Grid>);
}

export default Root;