import { getAllQuote, getPrediction, getQuoteHistory } from "@/services/transaction.service";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useTheme } from "@emotion/react";
import 'chartjs-adapter-moment'
import { Grid, List, ListItem, ListItemButton, ListItemText, Box, Typography, Alert, Card, CardContent, Chip, useMediaQuery, Button } from "@mui/material";
import ContentBox from "../layout/ContentBox";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import moment from "moment";
import Loading from "../layout/Loading";


const Market = () => {
    var minDate = new Date();
    const theme = useTheme()
    const desktop = useMediaQuery(theme.breakpoints.up('sm'));
    minDate.setDate(minDate.getDate() - 2)
    const [data, setData] = useState([])
    const [loadingQuotes, setLoadingQuotes] = useState(false)
    const [loadingChart, setLoadingChart] = useState(false)
    const [allQuotes, setAllQuotes] = useState([])
    const [prediction, setPrediction] = useState({ iconType: 'steady', title: '', desc: '', currency: '', notFound: false})
    const [selectedCurrency, setSelectedCurrency] = useState()
    useEffect(() => {
        if (selectedCurrency) {
            setLoadingChart(true)
            getQuoteHistory(selectedCurrency)
                .then(({ data }) => setData(data.quoteHistory.map(hist => ({ x: hist.updated, y: hist.rate }))))
                .finally(()=> setLoadingChart(false))
            getPrediction(selectedCurrency)
                .then(({data}) => {
                    setPrediction({
                        ...data, 
                        iconType: getIconType(data.predictedZScore),
                        title: titleText(data.predictedZScore),
                        desc: `Our system predicts that the opening USD/${data.currency} rate on ${moment(data.date).add(1, 'days').format('ll')} (GMT) ${descText(data.predictedZScore)}`
                    });
                })
                .catch(({error}) =>{ 
                    setPrediction({iconType: 'steady', title: '', desc: '', currency: '', notFound: true})
                })
        }
    }, [selectedCurrency])
    useEffect(() => {
        setLoadingQuotes(true)
        getAllQuote()
            .then(({ data }) => {
                setAllQuotes(data.filter(q=>q.currency!=='USD'))
                setSelectedCurrency(data[0].currency)
            })
            .finally(()=>setLoadingQuotes(false))
    }, [])

    const titleText = (zscore) => {
        if(Math.abs(zscore)<= 0.2) {
            return 'Steady'
        } else if (zscore<-0.5){
            return 'Possibly going down'
        } else if (zscore<-0.2){
            return 'Slight chance going down'
        } else if (zscore>0.5){
            return 'Possibly going up'
        } else if (zscore>0.2){
            return 'Slight chance going up'
        }  
    }

    const descText = (zscore) => {
        if(Math.abs(zscore)<= 0.2) {
            return 'remains steady'
        } else if (zscore<-0.5){
            return 'has a chance of going down'
        } else if (zscore<-0.2){
            return 'has a slight chance of going down'
        } else if (zscore>0.5){
            return 'has a chance of going up'
        } else if (zscore>0.2){
            return 'has a slight chance of going up'
        }  
    }

    const getIconType = (zscore) => {
        if(Math.abs(zscore)<= 0.2) {
            return 'steady'
        } else if (zscore<-0.2){
            return 'down'
        } else if (zscore>0.2){
            return 'up'
        }  
    }
    return (
        <Box sx={{ mt: 3, mb: 3 }}>
            <ContentBox title="Market Data">
                
                <Grid container>
                    {desktop && (
                        <Grid md={3}>
                        <Loading loading = {loadingQuotes}>
                        <List dense>
                            {allQuotes.map(q => (
                            <ListItem sx={{borderLeft: selectedCurrency===q.currency? 3 :0, borderLeftColor: 'primary.main'}} key={q.currency}>
                                <ListItemButton onClick={() => setSelectedCurrency(q.currency)}>
                                    <ListItemText primary={
                                        <>
                                            <Typography
                                                style={{ display: 'inline' }}
                                                variant="caption"
                                            >
                                                USD /
                                            </Typography>
                                            <Typography
                                                style={{ display: 'inline' }}
                                                variant="body1"
                                            >
                                                <strong>{q.currency}</strong>
                                            </Typography>
                                        </>
                                    } secondary={Number(q.rate).toFixed(4)}></ListItemText>
                                </ListItemButton>
                            </ListItem>))}
                        </List>
                        </Loading>
                    </Grid>
                    )}     
                    {!desktop && (
                        <Grid item sm container  spacing={1}>
                            {allQuotes.map(q=>(
                                <Grid item xs={4} key={q.currency}>
                                    <Button variant={selectedCurrency===q.currency ? "contained":undefined} onClick={() => setSelectedCurrency(q.currency)}>
                                        <div>
                                            <Typography variant="caption">
                                                USD / <strong>{q.currency}</strong>
                                            </Typography><br/>
                                            <Typography variant="caption">
                                                {Number(q.rate).toFixed(4)}
                                            </Typography>
                                        </div>
                                    </Button>
                                </Grid>    
                            ))}
                            
                        </Grid>
                    )}               
                    <Grid xs={12} md={9}>
                        {selectedCurrency && (<Loading loading={loadingChart}>                            
                            <Line
                                data={{
                                    datasets: [{ data }]
                                }}
                                options={{
                                    elements: { point: { radius: 0 }, line: { tension: 0.3, borderColor: theme.palette.primary.light } },
                                    interaction:{
                                        intersect: false
                                    },
                                    responsive: true,
                                    plugins:{
                                        title: {
                                           display: true,
                                            text:`USD / ${selectedCurrency} exchange rate`
                                        }
                                    },
                                    scales: {
                                        x: { type: 'time', time: { unit: 'day' }, suggestedMin: minDate.toISOString() },
                                    }
                                }} />

                            {prediction.notFound || (
                            <Card sx={{width: '100%', backgroundColor: 'secondary.light', mt: 5, }}>
                                <CardContent>

                                    <Grid container direction='row' alignItems='center' spacing={3}>
                                        <Grid item>
                                            <Typography color='secondary.contrastText' variant="h3">
                                                {prediction.iconType === 'up' && <TrendingUpIcon fontSize="inherit"/>}
                                                {prediction.iconType === 'down' && <TrendingDownIcon fontSize="inherit"/>}
                                                {prediction.iconType === 'steady' && <DragHandleIcon fontSize="inherit"/>}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs>
                                            <Typography color='secondary.contrastText' gutterBottom variant="h6" >{prediction.title}&nbsp;&nbsp; <Chip icon={<AutoFixHighIcon/>} label='AI assisted' color="secondary"></Chip></Typography>
                                            <Typography color='secondary.contrastText' variant="body1" >{prediction.desc}</Typography>
                                        </Grid>
                                        <Grid item>
                                            
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                            )}
                         </Loading>)}

                    </Grid>

                </Grid>
               
            </ContentBox>
        </Box>
    );
}

export default Market;