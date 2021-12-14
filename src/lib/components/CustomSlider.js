import React from 'react';
import Slider from '@mui/material/Slider';


class CustomSlider extends React.Component {
    constructor(props) {
        super(props);
        console.log(props);
    }
    render() {
        return <div>
            <Slider className="slider" 
                color={this.props.color} 
                sno={this.props.sno} 
                value={this.props.value} 
                defaultValue={this.props.default} 
                onChange={this.props.handleChange} 
                aria-label="Default" 
                valueLabelDisplay="auto" />
              
        </div>;
    };
};


export default CustomSlider;