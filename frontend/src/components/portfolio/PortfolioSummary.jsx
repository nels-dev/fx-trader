import { getPortfolio } from "../../services/portfolio.service";
import { useEffect, useState } from "react";
import Grid from '@mui/material/Unstable_Grid2'
import { Divider, Paper, Typography } from "@mui/material";
import {formatAmount} from "../../utils/number.utils"
import BalanceTable from "./BalanceTable";
import ContentBox from "../layout/ContentBox";
const PortfolioSummary = () => {
    const [portf, setPortf] = useState()
    useEffect(() => {
        getPortfolio()
            .then(({ data }) => {
                setPortf(data);
            })
    }, [])
    return portf && (<section>
        
        <Grid container mt={3} spacing={3}>
            <Grid sm={12} md={6}>
                <ContentBox title="My Portfolio">
                    <Typography variant="h4">{portf.baseCurrency} 
                        {formatAmount(portf.balanceInBaseCurrency)}
                    </Typography>
                    <Typography variant="subtitle2">Portfolio total value </Typography>                    
                    <Typography variant="h4">{portf.percentageChange >=0 ? "+": ""}{Number(portf.percentageChange*100).toFixed(2)}%</Typography>
                    <Typography variant="subtitle2">Performance since {new Date(portf.createdAt).toLocaleDateString()}</Typography>
                </ContentBox>
            </Grid>
            <Grid sm={12} md={6}>
                <BalanceTable balances={portf.balances}/>
            </Grid>
        </Grid>
    </section>);
}

export default PortfolioSummary;