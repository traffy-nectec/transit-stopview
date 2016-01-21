import React from 'react'
/*
  Header
  <Header/>
 */
const Header = React.createClass({

  render: function() {
    return (
      <header className="clearfix">
        <ul className="pull-right inline-list">
          <li><img src="build/css/images/nstda_logo.svg" width="150" height="60" /></li>
          <li><img src="build/css/images/nectec_logo.png" width="150" height="60" /></li>
          <li><img src="build/css/images/traffy_logo.png" width="150" height="60" /></li>
          <li><img src="build/css/images/ais_logo.png" width="150" height="60" /></li>
        </ul>
        <span>Traffy</span>
        <h1>73ก <small>ปรับปรุงทุก 10 วินาที</small> </h1>
      </header>
    )
  },
  propTypes: {
    tagline: React.PropTypes.string
  }
});

export default Header;