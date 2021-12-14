import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import ReddevSlider from './lib/components/ReddevSlider';



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
  //state to share sliderValues value across all sliderValues
  const [sliderValues, setSlider] = useState([40,30,20,10]);

  const handleChange = (index, e) => {
    let updatedSlider = [...sliderValues];
    updatedSlider[index] = e.target.value
    setSlider(updatedSlider);
  }

  return ( 
      <div className = "App">
        <div className="cont">
          <div className="sliders">
              <ReddevSlider sliders={sliders} onChange={handleChange} sliderValues={sliderValues} />
          </div>
        </div>
      </div> 
    );
}

export default App;
