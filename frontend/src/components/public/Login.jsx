import { Paper, Button, TextField, Container, Typography, Stack } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { useEffect, useState } from "react";
import logo from '../../assets/logo.svg'
import { login } from "../../services/user.service";
import { useAuth } from "../../provider/auth.provider";
import { useNavigate } from "react-router";
import { useAlert } from "../../provider/alert.provider";

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" })
    const {token, loginSuccess} = useAuth();    
    const {doAlert} = useAlert();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const submit = () => {
        setLoading(true)
        login(form)
        .then(resp=> {
            if(resp.data.success){
                loginSuccess(resp.data.accessToken)
            }else{
                doAlert({
                    message:'Please check your credentials and try again.',
                    type: 'error',
                    title: 'Login Failed'})
            }
        })
        .catch(err=> doAlert({
            message:'Unable to perform the operation. Please try again later',
            type: 'error',
            title: 'Login Failed'}))
        .finally(()=>{setLoading(false)})
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
                            disabled={loading}
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
                            disabled={loading}
                            variant="outlined"
                            id="password"
                            label="Password"
                            type="password"
                            value={form.password}
                            onChange={({ target: { value } }) => setForm({ ...form, password: value })}
                            autoComplete="password"
                        />
                        <Stack spacing={2} direction="row" sx={{mt: 2}}>
                            <Button type="submit" variant="contained" color="primary" onClick={submit} disabled={loading} >
                                Login
                            </Button>
                            <Button variant="outlined" color="primary" onClick={submit} disabled={loading}>
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