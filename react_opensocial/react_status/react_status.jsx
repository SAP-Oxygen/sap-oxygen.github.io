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
    );
  }
});

var WaveStatus = React.createClass({
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
      <div className="WaveStatus">
        <div className={color} role="alert">
        Wave Status: <strong>{status}</strong>
        </div>
      </div>
    );
  }
});

var AppdataStatus = React.createClass({
  getInitialState: function() {
    return {data: {}};
  },
  componentDidMount: function() {
    var self = this;
    var testData = {test: "test"};

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
      <div className="AppdataStatus">
        <div className={color} role="alert">
        Appdata Status: <strong>{status}</strong>
        </div>
      </div>
    );
  }
});

var PrefsStatus = React.createClass({
  getInitialState: function() {
    return {data:{}};
  },
  componentDidMount: function() {

  },
  handleTest: function() {
    console.log("in handleTest");

    var prefs = new gadgets.Prefs();
    var self = this;

    var get = function() {
      var mycolor = prefs.getString("mycolor");
      var localData = self.state.data;
      if (mycolor === "black") {
        localData["get"] = true;
      } else {
        localData["get"] = false;
      }
      self.setState(localData);
      console.log("mycolor: " + mycolor);
    };

    var set = function() {
      prefs.set("mycolor", "white");
      var newMycolor = prefs.getString("mycolor");
      var localData = self.state.data;
      if (newMycolor === "white") {
        localData["set"] = true;
      } else {
        localData["set"] = false;
      }
      self.setState(localData);
      console.log("newMycolor: " + newMycolor);
    };

    get();
    set();
  },
  render: function() {
    var localData = this.state.data;
    if (localData["get"] && localData["set"]) {
      console.log("statusDOM: success");
      color = "alert alert-success";
      status = "GOOD";
    } else {
      console.log("statusDOM: danger");
      color = "alert alert-danger";
      status = "BAD";
    }
    return (
      <div className="PrefsStatus">
        <div className={color} role="alert">
        Prefs Status: <strong>{status}</strong>
        </div>
        <button type="button" className="btn btn-default btn-sm" onClick={this.handleTest}>
        test
        </button>
      </div>
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
