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
        React.createElement(PeopleStatus, null), 
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
    console.log("WaveStatus-componentDidMount");

    var self = this;
    var testData = {};
    testData["test"] = {test: "test"};

    var onWaveUpdate = function() {
      console.log("WaveStatus-onWaveUpdate");
      var waveData = {};
      var waveState = wave.getState();
      var localData = self.state.data;
      $.each(waveState.getKeys(), function(index, key) {
        waveData[key] = waveState.get(key);
      });
      if (JSON.stringify(waveData["test"]) === JSON.stringify(testData["test"])) {
        console.log("WaveStatus-data matches");
        localData["onUpdate"] = true;
      } else {
        console.log("WaveStatus-data does not match");
        localData["onUpdate"] = false;
      }
      self.setState(localData);
    };

    var onWaveInit = function() {
      console.log("WaveStatus-onWaveInit");
      var localData = self.state.data;
      if (wave.getState()) {
        localData["state"] = true;
      } else {
        console.log("wave is null");
        localData["state"] = false;
      }
      self.setState(localData);
      wave.setStateCallback(onWaveUpdate);
      wave.getState().submitDelta(testData);
    };

    wave.setStateCallback(onWaveInit);
  },
  render: function() {
    var data = this.state.data;
    if (data["onUpdate"] && data["state"]) {
      console.log("WavesStatus-status: success");
      color = "alert alert-success";
      status = "GOOD";
    } else {
      console.log("WaveStatus-status: danger");
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
    console.log("AppdataStatus-componentDidMount");

    var self = this;
    var testData = {test: "test"};

    var appdataGet = function(viewerId) {
      osapi.appdata.get({userId: '@viewer', groupId: '@self', fields: ['test']}).execute(function (userData) {
        var localData = self.state.data;
        console.log("AppdataStatus-appdata_get: " + JSON.stringify(userData));
        if (userData.error) {
          localData["get"] = false;
        } else {
          var receivedData = userData[viewerId];
          if (JSON.stringify(testData) === JSON.stringify(receivedData)) {
            localData["get"] = true;
          } else {
            localData["get"] = false;
          }
        }
        appdataDelete(viewerId);
        self.setState(localData);
      });
    };

    var appdataUpdate = function(viewerId) {
      osapi.appdata.update({userId: '@viewer', groupId: '@self', data: testData}).execute(function (userData) {
        var localData = self.state.data;
        if (userData.error) {
          localData["update"] = false;
        } else {
          localData["update"] = true;
        }
        appdataGet(viewerId);
        self.setState(localData);
      });
    };

    var appdataGetEmpty = function(viewerId) {
      osapi.appdata.get({userId: '@viewer', grouId: '@self', fields: ['test']}).execute(function (userData) {
        var localData = self.state.data;
        if (userData.error) {
          localData["getEmpty"] = false;
        } else {
          var receivedData = userData[viewerId];
          if (JSON.stringify(receivedData) === JSON.stringify({})) {
            localData["getEmpty"] = true;
            console.log("AppdataStatus-appdata_getEmpty: " + JSON.stringify(userData));
          } else {
            localData["getEmpty"] = false;
          }
        }
        self.setState(localData);
      });
    }

    var appdataDelete = function(viewerId) {
      osapi.appdata.delete({userId: '@viewer', groupId: '@self', fields: ['test']}).execute(function (userData) {
        var localData = self.state.data;
        if (userData.error) {
          localData["delete"] = false;
        } else {
          localData["delete"] = true;
          console.log("AppdataStatus-appdata_delete: " + JSON.stringify(userData));
        }
        appdataGetEmpty(viewerId);
        self.setState(localData);
      })
    };

    var appdataGetViewer = function() {
      osapi.people.getViewer().execute(function (userData) {
        var localData = self.state.data;
        if (userData.error) {
          localData["getViewer"] = false;
        } else {
          localData["getViewer"] = true;
          console.log("AppdataStatus-appdata_getViewer: " + JSON.stringify(userData));
        }
        self.setState(localData);
        appdataUpdate(userData["id"]);
      });
    };

    appdataGetViewer();
  },
  render: function() {
    var localData = this.state.data;
    if (localData["getViewer"] && localData["get"] && localData["update"] && localData["getEmpty"] && localData["delete"]) {
      console.log("AppdataStatus-status: success");
      color = "alert alert-success";
      status = "GOOD";
    } else {
      console.log("AppdataStatus-status: danger");
      color = "alert alert-danger";
      status = "BAD";
    }
    return (
      React.createElement("div", {className: "Osapi.AppdataStatus"}, 
        React.createElement("div", {className: color, role: "alert"}, 
        "Appdata Status: ", React.createElement("strong", null, status)
        )
      )
    );
  }
});

var PeopleStatus = React.createClass({displayName: "PeopleStatus",
  getInitialState: function() {
    return {data:{}};
  },
  componentDidMount: function() {
    console.log("PeopleStatus-componenetDidMount");

    var self = this;

    var peopleGetViewer = function() {
      osapi.people.getViewer().execute(function (userData) {
        var localData = self.state.data;
        if (userData.error) {
          localData["getViewer"] = false;
        } else {
          localData["getViewer"] = true;
          console.log("PeopleStatus-people_getViewer: " + JSON.stringify(userData));
        }
        self.setState(localData);
        peopleGetViewerFriends();
      });
    };

    var peopleGetViewerFriends = function () {
      osapi.people.getViewerFriends().execute(function(userData) {
        var localData = self.state.data;
        if (userData.error) {
          localData["getViewerFriends"] = false;
        } else {
          localData["getViewerFriends"] = true;
          console.log("PeopleStatus-people_getViewerFriends: " + JSON.stringify(userData));
        }
        self.setState(localData);
        peopleGetOwner();
      });
    };

    var peopleGetOwner = function () {
      osapi.people.getViewerFriends().execute(function(userData) {
        var localData = self.state.data;
        if (userData.error) {
          localData["getOwner"] = false;
        } else {
          localData["getOwner"] = true;
          console.log("PeopleStatus-people_getOwner: " + JSON.stringify(userData));
        }
        self.setState(localData);
        peopleGetOwnerFriends();
      });
    };

    var peopleGetOwnerFriends = function () {
      osapi.people.getViewerFriends().execute(function(userData) {
        var localData = self.state.data;
        if (userData.error) {
          localData["getOwnerFriends"] = false;
        } else {
          localData["getOwnerFriends"] = true;
          console.log("PeopleStatus-people_getOwnerFriends: " + JSON.stringify(userData));
        }
        self.setState(localData);
      });
    };

    peopleGetViewer();
  },
  render: function() {
    var localData = this.state.data;
    if (localData["getViewer"] && localData["getViewerFriends"] && localData["getOwner"] && localData["getOwnerFriends"]) {
      console.log("PeopleStatus-status: success");
      color = "alert alert-success";
      status = "GOOD";
    } else {
      console.log("PeopleStatus-status: danger");
      color = "alert alert-danger";
      status = "BAD";
    }
    return (
      React.createElement("div", {className: "Osapi.AppdataStatus"}, 
        React.createElement("div", {className: color, role: "alert"}, 
        "People Status: ", React.createElement("strong", null, status)
        )
      )
    );
  }
});

var PrefsStatus = React.createClass({displayName: "PrefsStatus",
  getInitialState: function() {
    return {data:{}};
  },
  componentDidMount: function() {
    console.log("PrefsStatus-componenetDidMount");

    var self = this;
    var prefs = new gadgets.Prefs();

    var set = function() {
      var mycolor = prefs.getString("mycolor");
      console.log("PrefsStatus-mycolor: (should be black) " + mycolor);
      prefs.set("mycolor", "white");
      var newMycolor = prefs.getString("mycolor");
      var localData = self.state.data;
      if (newMycolor === "white") {
        localData["set"] = true;
      } else {
        localData["set"] = false;
      }
      self.setState(localData);
      console.log("PrefsStatus-newMycolor: (should be white) " + newMycolor);
    };

    set();
  },
  render: function() {
    var localData = this.state.data;
    if (localData["set"]) {
      console.log("PrefsStatus-status: success");
      color = "alert alert-success";
      status = "GOOD";
    } else {
      console.log("PrefsStatus-status: danger");
      color = "alert alert-danger";
      status = "BAD";
    }
    return (
      React.createElement("div", {className: "PrefsStatus"}, 
        React.createElement("div", {className: color, role: "alert"}, 
        "Prefs Status: ", React.createElement("strong", null, status)
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
