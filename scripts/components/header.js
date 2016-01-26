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
          <li className="width-20"><img className="thumbnail" alt="BMTA" src="build/css/images/bmta_logo.png" /></li>
          <li className="width-20"><img className="thumbnail" alt="NSTDA" src="build/css/images/nstda_logo.png" /></li>
          <li className="width-20"><img className="thumbnail" alt="NECTEC" src="build/css/images/nectec_logo.png" /></li>
          <li className="width-20"><img className="thumbnail" alt="Traffy" src="build/css/images/traffy_logo.png" /></li>
          <li className="width-20"><img className="thumbnail" alt="AIS" src="build/css/images/ais_logo.png" /></li>
        </ul>
        <span>สาย</span>
        <h1>73ก <small>BETA</small> </h1>
      </header>
    )
  },
  propTypes: {
    tagline: React.PropTypes.string
  }
});

export default Header;