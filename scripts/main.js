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
import ga from 'react-ga'
import {GA_TRACKING_ID} from './constant'
/*
  components
 */
import NotFound from './components/NotFound'
import App from './components/app'
import Geolocation from './components/geoloc'


/*
  Routes
 */

var routes = (
  <Router history={createBrowserHistory()} onUpdate={logPageView}>
    <Route path="/transit/" component={App}/>
    <Route path="/" component={App}/>
    <Route path="*" component={NotFound}/>
  </Router>
)

ga.initialize(GA_TRACKING_ID);
ReactDOM.render(routes, document.querySelector('#main'));

function logPageView() {
    ga.pageview(this.state.location.pathname);
}
