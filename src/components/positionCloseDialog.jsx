import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  TextField,
  Checkbox,
  Button,
  makeStyles,
  
} from '@material-ui/core';
import Cookies from 'js-cookie'
import axios from 'axios';
import { closeOrder, resetToken } from './apiUtil';
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

const PositionCloseDialog = ({ open, onClose, symbol,ticket }) => {
  const classes = useStyles();
  const [commentChecked, setCommentChecked] = useState(false);
  const [comment, setComment] = useState('');
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
  const handleCommentCheck = (event) => {
    setCommentChecked(event.target.checked);
  };

  const handleOrderSubmit = async () => {
    // Handle order submission logic
    closeOrder(ticket,onClose)
  };

  return (
    <Dialog open={open} onClose={onClose} TransitionComponent={Transition} maxWidth="xl">
      <DialogTitle >
        Close Position
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
          Close Position
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PositionCloseDialog;