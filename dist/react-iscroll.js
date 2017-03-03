'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _deepEqual = require('deep-equal');

var _deepEqual2 = _interopRequireDefault(_deepEqual);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var excludePropNames = ['defer', 'iScroll', 'onRefresh', 'options'];

// Events available on iScroll instance
// {`react component event name`: `iScroll event name`}
var availableEventNames = {};
var iScrollEventNames = ['beforeScrollStart', 'scrollCancel', 'scrollStart', 'scroll', 'scrollEnd', 'flick', 'zoomStart', 'zoomEnd'];

for (var i = 0, len = iScrollEventNames.length; i < len; i++) {
  var iScrollEventName = iScrollEventNames[i];
  var reactEventName = 'on' + iScrollEventName[0].toUpperCase() + iScrollEventName.slice(1);
  availableEventNames[reactEventName] = iScrollEventName;
  excludePropNames.push(reactEventName);
}

var ReactIScroll = function (_React$Component) {
  _inherits(ReactIScroll, _React$Component);

  function ReactIScroll(props) {
    _classCallCheck(this, ReactIScroll);

    var _this = _possibleConstructorReturn(this, (ReactIScroll.__proto__ || Object.getPrototypeOf(ReactIScroll)).call(this, props));

    _this._queuedCallbacks = [];
    _this._iScrollBindedEvents = {};
    return _this;
  }

  _createClass(ReactIScroll, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._initializeIScroll();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      clearTimeout(this.timeout);
      this._teardownIScroll();
    }

    // There is no state, we can compare only props.

  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      return !(0, _deepEqual2.default)(this.props, nextProps);
    }

    // Check if iScroll options has changed and recreate instance with new one

  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      var _this2 = this;

      // If options are same, iScroll behaviour will not change. Just refresh events and trigger refresh
      if ((0, _deepEqual2.default)(prevProps.options, this.props.options)) {
        this._updateIScrollEvents(prevProps, this.props);
        this.refresh();

        // If options changed, we will destroy iScroll instance and create new one with same scroll position
        // TODO test if this will work with indicators
      } else {
        this.withIScroll(true, function (iScrollInstance) {
          // Save current state
          var x = iScrollInstance.x,
              y = iScrollInstance.y,
              scale = iScrollInstance.scale;

          // Destroy current and Create new instance of iScroll

          _this2._teardownIScroll();
          _this2._initializeIScroll();

          _this2.withIScroll(true, function (newIScrollInstance) {
            // Restore previous state
            if (scale && newIScrollInstance.zoom) newIScrollInstance.zoom(scale, 0, 0, 0);

            newIScrollInstance.scrollTo(x, y);
          });
        });
      }
    }
  }, {
    key: 'getIScroll',
    value: function getIScroll() {
      return this._iScrollInstance;
    }
  }, {
    key: 'getIScrollInstance',
    value: function getIScrollInstance() {
      console.warn("Function 'getIScrollInstance' is deprecated. Instead use 'getIScroll'");
      return this._iScrollInstance;
    }
  }, {
    key: 'withIScroll',
    value: function withIScroll(waitForInit, callback) {
      if (!callback && typeof waitForInit == "function") {
        callback = waitForInit;
      }

      if (this.getIScroll()) {
        callback(this.getIScroll());
      } else if (waitForInit === true) {
        this._queuedCallbacks.push(callback);
      }
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      this.withIScroll(function (iScrollInstance) {
        return iScrollInstance.refresh();
      });
    }
  }, {
    key: '_runInitializeIScroll',
    value: function _runInitializeIScroll() {
      var _this3 = this;

      var _props = this.props,
          iScroll = _props.iScroll,
          options = _props.options;

      // Create iScroll instance with given options

      var iScrollInstance = new iScroll(_reactDom2.default.findDOMNode(this), options);
      this._iScrollInstance = iScrollInstance;

      // TODO there should be new event 'onInitialize'
      this._triggerRefreshEvent();

      // Patch iScroll instance .refresh() function to trigger our onRefresh event
      iScrollInstance.originalRefresh = iScrollInstance.refresh;

      iScrollInstance.refresh = function () {
        iScrollInstance.originalRefresh.apply(iScrollInstance);
        _this3._triggerRefreshEvent();
      };

      // Bind iScroll events
      this._bindIScrollEvents();

      this._callQueuedCallbacks();
    }
  }, {
    key: '_initializeIScroll',
    value: function _initializeIScroll() {
      var _this4 = this;

      var defer = this.props.defer;


      if (defer === false) {
        this._runInitializeIScroll();
      } else {
        var timeout = defer === true ? 0 : defer;
        this.timeout = setTimeout(function () {
          return _this4._runInitializeIScroll();
        }, timeout);
      }
    }
  }, {
    key: '_callQueuedCallbacks',
    value: function _callQueuedCallbacks() {
      var callbacks = this._queuedCallbacks,
          len = callbacks.length;

      this._queuedCallbacks = [];

      for (var _i = 0; _i < len; _i++) {
        callbacks[_i](this.getIScroll());
      }
    }
  }, {
    key: '_teardownIScroll',
    value: function _teardownIScroll() {
      if (this._iScrollInstance) {
        this._iScrollInstance.destroy();
        this._iScrollInstance = undefined;
        this._iScrollBindedEvents = {};
      }
    }
  }, {
    key: '_bindIScrollEvents',
    value: function _bindIScrollEvents() {
      // Bind events on iScroll instance
      this._iScrollBindedEvents = {};
      this._updateIScrollEvents({}, this.props);
    }

    // Iterate through available events and update one by one

  }, {
    key: '_updateIScrollEvents',
    value: function _updateIScrollEvents(prevProps, nextProps) {
      for (var _reactEventName in availableEventNames) {
        this._updateIScrollEvent(availableEventNames[_reactEventName], prevProps[_reactEventName], nextProps[_reactEventName]);
      }
    }

    // Unbind and/or Bind event if it was changed during update

  }, {
    key: '_updateIScrollEvent',
    value: function _updateIScrollEvent(iScrollEventName, prevEvent, currentEvent) {
      var _this5 = this;

      if (prevEvent !== currentEvent) {
        this.withIScroll(true, function (iScrollInstance) {
          var currentEvents = _this5._iScrollBindedEvents;

          if (prevEvent) {
            iScrollInstance.off(iScrollEventName, currentEvents[iScrollEventName]);
            currentEvents[iScrollEventName] = undefined;
          }

          if (currentEvent) {
            var wrappedCallback = function wrappedCallback() {
              for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }

              currentEvent.apply(undefined, [iScrollInstance].concat(args));
            };

            iScrollInstance.on(iScrollEventName, wrappedCallback);
            currentEvents[iScrollEventName] = wrappedCallback;
          }
        });
      }
    }
  }, {
    key: '_triggerRefreshEvent',
    value: function _triggerRefreshEvent() {
      var onRefresh = this.props.onRefresh;


      if (onRefresh) this.withIScroll(function (iScrollInstance) {
        return onRefresh(iScrollInstance);
      });
    }
  }, {
    key: 'render',
    value: function render() {
      // Keep only non ReactIScroll properties
      var props = {};

      for (var prop in this.props) {
        if (!~excludePropNames.indexOf(prop)) {
          props[prop] = this.props[prop];
        }
      }

      return _react2.default.createElement('div', props);
    }
  }]);

  return ReactIScroll;
}(_react2.default.Component);

ReactIScroll.displayName = 'ReactIScroll';
ReactIScroll.defaultProps = {
  defer: true,
  options: {},
  style: {
    position: "relative",
    height: "100%",
    width: "100%",
    overflow: "hidden"
  }
};
exports.default = ReactIScroll;


if (process.env.NODE_ENV != "production") {
  var propTypesMaker = require('./prop_types').default;
  ReactIScroll.propTypes = propTypesMaker(availableEventNames);
}