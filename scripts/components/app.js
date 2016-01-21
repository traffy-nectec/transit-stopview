import React from 'react'
import Catalyst from 'react-catalyst'
import ReactInterval from 'react-interval'

import request from 'reqwest'
import when from 'when'
import moment from 'moment'
/*
  components
 */
import {humanizeTime} from '../helpers'

import Header from './header'
import {BusStop, BusStopList} from './busstop'
import {BUS_LOCATION_URL, BUSSTOP_URL} from '../constant'

/*
  App
 */

const App = React.createClass({
  mixins: [Catalyst.LinkedStateMixin],

  getInitialState: function() {
    return {
      busStops: [],
      enabled: true,
      timeout: 5000,
      buses: [],
      busAtStop: {},
      incomingBus: {},
      routeId: '135',
      lastUpdated: undefined,
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
      let newestTimestamp = new Date('1970-01-01');

      response.filter(item => item.direct == routeConv[app.state.routeId])
          .map( (obj) => {
        // let station = obj.near_station;
        let next_station = obj.next_station;
        let prev_station = obj.previous_station;
        let stationId = String(prev_station.id_stop);

        if ( newestTimestamp < moment(obj.time_stamp) )
          newestTimestamp = moment(obj.time_stamp);

        let bus = {
          // need to change into something better -- fetch from API for example
          bus_line: obj.bus_line,
          loc: [ obj.latitude, obj.longitude ],
          id: obj.bmta_id,
          linear_ref: obj.linearref
        }

        // if it's at the destination, we don't care
        let relative_ref_btw_stops = 0;
        // but when it's not at the destination, we have to calc relative_ref
        if (next_station.id_stop != prev_station.id_stop) {
          relative_ref_btw_stops = (+bus.linear_ref - +prev_station.linearref)*100 /
          (+next_station.linearref - +prev_station.linearref);
        }

        bus['ref_btw_stops'] = Math.floor(relative_ref_btw_stops);

        let tenth = Math.floor(bus['ref_btw_stops']/10)
        bus['ref_classname'] = "d" + ( (tenth > 1 && tenth < 9) ? '8' : '' ) + "0";

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

      } );

      app.setState({
        buses: response.filter(item => item.direct == routeConv[app.state.routeId]),
        busAtStop: currentBusAtStop,
        incomingBus: currentLeavingBus,
        lastUpdated: newestTimestamp,
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
      });

      app.fetchCurrentBusLocation();

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
            <li><a href="http://goo.gl/forms/e7GYDPC0CK" target="_blank" className="outside_link">
              [ เสนอแนะ/ติชม ]</a></li>
            <li>ปรับปรุงเมื่อ: {humanizeTime(this.state.lastUpdated)}</li>
          </ul>
        </div>
        <BusStopList busStops={this.state.busStops}
          busAtStop={this.state.busAtStop}
          incomingBus = {this.state.incomingBus} />
      </div>
    )
  }

});

export default App;