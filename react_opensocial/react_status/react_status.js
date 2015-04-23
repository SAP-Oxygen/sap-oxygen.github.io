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
    return {data: {}};
  },
  componentDidMount: function() {
    var self = this;
    var testData = {};
    testData["test"] = {test: "test"};

    var onWaveUpdate = function() {
      console.log("onWaveUpdate");
      var waveData = {};
      var waveState = wave.getState();
      var localData = self.state.data;
      $.each(waveState.getKeys(), function(index, key) {
        waveData[key] = waveState.get(key);
      });
      if (JSON.stringify(waveData["test"]) === JSON.stringify(testData["test"])) {
        console.log("data matches");
        localData["onUpdateStatus"] = true;
      } else {
        console.log("data does not match");
        localData["onUpdateStatus"] = false;
      }
      self.setState(localData);
    };

    var onWaveInit = function() {
      console.log("onWaveInit");
      var localData = self.state.data;
      if (wave.getState()) {
        console.log("wave is not null");
        localData["stateStatus"] = true;
      } else {
        console.log("wave is null");
        localData["stateStatus"] = false;
      }
      self.setState(localData);
      wave.setStateCallback(onWaveUpdate);
      wave.getState().submitDelta(testData);
    };

    wave.setStateCallback(onWaveInit);
  },
  render: function() {
    var data = this.state.data;
    if (data["onUpdateStatus"] && data["stateStatus"]) {
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
        "Wave Status: ", React.createElement("strong", null, status)
        )
      )
    );
  }
});

var AppdataStatus = React.createClass({displayName: "AppdataStatus",
  getInitialState: function() {
    return {data: {}};
  },
  componentDidMount: function() {
    var self = this;
    var testData = {test: "test"};

    var appdataGetViewer = function() {
      osapi.people.getViewer().execute(function (userData) {
        var localData = self.state.data;
        if (userData.error) {
          localData["getViewerStatus"] = false;
        } else {
          localData["getViewerStatus"] = true;
          console.log("appdata_getViewer: " + JSON.stringify(userData));
        }
        self.setState(localData);
        appdataUpdate(userData["id"]);
      });
    };

    var appdataGet = function(viewerId) {
      osapi.appdata.get({userId: '@viewer', groupId: '@self', fields: ['test']}).execute(function (userData) {
        var localData = self.state.data;
        console.log("appdata_get: " + JSON.stringify(userData));
        if (userData.error) {
          localData["getStatus"] = false;
        } else {
          var receivedData = userData[viewerId];
          if (JSON.stringify(testData) === JSON.stringify(receivedData)) {
            localData["getStatus"] = true;
          } else {
            localData["getStatus"] = false;
          }
        }
        self.setState(localData);
      });
    };

    var appdataUpdate = function(viewerId){
      osapi.appdata.update({userId: '@viewer', groupId: '@self', data: testData}).execute(function (userData) {
        var localData = self.state.data;
        if (userData.error) {
          localData["updateStatus"] = false;
        } else {
          localData["updateStatus"] = true;
          var appdataData = appdataGet(viewerId);
        }
        self.setState(localData);
      });
    };

    appdataGetViewer();
  },
  handleTest: function(e) {
    e.preventDefault();

    var self = this;
    var testData = {test: "test"};

    var appdataGetViewer = function() {
      osapi.people.getViewer().execute(function (userData) {
        var localData = self.state.data;
        if (userData.error) {
          localData["getViewerStatus"] = false;
        } else {
          localData["getViewerStatus"] = true;
          console.log("appdata_getViewer: " + JSON.stringify(userData));
        }
        self.setState(localData);
        appdataUpdate(userData["id"]);
      });
    };

    var appdataGet = function(viewerId) {
      osapi.appdata.get({userId: '@viewer', groupId: '@self', fields: ['test']}).execute(function (userData) {
        var localData = self.state.data;
        console.log("appdata_get: " + JSON.stringify(userData));
        if (userData.error) {
          localData["getStatus"] = false;
        } else {
          var receivedData = userData[viewerId];
          if (JSON.stringify(testData) === JSON.stringify(receivedData)) {
            localData["getStatus"] = true;
          } else {
            localData["getStatus"] = false;
          }
        }
        self.setState(localData);
      });
    };

    var appdataUpdate = function(viewerId){
      osapi.appdata.update({userId: '@viewer', groupId: '@self', data: testData}).execute(function (userData) {
        var localData = self.state.data;
        if (userData.error) {
          localData["updateStatus"] = false;
        } else {
          localData["updateStatus"] = true;
          var appdataData = appdataGet(viewerId);
        }
        self.setState(localData);
      });
    };

    appdataGetViewer();
  },
  render: function() {
    var localData = this.state.data;
    if (localData["getViewerStatus"] && localData["getStatus"] && localData["updateStatus"]) {
      console.log("statusDOM: success");
      color = "alert alert-success";
      status = "GOOD";
    } else {
      console.log("statusDOM: danger");
      color = "alert alert-danger";
      status = "BAD";
    }
    return (
      React.createElement("div", {className: "AppdataStatus"}, 
        React.createElement("div", {className: color, role: "alert"}, 
        "Appdata Status: ", React.createElement("strong", null, status)
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
  console.log(wave);
  console.log(wave.getState());

  React.render(
    React.createElement(StatusBox),
    document.getElementById('content')
    );
});
