import React from 'react'
import ReactDOM from 'react-dom'
// import CSSTransitionGroup from 'react-addons-css-transition-group'
import { Router, Route } from 'react-router'

// var Navigation = ReactRouter.Navigation; // mixin
// var History = ReactRouter.History;
import createBrowserHistory from 'history/lib/createBrowserHistory'
// import h from './helpers'
// Firebase
// import Rebase from 're-base'
// var base = Rebase.createClass('https://shining-heat-3666.firebaseio.com/');

/*
  components
 */
import NotFound from './components/notfound'
import App from './components/app'
import Geolocation from './components/geoloc'


/*
  Routes
 */

var routes = (
  <Router history={createBrowserHistory()}>
    <Route path="/transit/" component={App}/>
    <Route path="/" component={App}/>
    <Route path="*" component={NotFound}/>
  </Router>
)

ReactDOM.render(routes, document.querySelector("#main"));
