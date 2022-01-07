import React from 'react';
import Slider from '@mui/material/Slider';


class CustomSlider extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <div>
            <Slider className="slider" 
                color={this.props.color} 
                sno={this.props.sno} 
                min = {this.props.min} 
                value={this.props.value} 
                defaultValue={this.props.defaultValue} 
                onChange={this.props.handleChange} 
                onChangeCommitted={this.props.handleChangeCommited} 
                aria-label="Default" 
                valueLabelDisplay="auto" />
              
        </div>;
    };
};


export default CustomSlider;