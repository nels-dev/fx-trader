import { Paper, Typography, Divider, Box } from "@mui/material";
const ContentBox = ({title, children}) => {
    return ( 
    <Paper elevation={2} sx={{height:'100%'}} >
        <Box sx={{p:3}}>
        <Typography variant="h6" fontWeight={700} color='primary'>{title}</Typography>
        <Divider sx={{ mt: 1, mb: 2 }} />
        {children}
        </Box>
    </Paper> );
}
 
export default ContentBox;