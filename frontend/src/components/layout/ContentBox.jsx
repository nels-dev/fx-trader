import {Box, Paper, Typography} from "@mui/material";

const ContentBox = ({title, children}) => {
  return (
      <Paper elevation={2} sx={{height: '100%'}}>
        <Box sx={{p: 3}}>
          <Typography gutterBottom variant="h6" fontWeight={700}
                      color='primary'>{title}</Typography>
          {children}
        </Box>
      </Paper>);
}

export default ContentBox;