import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/logo.svg"
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/FolderSpecial'
import TimelineIcon from '@mui/icons-material/Timeline'
import SyncAltIcon from '@mui/icons-material/SyncAlt'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Box, Button, Divider, IconButton, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, useMediaQuery, useTheme } from "@mui/material";

const Nav = ({ smallScreen, close = () => { } }) => {
  const links = [
    { label: 'Portfolio', link: '/', icon: <FolderIcon/> },
    { label: 'Market', link: '/market', icon: <TimelineIcon/> },
    { label: 'Trade', link: '/trade', icon: <SyncAltIcon/>},
    { label: 'Funding', link: '/funding', icon: <AccountBalanceIcon/> },
    { label: 'Notifications', link: '/notification', icon: <NotificationsIcon/> },
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

        {links.map(({ label, link, icon }) => (
          <ListItemButton key={label} component={NavLink} to={link} onClick={close}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>))}
      </List></Box>)
  } else {
    return (<nav>

      <Grid
        sx={{ pt: 2 }}
        container alignContent="stretch"
      >
        {links.map(({ label, link, icon }) => (
          <Grid key={label}>
            <NavLink to={link}>
              {({isActive}) => (
               <Button
               startIcon={icon} 
               sx={{ p: 2, fontWeight: 500, borderRadius:0, borderBottom: (isActive ? 3:0), borderBottomColor: 'primary.main' }}  
               size="large">{label}</Button>
              )}
            </NavLink>
          </Grid>))}
      </Grid>
      
    </nav>)
  }
}

export default Nav;