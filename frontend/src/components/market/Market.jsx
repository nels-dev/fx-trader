import { getAllQuote, getPrediction, getQuoteHistory } from "@/services/transaction.service";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useTheme } from "@emotion/react";
import { TimeScale, LinearScale, PointElement, LineElement, Chart } from "chart.js";
import 'chartjs-adapter-moment'
import { Grid, List, ListItem, ListItemButton, ListItemText, Box, Typography, Alert, Card, CardContent, Chip } from "@mui/material";
import ContentBox from "../layout/ContentBox";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import moment from "moment";


const Market = () => {
    var minDate = new Date();
    const theme = useTheme()
    minDate.setDate(minDate.getDate() - 2)
    const [data, setData] = useState([])
    const [allQuotes, setAllQuotes] = useState([])
    const [prediction, setPrediction] = useState({ iconType: 'steady', title: '', desc: '', currency: '', notFound: false})
    const [selectedCurrency, setSelectedCurrency] = useState()
    useEffect(() => {
        if (selectedCurrency) {
            getQuoteHistory(selectedCurrency)
                .then(({ data }) => setData(data.quoteHistory.map(hist => ({ x: hist.updated, y: hist.rate }))))
            getPrediction(selectedCurrency)
                .then(({data}) => {
                    setPrediction({
                        ...data, 
                        iconType: getIconType(data.predictedZScore),
                        title: titleText(data.predictedZScore),
                        desc: `Our system predicts that the opening USD/${data.currency} rate on ${moment(data.date).add(1, 'days').format('L')} (GMT) ${descText(data.predictedZScore)}`
                    });
                })
                .catch(({error}) =>{ 
                    setPrediction({iconType: 'steady', title: '', desc: '', currency: '', notFound: true})
                })
        }
    }, [selectedCurrency])
    useEffect(() => {
        getAllQuote()
            .then(({ data }) => setAllQuotes(data))
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
                    <Grid xs={12} md={3}>

                        <List dense>
                            {allQuotes.map(q => (<ListItem sx={{borderLeft: selectedCurrency===q.currency? 3 :0, borderLeftColor: 'primary.main'}}>
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

                    </Grid>
                    <Grid xs={12} md={9}>
                        {selectedCurrency && (<>
                            <Typography variant="h6" gutterBottom>
                                USD / {selectedCurrency} exchange rate
                            </Typography>
                            <Line
                                data={{
                                    datasets: [{ data }]
                                }}
                                options={{
                                    elements: { point: { radius: 0 }, line: { tension: 0.3, borderColor: theme.palette.primary.light } },

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
                                            <Typography color='secondary.contrastText' gutterBottom variant="h6" >{prediction.title}<Chip sx={{ml: 3}} icon={<AutoFixHighIcon/>} label='AI assisted' color="secondary"></Chip></Typography>
                                            <Typography color='secondary.contrastText' >{prediction.desc}</Typography>
                                        </Grid>
                                        <Grid item>
                                            
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                            )}
                        </>)}
                        {!selectedCurrency && (<Alert severity="info">Select a currency from the list to see the chart</Alert>)}

                    </Grid>

                </Grid>
            </ContentBox>
        </Box>
    );
}

export default Market;