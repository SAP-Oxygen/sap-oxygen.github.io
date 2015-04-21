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
    console.log("inGetInitialState");
    return {data: {}};
  },
  componentDidMount: function() {
    console.log("inComponentDidMount");
  },
  handleTest: function(e) {
    e.preventDefault();

    console.log("inHandleTest");

    var self = this;
    var testData = {};
    testData["test"] = {test: "test"};
    var color;
    var waveStateStatus;

    for (i = 0; i < loops; i++) {
      if (wave.getState()) {
        waveStateStatus = true;
      } else {
        waveStateStatus = false;
      }
    }
    var localData = this.state.data;
    localData["waveStateStatus"] = waveStateStatus;
    self.setState(localData);
    wave.getState().submitDelta(testData);
    
    function onWaveUpdate() {
      var testData = {};
      testData["test"] = {test: "test"};
      var waveData = {};
      var waveState = wave.getState();
      var submitDeltaStatus;
      $.each(waveState.getKeys(), function(index, key) {
        waveData[key] = waveState.get(key);
      });
      // JSON method
      if (JSON.stringify(waveData["test"]) === JSON.stringify(testData["test"])) {
        submitDeltaStatus = true;
      } else {
        submitDeltaStatus = false;
      }
      var localData = self.state.data;
      localData["submitDeltaStatus"] = submitDeltaStatus;
      self.setState(localData);
    }

    wave.setStateCallback(onWaveUpdate);
  },
  render: function() {
    var data = this.state.data;
    if (data["waveStateStatus"] && data["submitDeltaStatus"]) {
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
        ), 
        React.createElement("button", {type: "button", className: "btn btn-default btn-sm", onClick: this.handleTest}, 
         "Test"
        )
      )
    );
  }
});

var AppdataStatus = React.createClass({displayName: "AppdataStatus",
  getInitialState: function() {
    console.log("inGetInitialState");
    return {data: {}};
  },
  componentDidMount: function() {
    console.log("inComponentDidMount");
  },
  handleTest: function(e) {
    e.preventDefault();

    var appdata_get = function() {
      osapi.appdata.get({userId: '@viewer', groupId: '@self', fields: ['test']}).execute(function (userData) {
        console.log("appdata_get: " + JSON.stringify(userData));
        return userData;
      });
    };

    var appdata_get1 = function() {
      osapi.appdata.get({userId: '@viewer', groupId: '@self'}).execute(function (userData) {
        console.log("appdata_get: " + JSON.stringify(userData));
        return userData;
      });
    };

    var appdata_update = function(input){
      osapi.appdata.update({userId: '@viewer', groupId: '@self', data: {test: input, test1: input, test2: input}}).execute(function (userData) {
        if (userData.error) {
          console.log("appdata_update failed");
        }
        else {
          appdata_get();
          appdata_get1();
          console.log("appdata_update succeeded");
        }
      });
    };

    appdata_update("test");
  },
  render: function() {
    return (
      React.createElement("div", {className: "AppdataStatus"}, 
        React.createElement("div", {className: "alert alert-success", role: "alert"}, 
          React.createElement("b", null, "Appdata Status:"), " GOOD"
        ), 
        React.createElement("button", {type: "button", className: "btn btn-default btn-sm", onClick: this.handleTest}, 
         "Test"
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
