import React from 'react'
import ReactDOM from 'react-dom'
import CSSTransitionGroup from 'react-addons-css-transition-group'
import ReactInterval from 'react-interval'
import { Router, Route } from 'react-router'
import Catalyst from 'react-catalyst'
import cs from 'classnames'

// var Navigation = ReactRouter.Navigation; // mixin
// var History = ReactRouter.History;
import createBrowserHistory from 'history/lib/createBrowserHistory'
// import h from './helpers'
import request from 'reqwest'
import when from 'when'
// Firebase
// import Rebase from 're-base'
// var base = Rebase.createClass('https://shining-heat-3666.firebaseio.com/');
import cx from 'classnames';

/*
  components
 */
import NotFound from './components/NotFound'
import {BUS_LOCATION_URL, BUSSTOP_URL} from './constant'

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
      busAtStop: {},
      incomingBus: {},
      routeId: '135'
    }
  },

  fetchCurrentBusLocation: function() {
    let app = this;
    let routeConv = {}
    routeConv['135'] = 'outbound';
    routeConv['136'] = 'inbound';

    // console.log('fetch fetchCurrentBusLocation');
    when(request({
      url: BUS_LOCATION_URL,
      method: 'GET',
      type: 'json',
      headers: {
        // 'Authorization': 'Bearer ',
      }
    }).then(function(response) {
      let currentBusAtStop = {};
      let currentLeavingBus = {};

      response.filter(item => item.direct == routeConv[app.state.routeId])
          .map( (obj) => {
        // let station = obj.near_station;
        let next_station = obj.next_station;
        let prev_station = obj.previous_station;
        let stationId = String(prev_station.id_stop);

        let bus = {
          // need to change into something better -- fetch from API for example
          bus_line: obj.bus_line,
          loc: [ obj.latitude, obj.longitude ],
          id: obj.bmta_id,
          linear_ref: obj.linearref
        }
        let relative_ref_btw_stops = (+bus.linear_ref - +prev_station.linearref)*100 /
          (+next_station.linearref - +prev_station.linearref);

        bus['ref_btw_stops'] = Math.floor(relative_ref_btw_stops);

        let tenth = Math.floor(bus['ref_btw_stops']/10)
        bus['ref_classname'] = "d" + ( (tenth > 1 && tenth < 9) ? tenth : '' ) + "0";

        // console.log(bus);

        if (bus.ref_btw_stops < 10) {
          if (stationId in currentBusAtStop) {
            currentBusAtStop[stationId].push(bus);
          } else {
            currentBusAtStop[stationId] = [ bus ];
          }
        } else if (bus.ref_btw_stops > 90) {
          let xStationId = String(next_station.id_stop);
          if (xStationId in currentBusAtStop) {
            currentBusAtStop[xStationId].push(bus);
          } else {
            currentBusAtStop[xStationId] = [ bus ];
          }
        } else {
          if (stationId in currentLeavingBus) {
            currentLeavingBus[stationId].push(bus);
          } else {
            currentLeavingBus[stationId] = [ bus ];
          }
        }
        // console.log("at: #"+currentBusAtStop.length + " | in: #" + currentLeavingBus.length);
      } );

      app.setState({
        buses: response.filter(item => item.direct == routeConv[app.state.routeId]),
        busAtStop: currentBusAtStop,
        incomingBus: currentLeavingBus,
      });

      return true;
    }));
  },

  toggleEnableUpdate: function(evt) {
    this.setState({
      enabled: this.refs.enableUpdate.checked
    })
  },

  updateBusStops: function(routeId) {
    let app = this;
    // console.log( ' route id : ' + routeId + " / " + app.state.routeId);
    let rId = ( (routeId) ? routeId : app.state.routeId);

    when(request({
      url: BUSSTOP_URL + '&route_id=' + rId,
      method: 'GET',
      type: 'json',
      headers: {
        // 'Authorization': 'Bearer ',
      }
    }).then(function(response) {
      app.setState({
        busStops: response.results
      })

    }))

  },

  changeRouteId: function(evt) {
    this.setState({
      routeId: this.refs.route_id.value,
      buses: [],
      busAtStop: {},
      incomingBus: {},
    })
    this.updateBusStops(this.refs.route_id.value);
  },

  componentDidMount: function() {
    /*this.setState({
      busStops: require('./all-bus-stops')
    })*/
    this.updateBusStops();

  },
  
  render: function() {
    const {timeout, enabled} = this.state;
    return (
      <div className="container">
        <ReactInterval {...{timeout, enabled}} callback={this.fetchCurrentBusLocation.bind(null, this)} />
        <Header/>
        <div className="content">
          <ul className="inline-list">
            {/*<li><label><input type="checkbox" ref="enableUpdate" checked={this.state.enabled}
          onChange={this.toggleEnableUpdate.bind(null, this)} /> update?</label></li>*/}
            <li>จำนวนรถ: {this.state.buses.length} คัน</li>
            <li>
              <select ref="route_id" onChange={this.changeRouteId.bind(null, this)}>
              <option value="135">ขาออก</option>
              <option value="136">ขาเข้า</option>
              </select></li>
          </ul>
        </div>
        <BusStopList busStops={this.state.busStops}
          busAtStop={this.state.busAtStop}
          incomingBus = {this.state.incomingBus} />
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
        busAtStop={this.props.busAtStop}
        incomingBus={this.props.incomingBus} />
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
    incomingBus: React.PropTypes.object.isRequired,
    busStops: React.PropTypes.array.isRequired
  }
});



var BusItemList = React.createClass({

  render: function() {
    let items = this.props.items;
    if (items.length == 0) {
      return <i></i>
    } else {
      return (
        <li><b>{this.props.title}</b>:
          {items.map( (i) => i.id + " (" + (i['ref_btw_stops']) + ") " )}
        </li>
      )
    }
  }

})
/*
  BusStop
  <BusStop/>
 */

var BusStop = React.createClass({

  render: function() {
    let detail = this.props.details;
    // check if there is incoming bus
    let incoming = [];
    let atStop = [];
    if (String(detail.stop_id) in this.props.incomingBus) {
      incoming = this.props.incomingBus[String(detail.stop_id)];
      // console.log('incoming');
      // console.log(incoming);
    }
    if (String(detail.stop_id) in this.props.busAtStop &&
          this.props.busAtStop[String(detail.stop_id)] != undefined) {
      atStop = this.props.busAtStop[String(detail.stop_id)];
      // console.log('at stop');
      // console.log(atStop);
    }
    let incomingClassDict = {
      'cbp_tmicon': true, 'ontheway': true
    };
    // console.log();
    let incomingClassName = cx(incomingClassDict);
    // console.log(incoming);
    // console.log(atStop);
    // check if there is a bus at stop
    return (
      <li className="each_stop">
        <div className="block">
          <time className="cbp_tmtime">
            <span>{/*{ atStop.length ? atStop.length : '' }*/}</span>
            <span></span></time>
          <div className="cbp_tmicon">
            { atStop.length ? this.renderBusIcon() : null }
          </div>
          {incoming.map( (ele, i) => {
            let xClsDict = [ele.ref_classname, 'cbp_tmicon', 'ontheway'];
            let xClsName = cx(xClsDict);
            let key = "car-icon-" + i;
            return (
              <div className={xClsName} key={key}>
                { incoming.length ? this.renderBigBusIcon() : null }
              </div>
            )
          })}
          <div className="cbp_tmlabel">
            <h4>{detail.name} {/*<small>#{detail.stop_id}</small>*/}</h4>
            {/*<ul>
              <BusItemList title="At stop" items={atStop} />
              <BusItemList title="Leaving" items={incoming} />
            </ul>*/}
          </div>
        </div>

        {/*<div className="block">
          <time className="cbp_tmtime">
            <span>{ incoming.length ? incoming.length : '' }</span>
            <span></span></time>
          {incoming.map( (ele, i) => {
            let xClsDict = [ele.ref_classname, 'cbp_tmicon', 'ontheway'];
            let xClsName = cx(xClsDict);
            let key = "car-icon-" + i;
            return (
              <div className={xClsName} key={key}>
                { incoming.length ? this.renderBigBusIcon() : null }
              </div>
            )
          })}
          <div className="cbp_tmblank"></div>
        </div>*/}
      </li>
    )
  },
  renderBusIcon: function() {
    return <i className="fa fa-bus"></i>
  },
  renderBigBusIcon: function() {
    return <i className="fa fa-bus"></i>
  },
  propTypes: {
    busAtStop: React.PropTypes.object.isRequired,
    incomingBus: React.PropTypes.object.isRequired,
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
        <h1>73ก</h1>
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
