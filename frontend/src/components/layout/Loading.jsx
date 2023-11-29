import {Box, CircularProgress} from "@mui/material";

const Loading = ({children, loading}) => {
  return loading ? (<Box sx={{p: 15, display: 'flex', justifyContent: 'center'}}>
    <CircularProgress/>
  </Box>) : children;
}

export default Loading;