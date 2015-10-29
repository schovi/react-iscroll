import React from 'react'
import ReactDOM from 'react-dom';
import equal from 'deep-equal'
const { PropTypes } = React

// Events available on iScroll instance
// [`iscroll event name`, `react component event name`]
const availableEvents = [
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
const propTypes = {
  defer: PropTypes.number,
  options: PropTypes.object,
  iscroll: (props, propName, componentName) => {
    const iscroll = props[propName]
    const proto   = iscroll && iscroll.prototype

    if(!iscroll || !proto || !proto.version || !proto.scrollTo) {
      return new Error(componentName + ": iscroll not passed to component props.")
    } else {
      if(!/^5\..*/.test(proto.version)) {
        console.warn(componentName + ": different version than 5.x.y of iscroll is loaded. Some features won't work properly.")
      }

      if(props.options && props.options.zoom && !proto.zoom) {
        console.warn(componentName + ": options.zoom is set, but iscroll-zoom version is not loaded. This feature won't works properly.")
      }
    }
  },
  onRefresh: PropTypes.func
}

for(var i = 0; i < availableEvents.length; i++) {
  propTypes[availableEvents[i][1]] = PropTypes.func
}

export default class ReactIScroll extends React.Component {

  static displayName = 'ReactIScroll'

  static propTypes = propTypes

  static defaultProps = {
    defer: 0,
    options: {},
    style: {
      position: "relative",
      height: "100%",
      width: "100%",
      overflow: "hidden"
    }
  }

  constructor(props) {
    super(props)
    this._queuedCallbacks = []
    this._iScrollBindedEvents = {}
  }

  componentDidMount() {
    this._initializeIScroll()
  }

  componentWillUnmount() {
    this._teardownIScroll()
  }

  // There is no state, we can compare only props.
  shouldComponentUpdate(nextProps) {
    return !equal(this.props, nextProps)
  }

  // Check if iscroll options has changed and recreate instance with new one
  componentDidUpdate(prevProps) {
    // If options are same, iscroll behaviour will not change. Just refresh events and trigger refresh
    if(equal(prevProps.options, this.props.options)) {
      this._updateIScrollEvents(prevProps, this.props)
      this.refresh()

    // If options changed, we will destroy iScroll instance and create new one with same scroll position
    // TODO test if this will work with indicators
    } else {
      this.withIScroll(true, (iScrollInstance) => {
        // Save current state
        const x     = iScrollInstance.x
        const y     = iScrollInstance.y
        const scale = iScrollInstance.scale

        // Destroy current and Create new instance of iscroll
        this._teardownIScroll()
        this._initializeIScroll()

        this.withIScroll(true, (newIScrollInstance) => {
          // Restore previous state
          if(scale && newIScrollInstance.zoom)
            newIScrollInstance.zoom(scale, 0, 0, 0)

          newIScrollInstance.scrollTo(x,y)
        })
      })
    }
  }

  getIScroll() {
    return this._iScrollInstance;
  }

  getIScrollInstance() {
    console.warn("Function 'getIScrollInstance' is deprecated. Instead use 'getIScroll'")
    return this._iScrollInstance;
  }

  withIScroll(waitForInit, callback) {
    if(!callback && typeof waitForInit == "function") {
      callback = waitForInit
    }

    if(this.getIScroll()) {
      callback(this.getIScroll())
    } else if (waitForInit === true) {
      this._queuedCallbacks.push(callback)
    }
  }

  refresh() {
    this.withIScroll((iScroll) => iScroll.refresh())
  }

  _initializeIScroll() {
    const {iscroll: iScroll, options, defer} = this.props

    setTimeout(() => {
      // Create iScroll instance with given options
      const iScrollInstance = new iScroll(ReactDOM.findDOMNode(this), options)
      this._iScrollInstance = iScrollInstance

      // TODO there should be new event 'onInitialize'
      this._triggerRefreshEvent()

      // Patch iscroll instance .refresh() function to trigger our onRefresh event
      const origRefresh = iScrollInstance.refresh

      iScrollInstance.refresh = () => {
        origRefresh.apply(iScrollInstance)
        this._triggerRefreshEvent()
      }

      // Bind iScroll events
      this._bindIScrollEvents()

      this._callQueuedCallbacks()
    }, defer)
  }

  _callQueuedCallbacks() {
    const callbacks = this._queuedCallbacks,
          len = callbacks.length;

    this._queuedCallbacks = []

    for(let i = 0; i < len; i++) {
      callbacks[i](this.getIScroll())
    }
  }

  _teardownIScroll() {
    this._iScrollInstance.destroy()
    this._iScrollInstance = undefined
  }

  _bindIScrollEvents() {
    // Bind events on iScroll instance
    this._iScrollBindedEvents = {}
    this._updateIScrollEvents({}, this.props)
  }

  // Iterate through available events and update one by one
  _updateIScrollEvents(prevProps, nextProps) {
    const len = availableEvents.length;

    for(let i = 0; i < len; i++) {
      const [iScrollEventName, reactEventName] = availableEvents[i]
      this._updateIScrollEvent(iScrollEventName, prevProps[reactEventName], nextProps[reactEventName])
    }
  }

  // Unbind and/or Bind event if it was changed during update
  _updateIScrollEvent(iScrollEventName, prevEvent, currentEvent) {
    if(prevEvent !== currentEvent) {
      this.withIScroll(true, (iScrollInstance) => {
        const currentEvents = this._iScrollBindedEvents

        if(prevEvent) {
          iScrollInstance.off(iScrollEventName, currentEvents[iScrollEventName])
          currentEvents[iScrollEventName] = undefined
        }

        if(currentEvent) {
          const wrappedCallback = function(...args) {
            currentEvent(iScrollInstance, ...args)
          }

          iScrollInstance.on(iScrollEventName, wrappedCallback)
          currentEvents[iScrollEventName] = wrappedCallback
        }
      })
    }
  }

  _triggerRefreshEvent() {
    const {onRefresh} = this.props

    if(onRefresh) {
      this.withIScroll((iScrollInstance) => onRefresh(iScrollInstance))
    }
  }

  render() {
    return (
      <div className={this.props.className} style={this.props.style}>
        <div style={this.props.scrollerStyle}>
          {this.props.children}
        </div>
      </div>
    )
  }
}
