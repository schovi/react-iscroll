var React        = require('react'),
    iScroll      = require('iscroll'),
    shallowEqual = require('react/lib/shallowEqual');

// Events available on iScroll instance
// [`iscroll event name`, `react component event name`]
var availableEvents = [
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
var propTypes = {
  options: React.PropTypes.object
}

for(var i = 0; i < availableEvents.length; i++) {
  propTypes[availableEvents[1]] = React.PropTypes.func
}

// Default wrapper style
var scrollerStyle = {
  position: "relative",
  height: "100%",
  width: "100%",
  overflow: "hidden"
}

var ReactIScroll = React.createClass({
  displayName: 'ReactIScroll',

  propTypes: propTypes,

  getDefaultProps: function() {
    return {
      options: {}
    }
  },

  componentDidMount: function() {
    this._initializeIScroll()
    this._triggerRefreshEvent()
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
        x,y,scale;

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
      if(scale && options.zoom) {
        this._iScrollInstance.zoom(scale, 0, 0, 0)
      }

      this._iScrollInstance.scrollTo(x,y)
    }

    this._triggerRefreshEvent()
  },

  getIScrollInstance: function() {
    return this._iScrollInstance;
  },

  refresh: function() {
    this._iScrollInstance.refresh()
  },

  _initializeIScroll: function() {
    // Create iScroll instance with given options
    this._iScrollInstance = new iScroll(this.getDOMNode(), this.props.options)

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
        evenNames;

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
        iScrollInstance.off(eventName, this._iScrollBindedEvents[eventName])
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

  // TODO allow change className and styles
  render: function() {
    return React.createElement("div", {style: scrollerStyle},
             React.createElement("div", null, this.props.children)
           )
  }
})

module.exports = ReactIScroll
