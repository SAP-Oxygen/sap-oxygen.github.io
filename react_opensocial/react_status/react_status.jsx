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
    
    var onWaveUpdate = function() {
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
    };

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
      <div className="WaveStatus">
        <div className={color} role="alert">
          <b>Wave Status:</b> {status}
        </div>
        <button type="button" className="btn btn-default btn-sm" onClick={this.handleTest}>
         Test
        </button>
      </div>
    );
  }
});

var AppdataStatus = React.createClass({
  getInitialState: function() {
    console.log("inGetInitialState");
    return {data: {}};
  },
  componentDidMount: function() {
    console.log("inComponentDidMount");
  },
  handleTest: function(e) {
    e.preventDefault();

    var appdataGetViewer = function() {
      osapi.people.getViewer().execute(function (userData) {
        var localData = this.state.data;
        if (userData.error) {
          localData["getViewerStatus"] = true;
        } else {
          localData["getViewerStatus"] = true;
          console.log("appdata_getViewer: " + JSON.stringify(userData));
        }
      });
    };

    var appdataGet = function() {
      osapi.appdata.get({userId: '@viewer', groupId: '@self', fields: ['test']}).execute(function (userData) {
        if (userData.error) {
          getStatus = false;
        } else {
          getStatus = true;
          console.log("appdata_get: " + JSON.stringify(userData));
        }
        return userData;
      });
    };

    var appdataUpdate = function(input){
      osapi.appdata.update({userId: '@viewer', groupId: '@self', data: {test: input, test1: input, test2: input}}).execute(function (userData) {
        if (userData.error) {
          console.log("appdata_update failed");
        } else {
          var appdataData = appdataGet();

          var localData = self.state.data;
          console.log("appdata_update succeeded");
        }
      });
    };

    appdata_update("test");
  },
  render: function() {
    return (
      <div className="AppdataStatus">
        <div className="alert alert-success" role="alert">
          <b>Appdata Status:</b> GOOD
        </div>
        <button type="button" className="btn btn-default btn-sm" onClick={this.handleTest}>
         Test
        </button>
      </div>
    );
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
    );
  }
});

gadgets.util.registerOnLoadHandler(function() {
  React.render(
    React.createElement(StatusBox),
    document.getElementById('content')
    );
});
