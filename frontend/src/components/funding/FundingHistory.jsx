import { useEffect, useState } from "react";
import { getTransactions } from "../../services/transaction.service";
import { Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { formatAmount } from "../../utils/number.utils";
import ContentBox from "../layout/ContentBox";

const FundingHistory = () => {
    const [transactions, setTransactions] = useState([])
    useEffect(() => {
        getTransactions()
            .then(({ data }) => setTransactions(data.transactions))
    }, [])
    return (
        <TableContainer component={ContentBox} title="Transfer history">
            <Table>

                <TableHead>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Currency</TableCell>
                        <TableCell>Amount</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        transactions.map(row => (
                            <TableRow key={row.createdAt}>
                                <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>{row.type}</TableCell>
                                <TableCell>{row.toCurrency}</TableCell>
                                <TableCell>{formatAmount(row.toAmount)}</TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default FundingHistory;