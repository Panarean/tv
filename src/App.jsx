import React , { useState,useEffect} from 'react'
import './App.css'
import LoginPage from './components/login'
import ChartElement from './components/chartelement'
import CommodityList from './components/commodityList'
import MainPage from './components/main'
import Cookies from 'js-cookie'
import { Container, Row,Col, Image } from 'react-bootstrap'
import Colors from './config/colors'
import { createTheme,ThemeProvider } from "@material-ui/core/styles"
import { Box } from '@mui/material'
import servers from './config/servers'
import {Brightness4 ,Brightness7, ExitToApp} from '@material-ui/icons'
import { IconButton, Typography } from '@material-ui/core'


function App() {
  var content;

  useEffect( () => {
    Cookies.set('tokenLoading',0)
  }, [] )



  if(Cookies.get('colorMode') == undefined){
    Cookies.set('colorMode',"dark")
  }
  if(Cookies.get("token")) {
    content =  (
      <>
        <MainPage/>
      </>
    )
  }
  else {
    content =  (
      <LoginPage/>
    )
  }
  const [mode,setMode] = useState(false)
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          type:Cookies.get('colorMode'),
        },
      }),
    [mode],
  );
  const handleLogOut = () => {
    Cookies.remove('token')
    window.location.reload();
  };

  return (
    <ThemeProvider theme={theme}>
      <Container style={{"margin":"0px","padding":"0px", minWidth:"100vw","minHeight":"100vh","backgroundColor":Colors[Cookies.get('colorMode')].backgroundColor,"color":Colors[Cookies.get('colorMode')].color}}>
      {
        Cookies.get('token') ? (
          <>
          <Row style={{margin:'0px',paddingLeft:'20px', paddingRight:'10px' }} >
            <Box style={{width:"100%",padding:'10px'}} className={'d-flex flex-row align-items-center'}>
                <Image src={servers[Cookies.get('server')].image} />
                <Typography variant='h5'>{servers[Cookies.get('server')].name}</Typography>
                <Box className='flex-grow-1' />
                <IconButton sx={{ ml: 1 }} onClick={()=>{
                  Cookies.get('colorMode') =='dark' ? Cookies.set('colorMode','light'):Cookies.set('colorMode','dark'); 
                  setMode((prev) => !prev)
                  }} color="inherit">
                  {Cookies.get('colorMode') === 'dark' ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
                <IconButton color="inherit" onClick={handleLogOut}>
                  <ExitToApp />
                </IconButton>
                </Box>
          
          </Row>
          </>
        ) : ( 
          <Row style={{height:"50px",margin:'0px'}} >
            <Box style={{width:"100%",}} className={'d-flex flex-row'}>
                <Box className='flex-grow-1' />
                <IconButton sx={{ ml: 1 }} onClick={()=>{
                  Cookies.get('colorMode') =='dark' ? Cookies.set('colorMode','light'):Cookies.set('colorMode','dark'); 
                  setMode((prev) => !prev)
                  }} color="inherit">
                  {Cookies.get('colorMode') === 'dark' ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
                
              </Box>
          
          </Row>
        )
      }
            
            
        <Row style={{margin:'0px' }}>
            {content}
            </Row>
      </Container>
    </ThemeProvider>
  )
}

export default App
