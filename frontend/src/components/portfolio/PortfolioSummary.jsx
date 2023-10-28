import { getPortfolio } from "../../services/portfolio.service";
import { useEffect, useState } from "react";
import Grid from '@mui/material/Unstable_Grid2'
import { Typography } from "@mui/material";

import { formatAmount } from "../../utils/number.utils"
import BalanceTable from "./BalanceTable";
import ContentBox from "../layout/ContentBox";
import Loading from "../layout/Loading"
import { Stack, Button } from "@mui/material"
import { Link } from "react-router-dom";
const PortfolioSummary = () => {
    const [portf, setPortf] = useState()
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        getPortfolio()
            .then(({ data }) => {
                setPortf(data);
                setLoading(false)
            })
    }, [])
    return (<>
        {loading && (<Loading />)}
        {!loading && (
            (<section>

                <Grid container mt={3} spacing={3}>
                    <Grid sm={12} md={6}>
                        <ContentBox title="My Portfolio">
                            <Typography variant="h4" sx={{ mt: 2, mb: 2 }}>{portf.baseCurrency}
                                {formatAmount(portf.balanceInBaseCurrency)}
                            </Typography>
                            <Typography variant="subtitle2">Portfolio total value </Typography>
                            <Typography variant="h4" sx={{ mt: 2, mb: 2 }}>{portf.percentageChange >= 0 ? "+" : ""}{Number(portf.percentageChange * 100).toFixed(2)}%</Typography>
                            <Typography variant="subtitle2">Performance since {new Date(portf.createdAt).toLocaleDateString()}</Typography>
                            <Stack spacing={2} direction="row" sx={{ mt: 2 }}>
                                <Button variant="contained" color='primary' component={Link} to="/trade">Perform trade</Button>
                                <Button variant="outlined" color='primary' component={Link} to="/funding">Fund your portfolio</Button>
                            </Stack>
                        </ContentBox>
                    </Grid>
                    <Grid sm={12} md={6}>
                        <BalanceTable balances={portf.balances} />
                    </Grid>
                </Grid>
            </section>)
        )}
    </>)
}

export default PortfolioSummary;