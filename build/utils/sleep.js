"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function sleep(sec) {
  console.log("Waiting...");
  return new Promise(function (resolve) {
    return setTimeout(resolve, sec * 1000);
  });
}

var _default = sleep;
exports["default"] = _default;