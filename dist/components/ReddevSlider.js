"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _CustomSlider = _interopRequireDefault(require("./CustomSlider"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ReddevSlider extends _react.default.Component {
  constructor(props) {
    super(props);
    console.log(props);
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", null, this.props.sliders.map((eachSlider, index) => {
      return /*#__PURE__*/_react.default.createElement(_CustomSlider.default, {
        key: index,
        color: eachSlider.color,
        value: this.props.sliderValues[index] === undefined ? 0 : this.props.sliderValues[index],
        defaultValue: eachSlider.defaultValue,
        handleChange: this.props.onChange.bind(this, index)
      });
    }));
  }

}

;
var _default = ReddevSlider;
exports.default = _default;