import React from 'react'

import iScroll from 'iscroll'
import IScroll from '../../src/react-iscroll'
import IScrollList from '../../src/list'

const iScrollOptions = {
  mouseWheel: true,
  scrollbars: true,
  infinite: {     // new option scope for infinite features
    treshold: 100 // how many pixels before end it will trigger onLoadMore event
  }
}

export default class Infinite extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      list:    [],
      count:   50,
      loading: false
    }

    this.onLoadMore = this.onLoadMore.bind(this)
  }

  componentDidMount() {
    this.getData(1, this.state.count)
  }

  // Custom loading function
  getData(page, count) {
    this.setState({
      loading: true
    })

    // Simulate async call from 500ms to 2s
    setTimeout(() => {
      const list = this.state.list.slice(0)
      const start = (page - 1) * count

      for(let i = 1; i <= count; i++) {
        list.push(start + i)
      }

      this.setState({
        list:    list,
        page:    page,
        loading: false
      })
    }, 500 + Math.random() * 1500)
  }

  onLoadMore() {
    console.log("onLoadMore")
    this.getData(this.state.page + 1, this.state.count)
  }

  renderItem(item, index) {
    return <li key={index}>Pretty row {item}</li>
  }

  render() {
    return (
      <div>
        <div id="header">
          React iScroll infinite scroll example
        </div>
        <div id="wrapper">
          <IScroll iScroll={iScroll}
                   options={iScrollOptions}
                   onLoadMore={this.onLoadMore}>
            <div className="content">
              <IScrollList className="infinite-list" // classic html attributes
                           element="ul"              // wrapper element
                           items={this.state.list}   // list of items
                           render={this.renderItem}  // item renderer function
                           cache={1000}              // how many items is kept in cache
                           prerender={10}            /* how many items is rendered before and after current viewport */ >
                {this.state.list} {/* Or you can pass list of items as children */}
              </IScrollList>
           </div>
         </IScroll>
        </div>
        <div id="footer">
          Scroll to load more
        </div>
      </div>
    )
  }
}
