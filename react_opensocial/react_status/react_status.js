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
  getInitialState: function() {
    return {data: {waveStateStatus: true, submitDeltaStatus: true}};
  },
  componentDidMount: function() {
    console.log("inWaveSatus");

    var self = this;
    var loops = 5;
    var delay = 1500;
    var testData = {};
    testData[test] = {test: "test"};
    var color;
    var waveStateStatus;

    for (i = 0; i < loops; i++) {
      setTimeout(function() {
        if (wave.getState()) {
          waveStateStatus = true;
        } else {
          waveStateStatus = false;
        }
      },delay);
    }
    var localData = this.state.data;
    localData["waveStateStatus"] = waveStateStatus;
    self.setState(localData);
    
    function onWaveUpdate() {
      var waveData = {};
      var submitDeltaStatus;
      $.each(wave.getState().getKeys(), function(index, key) {
        waveData[key] = waveState.get(key);
      });
      if (waveData.get("test") === testData[test]) {
        submitDeltatStatus = true;
      } else {
        submitDeltaStatus = false;
      }
      var localData = this.state.data;
      localData["submitDeltaStatus"] = submitDeltaStatus;
      self.setState(localData);
    }

    wave.setStateCallback(onWaveUpdate);
    wave.submitDelta(testdata);
  },
  render: function() {
    var data = this.state.data;
    if (data.get("waveStateStatus") && data.get("submitDeltaStatus")) {
      console.log("statusDOM: success");
      color = "alert alert-success";
      status = "GOOD";
    } else {
      console.log("statusDOM: danger");
      color = "alert alert-danger";
      status = "BAD";
    }
    return (
      React.createElement("div", {className: "WaveStatus"}, 
        React.createElement("div", {className: color, role: "alert"}, 
          React.createElement("b", null, "Wave Status:"), " ", status
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
