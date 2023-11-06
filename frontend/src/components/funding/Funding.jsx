import {Box} from "@mui/material";
import FundingHistory from "./FundingHistory";
import PerformFunding from "./PerformFunding";

const Funding = () => {
  return (<section>
    <Box sx={{mt: 3}}>
      <PerformFunding/>
    </Box>
    <Box sx={{mt: 3}}>
      <FundingHistory/>
    </Box>
  </section>);
}

export default Funding;