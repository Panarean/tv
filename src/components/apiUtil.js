import axios from "axios";
import Cookies from 'js-cookie'
import servers from '../config/servers'
export const resetToken = async (callback = undefined) => {
    const tokenLoading = Cookies.get('tokenLoading')
    if(tokenLoading == '1'){
      if(callback != undefined){
        callback();
      }
      return;
    }
    if(tokenLoading == undefined || tokenLoading == '0')
      Cookies.set('tokenLoading','1');
    const id = Cookies.get('id');
    const password = Cookies.get('password');
    const server = Cookies.get('server');

    console.log('tokenResetting')
    await axios.get(`http://mt5.mtapi.io/Connect?user=${id}&password=${password}&host=${servers[server].ip[0]}&port=443`)
          .then(response => {
            if(response.status==200 ){
              Cookies.set('token',response.data)
              
            }
            Cookies.set('tokenLoading',0)
          })
    if(callback != undefined){
      callback();
    }
    /*if(tokenLoading == undefined || tokenLoading == '0')
      Cookies.set('tokenLoading','0');*/
    console.log('token reset ' + Cookies.get('token'))
}
export const date2UTC = (date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is zero-based, so adding 1 and padding with zeros if necessary
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  return formattedDate;
}

export const closeOrder = async (ticket,callback = undefined) => {
  var url = `https://mt5.mtapi.io/OrderClose?id=${Cookies.get('token')}&ticket=${ticket}&comment=${Cookies.get('ip')}`
    await axios.get(url)
      .then(resp => {
        if(resp.status == 201 && resp.data.code == 'INVALID_TOKEN'){
          resetToken(() => closeOrder(ticket));
        }
        else if (resp.status == 200){
          console.log('success',resp.data)
          if(callback != undefined)
            callback();
        }
        else{
            console.log(resp.data)
            alert(resp.data.message)
        }
      })
      .catch(error => {
        console.log('error',error)
        
      })
}