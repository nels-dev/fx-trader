import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import {
    Button,
    Card,
    CardActionArea,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAlert} from "../../provider/alert.provider";
import {
    createPortfolio,
    getAllowedCurrencies,
    getPortfolio
} from "../../services/portfolio.service";
import {deposit, withdraw} from "../../services/transaction.service";
import ContentBox from "../layout/ContentBox";
import BalanceTable from "../portfolio/BalanceTable";

const PerformFunding = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('')
  const [form, setForm] = useState({currency: '', amount: 0})
  const [portf, setPortf] = useState({balances: {}})
  const [preCreate, setPreCreate] = useState(false)
  const [allowedCurrencies, setAllowedCurrencies] = useState([])
  const {doAlert} = useAlert();
  const submitDeposit = (event) => {
    if (preCreate) {
      createPortfolio(form)
      .then(() => {
        doAlert({
          message: 'You have successfully funded your account',
          type: 'success',
          title: 'Portfolio Created!'
        })
        navigate("/")
      })
      .catch((error) => doAlert({
        message: `Cannot fund your account. ${error.response?.data?.message
        || ''}`, type: 'error', title: 'Deposit Failed!'
      }))
    } else {
      deposit(form)
      .then(() => {
        doAlert({
          message: 'You have successfully funded your account',
          type: 'success',
          title: 'Deposit Success'
        })
        navigate("/")
      })
      .catch((error) => doAlert({
        message: `Cannot fund your account. ${error.response?.data?.message
        || ''}`, type: 'error', title: 'Deposit Failed!'
      }))
    }
    event?.preventDefault()
  }
  const submitWithdrawal = (event) => {
    withdraw(form)
    .then(() => {
      doAlert({
        message: 'You have successfully withdrawn from your account',
        type: 'success',
        title: 'Withdrawal Success'
      })
      navigate("/")
    })
    .catch((error) => doAlert({
      message: `Cannot withdraw from your account. ${error.response?.data?.message
      || ''}`, type: 'error', title: 'Withdrawal Failed!'
    }))
    event?.preventDefault()
  }
  useEffect(() => {
    getPortfolio()
    .then(({data}) => {
      setPortf(data);
    })
    .catch(error => {
      if (error.response.status === 404) {
        setPreCreate(true)
      }
    })
    getAllowedCurrencies()
    .then(({data}) => {
      setAllowedCurrencies(data);
    })
  }, [])

  if (!selectedType && !preCreate) {
    return (
        <Grid container spacing={3}>
          <Grid sm={12} md={7}>
            <Card sx={{backgroundColor: 'primary.light', height: "100%"}}
                  onClick={() => setSelectedType('DEPOSIT')}>
              <CardActionArea sx={{p: 3, textAlign: 'center', height: "100%"}}>
                <AccountBalanceWalletIcon
                    sx={{fontSize: 60, color: "primary.contrastText"}}/>

                <Typography gutterBottom variant="h4"
                            color="primary.contrastText">Fund your
                  portfolio</Typography>
                <Typography variant="caption" color="primary.contrastText">
                  Top up your account to begin trading. Choose from our range of
                  supported currencies. While no real money is involved, this
                  mirrors the fund movement in your actual portfolio. It&apos;s
                  also a great way to initiate your virtual portfolio for
                  strategy assessments.
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid sm={12} md={5}>
            <Card variant="outlined" sx={{textAlign: 'center', height: "100%"}}
                  onClick={() => setSelectedType('WITHDRAWAL')}>
              <CardActionArea sx={{p: 3, textAlign: 'center'}}>
                <LogoutIcon sx={{fontSize: 60, color: "secondary"}}/>

                <Typography gutterBottom variant="h4" color="secondary">Withdraw
                  from Balances</Typography>
                <Typography variant="caption" color="secondary">
                  You may indicate fund withdrawal from any of your existing
                  balances. Withdrawal reduces the size of your total investment
                  and will not affect the calculated return on your portfolio.
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>

        </Grid>
    )
  } else if (selectedType === 'DEPOSIT' || preCreate) {
    return (
        <Grid container spacing={3}>
          <Grid sm={12} md={4}>
            {preCreate && (<>
              <ContentBox title='Intital funding'>
                <p>
                  <Typography variant='body1'>
                    Fund your account to activate your portfolio. The initial
                    funding currency will be set as your portfolio&apos;s base
                    currency and cannot be changed.
                  </Typography>
                </p>
              </ContentBox>
            </>)}
            {!preCreate && (<BalanceTable balances={portf.balances}/>)}

          </Grid>
          <Grid sm={12} md={8}>
            <ContentBox title='Add Fund'>
              <form onSubmit={submitDeposit}>
                <InputLabel id="label-currency">Currency</InputLabel>
                <Select
                    labelId="label-currency"

                    label="Currency"
                    fullWidth
                    value={form.currency}
                    onChange={({target: {value}}) => setForm(
                        {...form, currency: value})}>
                  <MenuItem value=''><em>Select currency</em></MenuItem>
                  {allowedCurrencies.map(cur => (
                      <MenuItem key={cur} value={cur}>{cur}</MenuItem>))}
                </Select>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Amount"
                    value={form.amount}
                    onChange={({target: {value}}) => setForm(
                        {...form, amount: Number(value)})}
                />
                <Button type='submit' variant="contained" color="primary"
                        onClick={submitDeposit}
                        sx={{mr: 3, mt: 3}}>Submit</Button>
                {!preCreate && (
                    <Button variant="outlined" color="primary"
                            onClick={() => setSelectedType(null)}
                            sx={{mr: 3, mt: 3}}>Cancel</Button>
                )}
              </form>
            </ContentBox>
          </Grid>


        </Grid>

    )
  } else if (selectedType === 'WITHDRAWAL') {
    return (
        <Grid container spacing={3}>
          <Grid sm={12} md={4}>
            <BalanceTable balances={portf.balances}/>
          </Grid>
          <Grid sm={12} md={8}>
            <ContentBox title="Withdraw from Balances">
              <form onSubmit={submitWithdrawal}>
                <InputLabel id="label-currency">Currency</InputLabel>
                <Select
                    labelId="label-currency"

                    label="Currency"
                    fullWidth
                    value={form.currency}
                    onChange={({target: {value}}) => setForm(
                        {...form, currency: value})}>
                  <MenuItem value=''><em>Select currency</em></MenuItem>
                  {/* only allow withdrawal from balance currencies */}
                  {Object.keys(portf.balances).map(cur => (
                      <MenuItem key={cur} value={cur}>{cur}</MenuItem>))}
                </Select>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Amount"
                    value={form.amount}
                    onChange={({target: {value}}) => setForm(
                        {...form, amount: Number(value)})}
                />
                <Button type='submit' variant="contained" color="primary"
                        onClick={submitWithdrawal}
                        sx={{mr: 3, mt: 3}}>Submit</Button>
                <Button variant="outlined" color="primary"
                        onClick={() => setSelectedType(null)}
                        sx={{mr: 3, mt: 3}}>Cancel</Button>
              </form>
            </ContentBox>
          </Grid>
        </Grid>
    )
  } else {
    return (<></>);
  }
}

export default PerformFunding;