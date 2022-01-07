"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _Slider = _interopRequireDefault(require("@mui/material/Slider"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CustomSlider extends _react.default.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_Slider.default, {
      className: "slider",
      color: this.props.color,
      sno: this.props.sno,
      min: this.props.min,
      value: this.props.value,
      defaultValue: this.props.defaultValue,
      onChange: this.props.handleChange,
      onChangeCommitted: this.props.handleChangeCommited,
      "aria-label": "Default",
      valueLabelDisplay: "auto"
    }));
  }

}

;
var _default = CustomSlider;
exports.default = _default;