import Grid from '@mui/material/Unstable_Grid2'
import logo from "../../assets/logo.svg"
import Button from '@mui/material/Button'
import {useAuth} from '../../provider/auth.provider'
import Nav from './Nav'
import { useTheme } from '@emotion/react'
import { Drawer, IconButton, useMediaQuery } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react'
import MobileNav from './Nav'

const Header = () => {
  const {logout} = useAuth();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('sm'));
  const [open, setOpen] = useState(false)
  return (<header>
    <Grid
        sx={{pt: 3, pb: 1}}
        container alignContent="stretch" alignItems="center"
    >
      <Grid xs={6} md={4}>
        <img src={logo} width='100%'/>
      </Grid>
      <Grid xs>

      </Grid>
      <Grid>
        {desktop && (<Button variant="outlined" color="primary" onClick={logout}>
          Logout
        </Button>)}
        {!desktop && (
          <IconButton
          color="inherit"
          edge="end"
          onClick={()=> setOpen(true)}
          sx={{ ...(open && { display: 'none' }) }}
        >
          <MenuIcon fontSize='large'/>
        </IconButton>
        )}
      </Grid>
    </Grid>
    <Drawer
      anchor='right'
      open={open}
      onClose={()=> setOpen(false)}
    >
      <Nav smallScreen={true} close={()=> setOpen(false)}/>
    </Drawer>
    {desktop && <Nav smallScreen={false} />}
  </header>);
}

export default Header;