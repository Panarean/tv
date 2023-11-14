import React,{useState,useEffect} from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  makeStyles,
  Menu,
  MenuItem
} from '@material-ui/core';
import Cookies from 'js-cookie'
import axios from 'axios';
import {Tabs,Tab} from '@material-ui/core';
import { date2UTC, resetToken } from './apiUtil';
import PositionCloseDialog from './positionCloseDialog';
import UpdateOrderDialog from './updateOrderDialog';
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

function OrderInfos() {
  
  const classes = useStyles();

  const [symbol, setSymbol] = useState('')
  const [ticket, setTicket] = useState(0)
  const [value, setValue] = useState(0);
  const [headerList,setHeaderList] = useState([])
  const [historyData,setHistoryData]= useState([])
  const [orderData,setOrderData] = useState([])
  const [positionCloseDialog,setPositionCloseDialog] = useState(false);
  const [updateOrderDialog,setUpdateOrderDialog] = useState(false);
  const dealsHeaderList = ['Commodity',  'TicketID', 'Date/Time', 'Buy/Sell', 'Volume', 'Open Price',  'Open Commission',  'SL', 'TP', 'P/L', 'Comment' ]
  const orderHeaderList = ['Commodity', 'Order ID',	'Date/Time', 'Type', 'Volume', 'Pending	Price', 'SL', 'TP', 'Comment']
  const historyHeaderList = ['Commodity', 'ID',	'History Type',	'Type',		'Open Tkt',	'Open Date',	'Time',	'Amount',	'Open Price',	'Close Price',		'SL',	'TP',	'Commission',	'Open Commission',	'Comment',	'Close Profit']
  const [contextMenu, setContextMenu] = React.useState(null);
  
  const handleHistoryChange = (historyPeriod) => {
    let curdate=new Date();
    let date;
    if(historyPeriod == 0)
      date = curdate.getTime() - 1000*60*60*24
    
    if(historyPeriod == 1)
      date = curdate.getTime() - 1000*60*60*24*7
    
    if(historyPeriod == 2)
      date = curdate.getTime() - 1000*60*60*24*30
    
    if(historyPeriod == 3)
      date = curdate.getTime() - 1000*60*60*24*300000
    Cookies.set('historyFrom',encodeURIComponent(date2UTC(new Date(date))))
    handleMenuClose()
  }
    const getHistory = () => {
      if(Cookies.get('historyFrom') == undefined)
        handleHistoryChange(3)
    var url = `https://mt5.mtapi.io/OrderHistory?id=${Cookies.get('token')}&from=${Cookies.get('historyFrom')}&to=${encodeURIComponent(date2UTC(new Date()))}&ascending=true`
    
    axios.get(url)
    .then(resp => {
      if(resp.status == 201 && resp.data.code == 'INVALID_TOKEN'){
        resetToken(() => getHistory());
      }
      else if (resp.status == 200){
        var data = resp.data.orders.filter(history => history.symbol.length).map(history => {
          return [
            history.symbol,history.ticket,"Close",history.orderType, 
            history.dealInternalIn.ticketNumber , history.openTime, 
            history.closeTime, history.volume, history.openPrice,history.closePrice,
            history.stopLoss, history.takeProfit,history.commission.toFixed(2),
            history.dealInternalIn.commission, history.comment
          ]
        })
        setHistoryData(data)
      }
    })
    .catch(err=>console.log(err))
  }
  const getOrders = () => {
    var url = `https://mt5.mtapi.io/OpenedOrders?id=${Cookies.get('token')}&ascending=true`
    
    axios.get(url)
    .then(resp => {
      if(resp.status == 201 && resp.data.code == 'INVALID_TOKEN'){
        resetToken(() => getOrders());
      }
      else if (resp.status == 200){
        setOrderData(resp.data)
        
      }
    })
    .catch(err=>console.log(err))
  }
  useEffect(() => {
    const timer = setInterval(() => {
      getHistory()
      getOrders()
    }, 5000);
    return () => {
      clearInterval(timer);
    }
  },[])
  useEffect(()=>{
    if(value == 2){
      setHeaderList(historyHeaderList)
      getHistory();
    }
    if(value == 1){
      setHeaderList(orderHeaderList)
      getOrders();
    }
    if(value == 0){
      setHeaderList(dealsHeaderList)
      getOrders();
    }
  },[value]) 
  const handleContextMenu = (event) => {
    event.preventDefault();
    if(value!=2)
      setContextMenu(null)
    else
      setContextMenu(
        contextMenu === null
          ? {
              mouseX: event.clientX + 2,
              mouseY: event.clientY - 6,
            }
          :  null,
      );
  };
  const handleMenuClose = () => {
    setContextMenu(null);
  };
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const DoOperation = (symbol, ticket) => {
    
    if(value == 0){
      setSymbol(symbol)
      setTicket(ticket)
      setPositionCloseDialog(true)
    }
    else if(value==1){
      setSymbol(symbol)
      setTicket(ticket)
      setUpdateOrderDialog(true)
    }
  }
  var rows;
  if(value ==2){
    rows= historyData;
  }
  else{
    var data;
    console.log('order',orderData)
    if(value == 0)
      data = orderData.filter(order => order.symbol.length && (order.orderType=='Buy' || order.orderTyp=='Sell')).map(order => {
        return [
          order.symbol, order.ticket, order.openTime, order.orderType, order.lots, order.openPrice, 
          order.dealInternalIn.commission, order.stopLoss, order.takeProfit, order.profit,order.comment
        ]
      })
    else
      data = orderData.filter(order => order.symbol.length && !(order.orderType=='Buy' || order.orderTyp=='Sell')).map(order => {
        return [
          order.symbol, order.ticket, order.openTime,order.orderType, order.lots, order.openPrice,  
          order.stopLoss, order.takeProfit, order.comment
        ]
      })
    rows=data;
  }
  
  return (
    <div className={classes.root}>
      <PositionCloseDialog open={positionCloseDialog} symbol={symbol} ticket={ticket} onClose={()=>{setPositionCloseDialog(false)}}/>
      <UpdateOrderDialog open={updateOrderDialog} symbol={symbol} ticket={ticket} onClose={()=>{setUpdateOrderDialog(false)}}/>

      <Tabs value={value} onChange={handleChange}>
        <Tab label="Deals" />
        <Tab label="Orders" />
        <Tab label="History" />
      </Tabs>

      <TableContainer  className={['mt-2']} >
        <Table onContextMenu={handleContextMenu} style={{ cursor: 'context-menu' }}>
          <TableHead>
            <TableRow>
              {
                headerList.map(elem => <TableCell>{elem}</TableCell>)
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index} onClick={() => { DoOperation(row[0],row[1]) }}>
                {
                  row.map(elem => <TableCell>{elem}</TableCell>)
                }
                {
                  //value<2 ? <TableCell>×</TableCell> : <></>
                }
                
              </TableRow>
            ))}

          </TableBody>
          <Menu
            open={contextMenu !== null}
            onClose={handleMenuClose}
            anchorReference="anchorPosition"
            anchorPosition={
              contextMenu !== null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
            }
          >
            <MenuItem onClick={()=>{handleHistoryChange(0),getHistory()}}>Today</MenuItem>
            <MenuItem onClick={()=>{handleHistoryChange(1),getHistory()}}>1 week </MenuItem>
            <MenuItem onClick={()=>{handleHistoryChange(2),getHistory()}}>1 month</MenuItem>
            <MenuItem onClick={()=>{handleHistoryChange(3),getHistory()}}>All</MenuItem>
          </Menu>
        </Table>
      </TableContainer>
    </div>
  );
}

export default OrderInfos;