import { getAllQuote, getQuoteHistory } from "@/services/transaction.service";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useTheme } from "@emotion/react";
import { TimeScale, LinearScale, PointElement, LineElement, Chart } from "chart.js";
import 'chartjs-adapter-moment'
import { Grid, List, ListItem, ListItemButton, ListItemText, Box, Typography, Alert } from "@mui/material";
import ContentBox from "../layout/ContentBox";


const Market = () => {
    var minDate = new Date();
    const theme = useTheme()
    minDate.setDate(minDate.getDate() - 2)
    const [data, setData] = useState([])
    const [allQuotes, setAllQuotes] = useState([])
    const [selectedCurrency, setSelectedCurrency] = useState()
    useEffect(() => {
        if (selectedCurrency) {
            getQuoteHistory(selectedCurrency)
                .then(({ data }) => setData(data.quoteHistory.map(hist => ({ x: hist.updated, y: hist.rate }))))
        }
    }, [selectedCurrency])
    useEffect(() => {
        getAllQuote()
            .then(({ data }) => setAllQuotes(data))
    }, [])
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
                        </>)}
                        {!selectedCurrency && (<Alert severity="info">Select a currency from the list to see the chart</Alert>)}

                    </Grid>

                </Grid>
            </ContentBox>
        </Box>
    );
}

export default Market;