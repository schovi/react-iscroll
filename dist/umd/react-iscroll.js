define(['exports', 'react', 'react-dom', 'deep-equal'], function (exports, _react, _reactDom, _deepEqual) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _react2 = _interopRequireDefault(_react);

  var _reactDom2 = _interopRequireDefault(_reactDom);

  var _deepEqual2 = _interopRequireDefault(_deepEqual);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var PropTypes = _react2.default.PropTypes;


  // Events available on iScroll instance
  // [`iscroll event name`, `react component event name`]
  var availableEvents = [['beforeScrollStart', "onBeforeScrollStart"], ['scrollCancel', "onScrollCancel"], ['scrollStart', "onScrollStart"], ['scroll', "onScroll"], ['scrollEnd', "onScrollEnd"], ['flick', "onFlick"], ['zoomStart', "onZoomStart"], ['zoomEnd', "onZoomEnd"]];

  // Generate propTypes with event function validating
  var propTypes = {
    defer: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.bool, _react2.default.PropTypes.number]),
    options: PropTypes.object,
    iscroll: function iscroll(props, propName, componentName) {
      var iscroll = props[propName];
      var proto = iscroll && iscroll.prototype;

      if (!iscroll || !proto || !proto.version || !proto.scrollTo) {
        return new Error(componentName + ": iscroll not passed to component props.");
      } else {
        if (!/^5\..*/.test(proto.version)) {
          console.warn(componentName + ": different version than 5.x.y of iscroll is loaded. Some features won't work properly.");
        }

        if (props.options && props.options.zoom && !proto.zoom) {
          console.warn(componentName + ": options.zoom is set, but iscroll-zoom version is not loaded. This feature won't works properly.");
        }
      }
    },
    onRefresh: PropTypes.func
  };

  for (var i = 0; i < availableEvents.length; i++) {
    propTypes[availableEvents[i][1]] = PropTypes.func;
  }

  var ReactIScroll = function (_React$Component) {
    _inherits(ReactIScroll, _React$Component);

    function ReactIScroll(props) {
      _classCallCheck(this, ReactIScroll);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ReactIScroll).call(this, props));

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
        this._teardownIScroll();
      }
    }, {
      key: 'shouldComponentUpdate',
      value: function shouldComponentUpdate(nextProps) {
        return !(0, _deepEqual2.default)(this.props, nextProps);
      }
    }, {
      key: 'componentDidUpdate',
      value: function componentDidUpdate(prevProps) {
        var _this2 = this;

        // If options are same, iscroll behaviour will not change. Just refresh events and trigger refresh
        if ((0, _deepEqual2.default)(prevProps.options, this.props.options)) {
          this._updateIScrollEvents(prevProps, this.props);
          this.refresh();

          // If options changed, we will destroy iScroll instance and create new one with same scroll position
          // TODO test if this will work with indicators
        } else {
            this.withIScroll(true, function (iScrollInstance) {
              // Save current state
              var x = iScrollInstance.x;
              var y = iScrollInstance.y;
              var scale = iScrollInstance.scale;

              // Destroy current and Create new instance of iscroll
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
        this.withIScroll(function (iScroll) {
          return iScroll.refresh();
        });
      }
    }, {
      key: '_runInitializeIScroll',
      value: function _runInitializeIScroll() {
        var _this3 = this;

        var _props = this.props;
        var iScroll = _props.iscroll;
        var options = _props.options;


        // Create iScroll instance with given options
        var iScrollInstance = new iScroll(_reactDom2.default.findDOMNode(this), options);
        this._iScrollInstance = iScrollInstance;

        // TODO there should be new event 'onInitialize'
        this._triggerRefreshEvent();

        // Patch iscroll instance .refresh() function to trigger our onRefresh event
        var origRefresh = iScrollInstance.refresh;

        iScrollInstance.refresh = function () {
          origRefresh.apply(iScrollInstance);
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
          setTimeout(function () {
            return _this4._runInitializeIScroll();
          }, defer);
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
        }
      }
    }, {
      key: '_bindIScrollEvents',
      value: function _bindIScrollEvents() {
        // Bind events on iScroll instance
        this._iScrollBindedEvents = {};
        this._updateIScrollEvents({}, this.props);
      }
    }, {
      key: '_updateIScrollEvents',
      value: function _updateIScrollEvents(prevProps, nextProps) {
        var len = availableEvents.length;

        for (var _i2 = 0; _i2 < len; _i2++) {
          var _availableEvents$_i = _slicedToArray(availableEvents[_i2], 2);

          var iScrollEventName = _availableEvents$_i[0];
          var reactEventName = _availableEvents$_i[1];

          this._updateIScrollEvent(iScrollEventName, prevProps[reactEventName], nextProps[reactEventName]);
        }
      }
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


        if (onRefresh) {
          this.withIScroll(function (iScrollInstance) {
            return onRefresh(iScrollInstance);
          });
        }
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          'div',
          { className: this.props.className, style: this.props.style },
          _react2.default.createElement(
            'div',
            { style: this.props.scrollerStyle },
            this.props.children
          )
        );
      }
    }]);

    return ReactIScroll;
  }(_react2.default.Component);

  ReactIScroll.displayName = 'ReactIScroll';
  ReactIScroll.propTypes = propTypes;
  ReactIScroll.defaultProps = {
    defer: 0,
    options: {},
    style: {
      position: "relative",
      height: "100%",
      width: "100%",
      overflow: "hidden"
    }
  };
  exports.default = ReactIScroll;
});