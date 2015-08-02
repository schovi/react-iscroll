import './example.css'
import React from 'react'
import ReactIScroll from '../index.js'
import IScroll from 'iscroll'

const iScrollOptions = {
  mouseWheel: true,
  scrollbars: true
}

class Example extends React.Component {

  constructor(props) {
    super(props)

    const list = [], len = 30;
    let i = 0;

    for(i; i < len; i++) {
      list.push(i+1)
    }

    this.state = {
      y: 0,
      isScrolling: false,
      list: list,
      lastId: len
    }
  }

  onScrollStart() {
    this.setState({isScrolling: true})
  }

  onScrollEnd(iscroll) {
    this.setState({isScrolling: false, y: iscroll.y})
  }

  addRow(ev) {
    ev.preventDefault()

    const list  = this.state.list,
          newId = this.state.lastId + 1;

    list.push(newId)

    this.setState({list: list, lastId: newId})
  }

  removeRow(ev) {
    ev.preventDefault()

    const list = this.state.list;

    list.shift()

    this.setState({list: list})
  }

  onScrollRefresh(iscroll) {
    const hasVerticalScroll = iscroll.hasVerticalScroll;

    if(this.state.canScroll !== hasVerticalScroll) {
      this.setState({canScroll: hasVerticalScroll})
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
          <button onClick={this.removeRow.bind(this)} className="button">Remove first row</button>
          React IScroll component example
        </div>
        <div id="wrapper">
          <ReactIScroll iscroll={IScroll}
                        options={iScrollOptions}
                        onRefresh={this.onScrollRefresh.bind(this)}
                        onScrollStart={this.onScrollStart.bind(this)}
                        onScrollEnd={this.onScrollEnd.bind(this)}>
            <ul>
              {listOfLi}
            </ul>
          </ReactIScroll>
        </div>
        <div id="footer">
          <button onClick={this.addRow.bind(this)} className="button">Add one row</button>
          status: {this.state.isScrolling ? 'Scrolling' : 'Standby' } |
          can scroll: {this.state.canScroll ? 'Yes' : 'No'}
        </div>
      </div>
    )
  }
}

React.render(<Example />, document.getElementById("example"))
