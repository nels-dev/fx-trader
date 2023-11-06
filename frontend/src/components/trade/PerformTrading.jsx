import {
  Button,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Card,
  CardActionArea
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../provider/alert.provider";
import ContentBox from "../layout/ContentBox";
import BalanceTable from "../portfolio/BalanceTable";
import {
  getAllowedCurrencies,
  getPortfolio
} from "@/services/portfolio.service.js";
import { trade } from "@/services/transaction.service";

const OptionBox = ({option, text, selectedOption, onClick}) => {
  return(
    <Card sx={{backgroundColor: option===selectedOption ? 'primary.light' : 'white', height: "100%"}} onClick={onClick} variant="outlined">
      <CardActionArea sx={{p: 2, textAlign: 'center', height: "100%"}}>
        <Typography variant="button" color={option===selectedOption ? 'primary.contrastText' : ''}>{text}</Typography>
      </CardActionArea>
    </Card>
  )
}


const PerformTrading = () => {
  const [option, setOption] = useState('specifySell')
  const navigate = useNavigate();
  const [form, setForm] = useState({ fromCurrency: '', toCurrency: '', fromAmount: 0, toAmount: 0 })
  const [portf, setPortf] = useState({ balances: {} })
  const [preCreate, setPreCreate] = useState(false)
  const [allowedCurrencies, setAllowedCurrencies] = useState([])
  const { doAlert } = useAlert();
  useEffect(() => {
    getPortfolio()
      .then(({ data }) => {        
        setPortf(data);
      })
      .catch(error => {
        if (error.response.status === 404) {
          setPreCreate(true)
        }
      })
    getAllowedCurrencies()
      .then(({ data }) => {
        setAllowedCurrencies(data);
      })
  }, [])
  const submit = () => { 
    let request = {fromCurrency: form.fromCurrency, toCurrency: form.toCurrency}
    if(option==='specifySell' || option=='specifyBoth'){
      request.fromAmount= form.fromAmount
    }
    
    if(option==='specifyBuy' || option=='specifyBoth'){
      request.toAmount = form.toAmount
    }

    trade(request)
    .then(()=>{
      doAlert({message: 'You will see your trade details in the history table', type:'success', title: 'Trade recorded'})
      navigate("/")
    })
    .catch((error)=> doAlert({message: `Cannot perform trade. ${error.response?.data?.message|| ''}`, type: 'error', title: 'Trade Failed!'}))
   }
  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={4}>
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
        {!preCreate && (<BalanceTable balances={portf.balances} />)}

      </Grid>
      <Grid xs={12} md={8}>
        <ContentBox title='Trade'>
          <Grid container gap={2} sx={{ mt: 2, mb: 2 }}>
            <Grid sm>
              <OptionBox option="specifySell" selectedOption={option} text="Specify Sell Amount" onClick={()=> setOption("specifySell")}/> 
            </Grid>
            <Grid sm>
              <OptionBox option="specifyBuy" selectedOption={option} text="Specify Buy Amount" onClick={()=> setOption("specifyBuy")}/>
            </Grid>            
            <Grid sm>
              <OptionBox option="specifyBoth" selectedOption={option} text="Specify Both (record trade)" onClick={()=> setOption("specifyBoth")}/> 
            </Grid>
          </Grid>
          <form>
            <InputLabel id="label-currency-from">I am selling</InputLabel>
            <Select
              labelId="label-currency-from"

              label="From Currency"
              fullWidth
              value={form.fromCurrency}
              onChange={({ target: { value } }) => setForm(
                { ...form, fromCurrency: value })}>
              <MenuItem value=''><em>Select currency</em></MenuItem>
              {Object.keys(portf.balances).map(
                cur => (<MenuItem key={cur} value={cur}>{cur}</MenuItem>))}
            </Select>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Amount"
              value={form.fromAmount}
              disabled={option==='specifyBuy'}
              onChange={({ target: { value } }) => setForm(
                { ...form, fromAmount: Number(value) })}
            />

            <InputLabel id="label-currency-to">I am buying</InputLabel>
            <Select
              labelId="label-currency-to"
              label="To Currency"
              fullWidth
              disabled={!form.fromCurrency}
              value={form.toCurrency}
              onChange={({ target: { value } }) => setForm(
                { ...form, toCurrency: value })}>
              <MenuItem value=''><em>Select currency</em></MenuItem>
              {allowedCurrencies.filter(cur => cur !== form.fromCurrency).map(
                cur => (<MenuItem key={cur} value={cur}>{cur}</MenuItem>))}
            </Select>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Amount"
              disabled={option==='specifySell'}
              value={form.toAmount}
              onChange={({ target: { value } }) => setForm(
                { ...form, toAmount: Number(value) })}
            />
            <Button variant="contained" color="primary"
              onClick={submit}
              sx={{ mr: 3, mt: 3 }}>Submit</Button>

          </form>
        </ContentBox>
      </Grid>


    </Grid>

  );
}

export default PerformTrading;