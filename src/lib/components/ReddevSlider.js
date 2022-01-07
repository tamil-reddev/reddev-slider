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
        logger.log(`final committed value : ${sliderValues}`);
    }
    
    useEffect(() => {
        setSliderValues(props.sliderValues);
    }, [props.sliderValues])
  
    useEffect(()=>{
      if(isInitialMount.current){
        isInitialMount.current = false;
      }else {
        logger.log(`Before moving silder value ${sliderValues}`);
        let totalValue = 100;
        let balanceAvailable = 0;
        let existingAllSliderArray = sliderValues;
        let existingSelectedSliderValue = existingAllSliderArray[sliderIndex];
        let difference = Math.abs(existingSelectedSliderValue - currentSliderValue);
        logger.log(`Difference btw last and current value of moved sliderIndex ${sliderIndex}, ${existingSelectedSliderValue} - ${currentSliderValue} : ${difference}`)
        //Below slider
        let newAllSliderArray = [...existingAllSliderArray];
        newAllSliderArray[sliderIndex] = currentSliderValue;
  
        //Find total of top sliders
        if(sliderIndex > 0) {
          let totalOfTopSliders = getTotal(newAllSliderArray, 0, Number(sliderIndex+1));
          balanceAvailable = (totalValue - totalOfTopSliders) > 0 ? (totalValue - totalOfTopSliders) : 0;
          logger.log(`Moved sliderIndex ${sliderIndex} \nTotalOfTopSliders including from moved ${totalOfTopSliders} \nBalanceAvailable = ${balanceAvailable} `)
        }else{
          balanceAvailable = totalValue - currentSliderValue;
          logger.log(`Moved sliderIndex ${sliderIndex} \nThere is no top Sliders hence balanceAvailable : ${totalValue} - ${currentSliderValue} = ${balanceAvailable} `)
        }
        let total = getTotal(existingAllSliderArray, Number(sliderIndex+1), existingAllSliderArray.length);
        logger.log(`Following sliders total to find the % to +/- silderIndex [${(sliderIndex)} to ${existingAllSliderArray.length-1}] = ${total}`)
        
        newAllSliderArray = divideProposionally(newAllSliderArray, existingAllSliderArray, total, balanceAvailable, difference, false);
        
        let totalOfNew = getTotal(newAllSliderArray, 0, newAllSliderArray.length);
        logger.log(`Total after affecting below sliders ${newAllSliderArray} = ${totalOfNew}`);
        let balanceAvailableNew = totalValue - totalOfNew;
        logger.log(`is Still balanceAvailable?: ${balanceAvailableNew}`)
        //Adjust the balance to the last slider only when the slider is moved is not current
        if(balanceAvailableNew > 0 && sliderIndex !== (newAllSliderArray.length -1)){
          //TO-DO i check in while  loopneed to be removed as for now added for browser hanging when unconditional infinity loop
          let i = 1;
          while(balanceAvailableNew > 1){
            i++;
            newAllSliderArray = divideProposionally(newAllSliderArray, existingAllSliderArray, total, balanceAvailableNew, balanceAvailableNew+1, true);
            existingAllSliderArray = [...newAllSliderArray];
            logger.log(existingAllSliderArray);
            balanceAvailableNew = totalValue - getTotal(newAllSliderArray, 0, newAllSliderArray.length);
            if(i > 1001){
              console.error(`While loop reached infinity exit;`)
              break;
            }
          }
          
          if(balanceAvailableNew > 0 && (sliderIndex !== (existingAllSliderArray.length - 1))){
            let lastSlider = existingAllSliderArray.length - 1;
            let newValue = newAllSliderArray[lastSlider]  + balanceAvailableNew;
            logger.log(`then adjusted to sliderIndex ${lastSlider} with existingValue + balanceAvailable = ${newAllSliderArray[lastSlider]} + ${balanceAvailableNew} = ${newAllSliderArray[lastSlider] + balanceAvailableNew} or min ${sliders[lastSlider].min}  `)
            newAllSliderArray[lastSlider] = newValue > sliders[lastSlider].min ? newValue : sliders[lastSlider].min;
          } 
        }
        
        
        let latestTotalOfAllSliders = getTotal(newAllSliderArray, 0, newAllSliderArray.length);
        if(latestTotalOfAllSliders !== totalValue){
          //If total of latest change is more than 100 then decrease from i-1
          if(latestTotalOfAllSliders > totalValue){
            logger.log(`Total of all sliders ${newAllSliderArray} = ${latestTotalOfAllSliders} crossed the limit ${totalValue} hence decrease from i-1`); 
            let valueToBeDecreased = latestTotalOfAllSliders - totalValue;
            //Decrease from i-1
            for(let i=sliderIndex-1;i>=0;i--){
              if((newAllSliderArray[i]-sliders[i].min) - valueToBeDecreased >= 0) {
                logger.log(`Above slider can accomodate the entire over limit value itself ${newAllSliderArray[i]} - ${valueToBeDecreased} = ${newAllSliderArray[i] - valueToBeDecreased} or min ${sliders[i].min}`)
                let newValue = newAllSliderArray[i] - valueToBeDecreased;
                newAllSliderArray[i] = newValue > sliders[i].min ? newValue : sliders[i].min;
                //break if balance value can be adjusted within this slider, no need to go 
                break;
              }else{
                valueToBeDecreased = valueToBeDecreased - (newAllSliderArray[i]-sliders[i].min);
                newAllSliderArray[i] = sliders[i].min;
                logger.log(`Adjusted until min value ${sliders[i].min} and continue adjusting balance ${valueToBeDecreased} i-1`)
              }
            }
          } else {
            logger.log(`Total of all sliders ${newAllSliderArray} = ${latestTotalOfAllSliders} not reached the limit ${totalValue} hence increase from i-1 only sliderIndex is last`); 
            //If total of latest change is less than 100 then increase from i-1
            let valueToBeIncreased = totalValue - latestTotalOfAllSliders;
            //Increase from i-1 if sliderIndex is last slider
            if(sliderIndex === (existingAllSliderArray.length -1)) {
              for(let i=sliderIndex-1;i>=0;i--){
                logger.log(`${newAllSliderArray[i]} + ${valueToBeIncreased} = ${newAllSliderArray[i] + valueToBeIncreased}`)
                if(newAllSliderArray[i] + valueToBeIncreased <= totalValue) {
                  let newValue = newAllSliderArray[i] + valueToBeIncreased;
                  newAllSliderArray[i] = newValue > sliders[i].min ? newValue : sliders[i].min;
                  //break if balance value can be adjusted within this slider, no need to go further
                  break;
                }
              }
            } else {
  
            }
          }
        }
        
        //Adjust the slider not to reach more than min of all other sliders
        latestTotalOfAllSliders = getTotal(newAllSliderArray, 0, newAllSliderArray.length);
        if(latestTotalOfAllSliders > totalValue){
          newAllSliderArray[sliderIndex] = newAllSliderArray[sliderIndex] - (latestTotalOfAllSliders - totalValue);
        }
        setSliderValues(newAllSliderArray);
      }
    }, [currentSliderValue, sliderIndex])
    
    
    const divideProposionally = (newAllSliderArray, existingAllSliderArray, total, balanceAvailable, difference, isLoop) => {
      for(let i=sliderIndex+1;i<existingAllSliderArray.length;i++){
        if(total) {
          let minSliderValue = sliders[i].min;
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
      return newAllSliderArray;
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