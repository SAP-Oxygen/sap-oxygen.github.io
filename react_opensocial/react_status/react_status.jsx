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
      <div className="WaveStatus">
        <div className={color} role="alert">
          <b>Wave Status:</b> {status}
        </div>
      </div>
    );
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
