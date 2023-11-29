import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/logo.svg"
import CloseIcon from '@mui/icons-material/Close';

import { Box, Button, Divider, IconButton, List, ListItemButton, ListItemText, ListSubheader, useMediaQuery, useTheme } from "@mui/material";

const Nav = ({ smallScreen, close = () => { } }) => {
  const links = [
    { label: 'Portfolio', link: '/' },
    { label: 'Market', link: '/market' },
    { label: 'Trade', link: '/trade' },
    { label: 'Funding', link: '/funding' },
    { label: 'Notifications', link: '/notification' },
  ]
  if (smallScreen) {
    return (<Box sx={{ width: '100vw', pt: 2 }}>
      <List>
        <ListSubheader>
          <Grid container spacing={2}>
            <Grid xs={6}>
              <img src={logo} width='100%' />
            </Grid>
            <Grid xs>

            </Grid>
            <Grid>
              <IconButton
                color="inherit"
                edge="end"
                onClick={close}

              >
                <CloseIcon fontSize='large' />
              </IconButton>
            </Grid>
          </Grid>


        </ListSubheader>

        {links.map(({ label, link }) => (
          <ListItemButton key={label} component={NavLink} to={link} onClick={close}>
            <ListItemText primary={label} />
          </ListItemButton>))}
      </List></Box>)
  } else {
    return (<nav>

      <Grid
        sx={{ pt: 2 }}
        container alignContent="stretch"
      >
        {links.map(({ label, link }) => (
          <Grid key={label}>

            <Button sx={{ p: 2, fontWeight: 500 }} component={NavLink} size="large"
              to={link}>{label}</Button>
          </Grid>))}
      </Grid>
      <Divider />
    </nav>)
  }
}

export default Nav;