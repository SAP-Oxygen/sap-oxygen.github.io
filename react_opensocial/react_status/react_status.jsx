var StatusBox = React.createClass({
  render: function() {
    return (
      <div className="StatusBox">
        <div className="page-header">
          <h1>OpenSocial Status</h1>
          <WaveStatus />
          <AppdataStatus />
          <PrefsStatus />
        </div>
      </div>
    )
  }
});

var WaveStatus = React.createClass({
  render: function() {
    return (
      <div className="WaveStatus">
        <div className="alert alert-success" role="alert">
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
        <div className="alert alert-success" role="alert">
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
        <div className="alert alert-danger" role="alert">
          <b>Prefs Status: </b> BAD
        </div>
      </div>
    )
  }
});

gadgets.util.registerOnLoadHandler(function() {
  React.render(
    React.createElement(StatusBox),
    document.getElementById('content')
    );
});
