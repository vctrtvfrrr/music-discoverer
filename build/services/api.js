"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _qs = _interopRequireDefault(require("qs"));

var _axios = _interopRequireDefault(require("axios"));

var _dotenv = _interopRequireDefault(require("dotenv"));

_dotenv["default"].config();

var api = _axios["default"].create({
  baseURL: process.env.LASTFM_API_URL,
  timeout: 60000,
  // 1 minute
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  },
  params: {
    api_key: process.env.LASTFM_API_KEY,
    format: "json",
    user: process.env.LASTFM_USER
  },
  paramsSerializer: function paramsSerializer(params) {
    return _qs["default"].stringify(params, {
      arrayFormat: "brackets"
    });
  }
});

function getArtistsOnLastFm() {
  return _getArtistsOnLastFm.apply(this, arguments);
}

function _getArtistsOnLastFm() {
  _getArtistsOnLastFm = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
    var currentPage,
        _yield$api$get,
        data,
        _args = arguments;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            currentPage = _args.length > 0 && _args[0] !== undefined ? _args[0] : 1;
            _context.prev = 1;
            _context.next = 4;
            return api.get("/", {
              params: {
                method: "user.gettopartists",
                page: currentPage
              }
            });

          case 4:
            _yield$api$get = _context.sent;
            data = _yield$api$get.data;
            return _context.abrupt("return", {
              artists: data.topartists.artist,
              meta: data.topartists["@attr"]
            });

          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](1);
            throw _context.t0;

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 9]]);
  }));
  return _getArtistsOnLastFm.apply(this, arguments);
}

function getTopTracksOnLastFm(_x) {
  return _getTopTracksOnLastFm.apply(this, arguments);
}

function _getTopTracksOnLastFm() {
  _getTopTracksOnLastFm = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(_ref) {
    var artist, mbid, params, _yield$api$get2, data;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            artist = _ref.name, mbid = _ref.mbid;
            _context2.prev = 1;
            params = {
              method: "artist.gettoptracks"
            };

            if (artist === null) {
              params.mbid = mbid;
            } else {
              params.artist = artist;
            }

            _context2.next = 6;
            return api.get("/", {
              params: params
            });

          case 6:
            _yield$api$get2 = _context2.sent;
            data = _yield$api$get2.data;

            if (!data.error) {
              _context2.next = 10;
              break;
            }

            throw new Error(data.message);

          case 10:
            return _context2.abrupt("return", {
              tracks: data.toptracks.track,
              meta: data.toptracks["@attr"]
            });

          case 13:
            _context2.prev = 13;
            _context2.t0 = _context2["catch"](1);
            throw _context2.t0;

          case 16:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[1, 13]]);
  }));
  return _getTopTracksOnLastFm.apply(this, arguments);
}

var _default = {
  getArtistsOnLastFm: getArtistsOnLastFm,
  getTopTracksOnLastFm: getTopTracksOnLastFm
};
exports["default"] = _default;