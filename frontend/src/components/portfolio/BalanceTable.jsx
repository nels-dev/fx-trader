import ContentBox from "@/components/layout/ContentBox";
import { Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useEffect, useState } from "react";
import { getPortfolio } from "../../services/portfolio.service";
import { formatAmount } from "../../utils/number.utils";

const BalanceTable = ({ balances }) => {
    const [curBalances, setCurBalances] = useState(balances)
    useEffect(() => {        
        if (!balances) {
            getPortfolio()
                .then(({ data }) => { setCurBalances(data.balances) })
                .catch(()=> setCurBalances({}))
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