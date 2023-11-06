import {Box, CircularProgress} from "@mui/material";

const Loading = () => {
  return (<Box sx={{p: 15, display: 'flex', justifyContent: 'center'}}>
    <CircularProgress/>
  </Box>);
}

export default Loading;