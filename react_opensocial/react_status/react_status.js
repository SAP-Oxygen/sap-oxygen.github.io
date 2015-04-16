var StatusBox = React.createClass({displayName: "StatusBox",
  componentDidMount: function() {
    gadgets.window.adjustHeight();
  },
  componentDidUpdate: function() {
    gadgets.window.adjustHeight();
  },
  render: function() {
    return (
      React.createElement("div", {className: "StatusBox"}, 
        React.createElement("div", {className: "page-header"}, 
          React.createElement("h1", null, "OpenSocial Status")
        ), 
        React.createElement(WaveStatus, null), 
        React.createElement(AppdataStatus, null), 
        React.createElement(PrefsStatus, null)
      )
    );
  }
});

var WaveStatus = React.createClass({displayName: "WaveStatus",
  render: function() {
    // console.log("inWaveSatus");
    // var submitDeltaStatus;
    // if (1 === 1) {
    //   submitDeltaStatus = true;
    // }
    // var statusDOM = function (submitDeltaStatus) {
    //   if (submitDeltaStatus) {
    //     console.log("statusDOM: success");
    //     return (
    //       <div className="alert alert-{class_name}" role="alert">
    //         <b>Wave Status:</b> {status}
    //       </div>
    //     );
    //   } else {
    //     console.log("statusDOM: danger");
    //     return (
    //       <div className="alert alert-danger" role="alert">
    //         <b>Wave Status:</b> BAD
    //       </div>
    //     );
    //   }
    // }
    return (
      React.createElement("div", {className: "WaveStatus"}, 
        React.createElement("div", {className: "alert alert-success", role: "alert"}, 
          React.createElement("b", null, "Wave Status:")
        )
      )
    );
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
    );
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
    );
  }
});

gadgets.util.registerOnLoadHandler(function() {
  React.render(
    React.createElement(StatusBox),
    document.getElementById('content')
    );
});
