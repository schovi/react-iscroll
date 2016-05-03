import React from 'react'
import ReactDOM from 'react-dom';
import equal from 'deep-equal'
const { PropTypes } = React

const iScrollPropType = (props, propName, componentName) => {
  const iScroll = props[propName]
  const proto   = iScroll && iScroll.prototype

  if(!iScroll || !proto || !proto.version || !proto.scrollTo)
    return new Error(componentName + ": iScroll not passed to component props.")

  if(+proto.version.split(".")[0] !== 5)
    console.warn(componentName + ": different version than 5.x.y of iScroll is required. Some features won't work properly.")

  if(props.options && props.options.zoom && !proto.zoom)
    console.warn(componentName + ": options.zoom is set, but iscroll-zoom version is not required. Zoom feature won't work properly.")
}

// Generate propTypes with event function validating
const propTypes = {
  defer: React.PropTypes.oneOfType([
    React.PropTypes.bool,
    React.PropTypes.number
  ]),
  options: PropTypes.object,
  iScroll: iScrollPropType,
  onRefresh: PropTypes.func
}

// Events available on iScroll instance
// {`react component event name`: `iScroll event name`}
const availableEventNames = {}
const iScrollEventNames = ['beforeScrollStart', 'scrollCancel', 'scrollStart', 'scroll', 'scrollEnd', 'flick', 'zoomStart', 'zoomEnd']

for(let i = 0, len = iScrollEventNames.length; i < len; i++) {
  const iScrollEventName = iScrollEventNames[i]
  const reactEventName = `on${iScrollEventName[0].toUpperCase()}${iScrollEventName.slice(1)}`
  availableEventNames[reactEventName] = iScrollEventName
  // Set propTypes validation for event
  propTypes[reactEventName] = PropTypes.func
}

export default class ReactIScroll extends React.Component {

  static displayName = 'ReactIScroll';

  static propTypes = propTypes;

  static defaultProps = {
    defer: true,
    options: {},
    style: {
      position: "relative",
      height: "100%",
      width: "100%",
      overflow: "hidden"
    }
  };

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

  // Check if iScroll options has changed and recreate instance with new one
  componentDidUpdate(prevProps) {
    // If options are same, iScroll behaviour will not change. Just refresh events and trigger refresh
    if(equal(prevProps.options, this.props.options)) {
      this._updateIScrollEvents(prevProps, this.props)
      this.refresh()

    // If options changed, we will destroy iScroll instance and create new one with same scroll position
    // TODO test if this will work with indicators
    } else {
      this.withIScroll(true, (iScrollInstance) => {
        // Save current state
        const {x, y, scale} = iScrollInstance

        // Destroy current and Create new instance of iScroll
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
    this.withIScroll((iScrollInstance) => iScrollInstance.refresh())
  }

  _runInitializeIScroll() {
    const {iScroll, options} = this.props

    // Create iScroll instance with given options
    const iScrollInstance = new iScroll(ReactDOM.findDOMNode(this), options)
    this._iScrollInstance = iScrollInstance

    // TODO there should be new event 'onInitialize'
    this._triggerRefreshEvent()

    // Patch iScroll instance .refresh() function to trigger our onRefresh event
    iScrollInstance.originalRefresh = iScrollInstance.refresh

    iScrollInstance.refresh = () => {
      iScrollInstance.originalRefresh.apply(iScrollInstance)
      this._triggerRefreshEvent()
    }

    // Bind iScroll events
    this._bindIScrollEvents()

    this._callQueuedCallbacks()
  }

  _initializeIScroll() {
    const {defer} = this.props

    if(defer === false) {
      this._runInitializeIScroll()
    } else {
      const timeout = defer === true ? 0 : defer
      setTimeout(() => this._runInitializeIScroll(), timeout)
    }
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
    if (this._iScrollInstance) {
      this._iScrollInstance.destroy()
      this._iScrollInstance = undefined
    }
  }

  _bindIScrollEvents() {
    // Bind events on iScroll instance
    this._iScrollBindedEvents = {}
    this._updateIScrollEvents({}, this.props)
  }

  // Iterate through available events and update one by one
  _updateIScrollEvents(prevProps, nextProps) {
    for(const reactEventName in availableEventNames) {
      this._updateIScrollEvent(availableEventNames[reactEventName], prevProps[reactEventName], nextProps[reactEventName])
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
    // Keep only html properties
    const htmlProps = {}

    for(const prop in this.props) {
      if(!propTypes[prop]) {
        htmlProps[prop] = this.props[prop]
      }
    }

    return <div {...htmlProps} />
  }
}
