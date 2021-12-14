import React from 'react';
import './App.css';
import ReddevSlider from './lib/components/ReddevSlider';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@emotion/react';
import { useState, useEffect, useRef } from "react";



const theme = createTheme({
  status: {
    danger: '#e53e3e',
  },
  palette: {
    red: {
      main: '#F46534',
      darker: '#053e85',
    },
  },
});

//configure sliderValues

const sliders = [{
  name: "TNC",
  color: "primary",
  defaultValue: 40,
},{
  name: "Artist",
  color: "secondary",
  defaultValue: 30,
},{
  name: "Reddev",
  color: "primary",
  defaultValue: 20,
},{
  name: "Seller",
  color: "secondary",
  defaultValue: 10,
}]

function App() {

  //state to manage all sliders
  const [value, setValue] = useState(0);
  //state to track which sliderValues is moved
  const [sno, setSno] = useState(0);
  //state to share sliderValues value across all sliderValues
  const [sliderValues, setSlider] = useState([40,30,20,10]);
  //Manage only on updates to avoid intial load update
  const isInitialMount = useRef(true);

  const handleChange = (sno, e) => {
    console.log(e.target.value);
    setValue(e.target.value);
    setSno(sno);
  }

  useEffect(()=>{
    if(isInitialMount.current){
      isInitialMount.current = false;
    }else {
      console.log(`Existing all silder ${sliderValues}`);
      let existingAllSliderArray = sliderValues;
      let existingSelectedSliderValue = existingAllSliderArray[sno];
      let difference = Math.abs(existingSelectedSliderValue - value);
      //Below sliderValues
      let newAllSliderArray = [];
      newAllSliderArray[sno] = value;
      let total = existingAllSliderArray.slice(Number(sno+1), (existingAllSliderArray.length)).reduce((a,b)=>a+b,0);
      for(let i=sno+1;i<existingAllSliderArray.length;i++){
        if(total) {
          newAllSliderArray[i] = Number(Math.floor((existingAllSliderArray[i]/total) * difference));
        }
      }
      setSlider(newAllSliderArray);

      console.log(`Existing selected sliderValues ${existingSelectedSliderValue}`);
      console.log(`Difference ${difference}`);
      console.log(`Total ${total} `);
      console.log(`Final of all sliderValues ${newAllSliderArray}`);
    }
  }, [value])
  
  
  
  return ( 
      <div className = "App">
        <div className="cont">
          <div className="sliders">
            <ThemeProvider theme={theme}>
              <ReddevSlider sliders={sliders} onChange={handleChange} sliderValues={sliderValues} />
            </ThemeProvider>
          </div>
        </div>
      </div> 
    );
}

export default App;
