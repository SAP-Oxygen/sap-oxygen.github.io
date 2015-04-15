var StatusBox = React.createClass({
  render: function() {
    return (
      <div className="StatusBox">
        <div className="page-header">
          <h1>OpenSocial Status</h1>
        </div>
      </div>
    )
  }
});

var WaveStatus = React.createClass({
  render: function() {
    return (
      <div className="WaveStatus">
        <div class="alert alert-success" role="alert">
          <b>Wave Status:</b> GOOD 
        </div>
      </div>
    )
  }
});

var AppdataStatus = React.createClass({
  render: function() {
    return (
      <div className="AppdataStatus">
        <div class="alert alert-success" role="alert">
          <b>Appdata Status:</b> GOOD
        </div>
      </div>
    )
  }
});

var PrefsStatus = React.createClass({
  render: function() {
    return (
      <div className="PrefsStatus">
        <div class="alert alert-danger" role="alert">
          <b>Prefs Status: </b> BAD
        </div>
      </div>
    )
  }
});