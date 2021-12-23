### Usage

```
npm i reddev-slider
```
handleChange is optional, which kept default reddev logic of distribution
Overwrite handleChange event like below to manage custom distribution

```
import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import { ReddevSlider } from 'reddev-slider';

//configure sliderValues

const sliders = [{
  name: "TNC",
  color: "primary",
  defaultValue: 40,
  min: 10
},{
  name: "Artist",
  color: "secondary",
  defaultValue: 30,
  min: 5
},{
  name: "Reddev",
  color: "primary",
  defaultValue: 20,
  min: 3
},{
  name: "Seller",
  color: "secondary",
  defaultValue: 10,
  min: 1
}]

function App() {
  //state to initialize the values of the slider
  const [sliderValues, setSliderValues] = useState(sliders.map((s) => s.defaultValue));
  const [sliderValues2, setSliderValues2] = useState(sliders.map((s) => s.defaultValue));
  //onChange event to handle custom distribution
  const handleChange = (index, e) => {
    let updatedSlider = [...sliderValues];
    updatedSlider[index] = e.target.value
    setSliderValues(updatedSlider);
  }

  return ( 
      <div className = "App">
        <div className="cont">
          <div className="sliders">
            <div> Reddev Distirbution </div>
            <ReddevSlider sliders={sliders} sliderValues={sliderValues2} />
            <div> Custom Distribution</div>
            <ReddevSlider sliders={sliders} sliderValues={sliderValues} handleChange={handleChange} />
          </div>
        </div>
      </div> 
    );
}

export default App;

```