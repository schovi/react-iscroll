# React iScroll

React component for wrapping iScroll library.

## ! Breaking changes in version 1.0.0

- Property for passing iScroll instance is renamed from `iscroll` to `iScroll` and naming is unified across whole package
  - use it like `<ReactIScroll iScroll={iScroll}>` instead of ~~`<ReactIScroll iscroll={iScroll}>`~~
- Inner content wrapper is removed. https://github.com/schovi/react-iscroll/commit/ecd75bb75667a45d2e14a2eda0a1b7d56c9d54f4
  - You can do it by yourself by wrapping childrens of ReactIScroll component into one more div with specific styling (check **Horizontal scroll example** there in README)
  - Main iScroll element has same behaviour and you can still change styling with `style` and `className` properties.

### What is iScroll?

> iScroll is a high performance, small footprint, dependency free, multi-platform javascript scroller.
>
> -- <cite>[iScroll's homepage][1]</cite>

[1]:http://iscrolljs.com/

Works on mobile and desktop, supports zooming, pagging, parallax scrolling, carousels and is incredibly small (4kb compress gzipped).

### Why React component?

React components are a great way to compose your application. And they are a great way to handle third party libraries. You can wrap complex logic around a library and expose a simple API, which react users are used to.

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
      <div style={height: '100vh'}>
        <h1>Example of scrollable list</h1>
        <ReactIScroll iScroll={iScroll}
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

## FAQs

### onScroll event does not works

You have to use **probe** version of iScroll and add `probeType` to `<ReactIScroll options={{probeType:2}}>`. Check [iScroll documentation](http://iscrolljs.com/) for more information.


## Configuration (API)

Basic configuration. Just component with iScroll library. You can pick build which you want.

```js
var iScroll = require('iscroll/build/iscroll-lite')

<ReactIScroll iScroll={iScroll}>
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

<ReactIScroll iScroll={iScroll}
              options={options}>
  <div>Long content...</div>
</ReactIScroll>
```

Component supports all iScroll events. All of them passed iScroll instance to callback.

```js
var iScroll = require('iscroll/build/iscroll-probe')

<ReactIScroll iScroll={iScroll}
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
    <ReactIScroll iScroll={iScroll}
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
You can pass `true` as first argument for call callback after iScroll is initialized

```js
  onSomethingClick: function(ev) {
    ev.preventDefault()
    this.refs.iScroll.withIScroll(function(iScroll) {
      iScroll.scrollTo(0,0)
    })
  },

  render: function() {
    return(
      <div>
        <ReactIScroll ref="iScroll"
                      iScroll={iScroll}
                      onRefresh={this.onRefresh}>
          <div>Long content...</div>
          <a class="#" onClick={this.onSomethingClick}>Back to top</a>
        </ReactIScroll>
      </div>
    )
  }
```

## Horizontal scroll

Common usecase of horizontal scrolling

```js
var React = require('react'),
    ReactIScroll = require('react-iscroll'),
    iScroll = require('iscroll');

var HorizontalScroll = React.createClass({
  render: function() {
    return (
      <ReactIScroll iScroll={iScroll}
                    options={{mouseWheel: true, scrollbars: true, scrollX: true}}>
        <div style={{width:'200%'}}>
          <ul>
            {listOfLi}
          </ul>
        </div>
      </ReactIScroll>
    )
  }
})
```

## Example

There is example application. You can run it with this commands:

- `npm install`
- `npm run example`
- `open http://localhost:8080/`

## To-Do

- [ ] Add tests
- [ ] Think about `shouldComponentUpdate`. Now it is always true because `this.props.children` are new object everytime and can't be compared via `==` or `===`. Maybe there is some way how to cheaply compare them.
- [ ] Don't initialize IScroll when there is no child supplied.

### Done
- [x] Make this README.md :)
- [x] Trigger `onRefresh` event when iScroll is internally refreshed (e.g. on window resize)
- [x] Do not `require('iscroll')` by itself. Instead pass it in props (there is few different versions of iScroll and you want to pick correct one for you)
- [x] Publish to npm
- [x] Convert source code into Babel


## License

React iScroll is released under the [MIT License](http://www.opensource.org/licenses/MIT).
