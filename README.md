# React iScroll

React component for wrapping iScroll library.


### What is iScroll?

> iScroll is a high performance, small footprint, dependency free, multi-platform javascript scroller.
>
> -- <cite>[iScroll's homepage][1]</cite>

[1]:http://iscrolljs.com/

Works on mobile and desktop, supports zooming, pagging, parallax scrolling, carousels and is incredibly small (4kb compress gzipped).

### Why React compoment?

React components are great way how to compose your application. And they are great how to handle third party libraries. You can wrap complex logic around library and expose simple API, which are react users used to.

## Install

    npm install react-iscroll

## Usage

Simple example app. Allow scrolling on long list and catch event when scrolling starts.

```js
var React = require('react'),
    ReactIScroll = require('react-iscroll'),
    iScroll = require('iscroll');

var ExampleApp = React.createClass({
  getDefaultProps: function() {
    return ({
      options: {
        mouseWheel: true,
        scrollbars: true
      },
      wrapperStyle: {
        position: 'absolute',
        zIndex: '1',
        top: '0',
        bottom: '45px',
        left: '0',
        overflow: 'hidden',
      }
    })
  },
  onScrollStart: function() {
    console.log("iScroll starts scrolling")
  },
  render: function() {
    var i = 0, len = 1000, listOfLi = [];

    for(i; i < len; i++) {
      listOfLi.push(<li key={i}>Row {i+1}</li>)
    }

    return (
      <div style={this.props.wrapperStyle}>
        <h1>Example of scrollable list</h1>
        <ReactIScroll iscroll={iScroll}
                      options={this.props.options}
                      onScrollStart={this.onScrollStart}>
          <ul>
            {listOfLi}
          </ul>
        </ReactIScroll>
      </div>
    )
  }
})
```

## Configuration (API)

Basic configuration. Just component with iScroll library. You can pick build which you want.

```js
var iScroll = require('iscroll/build/iscroll-lite')

<ReactIScroll iscroll={iScroll}>
  <div>Long content...</div>
</ReactIScroll>
```

You can customize iScroll options with `options` property. Supports all from [iScroll manual](http://iscrolljs.com/)

```js
var iScroll = require('iscroll/build/iscroll-probe')
var options = {
  mouseWheel: true,
  scrollbars: true,
  freeScroll: true,
  invertWheelDirection: true,
  momentum: false,
  indicators: {...}
}

<ReactIScroll iscroll={iScroll}
              options={options}>
  <div>Long content...</div>
</ReactIScroll>
```

Component supports all iScroll events. All of them passed iScroll instance to callback.

```js
var iScroll = require('iscroll/build/iscroll-probe')

<ReactIScroll iscroll={iScroll}
              onBeforeScrollStart={this.onBeforeScrollStart}
              onScrollCancel={this.onScrollCancel}
              onScrollStart={this.onScrollStart}
              onScroll={this.onScroll}
              onScrollEnd={this.onScrollEnd}
              onFlick={this.onFlick}
              onZoomStart={this.onZoomStart}
              onZoomEnd={this.onZoomEnd}>
  <div>Long content...</div>
</ReactIScroll>
```

Plus there is one special event 'onRefresh' which is triggered when iScroll is refreshed. You can then get state of iScroll like `iscroll.hasVerticalScroll`, `iscroll.x` or `iscroll.scale`.

**Watch out when updating state by value from iScroll. Always update state only when value changed to prevent circular updating (stack level too deep)**

```js
var iScroll = require('iscroll/build/iscroll-lite')

onRefresh: function(iScrollInstance) {
  var yScroll = iScrollInstance.y;

  console.log("vertical position:" + yScroll)

  if(this.state.y != yScroll) {
    this.setState({y: yScroll})
  }
},
render: function() {
  return (
    <ReactIScroll iscroll={iScroll}
                  onRefresh={this.onRefresh}>
      <div>Long content...</div>
    </ReactIScroll>
  )
}
```

### function component.getIScroll()

Return iScroll instance if initialized

### function component.withIScroll([waitForInit], callback)

Run callback with iScroll instance as argument if instance is initialized.
You can pass `true` as first argument for call callback after iscroll is initialized

```js
  onSomethingClick: function(ev) {
    ev.preventDefault()
    this.refs.iscroll.withIScroll(function(iscroll) {
      iscroll.destroy()
    })
  },

  render: function() {
    return(
      <div>
        <a class="#" onClick={this.onSomethingClick}>Do something</a>
        <ReactIScroll ref="iscroll"
                      iscroll={iScroll}
                      onRefresh={this.onRefresh}>
          <div>Long content...</div>
        </ReactIScroll>
      </div>
    )
  }
```

## Example

There is example application. You can run it with this commands:

```
npm install
npm run example
open http://localhost:8080/
```

## To-Do

#### Done
- [x] Make this README.md :)
- [x] Trigger `onRefresh` event when iscroll is internally refreshed (e.g. on window resize)
- [x] Do not `require('iscroll')` by itself. Instead pass it in props (there is few different versions of iscroll and you want to pick correct one for you)
- [x] Publish to npm
- [x] Convert source code into Babel

- [ ] Add tests
- [ ] Think about `shouldComponentUpdate`. Now it is always true because `this.props.children` are new object everytime and can't be compared via `==` or `===`. Maybe there is some way how to cheaply compare them.


## Licence

React iScroll is released under the [MIT License](http://www.opensource.org/licenses/MIT).
