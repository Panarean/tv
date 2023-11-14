import React, { useState,useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  FormControlLabel,
  Switch,
  Radio,
  RadioGroup,
  TextField,
  Checkbox,
  Button,
  Fade,
  makeStyles,
  
} from '@material-ui/core';
import Cookies from 'js-cookie'
import axios from 'axios';
import { closeOrder, resetToken } from './apiUtil';

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    minWidth:'350px'
  },
  flex: {
    display: 'flex'
  },
  fullWidth: {
    flexGrow: 1
  }
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const UpdateOrderDialog = ({ open, onClose, symbol,ticket }) => {
  const classes = useStyles();
  const [price, setPrice] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [expirationTime, setExpirationTime] = useState('');
  const [expirationChecked, setExpirationChecked] = useState(true);
  const [priceChecked, setPriceChecked] = useState(false);
  
  const handleExpirationCheck = (event) => {
    setExpirationChecked(event.target.checked);
  };
  const handlePriceCheck = (event) => {
    setPriceChecked(event.target.checked);
  };
  useEffect(() => {
    let date= new Date();
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is zero-based, so adding 1 and padding with zeros if necessary
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}T00%3A00%3A00`;
    setExpirationTime(formattedDate)
  },[])
  const handleUpdateOrder = async () => {
    var url = `https://mt5.mtapi.io/OrderModify?id=${Cookies.get('token')}&ticket=${ticket}&stoploss=${stopLoss}&takeprofit=${takeProfit}`
    if(priceChecked)
        url = url+ `&price=${price}`
    if(expirationChecked)
        url = url + `&expiration=${encodeURIComponent(expirationTime)}&expirationType=GTC`
    await axios.get(url)
        .then(resp => {
            if(resp.status == 201 && resp.data.code == 'INVALID_TOKEN'){
            resetToken(() => closeOrder(ticket));
            }
            else if (resp.status == 200){
                onClose();
            }                
            else{
                console.log(resp.data)
                alert(resp.data.message)
            }
        })
        .catch(error => {
            console.log('error',error)
        })
  };
  const handleCloseOrder = () => {
    closeOrder(ticket,onClose)
  }
  return (
    <Dialog open={open} onClose={onClose} TransitionComponent={Transition} maxWidth="xl">
      <DialogTitle >
        Update Order
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <TextField
            label="Symbol"
            value={symbol}
            disabled={true}
        />
        <TextField
            label="Ticket"
            value={ticket}
            disabled={true}
        />

        <div className={classes.flex}>
          <TextField  className={classes.fullWidth} label="Price" value={price} onChange={(e) => setPrice(e.target.value)} disabled={!priceChecked}  />
          <Checkbox checked={priceChecked} onChange={handlePriceCheck} />
        
        </div>
          <TextField className={classes.fullWidth} label="T/P" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)}   />

          <TextField  className={classes.fullWidth} label="S/L" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)}  />
        
        <div className={classes.flex}>
            <TextField
                className={classes.fullWidth} 
                label='Expiration Time'
                placeholder="yyyy-MM-ddTHH:mm:ss"
                value={expirationTime}
                onChange={(e) => setExpirationTime(e.target.value)}
                disabled={!expirationChecked}
            />
            <Checkbox checked={expirationChecked} onChange={handleExpirationCheck} />

        </div>
       
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleCloseOrder} color="primary">
          Close Order
        </Button>
        <Button onClick={handleUpdateOrder} color="primary">
          Update Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateOrderDialog;