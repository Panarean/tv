import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Grid } from '@material-ui/core';
import {Flex, Box, calc} from '@chakra-ui/react'
import { Container as BootstrapContainer, Row, Col } from 'react-bootstrap';
import TradingViewWidget, { Themes } from 'react-tradingview-widget';
import AccountInfo from './AccountInfo';

import CommodityList from './commodityList';
import Cookies from 'js-cookie'

import OrderInfos from './orderInfos';
import { useState } from 'react';
import { Timer } from './Timer';
const useStyles = makeStyles((theme) => ({
    container : {
        margin : '0px auto',
        flexGrow: 1
    },
    fixedHeight : {
        height:'500px'
    },
    customSlider: {
        '&::-webkit-scrollbar': {
          width: 5,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#888',
        },
      },
    cols: {
        padding: '15px'
    }
}));

function MainPage() {
  const classes = useStyles();
  
  return (
    <Flex flex={1} margin='0px auto'>
      
      <BootstrapContainer className={[classes.container]}>
        <Row className='mb-2 mt-5'>
              <AccountInfo />
        </Row>
        <Row>
          <Col sm={12} md={6} lg={6} className={[classes.fixedHeight,classes.cols, 'd-flex flex-column p']}>
            
            <Row className={[classes.customSlider,'flex-grow-1']} style={{'overflowY':'auto'}}>
              <CommodityList />
            </Row>
          </Col>
          <Col sm={12} md={6} lg={6} className={['mt-3 ',classes.cols]} style={{'minHeight':'400px'}}>
            <TradingViewWidget 
              symbol="USOIL"
              autosize
              theme={Cookies.get('colorMode')=='dark'?Themes.DARK:Themes.LIGHT}
            />
          </Col>
        </Row>
        <Row className='mt-4 mb-5'>
          <OrderInfos />
        </Row>
      </BootstrapContainer>
    </Flex>
  );
}

export default MainPage;