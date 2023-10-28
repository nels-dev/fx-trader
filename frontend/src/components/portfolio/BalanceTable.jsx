import { useState, useEffect } from "react";
import { getPortfolio } from "../../services/portfolio.service";
import { Paper, Typography, Divider } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { formatAmount } from "../../utils/number.utils";
import ContentBox from "../layout/ContentBox";
const BalanceTable = ({ balances }) => {
    const [curBalances, setCurBalances] = useState(balances)
    useEffect(() => {
        console.log(balances)
        if (!balances) {
            getPortfolio()
                .then(({ data }) => { setCurBalances(data.balances) })
        }
    }, [balances])
    return (
        <ContentBox title="Balances">            
            {curBalances && (
                <Grid container spacing={2}>

                    {Object.keys(curBalances).map((key) => (<>
                        <Grid md={4}>
                            <Typography variant="body1">{key}</Typography>
                        </Grid>
                        <Grid md={8} textAlign='right'>
                            <Typography variant="body1">{formatAmount(curBalances[key])}</Typography>
                        </Grid></>
                    ))}
                </Grid>
            )}
        </ContentBox>
    );
}

export default BalanceTable;