import {
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

const TradingHistory = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    getTrades()
    .then(({data}) => setTransactions(data.transactions))
    .finally(() => setLoading(false))
  }, [])
  return (<>
        {loading && <Loading/>}
        {!loading && (
            <TableContainer component={ContentBox} title="Trade history">
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
                          <TableCell>{new Date(
                              row.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{row.fromCurrency} {formatAmount(
                              row.fromAmount)}</TableCell>
                          <TableCell>{row.toCurrency} {formatAmount(
                              row.toAmount)}</TableCell>
                          <TableCell>{row.rate}</TableCell>
                        </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </TableContainer>
        )}
      </>
  );
}

export default TradingHistory;