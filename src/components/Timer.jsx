import { useState, useEffect } from "react";
export function Timer(props) {
    const [duration, setDuration] = useState(10);
    const func= () =>{
        
        setDuration(duration -1);
        
        setTimeout(func,1000)
    }
    useEffect(() => {
   
        func();
  
      
    }, []);
  

  
    return (
      <>
         <h3>{duration}</h3>
      </>
    );
  }