import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from "@mui/material";
import {useEffect, useState} from "react";
import {getTransactions} from "../../services/transaction.service";
import {formatAmount} from "../../utils/number.utils";
import ContentBox from "../layout/ContentBox";
import Loading from "../layout/Loading";
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import moment from "moment";

const FundingHistory = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    getTransactions()
    .then(({data}) => setTransactions(data.transactions))
    .finally(() => setLoading(false))
  }, [])
  return (
        <Loading loading={loading}>
            <TableContainer component={ContentBox} title="Transfer history">
              <Table>

                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    
                    <TableCell>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    transactions.map(row => (
                        <TableRow key={row.createdAt}>
                          <TableCell>
                          <Typography> {moment(row.createdAt).format('ll')}  
                          </Typography>
                          </TableCell>                          
                          <TableCell>
                            <Typography>
                            {row.type==='DEPOSIT' && (<Tooltip title='Deposit'><LogoutIcon sx={{verticalAlign:'top', mr: 2}}/></Tooltip> )}
                            {row.type==='WITHDRAWAL' && (<Tooltip title='Withdrawal'><LoginIcon sx={{verticalAlign:'top', mr: 2}}/></Tooltip> )}
                            {row.toCurrency} {formatAmount(row.toAmount)}
                            </Typography>
                                                  
                            
                            </TableCell>
                        </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </TableContainer>
        </Loading>
  );
}

export default FundingHistory;