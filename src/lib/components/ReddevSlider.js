import React from 'react';
import CustomSlider from './CustomSlider';


class ReddevSlider extends React.Component {
    constructor(props) {
        super(props);
        console.log(props);
    }
    render() {
        return(
            <div>
                {this.props.sliders.map((eachSlider, index) => {
                    return (
                    <CustomSlider key={index} color={eachSlider.color} value={this.props.sliderValues[index] === undefined ? 0 : this.props.sliderValues[index]} defaultValue={eachSlider.defaultValue} handleChange={this.props.onChange.bind(this,index)} />    
                    )
                })
            }
          </div>
        )
    };
};


export default ReddevSlider;