import {
  Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import {useEffect, useState} from "react";
import {getTrades} from "../../services/transaction.service";
import {formatAmount} from "../../utils/number.utils";
import ContentBox from "../layout/ContentBox";
import Loading from "../layout/Loading";
import moment from "moment";

const TradingHistory = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    getTrades()
    .then(({data}) => setTransactions(data.transactions))
    .finally(() => setLoading(false))
  }, [])
  return (<Loading loading={loading}>
            
            <TableContainer component={ContentBox} title="Trade history">
            <Box sx={{width: '100%', overflow: 'scroll'}}>
              <Table>

                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Sold</TableCell>
                    <TableCell>Bought</TableCell>
                    <TableCell>Effective Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    transactions.map(row => (
                        <TableRow key={row.createdAt}>
                          <TableCell>{moment(
                              row.createdAt).format('l')}</TableCell>
                          <TableCell>{row.fromCurrency} {formatAmount(
                              row.fromAmount)}</TableCell>
                          <TableCell>{row.toCurrency} {formatAmount(
                              row.toAmount)}</TableCell>
                          <TableCell>{Number(row.rate).toFixed(4)}</TableCell>
                        </TableRow>
                    ))
                  }
                </TableBody>
              </Table>  </Box>
            </TableContainer>
          
      </Loading>
  );
}

export default TradingHistory;