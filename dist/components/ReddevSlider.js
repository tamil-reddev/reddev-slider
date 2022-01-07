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
    logger.log("final committed value : ".concat(sliderValues));
  };

  (0, _react.useEffect)(() => {
    setSliderValues(props.sliderValues);
  }, [props.sliderValues]);
  (0, _react.useEffect)(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      logger.log("Before moving silder value ".concat(sliderValues));
      let totalValue = 100;
      let balanceAvailable = 0;
      let existingAllSliderArray = sliderValues;
      let existingSelectedSliderValue = existingAllSliderArray[sliderIndex];
      let difference = Math.abs(existingSelectedSliderValue - currentSliderValue);
      logger.log("Difference btw last and current value of moved sliderIndex ".concat(sliderIndex, ", ").concat(existingSelectedSliderValue, " - ").concat(currentSliderValue, " : ").concat(difference)); //Below slider

      let newAllSliderArray = [...existingAllSliderArray];
      newAllSliderArray[sliderIndex] = currentSliderValue; //Find total of top sliders

      if (sliderIndex > 0) {
        let totalOfTopSliders = getTotal(newAllSliderArray, 0, Number(sliderIndex + 1));
        balanceAvailable = totalValue - totalOfTopSliders > 0 ? totalValue - totalOfTopSliders : 0;
        logger.log("Moved sliderIndex ".concat(sliderIndex, " \nTotalOfTopSliders including from moved ").concat(totalOfTopSliders, " \nBalanceAvailable = ").concat(balanceAvailable, " "));
      } else {
        balanceAvailable = totalValue - currentSliderValue;
        logger.log("Moved sliderIndex ".concat(sliderIndex, " \nThere is no top Sliders hence balanceAvailable : ").concat(totalValue, " - ").concat(currentSliderValue, " = ").concat(balanceAvailable, " "));
      }

      let total = getTotal(existingAllSliderArray, Number(sliderIndex + 1), existingAllSliderArray.length);
      logger.log("Following sliders total to find the % to +/- silderIndex [".concat(sliderIndex, " to ").concat(existingAllSliderArray.length - 1, "] = ").concat(total));
      newAllSliderArray = divideProposionally(newAllSliderArray, existingAllSliderArray, total, balanceAvailable, difference, false);
      let totalOfNew = getTotal(newAllSliderArray, 0, newAllSliderArray.length);
      logger.log("Total after affecting below sliders ".concat(newAllSliderArray, " = ").concat(totalOfNew));
      let balanceAvailableNew = totalValue - totalOfNew;
      logger.log("is Still balanceAvailable?: ".concat(balanceAvailableNew)); //Adjust the balance to the last slider only when the slider is moved is not current

      if (balanceAvailableNew > 0 && sliderIndex !== newAllSliderArray.length - 1) {
        //TO-DO i check in while  loopneed to be removed as for now added for browser hanging when unconditional infinity loop
        let i = 1;

        while (balanceAvailableNew > 1) {
          i++;
          newAllSliderArray = divideProposionally(newAllSliderArray, existingAllSliderArray, total, balanceAvailableNew, balanceAvailableNew + 1, true);
          existingAllSliderArray = [...newAllSliderArray];
          logger.log(existingAllSliderArray);
          balanceAvailableNew = totalValue - getTotal(newAllSliderArray, 0, newAllSliderArray.length);

          if (i > 1001) {
            console.error("While loop reached infinity exit;");
            break;
          }
        }

        if (balanceAvailableNew > 0 && sliderIndex !== existingAllSliderArray.length - 1) {
          let lastSlider = existingAllSliderArray.length - 1;
          let newValue = newAllSliderArray[lastSlider] + balanceAvailableNew;
          logger.log("then adjusted to sliderIndex ".concat(lastSlider, " with existingValue + balanceAvailable = ").concat(newAllSliderArray[lastSlider], " + ").concat(balanceAvailableNew, " = ").concat(newAllSliderArray[lastSlider] + balanceAvailableNew, " or min ").concat(sliders[lastSlider].min, "  "));
          newAllSliderArray[lastSlider] = newValue > sliders[lastSlider].min ? newValue : sliders[lastSlider].min;
        }
      }

      let latestTotalOfAllSliders = getTotal(newAllSliderArray, 0, newAllSliderArray.length);

      if (latestTotalOfAllSliders !== totalValue) {
        //If total of latest change is more than 100 then decrease from i-1
        if (latestTotalOfAllSliders > totalValue) {
          logger.log("Total of all sliders ".concat(newAllSliderArray, " = ").concat(latestTotalOfAllSliders, " crossed the limit ").concat(totalValue, " hence decrease from i-1"));
          let valueToBeDecreased = latestTotalOfAllSliders - totalValue; //Decrease from i-1

          for (let i = sliderIndex - 1; i >= 0; i--) {
            if (newAllSliderArray[i] - sliders[i].min - valueToBeDecreased >= 0) {
              logger.log("Above slider can accomodate the entire over limit value itself ".concat(newAllSliderArray[i], " - ").concat(valueToBeDecreased, " = ").concat(newAllSliderArray[i] - valueToBeDecreased, " or min ").concat(sliders[i].min));
              let newValue = newAllSliderArray[i] - valueToBeDecreased;
              newAllSliderArray[i] = newValue > sliders[i].min ? newValue : sliders[i].min; //break if balance value can be adjusted within this slider, no need to go 

              break;
            } else {
              valueToBeDecreased = valueToBeDecreased - (newAllSliderArray[i] - sliders[i].min);
              newAllSliderArray[i] = sliders[i].min;
              logger.log("Adjusted until min value ".concat(sliders[i].min, " and continue adjusting balance ").concat(valueToBeDecreased, " i-1"));
            }
          }
        } else {
          logger.log("Total of all sliders ".concat(newAllSliderArray, " = ").concat(latestTotalOfAllSliders, " not reached the limit ").concat(totalValue, " hence increase from i-1 only sliderIndex is last")); //If total of latest change is less than 100 then increase from i-1

          let valueToBeIncreased = totalValue - latestTotalOfAllSliders; //Increase from i-1 if sliderIndex is last slider

          if (sliderIndex === existingAllSliderArray.length - 1) {
            for (let i = sliderIndex - 1; i >= 0; i--) {
              logger.log("".concat(newAllSliderArray[i], " + ").concat(valueToBeIncreased, " = ").concat(newAllSliderArray[i] + valueToBeIncreased));

              if (newAllSliderArray[i] + valueToBeIncreased <= totalValue) {
                let newValue = newAllSliderArray[i] + valueToBeIncreased;
                newAllSliderArray[i] = newValue > sliders[i].min ? newValue : sliders[i].min; //break if balance value can be adjusted within this slider, no need to go further

                break;
              }
            }
          } else {}
        }
      } //Adjust the slider not to reach more than min of all other sliders


      latestTotalOfAllSliders = getTotal(newAllSliderArray, 0, newAllSliderArray.length);

      if (latestTotalOfAllSliders > totalValue) {
        newAllSliderArray[sliderIndex] = newAllSliderArray[sliderIndex] - (latestTotalOfAllSliders - totalValue);
      }

      setSliderValues(newAllSliderArray);
    }
  }, [currentSliderValue, sliderIndex]);

  const divideProposionally = (newAllSliderArray, existingAllSliderArray, total, balanceAvailable, difference, isLoop) => {
    for (let i = sliderIndex + 1; i < existingAllSliderArray.length; i++) {
      if (total) {
        let minSliderValue = sliders[i].min;

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