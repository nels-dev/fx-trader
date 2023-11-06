import Snackbar from '@mui/material/Snackbar'
import {useAlert} from '../../provider/alert.provider'
import {useEffect, useState} from 'react'
import Alert from '@mui/material/Alert'
import {AlertTitle} from '@mui/material'

const AlertBox = () => {
  const {payload: {message, title, type, time}} = useAlert();
  const [payload, setPayload] = useState({open: false});

  useEffect(() => {
    console.log('Alert message changed', message)
    if (message) {
      setPayload({message, type, title, open: true})
    }
  }, [time])
  const handleClose = () => setPayload({...payload, open: false})
  return (
      <Snackbar
          anchorOrigin={{vertical: 'top', horizontal: 'center'}}
          autoHideDuration={6000}
          open={payload.open}
          onClose={handleClose}
      >
        <Alert variant='filled' severity={payload.type || 'info'}
               sx={{minWidth: 300}}>
          <AlertTitle>
            {payload.title}
          </AlertTitle>
          {payload.message}
        </Alert>
      </Snackbar>);
}

export default AlertBox;