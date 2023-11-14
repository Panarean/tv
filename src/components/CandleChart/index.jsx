import PropTypes from "prop-types";
import React, {useEffect,useState} from 'react';
import Chart from './Chart';
import axios from 'axios';
import Cookies from 'js-cookie'
import {resetToken} from '../apiUtil'
const  ChartComponent = (props) => {
	const[data, setData] = useState(undefined)
	const date2UTC = (date) => {
		const year = date.getUTCFullYear();
		const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is zero-based, so adding 1 and padding with zeros if necessary
		const day = String(date.getUTCDate()).padStart(2, '0');
		const hours = String(date.getUTCHours()).padStart(2, '0');
		const minutes = String(date.getUTCMinutes()).padStart(2, '0');
		const seconds = String(date.getUTCSeconds()).padStart(2, '0');

		const formattedDate = `${year}-${month}-${day}T${hours}%3A${minutes}%3A${seconds}`;
		return formattedDate;
	}
	useEffect(()=> {
		/*getData().then(data => {
			console.log(data)
			this.setState({ data })
		})*/
		updateData();
	},[])
	const updateData = () => {
		const token = Cookies.get('token')
		const currentDate = new Date();
		var millisecondsToSubtract = props.interval*60 *1000* 3000;
		const timeBefore = new Date(currentDate.getTime() - millisecondsToSubtract);			
		var url=`https://mt5.mtapi.io/PriceHistory?id=${token}&symbol=${props.symbol}&from=${encodeURIComponent(date2UTC(timeBefore))}&to=${encodeURIComponent(date2UTC(currentDate))}&timeFrame=${props.interval}`
		
		axios.get(url).then(response => {
			if(response.status == 200){
				console.log(response.data)
				setData(response.data.map(elem => {
					return {
						date:new Date(elem.time),
						open:elem.openPrice,
						high: elem.highPrice,
						low : elem.lowPrice,
						close : elem.closePrice,
						volume : elem.volume
					}
				}))
			}
			else if(response.status == 201 && response.data.code == 'INVALID_TOKEN'){
				
				resetToken();
			}
		})
	}
	if (data == undefined) {
		return (
			<div>Loading...
				<button onClick={updateData} >aa</button>
			</div>
		)
	}
	return (
		<div className="asdfasdf">
			<Chart  data={data} />
			
		</div>
	)
}

export default ChartComponent