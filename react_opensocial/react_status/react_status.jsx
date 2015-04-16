var StatusBox = React.createClass({
  componentDidMount: function() {
    gadgets.window.adjustHeight();
  },
  componentDidUpdate: function() {
    gadgets.window.adjustHeight();
  },
  render: function() {
    return (
      <div className="StatusBox">
        <div className="page-header">
          <h1>OpenSocial Status</h1>
        </div>
        <WaveStatus />
        <AppdataStatus />
        <PrefsStatus />
      </div>
    )
  }
});

var WaveStatus = React.createClass({
  render: function() {
    var submitDeltaStatus;
    if (1 === 1) {
      submitDeltaStatus = true;
    }
    var statusDOM = function (submitDeltaStatus) {
      if (submitDeltaStatus) {
        console.log("statusDOM: success");
        return (
          <div className="alert alert-success" role="alert">
            <b>Wave Status:</b> GOOD
          </div>
        )
      } else {
        console.log("statusDOM: danger");
        return (
          <div className="alert alert-danger" role="alert">
            <b>Wave Status:</b> BAD
          </div>
        )
      }
    }
    return (
      <div className="WaveStatus">
        {statusDOM}
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
