import { Box, Card, CardContent, FormControlLabel, Grid, MenuItem, Select, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography, Button, Chip, Stack, Alert, Checkbox } from "@mui/material";
import ContentBox from "../layout/ContentBox";
import { useEffect, useState } from "react";
import { getAllQuote, getQuote } from "@/services/transaction.service";
import { useAlert } from "@/provider/alert.provider";
import { addNotificationRule, deleteNotificationRule, getNotifications } from "@/services/notification.service";
import moment from "moment";

const Notifications = () => {
  const {doAlert} = useAlert();
  const [allQuotes, setAllQuotes] = useState([])
  const [refresh, setRefresh] = useState(new Date())
  const [rules, setRules] = useState([])
  const [form, setForm] = useState({ buyCurrency: undefined, sellCurrency: undefined, target: undefined, reactivate: undefined, referenceRate: undefined, targetType: 'upper', oneTime: true })
  useEffect(() => {
    getAllQuote()
      .then(({ data }) => setAllQuotes(data))
  }, [])
  useEffect(()=>{
    getNotifications()
    .then(({data})=> setRules(data.rules))
  }, [refresh])
  useEffect(() => {
    if(form.buyCurrency && form.sellCurrency){
      getQuote(form.sellCurrency, form.buyCurrency)
      .then(({data})=> setForm({...form, referenceRate: Number(data.rate).toFixed(4)}))
    }
  }, [form.buyCurrency, form.sellCurrency])

  const submit= ()=>{
    if(form.targetType==='upper'){
      if(Number(form.target) <= Number(form.reactivate)){
        doAlert({message: 'Reactivation threshold must be lower than target', type: 'warning', title: 'Please check your input'})
        return
      }
    } else if(form.targetType==='lower'){
      if(Number(form.target) >= Number(form.reactivate)){
        doAlert({message: 'Reactivation threshold must be higher than target', type: 'warning', title: 'Please check your input'})
        return
      }
    }
    addNotificationRule(form).then(()=>{
      doAlert({message: 'Notification rule added', type: 'success', title: 'Success!'})
      setRefresh(new Date)
    }).catch((error)=>{
      console.log(error)
      doAlert({message: 'Operation cannot be completed, please try again later', type: 'error', title: 'Unable to add a rule'})
    })
    
  }

  const deleteRule = (id)=> {
    deleteNotificationRule(id).then(()=>{
      setRefresh(new Date())
    })
  }
  const clear = ()=>{setForm({buyCurrency: undefined, sellCurrency: undefined, target: undefined, reactivate: undefined, referenceRate: undefined, targetType: 'upper', oneTime: true })}
  return (<Box sx={{ mt: 3, mb: 3 }}>
    <Grid container spacing={3} direction='row-reverse'>
      
      <Grid item md xs>
       
          <Stack direction='column' spacing={2}>
          {rules.map(rule=>(
            <Card key={rule.id} variant="outlined">
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs sm={6}>
                    <Stack direction="column" spacing={2}>
                      <Typography variant="body1" >Notify {rule.oneTime && 'once'} when {rule.sellCurrency}/{rule.buyCurrency} is</Typography>
                      <Typography variant="h5" >{rule.targetType==='upper' ? 'Above':'Below'} {Number(rule.target).toFixed(4)} </Typography>
                      {!rule.oneTime && (
                        <Typography variant="subtitle2" >and reactivate when {rule.targetType==='upper' ? 'drops below':'rise above'} {Number(rule.reactivate).toFixed(4)} </Typography>
                      )}
                      
                    </Stack>
                  
                    
                  </Grid>
                  <Grid item xs={12} sm>
                    <Stack direction="column" spacing={2}>
                    <Typography variant="body1" >Triggered</Typography>
                    <Typography variant="h5" > {rule.timesTriggered} time(s) </Typography>
                    <Typography variant="subtitle2" > {rule.lastTriggeredAt && `Last triggered: ${moment(rule.lastTriggeredAt).format('lll')}`} </Typography>
                    </Stack>
                  </Grid>
                  <Grid item>
                    <Chip label={rule.active?'Active':'Inactive'} color={rule.active? 'primary':'default'}/>
                  </Grid>
                  <Grid item xs={12}>
                     <Box><Button variant="outlined" onClick={()=>deleteRule(rule.id)}>Delete rule</Button></Box>  
                  </Grid>
                </Grid>
                
              </CardContent>
            </Card>
          ))}
          {rules.length==0 && (
            <>
            <Alert variant="outlined" severity="info">
              Currently, you haven't set up a notification rule. We recommend creating one to allow the platform to efficiently monitor updates for you!
            </Alert>
          </>
          )}
            </Stack>
        
      </Grid>
      <Grid item md={4} xs={12}>
        <ContentBox title='Add a rule'>
          <Typography gutterBottom variant="body1" sx={{ mt: 3 }}>Select buy currency</Typography>
          <Select
            required
            fullWidth
            value={form.buyCurrency}
            onChange={({ target: { value } }) => setForm(
              { ...form, buyCurrency: value })}>
            <MenuItem value=''><em>Select currency</em></MenuItem>
            {allQuotes.map(
              quote => (<MenuItem key={quote.currency} value={quote.currency}>{quote.currency}</MenuItem>))}
          </Select>

          {form.buyCurrency && (
            <><Typography gutterBottom variant="body1" sx={{ mt: 3 }}>Select sell currency</Typography>
              <Select
                required
                fullWidth
                value={form.sellCurrency}
                onChange={({ target: { value } }) => setForm(
                  { ...form, sellCurrency: value })}>
                <MenuItem value=''><em>Select currency</em></MenuItem>
                {allQuotes.filter(quote=> quote.currency!==form.buyCurrency).map(
                  quote => (<MenuItem key={quote.currency} value={quote.currency}>{quote.currency}</MenuItem>))}
              </Select></>
          )}

          {form.buyCurrency && form.sellCurrency && (
            <>
              <ToggleButtonGroup color="primary" value={form.targetType} exclusive onChange={(_event, value) => setForm({...form, targetType: value})} sx={{ mt: 3 }}>
                <ToggleButton value="lower">Set lower limit</ToggleButton>
                <ToggleButton value="upper">Set upper limit</ToggleButton>
              </ToggleButtonGroup>
              
              <Typography gutterBottom variant="body1" sx={{ mt: 3 }}>Get notified when {form.sellCurrency}/{form.buyCurrency} <strong>{form.targetType==='upper' ? 'rises above' :'drops below'}</strong></Typography>

              <TextField
                margin="normal"
                type="number"
                required
                fullWidth
                placeholder={form.referenceRate}
                value={form.target}                
                onChange={({ target: { value } }) => setForm({ ...form, target: value })}
              />

              <FormControlLabel control={ <Checkbox
                checked = {!form.oneTime}
                onChange = {()=> setForm({...form, oneTime: !form.oneTime})}
              />} label="Allow continuous monitoring"/>

              {!form.oneTime && (<>
                
              <Typography gutterBottom variant="body1" sx={{ mt: 3 }}>Reactivate the rule when {form.sellCurrency}/{form.buyCurrency} <strong>{form.targetType==='upper' ? 'drops below':'rises above'}</strong></Typography>

              <TextField
                margin="normal"
                type="number"
                required
                fullWidth
                placeholder={form.referenceRate}
                value={form.reactivate}
                onChange={({ target: { value } }) => setForm({ ...form, reactivate: value })}
              />
              </>
              )}



              <Button variant='contained' color="primary" onClick={submit} sx={{ mt: 3 }}>Add rule</Button>                
              <Button variant='outlined' color="primary" onClick={clear} sx={{ mt: 3 }}>Clear</Button>                
            </>
          )}

        </ContentBox>
      </Grid>
    </Grid>
  </Box>);
}

export default Notifications;