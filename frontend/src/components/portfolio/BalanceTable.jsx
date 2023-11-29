import ContentBox from "@/components/layout/ContentBox";
import {Table, TableBody, TableCell, TableRow, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {getPortfolio} from "../../services/portfolio.service";
import {formatAmount} from "../../utils/number.utils";

const BalanceTable = ({balances}) => {
  const [curBalances, setCurBalances] = useState(balances)  
  useEffect(() => {
    if (!balances) {
      getPortfolio()
      .then(({data}) => {
        setCurBalances(data.balances)
      })
      .catch(() => setCurBalances({}))
    }else{
      setCurBalances(balances)
    }
  }, [balances])
  return (
      <ContentBox title="Balances">
        {curBalances && (
            <Table>
              <TableBody>
              {Object.keys(curBalances).map((key) => (
                    <TableRow key={key}>
                      <TableCell>
                        <Typography variant="body1">{key}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight={600}>{formatAmount(
                            curBalances[key])}</Typography>
                      </TableCell>                      
                    </TableRow>
              ))}
              </TableBody>
            </Table>            
        )}
      </ContentBox>
  );
}

export default BalanceTable;