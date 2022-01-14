"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.array.reduce.js");

var _react = _interopRequireWildcard(require("react"));

var _CustomSlider = _interopRequireDefault(require("./CustomSlider"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ReddevSlider(props) {
  const sliders = props.sliders; //state to manage all sliders

  const [currentSliderValue, setCurrentSliderValue] = (0, _react.useState)(0); //state to track which slider is moved

  const [sliderIndex, setSliderIndex] = (0, _react.useState)(0); //state to share slider value across all slider

  const [sliderValues, setSliderValues] = (0, _react.useState)(props.sliderValues); //Manage only on updates to avoid intial load update

  const isInitialMount = (0, _react.useRef)(true);
  const totalValue = 100;
  const logger = {
    log: function log(msg) {
      if (props.debug) console.log(msg);
    }
  };

  const handleChange = (sliderIndex, e) => {
    logger.log("New value : ".concat(e.target.value));
    setCurrentSliderValue(e.target.value);
    setSliderIndex(sliderIndex);
  };

  const handleChangeCommited = () => {
    logger.log("final committed value : ".concat(sliderValues.reduce((a, b) => a + b, 0)));
  };

  (0, _react.useEffect)(() => {
    setSliderValues(props.sliderValues);
  }, [props.sliderValues]);
  (0, _react.useEffect)(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      logger.log("Before moving silder, the values are ".concat(sliderValues));
      let balanceAvailable = 0;
      let existingAllSliderArray = sliderValues;
      let existingSelectedSliderValue = existingAllSliderArray[sliderIndex];
      let difference = Math.abs(existingSelectedSliderValue - currentSliderValue);
      logger.log("Difference btw previous and current value of the moved sliderIndex {".concat(sliderIndex, "}: ").concat(existingSelectedSliderValue, " - ").concat(currentSliderValue, " : ").concat(difference)); //Clone the existing slider values and only update the latest value of currently moved slider

      let newAllSliderArray = [...existingAllSliderArray];
      newAllSliderArray[sliderIndex] = currentSliderValue; //n - refers to the current sider
      //While increasing or decreasing first we need to affect the n+1, n+2 etc and then based on balance start from n-1, n-2 etc 
      //for that we need to calculate the available balance 
      //hence total till moved - totalValue, which will be available balance need to be allocate for n+1, n+2 etc

      let totalTillMoved = getTotal(newAllSliderArray, 0, Number(sliderIndex + 1));
      balanceAvailable = totalValue - totalTillMoved > 0 ? totalValue - totalTillMoved : 0;
      logger.log("Moved sliderIndex ".concat(sliderIndex, " Total till moved ").concat(totalTillMoved, " \nBalanceAvailable = ").concat(balanceAvailable, " ")); //Find total of sliderIndex+1 to n to calulate proposional value to +/- for each sliders

      let total = getTotal(existingAllSliderArray, Number(sliderIndex + 1), existingAllSliderArray.length);
      logger.log("Following sliders total to find the % to +/- silderIndex [".concat(sliderIndex, " to ").concat(existingAllSliderArray.length - 1, "] = ").concat(total)); //Proposinally affect n+1 sliders

      newAllSliderArray = divideProposionally(newAllSliderArray, existingAllSliderArray, total, balanceAvailable, difference, false); //Check balance exists, if so affect n-1 to 0

      balanceAvailable = getTotal(newAllSliderArray, 0, newAllSliderArray.length);

      if (balanceAvailable !== totalValue) {
        newAllSliderArray = affectAboveSliders(balanceAvailable, newAllSliderArray);
      } //Adjust the uncontrollable balance within the slider


      balanceAvailable = getTotal(newAllSliderArray, 0, newAllSliderArray.length);

      if (balanceAvailable !== totalValue) {
        if (balanceAvailable > totalValue) {
          newAllSliderArray[sliderIndex] = newAllSliderArray[sliderIndex] - (balanceAvailable - totalValue);
        } else {
          newAllSliderArray[sliderIndex] = newAllSliderArray[sliderIndex] + (totalValue - balanceAvailable);
        }
      }

      setSliderValues(newAllSliderArray);
    }
  }, [currentSliderValue, sliderIndex]);

  const divideProposionally = (newAllSliderArray, existingAllSliderArray, total, balanceAvailable, difference, isLoop) => {
    let previousBalance = balanceAvailable; //Affect n+1 sliders proprsionally

    for (let i = sliderIndex + 1; i < existingAllSliderArray.length; i++) {
      if (total) {
        let minSliderValue = sliders[i].min; //If balanceAvailable is greater than the difference the calculate the proposional value based on difference
        //else calulate by balanceAvailable
        //whichever is lower

        if (balanceAvailable >= difference) {
          let newValue = newAllSliderArray[i] - Number(Math.floor(existingAllSliderArray[i] / total * difference));
          newAllSliderArray[i] = newValue > minSliderValue ? newValue : minSliderValue;
          logger.log("balanceAvailable ".concat(balanceAvailable, " >= difference ").concat(difference, " hence proposional with differnce \n").concat(newAllSliderArray[i], " - (").concat(existingAllSliderArray[i], "/").concat(total, ") * ").concat(difference, " = ").concat(newValue, " or ").concat(minSliderValue));
        } else {
          logger.log("balanceAvailable ".concat(balanceAvailable, " < total ").concat(total, " hence proposional with balanceAvailable"));
          let newValue = (isLoop ? newAllSliderArray[i] : 0) + Number(Math.floor(existingAllSliderArray[i] / total * balanceAvailable));
          newAllSliderArray[i] = newValue > minSliderValue ? newValue : minSliderValue;
          logger.log("(".concat(existingAllSliderArray[i], "/").concat(total, ") * ").concat(balanceAvailable, " = ").concat(newValue, " or ").concat(minSliderValue));
        }
      }
    } //Check if still have balance and has to be adjusted


    balanceAvailable = totalValue - getTotal(newAllSliderArray, 0, newAllSliderArray.length);
    logger.log("is Still balanceAvailable?: ".concat(balanceAvailable)); //Continue adjust when slider is not the last the function divideProposionally is start from n+1

    if (balanceAvailable > 0 && sliderIndex !== newAllSliderArray.length - 1) {
      //Small balance write-off to last slider
      if (balanceAvailable === 1) {
        let lastSlider = existingAllSliderArray.length - 1;
        let newValue = newAllSliderArray[lastSlider] + balanceAvailable;
        logger.log("then adjusted to sliderIndex ".concat(lastSlider, " with existingValue + balanceAvailable = ").concat(newAllSliderArray[lastSlider], " + ").concat(balanceAvailable, " = ").concat(newAllSliderArray[lastSlider] + balanceAvailable, " or min ").concat(sliders[lastSlider].min, "  "));
        newAllSliderArray[lastSlider] = newValue > sliders[lastSlider].min ? newValue : sliders[lastSlider].min;
        return newAllSliderArray;
      } //more than $1 can be computed again until decent proposion


      if (balanceAvailable > 1) {
        //break proposional functional on repeated value
        if (balanceAvailable === previousBalance) {
          console.error("Balance cannot be proposionally divided exit loop;");
          return newAllSliderArray;
        }

        newAllSliderArray = divideProposionally(newAllSliderArray, newAllSliderArray, total, balanceAvailable, balanceAvailable + 1, true);
      }
    }

    return newAllSliderArray;
  };

  const affectAboveSliders = (balanceAvailable, newAllSliderArray) => {
    //If total of latest change is more than 100 then decrease from i-1
    if (balanceAvailable > totalValue) {
      logger.log("Total of all sliders ".concat(newAllSliderArray, " = ").concat(balanceAvailable, " crossed the limit ").concat(totalValue, " hence decrease from i-1"));
      let valueToBeDecreased = balanceAvailable - totalValue; //Decrease from i-1

      for (let i = sliderIndex - 1; i >= 0; i--) {
        if (newAllSliderArray[i] - sliders[i].min - valueToBeDecreased >= 0) {
          logger.log("sliderIndex ".concat(i, " slider can accomodate the entire over limit value within itself ").concat(newAllSliderArray[i], " - ").concat(valueToBeDecreased, " = ").concat(newAllSliderArray[i] - valueToBeDecreased));
          let newValue = newAllSliderArray[i] - valueToBeDecreased;
          newAllSliderArray[i] = newValue > sliders[i].min ? newValue : sliders[i].min; //break if balance value can be adjusted within this slider, no need to go 

          break;
        } else {
          valueToBeDecreased = valueToBeDecreased - (newAllSliderArray[i] - sliders[i].min);
          newAllSliderArray[i] = sliders[i].min;
          logger.log("Adjusted until min value ".concat(sliders[i].min, " in sliderIndex {").concat(i, "} and continue adjusting balance ").concat(valueToBeDecreased, " in sliderIndex {").concat(i - 1, "}"));
        }
      }
    } else {
      logger.log("Total of all sliders ".concat(newAllSliderArray, " = ").concat(balanceAvailable, " not reached the limit ").concat(totalValue, " hence increase from sliderIndex {").concat(sliderIndex - 1, "} till sliderIndex {0}")); //If total of latest change is less than 100 then increase from i-1

      let valueToBeIncreased = totalValue - balanceAvailable; //Increase from i-1 if sliderIndex is last slider

      if (sliderIndex === newAllSliderArray.length - 1) {
        for (let i = sliderIndex - 1; i >= 0; i--) {
          logger.log("".concat(newAllSliderArray[i], " + ").concat(valueToBeIncreased, " = ").concat(newAllSliderArray[i] + valueToBeIncreased));

          if (newAllSliderArray[i] + valueToBeIncreased <= totalValue) {
            let newValue = newAllSliderArray[i] + valueToBeIncreased;
            newAllSliderArray[i] = newValue > sliders[i].min ? newValue : sliders[i].min; //break if balance value can be adjusted within this slider, no need to go further

            break;
          }
        }
      }
    }

    return newAllSliderArray;
  };

  const getTotal = (list, start, end) => {
    return list.slice(start, end).reduce((a, b) => a + b, 0);
  };

  return /*#__PURE__*/_react.default.createElement("div", null, sliders.map((eachSlider, index) => {
    return /*#__PURE__*/_react.default.createElement(_CustomSlider.default, {
      key: index,
      min: eachSlider.min,
      color: eachSlider.color,
      sno: index,
      value: sliderValues[index] === undefined ? eachSlider.defaultValue : sliderValues[index],
      handleChange: props.handleChange ? props.handleChange.bind(this, index) : handleChange.bind(this, index),
      handleChangeCommited: props.handleChangeCommited ? props.handleChangeCommited : handleChangeCommited
    });
  }));
}

var _default = ReddevSlider;
exports.default = _default;