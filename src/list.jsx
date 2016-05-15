import React from 'react'
import { PropTypes } from 'react'
import ReactDOM from 'react-dom';

const propTypes = {
  element: PropTypes.string,
  items:   PropTypes.array.isRequired,
  render:  PropTypes.func.isRequired,
  cache:   PropTypes.number
}

export default class IScrollList extends React.Component {

  static displayName = 'IScrollList'

  static propTypes = propTypes

  static defaultProps = {
    element: 'div',
    cache:   false
  }

  static contextTypes = {
    iScroll: PropTypes.object
  }

  constructor(props) {
    super(props)
    this._cache = []
  }

  componentDidMount() {
    const iScroll = this.context.iScroll
    const el = ReactDOM.findDOMNode(iScroll)
    console.log(el.clientHeight)
    console.log(el.offsetHeight)
  }

  renderItems() {
    return []
  }

  render() {
    // Keep only html attributes
    const props = {}

    for(const prop in this.props) {
      if(!propTypes[prop]) {
        props[prop] = this.props[prop]
      }
    }

    return React.createElement(this.props.element, props, this.renderItems())
  }
}
