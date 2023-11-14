import React, {useState,useEffect} from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  makeStyles,
  Typography
} from '@material-ui/core';

import {Tabs,Tab} from '@material-ui/core';

import axios from 'axios';
import { Container } from 'react-bootstrap';
import { Search as SearchIcon } from '@material-ui/icons';
import OrderInfos from './orderInfos';
import Cookies from 'js-cookie'
import { resetToken } from './apiUtil';
import OrderDialog from './orderDialog';

const useStyles = makeStyles((theme) => ({
  
}));

const CommodityList = () => {
  const classes = useStyles();
  const [symbolList,setSymbolList]=useState({})
  const [watchList, setWatchList]=useState([])
  const [searchString, setSearchString]= useState('');
  const [rows, setRows] = useState([])
  const [orderDlgOpen,setOrderDlgOpen] = useState(false)
  const [symbol, setSymbol] = useState('');
  const [value,setValue] = useState(0)

  const getCommodities = async () => {
    axios.get(`https://mt5.mtapi.io/Symbols?id=${Cookies.get('token')}`)
    .then(resp => {
      if(resp.status == 201 && resp.data.code == 'INVALID_TOKEN'){
        resetToken(getCommodities);
      }
      else if (resp.status == 200){
        setSymbolList(resp.data)
        
      }
      else{
        alert(resp.data)
      }
    })
    .catch(err=>console.log(err))
  }
  const getQuotes = async () => {
    console.log("getQuote")
    const _watchList = JSON.parse(Cookies.get('watchList'));

    var url = `https://mt5.mtapi.io/MarketWatchMany?id=${Cookies.get('token')}`
    const quoteSymbols = _watchList.filter(elem => {
      if(elem.includes('\n'))
        return false;
      if(searchString.length)
        return elem.includes(searchString);
      else
        return true;
    })
    url = url + quoteSymbols.map(elem => `&symbols=${encodeURIComponent(elem)}`).join('');
    await axios.get(url)
    .then(resp => {
      if(resp.status == 201 && resp.data.code == 'INVALID_TOKEN'){
        resetToken();
      }
      else if (resp.status == 200){
        const marketData = {}
        resp.data.forEach(item => {
          marketData[item.symbol] = item
        })
        setRows(marketData)
      }
    })
    .catch(err=>console.log(err))

    
  }
  const subscribe = async (watchList) => {
    if(watchList.length != 0){
      var url = `https://mt5.mtapi.io/SubscribeMany?id=${Cookies.get('token')}`
      url = url + watchList.map(elem => `&symbols=${encodeURIComponent(elem)}`).join('');
      axios.get(url)
      .then(resp => {
        if(resp.status == 201 && resp.data.code == 'INVALID_TOKEN'){
          resetToken(() => subscribe(watchList));
        }
        else if (resp.status == 200){
        }
        else{
          alert(resp.data.message)
        }
      })
      .catch(err=>console.log(err))
    }
  }
  const subscribeMarket = async () => {
    if(watchList.length != 0){
      var url = `https://mt5.mtapi.io/SubscribeMarketWatch?id=${Cookies.get('token')}`
      console.log('watch',watchList)

      url = url + watchList.map(elem => `&symbols=${encodeURIComponent(elem)}`).join('');
      axios.get(url)
      .then(resp => {
        if(resp.status == 201 && resp.data.code == 'INVALID_TOKEN'){
          resetToken(() => subscribeMarket());
        }
        else if (resp.status == 200){
        }
        else{
          alert(resp.data.message)
        }
      })
      .catch(err=>console.log(err))
    }
  }
  const handleSocket  = (event) => {
    const symbolData = JSON.parse(event.data)
    if(symbolData.type == "IdNotExist")
    {
      console.log('retry')
      console.log(this)
      resetToken(socketConf)
    }
    else if (symbolData.type == 'MarketWatch'){
     let _watchList = JSON.parse(Cookies.get('watchList'))
      if(_watchList.includes(symbolData.data.symbol))
      {
        setRows(prev => {
          if(prev[symbolData.data.symbol] == undefined)
            return prev;
          let timestep = (new Date(prev[symbolData.data.symbol].time))-(new Date(symbolData.data.time))
          
          if(timestep<500)
            return prev;
          //if(prev[symbolData.data.symbol].time && new Date()-symbolData.data.time))
          if(prev[symbolData.data.symbol].high > symbolData.data.high)
            prev[symbolData.data.symbol].highColor='red'
          else if(prev[symbolData.data.symbol].high < symbolData.data.high)
            prev[symbolData.data.symbol].highColor='green'
          else
            prev[symbolData.data.symbol].highColor='text.primary'
          
          if(prev[symbolData.data.symbol].low > symbolData.data.low)
            prev[symbolData.data.symbol].lowColor='red'
          else if(prev[symbolData.data.symbol].low < symbolData.data.low)
            prev[symbolData.data.symbol].lowColor='green'
          else
            prev[symbolData.data.symbol].lowColor='text.primary'
          
          prev[symbolData.data.symbol].high = symbolData.data.high;
          prev[symbolData.data.symbol].low = symbolData.data.low;
          
          return   JSON.parse(JSON.stringify(prev))
        })
      }
      
      
    }
    else if(symbolData.type == 'Quote'){
      let _watchList = JSON.parse(Cookies.get('watchList'))
      if(_watchList.includes(symbolData.data.symbol))
      {
        setRows(prev => {
          if(prev[symbolData.data.symbol] == undefined)
            return prev;
          let timestep = (new Date(symbolData.data.time))-(new Date(prev[symbolData.data.symbol].time))
          
          
          if(timestep<500)
            return prev;
          console.log(symbolData.data)
          //if(prev[symbolData.data.symbol].time && new Date()-symbolData.data.time))
          if(prev[symbolData.data.symbol].ask > symbolData.data.ask)
            symbolData.data.askColor='red'
          else if(prev[symbolData.data.symbol].ask < symbolData.data.ask)
            symbolData.data.askColor='green'
          else
            symbolData.data.askColor='text.primary'
          
          if(prev[symbolData.data.symbol].bid > symbolData.data.bid)
            symbolData.data.bidColor='red'
          else if(prev[symbolData.data.symbol].bid < symbolData.data.bid)
            symbolData.data.bidColor='green'
          else
            symbolData.data.bidColor='text.primary'
          
          if(symbolData.data.symbol.includes("BANK"))
            console.log('ask', symbolData.data.symbol,prev[symbolData.data.symbol].ask, symbolData.data.ask)
          /*console.log({
            ...prev,
            [symbolData.data.symbol]:{
              ...symbolData.data
            },
          })*/
          return {
            ...prev,
            [symbolData.data.symbol]:{
              ...symbolData.data
            },
          }
        })
      }
    }
    else
    {
      console.log("Message from server ", event.data)
    }
  }
  const socketConf = () => {
    const socket = new WebSocket(`wss://mt5.mtapi.io/Events?id=${Cookies.get('token')}`)
    
    socket.addEventListener("open",event => {
      console.log("Established.")
    })
    socket.addEventListener("close",event => {
      console.log("Closed....",event)
      //socketConf();
      //alert('connection closed  If not working plz refresh page.' )
    })
    socket.addEventListener("message", handleSocket.bind(socket));
  }
  useEffect(() => {
    console.log(Cookies.get('watchList'))
    setWatchList(JSON.parse(Cookies.get('watchList')))
    getCommodities();
    subscribeMarket();
    socketConf()
  },[])
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  useEffect(() => {
    console.log('watchList')
    getQuotes();
    subscribe(watchList);
  },[watchList])
  var tableContent;
  if(value == 1){
    tableContent = Object.keys(symbolList).filter(symbol => {
      if(searchString.length)
        return symbol.includes(searchString);
      else
        return true;
    }).map(symbol => {
      return (
        <TableRow key={symbol} onClick={(e) => {
          var _watchList = watchList.map(elem => elem);
          if(watchList.includes(symbol)){
            _watchList = _watchList.filter(elem => elem !== symbol);
          }
          else{
            _watchList.push(symbol)
          }
          Cookies.set('watchList',JSON.stringify(_watchList));
          setWatchList(_watchList);
        }}>
          <TableCell >{symbol}</TableCell>
          <TableCell >{ watchList.includes(symbol) ? '-' : '+' }</TableCell>
        </TableRow>
      )
    })
  }
  else {
    tableContent=Object.keys(rows).filter(symbol => {
      if(searchString.length)
        return symbol.includes(searchString);
      else
        return true;
    }).sort().map(symbol => {
        let element = rows[symbol]
        return (
          <TableRow key={element.symbol} onClick={(e) => {
            setSymbol(element.symbol)
            setOrderDlgOpen(true)
          }}>
            <TableCell >
              <Typography  style={{}}  >{element.symbol}</Typography>
              <Typography  style={{"font-size":"10px"}}  >{element.time}</Typography>
            </TableCell>
            <TableCell >
              <Typography  style={{color:(element.bidColor?element.bidColor:'text.primary')}}  >{ element.bid.toFixed(2) }</Typography>
              <Typography  style={{color:(element.lowColor?element.lowColor:'text.primary'),"font-size":"12px" }}  >H:&nbsp;{ element.low?element.low.toFixed(2):'-' }</Typography>
            </TableCell>
            <TableCell style={{color:(element.askColor?element.askColor:'text.primary') }}>
              <Typography  style={{color:(element.askColor?element.askColor:'text.primary')}}  >{ element.ask.toFixed(2) }</Typography>
              <Typography  style={{color:(element.highColor?element.highColor:'text.primary'),"font-size":"12px" }}  >L:&nbsp;{ element.high?element.high.toFixed(2):'-' }</Typography>
              </TableCell>
          </TableRow>
        )
      })
    
  }
  return (
    <Container className='h-100'>
      <OrderDialog open={orderDlgOpen} symbol={symbol} onClose={()=>{setOrderDlgOpen(false)}}/>
      
      <Tabs value={value} onChange={handleChange}>
        <Tab label="WatchList" className="flex-grow-1"/>
        <Tab label="SymbolList" className="flex-grow-1"/>
      </Tabs>

      <TextField
        value={searchString}
        onChange={e => setSearchString(e.target.value)}
        variant="outlined"
        placeholder="Search"
        className='mt-2'
        fullWidth={true}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TableContainer component={Paper} className={['mt-2']} >
        <Table>
          {
            value ==0 &&
            (<TableHead>
              <TableCell>Script</TableCell>
              <TableCell>Bid</TableCell>
              <TableCell>ask</TableCell>
            </TableHead>)
          }
          <TableBody>
            {
              tableContent
            }
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default CommodityList;