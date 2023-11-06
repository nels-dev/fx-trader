import {Box} from "@mui/material";
import TradingHistory from "@/components/trade/TradingHistory.jsx";
import PerformTrading from "@/components/trade/PerformTrading.jsx";

const Trade = () => {
  return (<section>
    <Box sx={{mt: 3}}>
      <PerformTrading/>
    </Box>
    <Box sx={{mt: 3}}>
      <TradingHistory/>
    </Box>

  </section>);
}

export default Trade;