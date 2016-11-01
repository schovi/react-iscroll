import { PropTypes } from 'react'

const { bool, number, string, func, shape, object, instanceOf, oneOf, oneOfType, arrayOf } = PropTypes

const errMsg = function(props, propName, componentName, msgContinuation) {
  return `Invalid prop '${propName}' of value '${props[propName]}' supplied to '${componentName}'${msgContinuation}`;
}

const iScrollPropType = (props, propName, componentName) => {
  const iScroll = props[propName]
  const proto   = iScroll && iScroll.prototype

  if(!iScroll || !proto || !proto.version || !proto.scrollTo)
    return new Error(errMsg(props, propName, componentName, ', expected a iScroll object'))

  if(+proto.version.split(".")[0] !== 5)
    console.warn(componentName + ": different version than 5.x.y of iScroll is required. Some features won't work properly.")

  if(props.options && props.options.zoom && !proto.zoom)
    console.warn(componentName + ": options.zoom is set, but iscroll-zoom version is not required. Zoom feature won't work properly.")
}

const elementOrSelectorPropType = (props, propName, componentName) => {
  const value = props[propName]

  if (!value || value.nodeType !== 1 || typeof(value) !==  "string")
    return new Error(errMsg(props, propName, componentName, ', expected a DOM element or a selector'))
}

const shrinkPropType = oneOf([false, 'clip', 'scale'])

const indicatorPropType = shape({
  el: elementOrSelectorPropType,
  fade: bool,
  ignoreBoundaries: bool,
  interactive: bool,
  listenX: bool,
  listenY: bool,
  resize: bool,
  shrink: shrinkPropType,
  speedRatioX: number,
  speedRatioY: number
})

const stringOrNumberPropType = oneOfType([string, number])

const iScrollOptionsPropType = shape({
  // Basic options
  useTransform:  bool,
  useTransition: bool,
  HWCompositing: bool,
  bounce: bool,
  click:  bool,
  disableMouse:   bool,
  disablePointer: bool,
  disableTouch:   bool,
  eventPassthrough: oneOf([true, false, 'horizontal']),
  freeScroll:  bool,
  keyBindings: oneOfType([
    bool,
    shape({
      pageUp:   stringOrNumberPropType,
      pageDown: stringOrNumberPropType,
      end:  stringOrNumberPropType,
      home: stringOrNumberPropType,
      left: stringOrNumberPropType,
      up:    stringOrNumberPropType,
      right: stringOrNumberPropType,
      down:  stringOrNumberPropType
    })
  ]),
  invertWheelDirection: bool,
  momentum:   bool,
  mouseWheel: bool,
  preventDefault: bool,
  scrollX: bool,
  scrollY: bool,
  startX: number,
  startY: number,
  tap: oneOfType([
    bool,
    string
  ]),

  // Scrollbars
  scrollbars: oneOf([true, false, 'custom']),
  fadeScrollbars: bool,
  interactiveScrollbars: bool,
  resizeScrollbars: bool,
  shrinkScrollbars: shrinkPropType,

  // Indicators
  indicators: oneOfType([
    indicatorPropType,
    PropTypes.arrayOf(indicatorPropType)
  ]),

  // Snap
  snap: oneOfType([string, bool]),

  // Zoom
  zoom: bool,
  zoomMax: number,
  zoomMin: number,
  zoomStart: number,
  wheelAction: oneOf(['zoom']),

  // Advanced
  bindToWrapper: bool,
  bounceEasing: oneOfType([
    oneOf(['quadratic', 'circular', 'back', 'bounce', 'elastic']),
    shape({
      style: string,
      fn: func
    })
  ]),
  bounceTime: number,
  deceleration: number,
  mouseWheelSpeed: number,
  preventDefaultException: shape({
    className: instanceOf(RegExp),
    tagName:   instanceOf(RegExp)
  }),
  resizePolling: number,

  // Probe version (onScroll event)
  probeType: oneOf([1, 2, 3])
})

// Generate propTypes with event function validating
const reactIScrollPropTypes = {
  defer: oneOfType([
    PropTypes.bool,
    PropTypes.number
  ]),
  iScroll: iScrollPropType,
  onRefresh: func,
  options: iScrollOptionsPropType
}


export default function(eventsNames) {
  for(const eventName in eventsNames) {
    reactIScrollPropTypes[eventName] = func
  }

  return reactIScrollPropTypes
}
