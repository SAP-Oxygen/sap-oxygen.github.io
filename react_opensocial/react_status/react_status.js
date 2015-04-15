var StatusBox = React.createClass({displayName: "StatusBox",
  render: function() {
    return (
      React.createElement("div", {className: "StatusBox"}, 
        React.createElement("div", {className: "page-header"}, 
          React.createElement("h1", null, "OpenSocial Status")
        )
      )
    )
  }
});

var WaveStatus = React.createClass({displayName: "WaveStatus",
  render: function() {
    return (
      React.createElement("div", {className: "WaveStatus"}, 
        React.createElement("div", {class: "alert alert-success", role: "alert"}, 
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
        React.createElement("div", {class: "alert alert-success", role: "alert"}, 
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
        React.createElement("div", {class: "alert alert-danger", role: "alert"}, 
          React.createElement("b", null, "Prefs Status: "), " BAD"
        )
      )
    )
  }
});