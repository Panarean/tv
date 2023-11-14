import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import {
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  Button,
  Slide,
  Menu,
  Popover,
  Typography
} from '@material-ui/core';
import Colors from '../config/colors';
//import { AutoComplete } from 'antd';
import { Autocomplete } from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie'

import servers from '../config/servers'
import { useEffect,useState } from 'react';
import { resetToken } from './apiUtil';
const useStyles = makeStyles((theme) => ({
  card: {
    maxWidth: 400,
    margin: 'auto',
    marginTop: theme.spacing(8),
    backgroundColor : Colors[Cookies.get('colorMode')].backgroundColor1
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
  },
  textField: {
    margin: theme.spacing(1),
  },
  select: {
    margin: theme.spacing(1),
    minWidth: 200,
    textAlign: 'left',
  },
  button: {
    marginTop: theme.spacing(5),
  },
}));

const Login = () => {
  const classes = useStyles();
  const [id, setId] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [server, setServer] = React.useState('');

  const [openPassword,setOpenPass] = useState(false);
  const [openId,setOpenId] = useState(false)
  const [anchorEl, setanchorEl] = React.useState(null);

  const handleClick = (event) => {
    const _id = Cookies.get('id')
    const _password = Cookies.get('password')

    if(_id ==undefined || _password == undefined)
      return;
    if(openId || openPassword)
      return;
    if(event.target.type=='text')
      setOpenId(true)
    else{
      setOpenPass(true)
    }
    console.log(event)
    setanchorEl(event.target);
  };
  const handleClose = () => {
    setanchorEl(null);
  };

  useEffect(() => {
    if(anchorEl == null)
    {
      setOpenId(false)
      setOpenPass(false)
    }
  },[anchorEl])
  useEffect(() => {
    axios.get('https://api.ipify.org?format=json')
      .then(response => {
        // Handle the response data, which should contain the IP address
        Cookies.set('ip',response.data.ip)
      })
  },[])
  const handleIdChange = (event) => {
    setId(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleServerChange = (event,value) => {
    console.log(value)
    if(value == null) return;
    setServer(value.value)
    
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Add your login logic here
  };

  const onLogin = () => {
    var _id = id, _password = password;
    
    //https://mt5.mtapi.io/Connect?user=18002&password=DEMO12345&host=78.129.241.8&port=443
    axios.get(`https://mt5.mtapi.io/Connect?user=${_id}&password=${_password}&host=${servers[server].ip[0]}&port=443`)
        .then(response => {
            onSuccess(response.data,response.status,_id,_password)
        })
        .catch(err => {
            // Handle error
            console.log(err);
            axios.get(`https://mt5.mtapi.io/Connect?user=${_id}&password=${_password}&host=${servers[server].ip[1]}&port=443`)
                .then(response => {
                  onSuccess(response.data,response.status,_id,_password)
                })
                .catch(err => {
                    console.log(err)
                    onError(err);
                })
        });
  }
  const getOrderSymbols = async (token) => {
    var url = `https://mt5.mtapi.io/OpenedOrders?id=${token}&ascending=true`
    axios.get(url)
    .then(resp => {
      if(resp.status == 201 && resp.data.code == 'INVALID_TOKEN'){
        resetToken(() => getOrderSymbols(token));
      }
      else {
        //Cookies.set()
        console.log(resp.data)
        let _watchList = []
        resp.data.forEach(elem => {
          _watchList.push(elem.symbol)
        })
        console.log(_watchList.toString())
        Cookies.set('watchList',JSON.stringify(_watchList))
        Cookies.set("token", token, { expires: 7 })
        window.location.reload()
      }
    })
    //window.location.reload();
  }
  const onSuccess = (data,code,_id, _password) => {
    if(code == 201){
        alert('Authentication Error: '+data.code)
        console.log("ff",data)
    }
    else{
        console.log("ss",data)
        Cookies.set("id", _id.toString(), { expires: 7 })
        Cookies.set("password", _password.toString(), { expires: 7 })
        Cookies.set("server", server.toString(), { expires: 7 })    
        getOrderSymbols(data.toString())   
    }
  }
  const onError = (err) => {
    alert('Unkown Error Occured. The Server might have problem');
  }
  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
      <Card className={classes.card}>
        <CardContent>
          <form className={classes.form} onSubmit={handleSubmit}>
            <TextField
              label="ID"
              className={classes.textField}
              value={id}
                fullWidth={true}
                onChange={handleIdChange}
              onClick={handleClick}
              
              color={'white'}
            />
            <Popover
              id={id}
              open={openId}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              disableAutoFocus={true}
              disableEnforceFocus={true}
            >
              <Typography style={{ "padding": "10px" }} onClick={()=>{setId(Cookies.get('id')),setOpenId(false)}} >{Cookies.get('id')}</Typography>
            </Popover>
            <Popover
              id={id}
              open={openPassword}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              disableAutoFocus={true}
              disableEnforceFocus={true}
            >
              <Typography style={{ "padding": "10px" }} onClick={()=>{setPassword(Cookies.get('password')),setOpenPass(false)}} >••••••••••••••</Typography>
            </Popover>
            <TextField
              label="Password"
              className={classes.textField}
              type="password"
              value={password}
              onChange={handlePasswordChange}
                fullWidth={true}
                onFocus={(e)=>{console.log('onFocus'),handleClick(e)}}
              onBeforeInputCapture={()=>{console.log('onBeforeInputCapture')}}
              //onFocus={()=>{console.log('onFocus')}}
              onFocusCapture={()=>{console.log('onFocusCapture')}}
              onBeforeInput={()=>{console.log('onbeforeInput')}}
            />
            {/*<Select
              value={server}
              onChange={handleServerChange}
              className={classes.select}
              label="Server"
            >
                {
                    servers.map((element ,id) => <MenuItem value={id}>{element.name}</MenuItem>)
                }
              </Select>*/}

              <Autocomplete
                className='mt-3'
                disablePortal
                onChange={handleServerChange}
                id="server"
                options={servers.map((elem,index) => {return {"label":elem.name,"value":index}})}
                fullWidth={true}
                filterOptions={(x,y) => {
                  if(y.inputValue.length<3)
                    return []
                  return x.filter(elem => 
                    elem.label.toUpperCase().includes(y.inputValue.toUpperCase())
                  );
                }}
                renderInput={(params) => <TextField {...params} label="Server" />}
              />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={[classes.button]}
              onClick={onLogin}
            >
              Login
            </Button>

            
          </form>
        </CardContent>
      </Card>
    </Slide>
  );
};

export default Login;