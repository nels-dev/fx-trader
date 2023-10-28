import { Paper, Button, TextField, Container, Typography, Stack } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { useEffect, useState } from "react";
import logo from '../../assets/logo.svg'
import { login } from "../../services/user.service";
import { useAuth } from "../../provider/auth.provider";
import { useNavigate } from "react-router";

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" })
    const {token, loginSuccess} = useAuth();    
    const navigate = useNavigate();
    const submit = () => {
        login(form)
        .then(resp=> loginSuccess(resp.data.accessToken))
        .catch(err=> console.log(err))
    }
    useEffect(()=>{
        if(token){
            navigate('/')
        }
    }, [token])

    return (<Container maxWidth="md"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', height: '100vh' }}>

        <Paper sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}} elevation={8}>
            <Grid container sm={12} >
                <Grid md={6} sx={{p:10}}>                    
                    <img style={{objectFit:'contain', width: "100%", height:'100%'}} src={logo}/>
                </Grid>
                <Grid md={6} padding={5}>
                    <Typography variant="h5">
                        Welcome back, Investor!
                    </Typography>
                    <form>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            variant="outlined"
                            id="email"
                            label="Email"
                            value={form.email}
                            onChange={({ target: { value } }) => setForm({ ...form, email: value })}
                            autoComplete="email"
                            autoFocus

                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            variant="outlined"
                            id="password"
                            label="Password"
                            type="password"
                            value={form.password}
                            onChange={({ target: { value } }) => setForm({ ...form, password: value })}
                            autoComplete="password"
                        />
                        <Stack spacing={2} direction="row" sx={{mt: 2}}>
                            <Button variant="contained" color="primary" onClick={submit} >
                                Login
                            </Button>
                            <Button variant="outlined" color="primary" onClick={submit}>
                                Register
                            </Button>
                        </Stack>

                    </form>
                </Grid>

            </Grid>
        </Paper>


    </Container>);
}

export default Login; <></>