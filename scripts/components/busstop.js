import React from 'react'
import cx from 'classnames'
import {humanizeTime} from '../helpers'

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
            // console.log(ele.est_arrival_time);
            let nextStopTime = '';
            if (ele.est_arrival_time) {
              nextStopTime = (
                <span className="arrival-time">
                  {humanizeTime(ele.est_arrival_time)}<br/>
                  จะถึงป้ายหน้า
                </span>
              )
            }
            return (
              <div className={xClsName} key={key}>
                { incoming.length ? this.renderBigBusIcon() : null }
                {nextStopTime}
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

});


export default {
  BusStop,
  BusStopList
};
