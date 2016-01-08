var React = require('react');
var ReactDOM = require('react-dom');
var CSSTransitionGroup = require('react-addons-css-transition-group');

import ReactInterval from 'react-interval';

var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
// var Navigation = ReactRouter.Navigation; // mixin
// var History = ReactRouter.History;

var createBrowserHistory = require('history/lib/createBrowserHistory');

var h = require('./helpers');

// Firebase
var Rebase = require('re-base');
var base = Rebase.createClass('https://shining-heat-3666.firebaseio.com/');

// var Catalyst = require('react-catalyst');
import Catalyst from 'react-catalyst'

/*
  components
 */

import NotFound from './components/NotFound'

const busLocUrl = '//cloud.traffy.in.th/apis/lib/apiScript/getBusLocation/getBusLocation.php?bus_line=73';

/*
  App
 */

var App = React.createClass({
  mixins: [Catalyst.LinkedStateMixin],

  getInitialState: function() {
    return {
      busStops: {},
      enabled: false,
      timeout: 1000,
    }
  },

  fetchCurrentBusLocation: function() {
    console.log('fetch fetchCurrentBusLocation');
  },

  toggleEnableUpdate: function(evt) {
    this.setState({
      enabled: this.refs.enableUpdate.checked
    })
  },

  componentDidMount: function() {
    this.setState({
      busStops: require('./all-bus-stops')
    })
  },
  
  render: function() {
    const {timeout, enabled} = this.state;
    return (
      <div className="container">
        <ReactInterval {...{timeout, enabled}} callback={this.fetchCurrentBusLocation} />
        <Header/>
        <div className="text-right">
          <label><input type="checkbox" ref="enableUpdate" value={this.state.enabled}
          onClick={this.toggleEnableUpdate.bind(null, this)} /> update?</label>
        </div>
        <BusStopList busStops={this.state.busStops} />
      </div>
    )
  }

});


/*
  BusStopList
  <BusStopList/>
 */

var BusStopList = React.createClass({
  renderBusStop: function(key) {
    return (
      <BusStop key={key} index={key} details={this.props.busStops[key]}/>
    )
  },
  render: function() {
    return (
      <div className="main">
        <ul className="cbp_tmtimeline">
          {Object.keys(this.props.busStops).map(this.renderBusStop)}
        </ul>
      </div>
    )
  },
  propTypes: {
    busStops: React.PropTypes.object.isRequired
  }
});

/*
  BusStop
  <BusStop/>
 */

var BusStop = React.createClass({

  render: function() {
    var detail = this.props.details;
    return (
      <li>
        <div className="block">
          <time className="cbp_tmtime">
            <span>_#busId?</span>
            <span></span></time>
          <div className="cbp_tmicon">
          </div>
          <div className="cbp_tmlabel">
            <h4>{detail.name} <small>#{detail.id}</small></h4>
          </div>
        </div>

        <div className="block">
          <time className="cbp_tmtime">
            <span>_#busId?</span>
            <span></span></time>
          <div className="cbp_tmicon ontheway"></div>
          <div className="cbp_tmblank"></div>
        </div>
      </li>
    )
  }

})

/*
  Header
  <Header/>
 */
var Header = React.createClass({

  render: function() {
    return (
      <header className="clearfix">
        <span>Traffy</span>
        <h1>73a</h1>
      </header> 
    )
  },
  propTypes: {
    tagline: React.PropTypes.string
  }
});

/*
  Routes
 */


var routes = (
  <Router history={createBrowserHistory()}>
    <Route path="/" component={App}/>
    <Route path="*" component={NotFound}/>
  </Router>
)

ReactDOM.render(routes, document.querySelector("#main"));
