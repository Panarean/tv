import axios from "axios"
import React, { useEffect, useState } from 'react';
import {  makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core'
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from '@material-ui/core';
import  Cookies from 'js-cookie'
//import CandlestickChart from './candleStickChart';
//import CandlestickChart from "./chart1";
import TradingViewWidget, { Themes } from 'react-tradingview-widget';

import ChartComponent from "./CandleChart";
import OrderDialog from "./orderDialog";

import servers from '../config/servers'
import { resetToken } from "./apiUtil";
const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
  },
  tableHeader: {
    backgroundColor: '#000',
  },
  tableHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tableRow: {
    '&:nth-of-type(even)': {
      backgroundColor: '#f5f5f5',
    },
  },
  roundedButton: {
    borderRadius: '5px, 5px',
    padding: '5px ',
    margin: '10px',
    backgroundColor: '#000',
    color:'#fff'
  },
}));

const WIDTH = 980

const ChartElement = () => {
    const [openOrders, setOpenOrders] = useState([]);
    const [orderDlgOpen, setOrderDlgOpen] = useState(false);
    const classes = useStyles();
    const id = Cookies.get('id');
    const password = Cookies.get('password');
    const server = Cookies.get('server');
    var token = Cookies.get('token');

    const resetOpenOrder = () => {
      let token = Cookies.get('token')
      axios.get(`https://mt5.mtapi.io/OpenedOrders?id=${token}&sort=OpenTime&ascending=true`)
          .then(response => {
            if(response.status==200)
              setOpenOrders(response.data)
            else if(response.status == 201 && response.data.code == "INVALID_TOKEN"){    
                resetToken();
              }
          })
    }
    const closeOrder = async (ticket) => {
      const token = Cookies.get('token')
      var url = `https://mt5.mtapi.io/OrderClose?id=${token}&ticket=${ticket}`
      await axios.get(url)
        .then(response => {
          if(response.status == 200){
            console.log('success',response.data);
            resetOpenOrder();
          }
          else{
            console.log('failed',response.data);
          }
        })
    }
    useEffect(() => {
      const tokenResetTimer = setInterval(() => {
        resetToken();
      }, 60000);
  
      const OpenOrderTimer = setInterval(() => {
        resetOpenOrder();
      }, 5000);
      
      resetOpenOrder();

      return () => {
        clearInterval(tokenResetTimer);
        clearInterval(OpenOrderTimer);
      }
      //https://mt5.mtapi.io/OpenedOrders?id=67ea49fa-f608-443f-b3a5-c26ffac91381&sort=OpenTime&ascending=true
    },[])

    return (
        <>
          {/*<ChartComponent/>*/}
          <OrderDialog open={orderDlgOpen} onClose={()=>{setOrderDlgOpen(false)}}/>
          <Button className={classes.roundedButton} variant="contained" color="primary" onClick={() => setOrderDlgOpen(true)}>
            New Order
          </Button>
          {/*<TradingViewWidget symbol="USOIL"/>*/}
          <ChartComponent  symbol={Cookies.get("symbol")} interval={60}/>
          <Paper>
            <Table className={classes.table}>
                <TableHead>
                <TableRow className={classes.tableHeader}>
                    <TableCell className={classes.tableHeaderText}>Symbol</TableCell>
                    <TableCell className={classes.tableHeaderText}>Time</TableCell>
                    <TableCell className={classes.tableHeaderText}>Type</TableCell>
                    <TableCell className={classes.tableHeaderText}>Volume</TableCell>
                    <TableCell className={classes.tableHeaderText}>Price</TableCell>
                    <TableCell className={classes.tableHeaderText}>S/L</TableCell>
                    <TableCell className={classes.tableHeaderText}>T/P</TableCell>
                    <TableCell className={classes.tableHeaderText}>Swap</TableCell>
                    <TableCell className={classes.tableHeaderText}>Profit</TableCell>
                    <TableCell className={classes.tableHeaderText}>Comment</TableCell>
                    <TableCell className={classes.tableHeaderText}></TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                  {
                    openOrders.map(elem => {
                      return (
                        <TableRow className={classes.tableRow} >
                          <TableCell>{elem.symbol}</TableCell>
                          <TableCell>{elem.openTime}</TableCell>
                          <TableCell>{elem.orderType}</TableCell>
                          <TableCell>{elem.volume}</TableCell>
                          <TableCell>{elem.openPrice}</TableCell>
                          <TableCell>{elem.stopLimitPrice}</TableCell>
                          <TableCell>{elem.takeProfit}</TableCell>
                          <TableCell>{elem.swap}</TableCell>
                          <TableCell>{elem.profit}</TableCell>
                          <TableCell>{elem.closeComment}</TableCell>
                          <TableCell> 
                            <Button className={classes.roundedButton} variant="contained" color="white" onClick={()=>{closeOrder(elem.ticket)}}>
                              Close Order
                              </Button> 
                          </TableCell>

                        </TableRow>
                      )
                    })
                  }
                {/* 
                <TableRow className={classes.tableRow}>
                    <TableCell>ABC</TableCell>
                    <TableCell>1000</TableCell>
                    <TableCell>10:00 AM</TableCell>
                    <TableCell>Buy</TableCell>
                    <TableCell>100</TableCell>
                    <TableCell>1.25</TableCell>
                    <TableCell>1.20</TableCell>
                    <TableCell>1.30</TableCell>
                    <TableCell>0.10</TableCell>
                    <TableCell>50</TableCell>
                    <TableCell>Good trade</TableCell>
                </TableRow>
                Add your table rows here */}
                </TableBody>
            </Table>
            </Paper>
        </>
    )
    
}

export default ChartElement