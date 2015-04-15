var StatusBox = React.createClass({displayName: "StatusBox",
  render: function() {
    return (
      React.createElement("div", {className: "StatusBox"}, 
        React.createElement("div", {className: "page-header"}, 
          React.createElement("h1", null, "OpenSocial Status"), 
          React.createElement(WaveStatus, null), 
          React.createElement(AppdataStatus, null), 
          React.createElement(PrefsStatus, null)
        )
      )
    )
  }
});

var WaveStatus = React.createClass({displayName: "WaveStatus",
  render: function() {
    return (
      React.createElement("div", {className: "WaveStatus"}, 
        React.createElement("div", {className: "alert alert-success", role: "alert"}, 
          React.createElement("b", null, "Wave Status:"), " GOOD" 
        )
      )
    )
  }
});

var AppdataStatus = React.createClass({displayName: "AppdataStatus",
  render: function() {
    return (
      React.createElement("div", {className: "AppdataStatus"}, 
        React.createElement("div", {className: "alert alert-success", role: "alert"}, 
          React.createElement("b", null, "Appdata Status:"), " GOOD"
        )
      )
    )
  }
});

var PrefsStatus = React.createClass({displayName: "PrefsStatus",
  render: function() {
    return (
      React.createElement("div", {className: "PrefsStatus"}, 
        React.createElement("div", {className: "alert alert-danger", role: "alert"}, 
          React.createElement("b", null, "Prefs Status: "), " BAD"
        )
      )
    )
  }
});

gadgets.util.registerOnLoadHandler(function() {
  React.render(
    React.createElement(StatusBox),
    document.getElementById('content')
    );
});
