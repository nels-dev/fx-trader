import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { Link } from "react-router-dom";

import { Button, Divider } from "@mui/material";
const Nav = () => {
    return ( <nav>
        
        <Grid
          sx={{pt:2, pb: 2}}
          spacing={5}
          container alignContent="stretch"          
        >   
            <Grid>
                <Button component={Link} to="/">Portfolio</Button>
            </Grid>
            <Grid>
                <Button component={Link} to="/trade">Trade</Button>                
            </Grid>
            <Grid>
                <Button component={Link} to="/funding">Funding</Button>                
            </Grid>
            <Grid>
                <Button component={Link} to="/notification">Notifications</Button>                
            </Grid>
        </Grid>
        <Divider/>
    </nav> );
}
 
export default Nav;