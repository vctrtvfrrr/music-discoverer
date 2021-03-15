"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _path = _interopRequireDefault(require("path"));

var _nedb = _interopRequireDefault(require("nedb"));

var dbPath = _path["default"].join(__dirname, "../../database");

var _default = {
  artists: new _nedb["default"]({
    filename: "".concat(dbPath, "/artists.db"),
    autoload: true
  }),
  tracks: new _nedb["default"]({
    filename: "".concat(dbPath, "/tracks.db"),
    autoload: true
  })
};
exports["default"] = _default;