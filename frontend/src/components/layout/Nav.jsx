import Grid from "@mui/material/Unstable_Grid2/Grid2";
import {Link} from "react-router-dom";

import {Button, Divider} from "@mui/material";

const Nav = () => {
  return (<nav>

    <Grid
        sx={{pt: 2}}
        container alignContent="stretch"
    >
      <Grid>
        <Button sx={{p: 2, fontWeight: 500}} component={Link} size="large"
                to="/">Portfolio</Button>
      </Grid>
      <Grid>
        <Button sx={{p: 2, fontWeight: 500}} component={Link} size="large"
                to="/market">Market</Button>
      </Grid>
      <Grid>
        <Button sx={{p: 2, fontWeight: 500}} component={Link} size="large"
                to="/trade">Trade</Button>
      </Grid>
      <Grid>
        <Button sx={{p: 2, fontWeight: 500}} component={Link} size="large"
                to="/funding">Funding</Button>
      </Grid>
      <Grid>
        <Button sx={{p: 2, fontWeight: 500}} component={Link} size="large"
                to="/notification">Notifications</Button>
      </Grid>
    </Grid>
    <Divider/>
  </nav>);
}

export default Nav;