import { useState, useEffect } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { Typography, Card, Button, Select, MenuItem, TextField, Paper, Divider, InputLabel, CardActionArea } from "@mui/material";
import BalanceTable from "../portfolio/BalanceTable";
import ContentBox from "../layout/ContentBox";
import { getPortfolio } from "../../services/portfolio.service";
import { deposit, withdraw } from "../../services/transaction.service"
import { useAlert } from "../../provider/alert.provider";
import { useNavigate } from "react-router-dom";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
const PerformFunding = () => {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState()
    const [form, setForm] = useState({ currency: '', amount: 0 })
    const [portf, setPortf] = useState()
    const { doAlert } = useAlert();
    const submitDeposit = () => {
        deposit(form)
            .then(() => {
                doAlert({ message: 'You have successfully funded your account', type: 'success', title: 'Deposit Success' })
                navigate("/")
            })
            .catch((error) => doAlert({ message: `Cannot fund your account. ${error.response?.data?.message || ''}`, type: 'error', title: 'Deposit Failed!' }))
    }
    const submitWithdrawal = () => {
        withdraw(form)
            .then(() => {
                doAlert({ message: 'You have successfully withdrawn from your account', type: 'success', title: 'Withdrawal Success' })
                navigate("/")
            })
            .catch((error) => doAlert({ message: `Cannot withdraw from your account. ${error.response?.data?.message || ''}`, type: 'error', title: 'Withdrawal Failed!' }))
    }
    useEffect(() => {
        getPortfolio()
            .then(({ data }) => {
                setPortf(data);
            })
    }, [])

    if (!selectedType) {
        return (
            <Grid container spacing={3}>
                <Grid sm={12} md={7}>
                    <Card sx={{ backgroundColor: 'primary.light',  height: "100%" }} onClick={() => setSelectedType('DEPOSIT')}>
                        <CardActionArea sx={{ p: 3, textAlign: 'center',height: "100%"}}>
                            <AccountBalanceWalletIcon sx={{ fontSize: 60, color: "primary.contrastText" }} />

                            <Typography gutterBottom variant="h4" color="primary.contrastText">Fund your portfolio</Typography>
                            <Typography variant="caption" color="primary.contrastText">
                                Top up your account to begin trading. Choose from our range of supported currencies. While no real money is involved, this mirrors the fund movement in your actual portfolio. It's also a great way to initiate your virtual portfolio for strategy assessments.
                            </Typography>
                        </CardActionArea>
                    </Card>
                </Grid>
                <Grid sm={12} md={5}>
                    <Card variant="outlined" sx={{ textAlign: 'center', height: "100%"}} onClick={() => setSelectedType('WITHDRAWAL')}>
                        <CardActionArea sx={{ p: 3, textAlign: 'center' }}>
                            <LogoutIcon sx={{ fontSize: 60, color: "secondary" }} />

                            <Typography gutterBottom variant="h4" color="secondary">Withdraw from Balances</Typography>
                            <Typography variant="caption" color="secondary">
                                You may indicate fund withdrawal from any of your existing balances. Withdrawal reduces the size of your total investment and will not affect the calculated return on your portfolio.
                            </Typography>
                        </CardActionArea>
                    </Card>
                </Grid>

            </Grid>
        )
    } else if (selectedType === 'DEPOSIT') {
        return (
            <Grid container spacing={3}>
                <Grid sm={12} md={4}>
                    <BalanceTable balances={portf.balances} />
                </Grid>
                <Grid sm={12} md={8}>
                    <ContentBox title='Add Fund'>
                        <InputLabel id="label-currency">Currency</InputLabel>
                        <Select
                            labelId="label-currency"
                            margin="normal"
                            label="Currency"
                            fullWidth
                            value={form.currency}
                            onChange={({ target: { value } }) => setForm({ ...form, currency: value })}>
                            <MenuItem value=''><em>Select currency</em></MenuItem>
                            {portf.allowedCurrencies.map(cur => (<MenuItem value={cur}>{cur}</MenuItem>))}
                        </Select>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Amount"
                            value={form.amount}
                            onChange={({ target: { value } }) => setForm({ ...form, amount: value })}
                        />
                        <Button variant="contained" color="primary" onClick={submitDeposit} sx={{ mr: 3, mt: 3 }}>Submit</Button>
                        <Button variant="outlined" color="primary" onClick={() => setSelectedType(null)} sx={{ mr: 3, mt: 3 }}>Cancel</Button>

                    </ContentBox>
                </Grid>
                

            </Grid>

        )
    } else if (selectedType === 'WITHDRAWAL') {
        return (
            <Grid container spacing={3}>
                <Grid sm={12} md={4}>
                    <BalanceTable balances={portf.balances} />
                </Grid>
                <Grid sm={12} md={8}>
                    <ContentBox title="Withdraw from Balances">
                        <InputLabel id="label-currency">Currency</InputLabel>
                        <Select
                            labelId="label-currency"
                            margin="normal"
                            label="Currency"
                            fullWidth
                            value={form.currency} onChange={({ target: { value } }) => setForm({ ...form, currency: value })}>
                            <MenuItem value=''><em>Select currency</em></MenuItem>
                            {/* only allow withdrawal from balance currencies */}
                            {Object.keys(portf.balances).map(cur => (<MenuItem value={cur}>{cur}</MenuItem>))}
                        </Select>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Amount"
                            value={form.amount}
                            onChange={({ target: { value } }) => setForm({ ...form, amount: value })}
                        />
                        <Button variant="contained" color="primary" onClick={submitWithdrawal} sx={{ mr: 3, mt: 3 }}>Submit</Button>
                        <Button variant="outlined" color="primary" onClick={() => setSelectedType(null)} sx={{ mr: 3, mt: 3 }}>Cancel</Button>

                    </ContentBox>
                </Grid>
            </Grid>
        )
    } else return (<></>);
}

export default PerformFunding;