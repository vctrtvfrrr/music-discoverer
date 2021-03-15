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

var FetchTracksCommand = /*#__PURE__*/function (_Command) {
  (0, _inherits2["default"])(FetchTracksCommand, _Command);

  var _super = _createSuper(FetchTracksCommand);

  function FetchTracksCommand() {
    (0, _classCallCheck2["default"])(this, FetchTracksCommand);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(FetchTracksCommand, [{
    key: "calculateAverageStats",
    value: function calculateAverageStats(stats, track) {
      var trackPlaycount = parseInt(track.playcount);
      var trackListeners = parseInt(track.listeners);

      if (stats.counted === 0) {
        stats.playcount = trackPlaycount;
        stats.listeners = trackListeners;
      }

      stats.playcount = Math.trunc((stats.playcount + trackPlaycount) / 2);
      stats.listeners = Math.trunc((stats.listeners + trackListeners) / 2);
      stats.counted++;
      return stats;
    }
  }, {
    key: "calculateTrackPoints",
    value: function calculateTrackPoints(track, stats) {
      var _this$parse = this.parse(FetchTracksCommand),
          flags = _this$parse.flags;

      var minListeners = flags["min-listeners"] + stats.counted * flags["reduce-factor"];
      var minPlaycount = flags["min-playcount"] + stats.counted * flags["reduce-factor"]; // Percentage of current track listeners in relation to previous averages

      var avgListeners = track.listeners / stats.listeners; // Percentage of current track plays in relation to the previous averages

      var avgPlaycount = track.playcount / stats.playcount; // Average number of plays per listener

      var playcountByListener = track.playcount / track.listeners;
      var points = 0;
      if (avgListeners >= minListeners) points++;
      if (avgPlaycount >= minPlaycount) points++;
      if (playcountByListener >= flags["min-playcount-by-listener"]) points++;
      if (stats.counted <= flags["min-tracks"]) points++;
      if (avgPlaycount < minPlaycount && playcountByListener >= flags["playcount-by-listener"]) points++;
      return points;
    }
  }, {
    key: "fetchTopTracks",
    value: function () {
      var _fetchTopTracks = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(artist) {
        var _this = this;

        var _this$parse2, flags, _yield$api$getTopTrac, tracks, averageStats;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this$parse2 = this.parse(FetchTracksCommand), flags = _this$parse2.flags;
                console.log("Searching for \"".concat(artist.name, "\" tracks"));
                _context.next = 4;
                return _api["default"].getTopTracksOnLastFm(artist);

              case 4:
                _yield$api$getTopTrac = _context.sent;
                tracks = _yield$api$getTopTrac.tracks;
                averageStats = {
                  playcount: 0,
                  listeners: 0,
                  counted: 0
                };
                return _context.abrupt("return", tracks.slice(0, tracks.findIndex(function (track) {
                  averageStats = _this.calculateAverageStats(averageStats, track);

                  var points = _this.calculateTrackPoints(track, averageStats);

                  return points < flags["min-points"];
                })));

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function fetchTopTracks(_x) {
        return _fetchTopTracks.apply(this, arguments);
      }

      return fetchTopTracks;
    }()
  }, {
    key: "saveTracksOnDatabase",
    value: function saveTracksOnDatabase(tracks) {
      tracks.forEach(function (t) {
        var query = {
          name: t.name,
          artist: {
            name: t.artist.name
          }
        };

        _database["default"].tracks.find(query, function (_, tracks) {
          if (tracks.length === 0) {
            _database["default"].tracks.insert({
              name: t.name,
              artist: t.artist,
              playcount: parseInt(t.playcount)
            });
          }
        });
      });
    }
  }, {
    key: "run",
    value: function run() {
      var _this2 = this;

      _database["default"].artists.find({}, /*#__PURE__*/function () {
        var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(_, artists) {
          var i, artist, tracks;
          return _regenerator["default"].wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  if (artists.length === 0) {
                    _this2.log("There are no artists saved in the database.");

                    process.exit(1);
                  } // Clear tracks in database


                  _database["default"].tracks.remove({}, {
                    multi: true
                  });

                  _database["default"].tracks.persistence.compactDatafile();

                  i = 0;

                case 4:
                  artist = artists[i];
                  _context2.prev = 5;
                  _context2.next = 8;
                  return _this2.fetchTopTracks(artist);

                case 8:
                  tracks = _context2.sent;

                  _this2.saveTracksOnDatabase(tracks);

                  _context2.next = 12;
                  return (0, _sleep["default"])(1.2);

                case 12:
                  _context2.next = 17;
                  break;

                case 14:
                  _context2.prev = 14;
                  _context2.t0 = _context2["catch"](5);

                  _this2.log(_context2.t0.message);

                case 17:
                  i++;

                case 18:
                  if (i < artists.length) {
                    _context2.next = 4;
                    break;
                  }

                case 19:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, null, [[5, 14]]);
        }));

        return function (_x2, _x3) {
          return _ref.apply(this, arguments);
        };
      }());
    }
  }]);
  return FetchTracksCommand;
}(_command.Command);

FetchTracksCommand.description = "Search all top tracks from artists you've heard on Last.fm.";
FetchTracksCommand.flags = {
  "min-tracks": _command.flags.string({
    "default": 5,
    description: "Recommended number of tracks per artist."
  }),
  "min-points": _command.flags.string({
    "default": 3,
    description: "Minimum number of points that a track must obtain to be selected. Max: 5."
  }),
  "reduce-factor": _command.flags.string({
    "default": 0.0075,
    description: "Factor that increases the difficulty of a track to score as the other tracks are selected."
  }),
  "min-listeners": _command.flags.string({
    "default": 0.8,
    description: "Minimum percentage number of listeners that track must have in relation to the previous track."
  }),
  "min-playcount": _command.flags.string({
    "default": 0.75,
    description: "Minimum percentage number of plays that track should have in relation to the previous track."
  }),
  "min-playcount-by-listener": _command.flags.string({
    "default": 2,
    description: "Minimum average of track plays per listener."
  }),
  "playcount-by-listener": _command.flags.string({
    "default": 2.5,
    description: "Recommended average track plays per listener."
  })
};
var _default = FetchTracksCommand;
exports["default"] = _default;