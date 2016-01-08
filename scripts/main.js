import React from 'react'
import ReactDOM from 'react-dom'
import CSSTransitionGroup from 'react-addons-css-transition-group'
import ReactInterval from 'react-interval'
import { Router, Route } from 'react-router'
import Catalyst from 'react-catalyst'
// var Navigation = ReactRouter.Navigation; // mixin
// var History = ReactRouter.History;
import createBrowserHistory from 'history/lib/createBrowserHistory'
import h from './helpers'
import request from 'reqwest'
import when from 'when'
// Firebase
import Rebase from 're-base'
var base = Rebase.createClass('https://shining-heat-3666.firebaseio.com/');

/*
  components
 */
import NotFound from './components/NotFound'

// const BUS_LOCATION_URL = '//cloud.traffy.in.th/apis/lib/apiScript/getBusLocation/getBusLocation.php?bus_line=73';
const BUS_LOCATION_URL = '//localhost:8000/car/'

/*
  App
 */

var App = React.createClass({
  mixins: [Catalyst.LinkedStateMixin],

  getInitialState: function() {
    return {
      busStops: [],
      enabled: true,
      timeout: 5000,
      buses: [],
      busAtStop: {}
    }
  },

  fetchCurrentBusLocation: function() {
    let app = this;

    console.log('fetch fetchCurrentBusLocation');
    when(request({
      url: BUS_LOCATION_URL,
      method: 'GET',
      headers: {
        // 'Authorization': 'Bearer ',
      }
    }).then(function(response) {
      let currentBusAtStop = {};

      response.map( (obj) => {
        let station = obj.near_station;
        let stationId = String(station.id_stop);
        let bus = {
          // need to change into something better -- fetch from API for example
          bus_line: obj.bus_line,
          loc: [ obj.latitude, obj.longitude ],
          plate_id: obj.plate_id
        }

        if (stationId in currentBusAtStop) {
          currentBusAtStop[stationId].push(bus);
        } else {
          currentBusAtStop[stationId] = [ bus ]
        }

      } );

      app.setState({
        buses: response,
        busAtStop: currentBusAtStop
      });

      return true;
    }));
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
        <ReactInterval {...{timeout, enabled}} callback={this.fetchCurrentBusLocation.bind(null, this)} />
        <Header/>
        <div className="content">
          <ul className="inline-list">
            <li><label><input type="checkbox" ref="enableUpdate" checked={this.state.enabled}
          onClick={this.toggleEnableUpdate.bind(null, this)} /> update?</label></li>
            <li>Bus Total: {this.state.buses.length}</li>
          </ul>
        </div>
        <BusStopList busStops={this.state.busStops} busAtStop={this.state.busAtStop} />
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
      <BusStop key={key} index={key} details={this.props.busStops[key]}
        busAtStop={this.props.busAtStop} />
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
    busAtStop: React.PropTypes.object.isRequired,
    busStops: React.PropTypes.array.isRequired
  }
});

/*
  BusStop
  <BusStop/>
 */

var BusStop = React.createClass({

  render: function() {
    let detail = this.props.details;
    // check if there is incoming bus
    let incoming = [];
    if (String(detail.id) in this.props.busAtStop) {
      incoming = this.props.busAtStop[String(detail.id)];
    }
    // check if there is a bus at stop
    return (
      <li>
        <div className="block">
          <time className="cbp_tmtime">
            <span></span>
            <span></span></time>
          <div className="cbp_tmicon">
          </div>
          <div className="cbp_tmlabel">
            <h4>{detail.name} <small>#{detail.id}</small></h4>
            <p>
              { incoming.length ? <b>Incoming bus:</b> : '' }
              {incoming.map( (bus) =>  bus.plate_id + "," )}
            </p>
          </div>
        </div>

        <div className="block">
          <time className="cbp_tmtime">
            <span>{ incoming.length ? incoming.length : '' }</span>
            <span></span></time>
          <div className="cbp_tmicon ontheway">{ incoming.length ? this.renderBusIcon() : null }</div>
          <div className="cbp_tmblank"></div>
        </div>
      </li>
    )
  },
  renderBusIcon: function() {
    return <i className="fa fa-bus"></i>
  },
  propTypes: {
    busAtStop: React.PropTypes.object.isRequired,
    details: React.PropTypes.object.isRequired
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
