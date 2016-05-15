import React from 'react'
import ReactDOM from 'react-dom'

import './example.css'

// Examples
import Simple from './examples/simple'
import Infinite from './examples/infinite'

var simpleEl = document.getElementById("simple")
if(simpleEl) {
  ReactDOM.render(<Simple />, simpleEl)
}

var infiniteEl = document.getElementById("infinite")
if(infiniteEl) {
  ReactDOM.render(<Infinite />, infiniteEl)
}
