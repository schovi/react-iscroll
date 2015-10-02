require('./example.css')
var React = require('react')
var ReactIScroll = require('../index.js')
var IScroll = require('iscroll')

var iScrollOptions = {
  mouseWheel: true,
  scrollbars: true,
  scrollX: true
}

var Example = React.createClass({
  getInitialState: function() {
    var list = [], i = 0, len = 30;

    for(i; i < len; i++) {
      list.push(i+1)
    }

    return {
      y: 0,
      isScrolling: false,
      list: list,
      lastId: len
    }
  },
  onScrollStart: function() {
    this.setState({isScrolling: true})
  },
  onScrollEnd: function(iscroll) {
    this.setState({isScrolling: false, y: iscroll.y})
  },
  addRow: function(ev) {
    ev.preventDefault()

    var list  = this.state.list,
        newId = this.state.lastId + 1;

    list.push(newId)

    this.setState({list: list, lastId: newId})
  },
  removeRow: function(ev) {
    ev.preventDefault()

    var list = this.state.list;

    list.shift()

    this.setState({list: list})
  },
  onScrollRefresh: function(iscroll) {
    var hasVerticalScroll = iscroll.hasVerticalScroll
    if(this.state.canVerticallyScroll !== hasVerticalScroll) {
      this.setState({canVerticallyScroll: hasVerticalScroll})
    }
  },
  render: function() {
    var i = 0,
        len = this.state.list.length,
        listOfLi = [];

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
          <ReactIScroll iscroll={IScroll}
                        options={iScrollOptions}
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
})

React.render(<Example />, document.getElementById("example"))
