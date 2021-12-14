### Usage

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

// slider values
const [sliderValues, setSlider] = useState([40,30,20,10]);