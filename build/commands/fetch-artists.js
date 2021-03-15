"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _database = _interopRequireDefault(require("../database"));

var _api = _interopRequireDefault(require("../services/api"));

var _sleep = _interopRequireDefault(require("../utils/sleep"));

var _command = require("@oclif/command");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var FetchArtistsCommand = /*#__PURE__*/function (_Command) {
  (0, _inherits2["default"])(FetchArtistsCommand, _Command);

  var _super = _createSuper(FetchArtistsCommand);

  function FetchArtistsCommand() {
    (0, _classCallCheck2["default"])(this, FetchArtistsCommand);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(FetchArtistsCommand, [{
    key: "fetchArtists",
    value: function () {
      var _fetchArtists = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var _this$parse, flags, artistList, currentPage, totalPages, mustContinue, _yield$api$getArtists, artists, meta;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.log("Searching for artists");
                _this$parse = this.parse(FetchArtistsCommand), flags = _this$parse.flags;
                artistList = [];
                currentPage = 0;
                totalPages = null;
                mustContinue = true;

              case 6:
                if (!(currentPage > 0)) {
                  _context.next = 9;
                  break;
                }

                _context.next = 9;
                return (0, _sleep["default"])(2);

              case 9:
                currentPage++;
                this.log("Querying the page", currentPage);
                _context.next = 13;
                return _api["default"].getArtistsOnLastFm(currentPage);

              case 13:
                _yield$api$getArtists = _context.sent;
                artists = _yield$api$getArtists.artists;
                meta = _yield$api$getArtists.meta;
                artistList = artistList.concat(artists);
                currentPage = parseInt(meta.page);
                totalPages = parseInt(meta.totalPages);
                mustContinue = parseInt(artists[artists.length - 1].playcount) >= flags.scrobbles;

              case 20:
                if (mustContinue && currentPage < totalPages) {
                  _context.next = 6;
                  break;
                }

              case 21:
                return _context.abrupt("return", artistList.filter(function (a) {
                  return parseInt(a.playcount) >= flags.scrobbles;
                }));

              case 22:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function fetchArtists() {
        return _fetchArtists.apply(this, arguments);
      }

      return fetchArtists;
    }()
  }, {
    key: "saveArtistsOnDatabase",
    value: function saveArtistsOnDatabase(artists) {
      this.log("Saving artists on database");
      artists.forEach(function (a) {
        var data = {
          name: a.name,
          playcount: parseInt(a.playcount)
        };

        _database["default"].artists.find(data, function (_, artists) {
          if (artists.length === 0) _database["default"].artists.insert(data);
        });
      });
    }
  }, {
    key: "run",
    value: function () {
      var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var artists;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.fetchArtists();

              case 2:
                artists = _context2.sent;
                if (artists.length) this.saveArtistsOnDatabase(artists);
                this.log("Done!");

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function run() {
        return _run.apply(this, arguments);
      }

      return run;
    }()
  }]);
  return FetchArtistsCommand;
}(_command.Command);

FetchArtistsCommand.description = "Search all artists you've heard on Last.fm.";
FetchArtistsCommand.flags = {
  scrobbles: _command.flags.string({
    "char": "s",
    "default": 2,
    description: "Minimal number of scrobbles."
  })
};
var _default = FetchArtistsCommand;
exports["default"] = _default;