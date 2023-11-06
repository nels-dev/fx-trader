import { Box, Container, Divider, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";

const Footer = () => {
    return ( <Box sx={{p: 5, mt: 5, backgroundColor: grey[100]}}>
        
        <Container maxWidth='lg'>            
            <Typography gutterBottom variant="subtitle1">About Assisty Trade</Typography>
            <Typography variant="caption">
            This web application is a prototype developed for academic purposes, 
            specifically to meet the project requirements of CSIS4495 - Applied Research Project at Douglas College, 
            and as a personal development endeavor. The information presented may be inaccurate, outdated, or incomplete.
             Content on this site should not be considered as financial trading advice.
             For insights into the development and source code, please refer to the <a href="https://github.com/nels-dev/fx-trader">GitHub repository</a>.
            </Typography>
        </Container>
        
    </Box> );
}
 
export default Footer;