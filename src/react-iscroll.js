var React        = require('react'),
    shallowEqual = require('react/lib/shallowEqual'),
    availableEvents,
    propTypes;

// Events available on iScroll instance
// [`iscroll event name`, `react component event name`]
availableEvents = [
  ['beforeScrollStart', "onBeforeScrollStart"],
  ['scrollCancel', "onScrollCancel"],
  ['scrollStart', "onScrollStart"],
  ['scroll', "onScroll"],
  ['scrollEnd', "onScrollEnd"],
  ['flick', "onFlick"],
  ['zoomStart', "onZoomStart"],
  ['zoomEnd', "onZoomEnd"]
]

// Generate propTypes with event function validating
propTypes = {
  options: React.PropTypes.object,
  iscroll: function(props, propName, componentName) {
    var iscroll = props[propName],
        proto   = iscroll && iscroll.prototype;

    if(!iscroll || !proto || !proto.version || !proto.scrollTo) {
      return new Error(componentName + ": iscroll not passed to component props.")
    } else {
      if(!/^5\..*/.test(proto.version)) {
        console.warn(componentName + ": different version than 5.x.y of iscroll is loaded.")
      }

      if(props.options && props.options.zoom && !proto.zoom) {
        console.warn(componentName + ": options.zoom is true, but iscroll-zoom version is not loaded.")
      }
    }
  }
}

for(var i = 0; i < availableEvents.length; i++) {
  propTypes[availableEvents[i]] = React.PropTypes.func
}

var ReactIScroll = React.createClass({
  displayName: 'ReactIScroll',

  propTypes: propTypes,

  getDefaultProps: function() {
    return {
      options: {},
      style: {
        position: "relative",
        height: "100%",
        width: "100%",
        overflow: "hidden"
      }
    }
  },

  componentDidMount: function() {
    this._initializeIScroll()
  },

  componentWillUnmount: function() {
    this._teardownIScroll()
  },

  // There is no state, we can compare only props.
  shouldComponentUpdate: function(nextProps) {
    return !shallowEqual(this.props, nextProps)
  },

  // Check if iscroll options has changed and recreate instance with new one
  componentDidUpdate: function(prevProps) {
    var options = this.props.options,
        x, y, scale;

    if(shallowEqual(prevProps.options, options)) {
      this.refresh()
      this._updateIScrollEvents(prevProps, this.props)
    } else {
      // Save current state
      x     = this._iScrollInstance.x
      y     = this._iScrollInstance.y
      scale = this._iScrollInstance.scale

      // Destroy current and Create new instance of iscroll
      this._teardownIScroll()
      this._initializeIScroll()

      // Restore previous state
      if(scale && this._iScrollInstance.zoom) {
        this._iScrollInstance.zoom(scale, 0, 0, 0)
      }

      this._iScrollInstance.scrollTo(x,y)
    }
  },

  getIScrollInstance: function() {
    return this._iScrollInstance;
  },

  refresh: function() {
    this._iScrollInstance.refresh()
  },

  _initializeIScroll: function() {
    var self = this,
        origRefresh;
    // Create iScroll instance with given options
    this._iScrollInstance = new this.props.iscroll(this.getDOMNode(), this.props.options)
    this._triggerRefreshEvent()

    // Patch iscroll instance .refresh() function to trigger our onRefresh event
    origRefresh = this._iScrollInstance.refresh
    this._iScrollInstance.refresh = function() {
      origRefresh.apply(self._iScrollInstance)
      self._triggerRefreshEvent()
    }

    // Bind iScroll events
    this._bindIScrollEvents()
  },

  _teardownIScroll: function() {
    this._iScrollInstance.destroy()
  },

  _bindIScrollEvents: function() {
    // Bind events on iScroll instance
    this._iScrollBindedEvents = {}
    this._updateIScrollEvents({}, this.props)
  },

  // Iterate through available events and update one by one
  _updateIScrollEvents: function(props1, props2) {
    var len = availableEvents.length,
        i = 0,
        eventNames;

    for(i; i < len; i++) {
      eventNames = availableEvents[i]

      this._updateIScrollEvent(eventNames[0],
                               props1[eventNames[1]],
                               props2[eventNames[1]])
    }
  },

  // Unbind and/or Bind event if it was changed during update
  _updateIScrollEvent: function(eventName, prevEvent, currentEvent) {
    var iScrollInstance, currentEvents, callback;

    if(prevEvent !== currentEvent) {
      iScrollInstance = this._iScrollInstance
      currentEvents = this._iScrollBindedEvents

      if(prevEvent) {
        iScrollInstance.off(eventName, currentEvents[eventName])
        currentEvents[eventName] = undefined
      }

      if(currentEvent) {
        callback = function() {currentEvent(iScrollInstance)}

        this._iScrollInstance.on(eventName, callback)
        currentEvents[eventName] = callback
      }
    }
  },

  _triggerRefreshEvent: function() {
    if(this.props.onRefresh) {
      this.props.onRefresh(this._iScrollInstance)
    }
  },

  render: function() {
    return React.createElement("div", {className: this.props.className, style: this.props.style},
             React.createElement("div", {style: this.props.scrollerStyle}, this.props.children)
           )
  }
})

module.exports = ReactIScroll
