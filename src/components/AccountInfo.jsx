import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap'
import axios from 'axios';

import Cookies from 'js-cookie'
import { resetToken } from './apiUtil';

import { useEffect } from 'react';

function AccountInfo() {
  const [expanded, setExpanded] = useState(false);
  const [acInfo,setAcInfo] = useState({})
  const getAccountInfo = () => {
    var url = `https://mt5.mtapi.io/AccountSummary?id=${Cookies.get('token')}`
       
    axios.get(url)
    .then(resp => {
      if(resp.status == 201 && resp.data.code == 'INVALID_TOKEN'){
        resetToken(() => getAccountInfo());
      }
      else if (resp.status == 200){
        setAcInfo(resp.data)
        var s= Object.keys(resp.data).map((key) => {
          return ''+key+resp.data[key]
        })
      }
    })
    .catch(err=>console.log(err))
  }

  


  

  useEffect(() => {
    getAccountInfo();
    const timer = setInterval(() => {
      getAccountInfo();
    }, 1000);
    return () => {
      clearInterval(timer);
    }
  },[])

  if(acInfo.balance)
    return (
      <Container>
        <Row>
          <Col className='flex-grow-1'>
            <Row style={{"fontWeight":"bold", 'color':'text.primary'}}>
              <Col className='mb-2'> Balance: {acInfo.balance.toFixed(2)} </Col>
              <Col className='mb-2'> Equity: {acInfo.equity.toFixed(2)} </Col>
              <Col className='mb-2'> Credit: {acInfo.credit.toFixed(2)} </Col>
              <Col className='mb-2'> Profit: {acInfo.profit.toFixed(2)} </Col>
              <Col className='mb-2'> Margin: {acInfo.margin.toFixed(2)} </Col>
              <Col className='mb-2'> FreeMargin: {acInfo.freeMargin.toFixed(2)} </Col>
              <Col className='mb-2'> Marginlevel: {acInfo.marginLevel.toFixed(2)} </Col>
            </Row>
          </Col>
          
        </Row>
      </Container>
    );
  else{
    return (<></>)
  }
}

export default AccountInfo;