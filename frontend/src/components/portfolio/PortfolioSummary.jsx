import {getPortfolio} from "../../services/portfolio.service";
import {useEffect, useState} from "react";
import Grid from '@mui/material/Unstable_Grid2'
import {Button, Card, CardActionArea, Stack, Typography} from "@mui/material";

import {formatAmount} from "../../utils/number.utils"
import BalanceTable from "./BalanceTable";
import ContentBox from "../layout/ContentBox";
import Loading from "../layout/Loading"
import {Link, useNavigate} from "react-router-dom";
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';

const PortfolioSummary = () => {
  const [portf, setPortf] = useState(null)
  const [loading, setLoading] = useState(true)
  const [noActivePortfolio, setNoActivePortfolio] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    getPortfolio()
    .then(({data}) => {
      setPortf(data);

    })
    .catch(err => {
      console.log(err.response)
      if (err.response?.status == 404) {
        setNoActivePortfolio(true)
      }
    })
    .finally(() => setLoading(false))
  }, [])
  return (<>
    {loading && (<Loading/>)}
    {!loading && portf && (
        (<section>

          <Grid container mt={3} spacing={3}>
            <Grid sm={12} md={6}>
              <ContentBox title="My Portfolio">
                <Typography variant="h4" sx={{mt: 2, mb: 2}}>
                  {`${portf.baseCurrency}  ${formatAmount(
                      portf.balanceInBaseCurrency)}`}
                </Typography>
                <Typography variant="subtitle2">Portfolio total
                  value in base currency</Typography>
                <Typography variant="h4"
                            sx={{mt: 2, mb: 2}}>{portf.percentageChange >= 0
                    ? "+" : ""}{Number(portf.percentageChange * 100).toFixed(
                    2)}%</Typography>
                <Typography variant="subtitle2">Holding Period Return since {new Date(
                    portf.createdAt).toLocaleDateString()}</Typography>
                <Stack spacing={2} direction="row" sx={{mt: 5}}>
                  <Button variant="contained" color='primary' component={Link}
                          to="/trade">Perform trade</Button>
                  <Button variant="outlined" color='primary' component={Link}
                          to="/funding">Fund your portfolio</Button>
                </Stack>
              </ContentBox>
            </Grid>
            <Grid sm={12} md={6}>
              <BalanceTable balances={portf.balances}/>
            </Grid>
          </Grid>
        </section>)
    )}
    {noActivePortfolio && (
        <section>
          <Grid container spacing={3}>
            <Grid xs/>
            <Grid sm={8} md={6}>
              <Card
                  sx={{backgroundColor: 'primary.light', height: "100%", mt: 3}}
                  onClick={() => navigate('funding')}>
                <CardActionArea
                    sx={{p: 3, textAlign: 'center', height: "100%"}}>
                  <FolderSpecialIcon
                      sx={{fontSize: 60, color: "primary.contrastText"}}/>

                  <Typography gutterBottom variant="h4"
                              color="primary.contrastText">Create Your
                    Portfolio</Typography>
                  <Typography variant="caption" color="primary.contrastText">
                    Currently, you don&apos;t have an active portfolio. Begin
                    monitoring your investments by funding your account with one
                    of our supported currencies. The initial funding currency
                    will be set as your portfolio&apos;s base currency and
                    cannot be changed.
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid xs/>
          </Grid>
        </section>
    )}
  </>)
}

export default PortfolioSummary;