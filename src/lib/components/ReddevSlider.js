import React from 'react';
import CustomSlider from './CustomSlider';
import { useState, useEffect, useRef } from "react";


function ReddevSlider(props) {
    const sliders = props.sliders;
    //state to manage all sliders
    const [currentSliderValue, setCurrentSliderValue] = useState(0);
    //state to track which slider is moved
    const [sliderIndex, setSliderIndex] = useState(0);
    //state to share slider value across all slider
    const [sliderValues, setSliderValues] = useState(props.sliderValues);
    //Manage only on updates to avoid intial load update
    const isInitialMount = useRef(true);

    const totalValue = 100;
  
    const logger = {
      log: function (msg) {
       if(props.debug) console.log(msg) 
      }
    }

    const handleChange = (sliderIndex, e) => {
      logger.log(`New value : ${e.target.value}`);
      setCurrentSliderValue(e.target.value);
      setSliderIndex(sliderIndex);
    }

    const handleChangeCommited = () => {
        logger.log(`final committed value : ${sliderValues.reduce((a,b)=>a+b, 0)}`);
    }
    
    useEffect(() => {
        setSliderValues(props.sliderValues);
    }, [props.sliderValues])
  
    useEffect(()=>{
      if(isInitialMount.current){
        isInitialMount.current = false;
      }else {
        logger.log(`Before moving silder, the values are ${sliderValues}`);
        let balanceAvailable = 0;
        let existingAllSliderArray = sliderValues;
        let existingSelectedSliderValue = existingAllSliderArray[sliderIndex];
        let difference = Math.abs(existingSelectedSliderValue - currentSliderValue);
        logger.log(`Difference btw previous and current value of the moved sliderIndex {${sliderIndex}}: ${existingSelectedSliderValue} - ${currentSliderValue} : ${difference}`)
        //Clone the existing slider values and only update the latest value of currently moved slider
        let newAllSliderArray = [...existingAllSliderArray];
        newAllSliderArray[sliderIndex] = currentSliderValue;
  
        //n - refers to the current sider
        //While increasing or decreasing first we need to affect the n+1, n+2 etc and then based on balance start from n-1, n-2 etc 
        //for that we need to calculate the available balance 
        //hence total till moved - totalValue, which will be available balance need to be allocate for n+1, n+2 etc
        let totalTillMoved = getTotal(newAllSliderArray, 0, Number(sliderIndex+1));
        balanceAvailable = (totalValue - totalTillMoved) > 0 ? (totalValue - totalTillMoved) : 0;
        logger.log(`Moved sliderIndex ${sliderIndex} \Total till moved ${totalTillMoved} \nBalanceAvailable = ${balanceAvailable} `)
        
        //Find total of sliderIndex+1 to n to calulate proposional value to +/- for each sliders
        let total = getTotal(existingAllSliderArray, Number(sliderIndex+1), existingAllSliderArray.length);
        logger.log(`Following sliders total to find the % to +/- silderIndex [${(sliderIndex)} to ${existingAllSliderArray.length-1}] = ${total}`)
        
        //Proposinally affect n+1 sliders
        newAllSliderArray = divideProposionally(newAllSliderArray, existingAllSliderArray, total, balanceAvailable, difference, false);

        //Check balance exists, if so affect n-1 to 0
        balanceAvailable = getTotal(newAllSliderArray, 0, newAllSliderArray.length);
        if(balanceAvailable !== totalValue){
         newAllSliderArray = affectAboveSliders(balanceAvailable, newAllSliderArray)
        }
        
        //Adjust the uncontrollable balance within the slider
        balanceAvailable = getTotal(newAllSliderArray, 0, newAllSliderArray.length);
        if(balanceAvailable !== totalValue){
          if(balanceAvailable > totalValue){
            newAllSliderArray[sliderIndex] = newAllSliderArray[sliderIndex] - (balanceAvailable - totalValue);
          }else{
            newAllSliderArray[sliderIndex] = newAllSliderArray[sliderIndex] + (totalValue - balanceAvailable);
          }
        }
        setSliderValues(newAllSliderArray);
      }
    }, [currentSliderValue, sliderIndex])
    
    
    const divideProposionally = (newAllSliderArray, existingAllSliderArray, total, balanceAvailable, difference, isLoop) => {
      let previousBalance = balanceAvailable;
      //Affect n+1 sliders proprsionally
      for(let i=sliderIndex+1;i<existingAllSliderArray.length;i++){
        if(total) {
          let minSliderValue = sliders[i].min;
          //If balanceAvailable is greater than the difference the calculate the proposional value based on difference
          //else calulate by balanceAvailable
          //whichever is lower
          if(balanceAvailable >= difference){
            let newValue = newAllSliderArray[i] - Number(Math.floor((existingAllSliderArray[i]/total) * difference));
            newAllSliderArray[i] = newValue > minSliderValue ? newValue : minSliderValue;
            logger.log(`balanceAvailable ${balanceAvailable} >= difference ${difference} hence proposional with differnce \n${newAllSliderArray[i]} - (${existingAllSliderArray[i]}/${total}) * ${difference} = ${newValue} or ${minSliderValue}`);
          }else{
            logger.log(`balanceAvailable ${balanceAvailable} < total ${total} hence proposional with balanceAvailable`);
            let newValue = (isLoop ? newAllSliderArray[i] : 0 ) + Number(Math.floor((existingAllSliderArray[i]/total) * balanceAvailable));
            newAllSliderArray[i] = newValue > minSliderValue ? newValue : minSliderValue;
            logger.log(`(${existingAllSliderArray[i]}/${total}) * ${balanceAvailable} = ${newValue} or ${minSliderValue}`);
          }
        }
      }
      //Check if still have balance and has to be adjusted
      balanceAvailable = totalValue - getTotal(newAllSliderArray, 0, newAllSliderArray.length);
      logger.log(`is Still balanceAvailable?: ${balanceAvailable}`)
      //Continue adjust when slider is not the last the function divideProposionally is start from n+1
      if(balanceAvailable > 0 && sliderIndex !== (newAllSliderArray.length -1)){
        //Small balance write-off to last slider
        if(balanceAvailable === 1){
          let lastSlider = existingAllSliderArray.length - 1;
          let newValue = newAllSliderArray[lastSlider]  + balanceAvailable;
          logger.log(`then adjusted to sliderIndex ${lastSlider} with existingValue + balanceAvailable = ${newAllSliderArray[lastSlider]} + ${balanceAvailable} = ${newAllSliderArray[lastSlider] + balanceAvailable} or min ${sliders[lastSlider].min}  `)
          newAllSliderArray[lastSlider] = newValue > sliders[lastSlider].min ? newValue : sliders[lastSlider].min;
          return newAllSliderArray;
        } 
        //more than $1 can be computed again until decent proposion
        if(balanceAvailable > 1){
          //break proposional functional on repeated value
          if(balanceAvailable === previousBalance){
            console.error(`Balance cannot be proposionally divided exit loop;`)
            return newAllSliderArray;
          }
          newAllSliderArray = divideProposionally(newAllSliderArray, newAllSliderArray, total, balanceAvailable, balanceAvailable+1, true);
        }
      }
      return newAllSliderArray;
    }
  
    const affectAboveSliders = (balanceAvailable, newAllSliderArray) => {
       //If total of latest change is more than 100 then decrease from i-1
       if(balanceAvailable > totalValue){
        logger.log(`Total of all sliders ${newAllSliderArray} = ${balanceAvailable} crossed the limit ${totalValue} hence decrease from i-1`); 
        let valueToBeDecreased = balanceAvailable - totalValue;
        //Decrease from i-1
        for(let i=sliderIndex-1;i>=0;i--){
          if((newAllSliderArray[i]-sliders[i].min) - valueToBeDecreased >= 0) {
            logger.log(`sliderIndex ${i} slider can accomodate the entire over limit value within itself ${newAllSliderArray[i]} - ${valueToBeDecreased} = ${newAllSliderArray[i] - valueToBeDecreased}`)
            let newValue = newAllSliderArray[i] - valueToBeDecreased;
            newAllSliderArray[i] = newValue > sliders[i].min ? newValue : sliders[i].min;
            //break if balance value can be adjusted within this slider, no need to go 
            break;
          }else{
            valueToBeDecreased = valueToBeDecreased - (newAllSliderArray[i]-sliders[i].min);
            newAllSliderArray[i] = sliders[i].min;
            logger.log(`Adjusted until min value ${sliders[i].min} in sliderIndex {${i}} and continue adjusting balance ${valueToBeDecreased} in sliderIndex {${i-1}}`)
          }
        }
      } else {
        logger.log(`Total of all sliders ${newAllSliderArray} = ${balanceAvailable} not reached the limit ${totalValue} hence increase from sliderIndex {${sliderIndex-1}} till sliderIndex {0}`); 
        //If total of latest change is less than 100 then increase from i-1
        let valueToBeIncreased = totalValue - balanceAvailable;
        //Increase from i-1 if sliderIndex is last slider
        if(sliderIndex === (newAllSliderArray.length -1)) {
          for(let i=sliderIndex-1;i>=0;i--){
            logger.log(`${newAllSliderArray[i]} + ${valueToBeIncreased} = ${newAllSliderArray[i] + valueToBeIncreased}`)
            if(newAllSliderArray[i] + valueToBeIncreased <= totalValue) {
              let newValue = newAllSliderArray[i] + valueToBeIncreased;
              newAllSliderArray[i] = newValue > sliders[i].min ? newValue : sliders[i].min;
              //break if balance value can be adjusted within this slider, no need to go further
              break;
            }
          }
        } 
      }
      return newAllSliderArray
    }
  
    const getTotal = (list, start, end) => {
      return list.slice(start,end).reduce((a,b)=>a+b,0)
    }
    
    return ( 
        <div>
               {sliders.map((eachSlider, index) => {
                      return (
                        <CustomSlider key={index}  
                            min={eachSlider.min} 
                            color={eachSlider.color} 
                            sno={index}
                            value={sliderValues[index] === undefined ? eachSlider.defaultValue : sliderValues[index]} 
                            handleChange={props.handleChange ? props.handleChange.bind(this,index) : handleChange.bind(this,index)} 
                            handleChangeCommited={props.handleChangeCommited ? props.handleChangeCommited : handleChangeCommited}/>    
                      )
                      
                    })
                }
        </div> 
      );
}

export default ReddevSlider;