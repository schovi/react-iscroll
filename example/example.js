import React from 'react'
import ReactDOM from 'react-dom'
import iScroll from 'iscroll'

import './example.css'
import ReactIScroll from '../src/react-iscroll'

const iScrollOptions = {
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
  };

  onScrollEnd = (iScrollInstance) => {
    this.setState({isScrolling: false, y: iScrollInstance.y})
  };

  addRow = (ev) => {
    ev.preventDefault()

    const list  = this.state.list,
          newId = this.state.lastId + 1;

    list.push(newId)

    this.setState({list: list, lastId: newId})
  };

  removeRow = (ev) => {
    ev.preventDefault()

    const list = this.state.list;

    list.shift()

    this.setState({list: list})
  };

  onScrollRefresh = (iScrollInstance) => {
    const hasVerticalScroll = iScrollInstance.hasVerticalScroll

    if(this.state.canVerticallyScroll !== hasVerticalScroll) {
      this.setState({canVerticallyScroll: hasVerticalScroll})
    }
  };

  render() {
    const listOfLi = [],
          len = this.state.list.length;
    let i = 0;

    for(i; i < len; i++) {
      listOfLi.push(<li key={i}>Pretty row {this.state.list[i]}<span className="beyond">I'm beyond</span></li>)
    }

    return (
      <div>
        <div id="header">
          <button onClick={this.removeRow} className="button">Remove first row</button>
          React iScroll component example
        </div>
        <div id="wrapper">
          <ReactIScroll iScroll={iScroll}
                        options={iScrollOptions}
                        onRefresh={this.onScrollRefresh}
                        onScrollStart={this.onScrollStart}
                        onScrollEnd={this.onScrollEnd}>
            <div style={{width: "110%"}}>
              <ul>
                {listOfLi}
              </ul>
            </div>
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
