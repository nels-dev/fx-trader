import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import {useEffect, useState} from "react";
import {getTransactions} from "../../services/transaction.service";
import {formatAmount} from "../../utils/number.utils";
import ContentBox from "../layout/ContentBox";
import Loading from "../layout/Loading";

const FundingHistory = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    getTransactions()
    .then(({data}) => setTransactions(data.transactions))
    .finally(() => setLoading(false))
  }, [])
  return (<>
        {loading && <Loading/>}
        {!loading && (
            <TableContainer component={ContentBox} title="Transfer history">
              <Table>

                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>                    
                    <TableCell>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    transactions.map(row => (
                        <TableRow key={row.createdAt}>
                          <TableCell>{new Date(
                              row.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{row.type}</TableCell>                          
                          <TableCell>{row.toCurrency} {formatAmount(row.toAmount)}</TableCell>
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

export default FundingHistory;