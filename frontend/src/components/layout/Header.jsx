import Grid from '@mui/material/Unstable_Grid2'
import logo from "../../assets/logo.svg"
import Button from '@mui/material/Button'
import {useAuth} from '../../provider/auth.provider'

const Header = () => {
  const {logout} = useAuth();
  return (<header>
    <Grid
        sx={{pt: 3, pb: 1}}
        container alignContent="stretch"
    >
      <Grid>
        <img src={logo} width='100%'/>
      </Grid>
      <Grid xs>

      </Grid>
      <Grid>
        <Button variant="outlined" color="primary" onClick={logout}>
          Logout
        </Button>
      </Grid>
    </Grid>
  </header>);
}

export default Header;