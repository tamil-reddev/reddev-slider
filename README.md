### Usage

```
npm i reddev-slider
```

```
import React, { useState } from 'react';
import  { ReddevSlider } from 'reddev-slider';
import './App.css';

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

// slider values

function App() {

  const [sliderValues, setSlider] = useState([40,30,20,10]);

  const handleChange = (index, e) => {
    let updatedSlider = [...sliderValues];
    updatedSlider[index] = e.target.value
    setSlider(updatedSlider);
  }

  return ( 
      <div className = "App">
        <ReddevSlider sliders={sliders} onChange={handleChange} sliderValues={sliderValues} />
      </div> 
    );
}

export default App;
```