import {
  Button,
  Box,
  MenuItem,
  Select,
  TextField,
  Typography,
  Card,
  CardActionArea,
  Checkbox,
  FormControlLabel,
  InputAdornment
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
import { getQuote, trade } from "@/services/transaction.service";
import { AccountCircle, Calculate } from "@mui/icons-material";


const OptionBox = ({ option, text, selectedOption, onClick }) => {
  return (
    <Card sx={{ backgroundColor: option === selectedOption ? 'primary.light' : 'white', height: "100%" }} onClick={onClick} variant="outlined">
      <CardActionArea sx={{ p: 2, textAlign: 'center', height: "100%" }}>
        <Typography variant="button" color={option === selectedOption ? 'primary.contrastText' : ''}>{text}</Typography>
      </CardActionArea>
    </Card>
  )
}


const PerformTrading = () => {
  const [recordTrade, setRecordTrade] = useState(false)
  const [fixBuy, setFixBuy] = useState(false)
  const [quote, setQuote] = useState({from:'', to:'', rate:0})
  const navigate = useNavigate();
  const [form, setForm] = useState({ fromCurrency: '', toCurrency: '', fromAmount: '0', toAmount: '0' })
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

  useEffect(() => {

    if (form.fromCurrency && form.toCurrency) {
      if(recordTrade){
        setQuote({
          from: form.fromCurrency, 
          to: form.toCurrency, 
          rate: Number(form.fromAmount) > 0 ? Number(form.toAmount)/Number(form.fromAmount) : 0
        })
      }else{
        getQuote(form.fromCurrency, form.toCurrency)
        .then(({ data }) => {          
          setQuote(data)
          if(fixBuy){
            setForm({...form, fromAmount: calculateSellAmount(form.toAmount, data.rate)})
          }else{
            setForm({...form, toAmount: calculateBuyAmount(form.fromAmount, data.rate)})
          }
        })
      }      
    }
  }, [form.fromCurrency, form.toCurrency, recordTrade])

  const calculateSellAmount = (buyAmountStr, rate) =>{
    if(Number(buyAmountStr) > 0 && rate > 0){
      return (Number(buyAmountStr) / rate).toFixed(2)
    }else{
      return '0.00';
    }
  }
  
  const calculateBuyAmount = (sellAmountStr, rate)=>{
    if(Number(sellAmountStr) > 0 && rate > 0){
      return (Number(sellAmountStr) * rate).toFixed(2)
    }else{
      return '0.00';
    }
  }

  const changeFromAmount = ({target: {value}})=>{    
    if(recordTrade){
      setForm({...form, fromAmount: value})
      value >0 && setQuote({ ...quote, rate: (Number(form.toAmount)/ Number(value))})
    }else{
      setFixBuy(false)
      setForm({
        ...form, 
        fromAmount: value, 
        toAmount: calculateBuyAmount(value, quote.rate)})
    }
  }

  const changeToAmount = ({target: {value}})=>{
    if(recordTrade){
      setForm({...form, toAmount: value})
      value >0 && setQuote({ ...quote, rate: (Number(value)/ Number(form.fromAmount))})
    }else{
      setFixBuy(true)
      setForm({
        ...form, 
        toAmount: value, 
        fromAmount: calculateSellAmount(value, quote.rate)})
    }
  }

  const submit = () => {
    let request = { fromCurrency: form.fromCurrency, toCurrency: form.toCurrency }
    if (recordTrade || !fixBuy) {
      request.fromAmount = Number(form.fromAmount)
    }

    if (recordTrade || fixBuy) {
      request.toAmount = Number(form.toAmount)
    }

    trade(request)
      .then(() => {
        doAlert({ message: 'You will see your trade details in the history table', type: 'success', title: 'Trade recorded' })
        navigate("/")
      })
      .catch((error) => doAlert({ message: `Cannot perform trade. ${error.response?.data?.message || ''}`, type: 'error', title: 'Trade Failed!' }))
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
          <form>
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography gutterBottom variant="body1">I am Selling</Typography>
              <Select
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
                type="number"
                required
                fullWidth
                label="Amount"
                InputProps={{
                  startAdornment: 
                    !recordTrade && fixBuy && (
                      <InputAdornment position="start">
                      <Calculate />
                    </InputAdornment>
                    )   
                }}
                value={form.fromAmount}                
                onChange={changeFromAmount}
              />
            </Box>
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography gutterBottom variant="body1">I am buying</Typography>
              <Select

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
                type="number"
                fullWidth
                label="Amount"
                InputProps={{
                  startAdornment: 
                    !recordTrade && !fixBuy && (
                      <InputAdornment position="start">
                      <Calculate />
                    </InputAdornment>
                    )   
                }}
                value={form.toAmount}
                onChange={changeToAmount}
              />
            </Box>
            <FormControlLabel control={ <Checkbox
              checked = {recordTrade}
              onChange = {()=> setRecordTrade(!recordTrade)}
            />} label="I want to record a trade already performed"/>
            {quote && (
              <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body1">{recordTrade ? 'Exchange rate implied from my input' : 'Real time exchange rate'}</Typography>
              <TextField
                contentEditable={false}
                margin="normal"                
                fullWidth            
                InputProps={{
                  startAdornment: 
                    recordTrade && (
                      <InputAdornment position="start">
                      <Calculate />
                    </InputAdornment>
                    )   
                }}    
                value={form.fromCurrency && form.toCurrency && `${quote.from}/${quote.to} ${Number(quote.rate).toFixed(4)}`}
              />
            </Box>
            )}

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