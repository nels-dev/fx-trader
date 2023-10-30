import logo from '@/assets/logo.svg';
import { useAlert } from "@/provider/alert.provider";
import { useAuth } from '@/provider/auth.provider';
import { register } from "@/services/user.service";
import { Button, Container, Paper, Stack, TextField } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const Register = () => {
    const [form, setForm] = useState({ email: "", password: "", confirmPassword: "", firstName:"", lastName:"" })
    const { doAlert } = useAlert();
    const { token } =useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const submit = (event) => {
        event?.preventDefault()
        if (form.password != form.confirmPassword) {
            doAlert({
                message: 'Please check your password',
                type: 'warning',
                title: 'Password mismatch!'
            });
            return
        }
        setLoading(true)
        register(form)
            .then(() => {

                doAlert({
                    message: 'Please login with your credentials',
                    type: 'success',
                    title: 'Registration Success!'
                });
                navigate("/login")

            })
            .catch(err => doAlert({
                message: `${err.response?.data?.message || 'We are not able to register your user account. Please try later.'}`,
                type: 'error',
                title: 'Registration Failed'
            }))
            .finally(() => { setLoading(false) })

    }
    useEffect(() => {
        if (token) {
            navigate('/')
        }
    }, [token])

    return (<Container maxWidth="md"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', height: '100vh' }}>
        <Paper sx={{ display: 'flex', p: 5, flexDirection: 'column', alignItems: 'center', width: '100%' }} elevation={8}>
            <Grid container>
                <Grid md={4} xs={6}>
                    <img src={logo} />
                </Grid>
                <Grid xs={12}>
                    <form onSubmit={submit}>
                        <TextField
                            margin="normal"
                            required
                            disabled={loading}
                            fullWidth
                            variant="outlined"
                            label="First Name"
                            value={form.firstName}
                            onChange={({ target: { value } }) => setForm({ ...form, firstName: value })}
                            autoComplete="given-name"
                            autoFocus

                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            disabled={loading}
                            variant="outlined"
                            label="Last Name"
                            value={form.lastName}
                            onChange={({ target: { value } }) => setForm({ ...form, lastName: value })}
                            autoComplete="family-name"
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            disabled={loading}
                            variant="outlined"
                            label="Email"
                            value={form.email}
                            onChange={({ target: { value } }) => setForm({ ...form, email: value })}
                            autoComplete="email"
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            disabled={loading}
                            type="password"
                            variant="outlined"
                            label="Password"
                            value={form.password}
                            onChange={({ target: { value } }) => setForm({ ...form, password: value })}
                            autoComplete="new-password"
                        />
                        <TextField
                            margin="normal"
                            required
                            type="password"
                            fullWidth
                            disabled={loading}
                            variant="outlined"
                            label="Confirm password"
                            value={form.confirmPassword}
                            onChange={({ target: { value } }) => setForm({ ...form, confirmPassword: value })}
                            autoComplete="off"
                        />
                        <Stack spacing={2} direction="row" sx={{ mt: 2 }}>
                            <Button type="submit" variant="contained" color="primary" disabled={loading} >
                                Submit
                            </Button>
                            <Button variant="outlined" color="primary" onClick={() => navigate('/login')} disabled={loading}>
                                Back
                            </Button>
                        </Stack>
                    </form>
                </Grid>


            </Grid>
        </Paper>

    </Container>);
}

export default Register;