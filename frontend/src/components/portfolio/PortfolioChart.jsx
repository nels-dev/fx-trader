import { useEffect, useState } from "react";
import ContentBox from "../layout/ContentBox"
import { getSnapshots } from "@/services/portfolio.service";
import { Line } from "react-chartjs-2";
import { TimeScale, LinearScale, PointElement, LineElement, Chart, Title, Tooltip } from "chart.js";
import 'chartjs-adapter-moment'
import { useTheme } from "@emotion/react";
Chart.register(TimeScale, LinearScale, PointElement,LineElement, Title, Tooltip );

const PortfolioChart = ({baseCurrency}) => {
    const theme = useTheme()
    var minDate = new Date();
    minDate.setDate(minDate.getDate()-2)
    const [data, setData] =useState([])
    useEffect(()=>{
        getSnapshots().then(({data})=>setData(data.map(snapshot=>({x:snapshot.snapshotTime, y: snapshot.totalValue}))) )
    }, [])
    return ( <ContentBox title={`Portfolio Value (in ${baseCurrency})`}>

        <Line
        data={{
            datasets:[{ data}]
        }}
        options={{
            elements: {point:{radius: 0}, line: {tension:0.3, borderColor: theme.palette.primary.light}},
            interaction:{
                intersect: false
            },
            scales: {
                x: {type: 'time', time: { unit: 'day'}, suggestedMin: minDate.toISOString()},
            }
        }}/>
    </ContentBox> );
}
 
export default PortfolioChart;