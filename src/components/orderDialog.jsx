import React, { useState ,useEffect} from 'react';
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
import { resetToken } from './apiUtil';
import servers from '../config/servers'
import { CallMissedSharp, Comment } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    minWidth:'350px'
  },
  orderType: {
    flexDirection: 'row',
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

const OrderDialog = ({ open, onClose, symbol }) => {
  const classes = useStyles();
  const [buySell, setBuySell] = useState('Buy');
  const [orderType, setOrderType] = useState('normal');
  const [price, setPrice] = useState('');
  const [volume, setVolume] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [expirationTime, setExpirationTime] = useState('');
  const [expirationChecked, setExpirationChecked] = useState(true);
  const [tpChecked, setTPChecked] = useState(false);
  const [slChecked, setSLChecked] = useState(false);
  const handleBuySellChange = (event) => {
    setBuySell(event.target.value);
  };

  const handleOrderTypeChange = (event) => {
    setOrderType(event.target.value);
  };

  const handleExpirationCheck = (event) => {
    setExpirationChecked(event.target.checked);
  };
  const handleTPCheck = (event) => {
    setTPChecked(event.target.checked);
  };
  const handleSLCheck = (event) => {
    setSLChecked(event.target.checked);
  };
 

  const getMinVolume = async ()  => {
    let url = `https://mt5.mtapi.io/SymbolParams?id=${Cookies.get('token')}&symbol=${symbol}`
    await axios.get(url)
      .then(resp => {
        if(resp.status == 201 && resp.data.code == 'INVALID_TOKEN'){
          resetToken(() => getMinVolume());
        }
        else if (resp.status == 200){
          setVolume(resp.data.symbolGroup.minLots)
        }
        else{
          alert(resp.data.message)
        }

      })
      .catch(error => {
        console.log('error',error)
      })
  }
  useEffect(() => {
    console.log("symbol",symbol)
    if(symbol.length)
      getMinVolume()
  },[symbol])
  useEffect(() => {
    let date= new Date();
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is zero-based, so adding 1 and padding with zeros if necessary
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}T00:00:00`;
    setExpirationTime(formattedDate)
  },[])
  const handleOrderSubmit = async () => {
    // Handle order submission logic
    var token = Cookies.get('token');
    var operation = buySell;
    if(orderType == 'stopOrder')
        operation = operation + 'Stop'
    if(orderType == 'limitOrder')
        operation = operation + 'Limit'
    var url = `https://mt5.mtapi.io/OrderSend?id=${token}&symbol=${symbol}&operation=${operation}&volume=${volume}`
    if(orderType !== "normal"){
        url = url + `&price=${price}`
    }
    if(slChecked){
        url = url + `&stoploss=${stopLoss}`
    }
    if(tpChecked){
        url = url + `&takeprofit=${takeProfit}`
    }
    if(expirationChecked){
        url = url + `&expiration=${encodeURIComponent(expirationTime)}&expirationType=Today`
    }
    
    url = url + `&comment=${Cookies.get('token')}`
    
    await axios.get(url)
      .then(resp => {
        if(resp.status == 201 && resp.data.code == 'INVALID_TOKEN'){
          resetToken(() => handleOrderSubmit());
        }
        else if (resp.status == 200){
          onClose();
        }
        else{
          //console.log(resp.data,Cookies.get('token'))
        
          alert(resp.data.message)
        }
        
      })
      .catch(error => {
        console.log('error',error)
      })
  };

  return (
    <Dialog open={open} onClose={onClose} TransitionComponent={Transition} maxWidth="xl">
      <DialogTitle >
        Place Order
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
       <TextField
            label="Symbol"
            value={symbol}
            disabled={true}
        />
        <RadioGroup name="buySell" value={buySell} onChange={handleBuySellChange} row>
          <FormControlLabel value="Buy" control={<Radio />} label="Buy" />
          <FormControlLabel value="Sell" control={<Radio />} label="Sell" />
        </RadioGroup>
        <RadioGroup name="orderType" value={orderType} onChange={handleOrderTypeChange} className={classes.orderType}>
          <FormControlLabel value="normal" control={<Radio />} label="Normal" />
          <FormControlLabel value="stopOrder" control={<Radio />} label="Stop Order" />
          <FormControlLabel value="limitOrder" control={<Radio />} label="Limit Order" />
        </RadioGroup>
        <TextField
            label="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={orderType === 'normal'}
        />
        {/*orderType !== 'normal' && (
          <TextField label="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        )*/}
        <TextField label="Volume" value={volume} onChange={(e) => setVolume(e.target.value)} fullWidth={false}/>
        <div className={classes.flex}>
            
          <TextField className={classes.fullWidth} label="T/P" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} disabled={!tpChecked}  />
          <Checkbox checked={tpChecked} onChange={handleTPCheck}/>
        </div>
        <div className={classes.flex}>
          <TextField  className={classes.fullWidth} label="S/L" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} disabled={!slChecked}  />
          <Checkbox checked={slChecked} onChange={handleSLCheck}/>
        </div>
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
        <div className={classes.flex}>
                    
            <TextField
                className={classes.fullWidth} 
                label='Comment'
                value={Cookies.get('ip')}
                disabled={true}
            />
            
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleOrderSubmit} color="primary">
          Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDialog;