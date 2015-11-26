import React from 'react'
import ReactDOM from 'react-dom';
import equal from 'deep-equal'
const { PropTypes } = React

// Events available on IScroll instance
// [`IScroll event name`, `react component event name`]
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
  defer: React.PropTypes.oneOfType([
    React.PropTypes.bool,
    React.PropTypes.number
  ]),
  options: PropTypes.object,
  IScroll: (props, propName, componentName) => {
    const IScroll = props[propName]
    const proto   = IScroll && IScroll.prototype

    if(!IScroll || !proto || !proto.version || !proto.scrollTo) {
      return new Error(componentName + ": IScroll not passed to component props.")
    } else {
      if(!/^5\..*/.test(proto.version)) {
        console.warn(componentName + ": different version than 5.x.y of IScroll is required. Some features won't work properly.")
      }

      if(props.options && props.options.zoom && !proto.zoom) {
        console.warn(componentName + ": options.zoom is set, but iscroll-zoom version is not required. Zoom feature won't work properly.")
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
    this._IScrollBindedEvents = {}
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

  // Check if IScroll options has changed and recreate instance with new one
  componentDidUpdate(prevProps) {
    // If options are same, IScroll behaviour will not change. Just refresh events and trigger refresh
    if(equal(prevProps.options, this.props.options)) {
      this._updateIScrollEvents(prevProps, this.props)
      this.refresh()

    // If options changed, we will destroy IScroll instance and create new one with same scroll position
    // TODO test if this will work with indicators
    } else {
      this.withIScroll(true, (IScrollInstance) => {
        // Save current state
        const x     = IScrollInstance.x
        const y     = IScrollInstance.y
        const scale = IScrollInstance.scale

        // Destroy current and Create new instance of IScroll
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
    return this._IScrollInstance;
  }

  getIScrollInstance() {
    console.warn("Function 'getIScrollInstance' is deprecated. Instead use 'getIScroll'")
    return this._IScrollInstance;
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
    this.withIScroll((IScrollInstance) => IScrollInstance.refresh())
  }

  _runInitializeIScroll() {
    const {IScroll, options} = this.props

    // Create IScroll instance with given options
    const IScrollInstance = new IScroll(ReactDOM.findDOMNode(this), options)
    this._IScrollInstance = IScrollInstance

    // TODO there should be new event 'onInitialize'
    this._triggerRefreshEvent()

    // Patch IScroll instance .refresh() function to trigger our onRefresh event
    const origRefresh = IScrollInstance.refresh

    IScrollInstance.refresh = () => {
      origRefresh.apply(IScrollInstance)
      this._triggerRefreshEvent()
    }

    // Bind IScroll events
    this._bindIScrollEvents()

    this._callQueuedCallbacks()
  }

  _initializeIScroll() {
    const {defer} = this.props

    if(defer === false) {
      this._runInitializeIScroll()
    } else {
      setTimeout(() => this._runInitializeIScroll(), defer)
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
    this._IScrollInstance.destroy()
    this._IScrollInstance = undefined
  }

  _bindIScrollEvents() {
    // Bind events on IScroll instance
    this._IScrollBindedEvents = {}
    this._updateIScrollEvents({}, this.props)
  }

  // Iterate through available events and update one by one
  _updateIScrollEvents(prevProps, nextProps) {
    const len = availableEvents.length;

    for(let i = 0; i < len; i++) {
      const [IScrollEventName, reactEventName] = availableEvents[i]
      this._updateIScrollEvent(IScrollEventName, prevProps[reactEventName], nextProps[reactEventName])
    }
  }

  // Unbind and/or Bind event if it was changed during update
  _updateIScrollEvent(IScrollEventName, prevEvent, currentEvent) {
    if(prevEvent !== currentEvent) {
      this.withIScroll(true, (IScrollInstance) => {
        const currentEvents = this._IScrollBindedEvents

        if(prevEvent) {
          IScrollInstance.off(IScrollEventName, currentEvents[IScrollEventName])
          currentEvents[IScrollEventName] = undefined
        }

        if(currentEvent) {
          const wrappedCallback = function(...args) {
            currentEvent(IScrollInstance, ...args)
          }

          IScrollInstance.on(IScrollEventName, wrappedCallback)
          currentEvents[IScrollEventName] = wrappedCallback
        }
      })
    }
  }

  _triggerRefreshEvent() {
    const {onRefresh} = this.props

    if(onRefresh) {
      this.withIScroll((IScrollInstance) => onRefresh(IScrollInstance))
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
