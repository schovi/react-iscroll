import React from 'react'
import ReactDOM from 'react-dom'
import IScroll from 'iscroll'

import './example.css'
import ReactIScroll from '../dist/react-iscroll'

const IScrollOptions = {
  mouseWheel: true,
  scrollbars: true,
  scrollX: true
}

class Example extends React.Component {

  constructor(props) {
    super(props)

    const list = [];
    const len = 30;

    for(let i = 0; i < len; i++) {
      list.push(i+1)
    }

    this.state = {
      y: 0,
      isScrolling: false,
      list: list,
      lastId: len
    }
  }

  onScrollStart = () => {
    this.setState({isScrolling: true})
  }

  onScrollEnd = (IScrollInstance) => {
    this.setState({isScrolling: false, y: IScrollInstance.y})
  }

  addRow = (ev) => {
    ev.preventDefault()

    const list  = this.state.list,
          newId = this.state.lastId + 1;

    list.push(newId)

    this.setState({list: list, lastId: newId})
  }

  removeRow = (ev) => {
    ev.preventDefault()

    const list = this.state.list;

    list.shift()

    this.setState({list: list})

  }

  onScrollRefresh = (IScrollInstance) => {
    const hasVerticalScroll = IScrollInstance.hasVerticalScroll

    if(this.state.canVerticallyScroll !== hasVerticalScroll) {
      this.setState({canVerticallyScroll: hasVerticalScroll})
    }
  }

  render() {
    const listOfLi = [],
          len = this.state.list.length;
    let i = 0;

    for(i; i < len; i++) {
      listOfLi.push(<li key={i}>Pretty row {this.state.list[i]}</li>)
    }

    return (
      <div>
        <div id="header">
          <button onClick={this.removeRow} className="button">Remove first row</button>
          React IScroll component example
        </div>
        <div id="wrapper">
          <ReactIScroll IScroll={IScroll}
                        options={IScrollOptions}
                        onRefresh={this.onScrollRefresh}
                        onScrollStart={this.onScrollStart}
                        onScrollEnd={this.onScrollEnd}
                        scrollerStyle={{width: "200%"}}>
            <ul>
              {listOfLi}
            </ul>
          </ReactIScroll>
        </div>
        <div id="footer">
          <button onClick={this.addRow} className="button">Add one row</button>
          status: {this.state.isScrolling ? 'Scrolling' : 'Standby' } |
          can vertically scroll: {this.state.canVerticallyScroll ? 'Yes' : 'No'}
        </div>
      </div>
    )
  }
}

ReactDOM.render(<Example />, document.getElementById("example"))
