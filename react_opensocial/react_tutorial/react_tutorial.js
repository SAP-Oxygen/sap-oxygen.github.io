var VoteBox = React.createClass({displayName: "VoteBox",
  getInitialState: function() {
    return {data: {}};
  },
  componentDidMount: function() {
    var self = this;
    function onWaveUpdate() {
      if (!wave.getState()) {
        return;
      }
      var waveData = {};
      var waveState = wave.getState();
      $.each(waveState.getKeys(), function(index, key) {
        waveData[key] = waveState.get(key);
      });
      //for consistency in the array
      console.log("data in onWaveUpdate: " + waveData);
      var delay=3000;
      setTimeout(function() {
        self.setState({data: waveData});
      },delay);
    }

    wave.setStateCallback(onWaveUpdate);
    wave.setParticipantCallback(onWaveUpdate);
    console.log("setStateCallback + setParticipantCallback are called")
  },
  // invoked immediately after the component's updates are flushed to the DOM
  componentDidUpdate: function() {
    gadgets.window.adjustHeight();
  },
  handleTopicSubmit: function(topic) {
    var newTopic = {};
    newTopic[topic] = {topic: topic, timestamp: new Date().getTime(), votes: []};
    // optimistic local update
    var localData = this.state.data;
    $.extend(localData, newTopic);
    this.setState({data: localData});
    console.log("handleTopicSubmit-this.state.data: " + localData);
    var waveState = wave.getState();
    if (!waveState) {
      return;
    }
    waveState.submitDelta(newTopic);
  },
  handleVoteSubmit: function(topic, viewerId) {
    var waveState = wave.getState();
    if(!waveState) {
      return;
    }
    var updatedEntry = {};
    var localData = this.state.data;
    var voteData = localData[topic];
    // if votes array does not exist, then add a new one
    voteData.votes = voteData.votes || [];
    if ($.inArray(viewerId, voteData.votes) == -1) {
      // optimistic local update
      voteData.votes.push(viewerId);
      localData[topic] = voteData;
      this.setState({data: localData});
      console.log("handleVoteSubmit-this.state.data: " + localData);
      updatedEntry[topic] = voteData;
      waveState.submitDelta(updatedEntry);
    }
  },
  handleUnVoteSubmit: function(topic, viewerId) {
    var waveState = wave.getState();
    if(!waveState) {
      return;
    }
    var updatedEntry = {};
    var localData = this.state.data;
    var voteData = localData[topic];
    // if votes array does not exist, then add a new one
    voteData.votes = voteData.votes || [];
    var index = $.inArray(viewerId, voteData.votes);
    if (index !== -1) {
      voteData.votes.splice(index, 1);
      localData[topic] = voteData;
      this.setState({data: localData});
      console.log("handleUnVoteSubmit-this.state.data: " + localData);
      updatedEntry[topic] = voteData;
      waveState.submitDelta(updatedEntry);
    }
  },
  render: function() {
    var localData = this.state.data;
    var data = [];
    var keys = Object.keys(this.state.data);
    // pass data as an array sorted by timestamp
    $.each(keys, function(index, key) {
      data[index] = localData[key];
    });
    data.sort(function(a, b) {
      return a.timestamp - b.timestamp;
    });
    return (
      React.createElement("div", {className: "VoteBox"}, 
        React.createElement("nav", {className: "navbar navbar-inverse navbar-fixed-top"}, 
          React.createElement("div", {className: "container-fluid"}, 
            React.createElement("div", {className: "navbar-header"}, 
              React.createElement("button", {type: "button", className: "navbar-toggle collapsed", "data-toggle": "collapse", "data-target": "#bs-example-navbar-collapse-1"}, 
                React.createElement("span", {className: "sr-only"}, "Toggle navigation"), 
                React.createElement("span", {className: "icon-bar"}), 
                React.createElement("span", {className: "icon-bar"}), 
                React.createElement("span", {className: "icon-bar"})
              ), 
              React.createElement("a", {className: "navbar-brand", href: "#"}, "OpenSocial Tutorial")
            ), 
            React.createElement("div", {className: "collapse navbar-collapse", id: "bs-example-navbar-collapse-1"}, 
              React.createElement(VoteForm, {onTopicSubmit: this.handleTopicSubmit})
            )
          )
        ), 
        React.createElement(VoteList, {data: data, onHandleVoteSubmit: this.handleVoteSubmit, onHandleUnVoteSubmit: this.handleUnVoteSubmit})
      )
    );
  }
});

var VoteList = React.createClass({displayName: "VoteList",
  render: function() {
    var voteNodes = this.props.data.map(function (voteData) {
      return (
        React.createElement(VoteTopic, {voteData: voteData, onHandleVoteSubmit: this.props.onHandleVoteSubmit, onHandleUnVoteSubmit: this.props.onHandleUnVoteSubmit}, 
          voteData.topic
        )
      );
    }, this);
    return (
      React.createElement("div", {className: "VoteList"}, 
        voteNodes
      )
    );
  }
});

var VoteTopic = React.createClass({displayName: "VoteTopic",
  render: function() {
    return (
      React.createElement("div", {className: "VoteTopic"}, 
        React.createElement("div", {className: "panel panel-primary"}, 
          React.createElement("div", {className: "panel-heading clearfix narrow-panel-heading"}, 
            React.createElement("h4", {className: "panel-title pull-left topic-align"}, this.props.children), 
              React.createElement(VoteButton, {topic: this.props.children, onHandleVoteSubmit: this.props.onHandleVoteSubmit, onHandleUnVoteSubmit: this.props.onHandleUnVoteSubmit})
          ), 
          React.createElement("div", {className: "panel-body narrow-panel-body"}, 
            React.createElement(VoteThumbnail, {votes: this.props.voteData.votes})
          )
        )
      )
    );
  }
});

var VoteThumbnail = React.createClass({displayName: "VoteThumbnail",
  render: function() {
    var thumbnails;
    if (this.props.votes) {
      var thumbnails = this.props.votes.map(function (viewerId) {
        var voter = wave.getParticipantById(viewerId);
        // skipping the rest due to a bug that returns null from the previous line
        if (!voter) {
          return;
        }
        var thumbnail = voter.getThumbnailUrl();
        var name = voter.getDisplayName();
        return (
          React.createElement("img", {className: "img-rounded img-fixed", id: "thumbnail", title: name, src: thumbnail})
        );
      }, this);
    }
    return (
      React.createElement("div", {className: "VoteThumbNail"}, 
          thumbnails
      )
    );
  }
});

var VoteButton = React.createClass({displayName: "VoteButton",
  handleVote: function() {
    var topic = this.props.topic;
    var viewerId = wave.getViewer().getId();
    this.props.onHandleVoteSubmit(topic, viewerId);
  },
  handleUnVote: function() {
    var topic = this.props.topic;
    var viewerId = wave.getViewer().getId();
    this.props.onHandleUnVoteSubmit(topic, viewerId);
  },
  render: function() {
    return (
      React.createElement("div", {className: "btn-group btn-group-sm pull-right", role: "group", "arial-label": "..."}, 
        React.createElement("button", {type: "button", className: "btn btn-default btn-sm btn-vote", onClick: this.handleVote}, 
          "Vote Up ", React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"})
        ), 
        React.createElement("button", {type: "button", className: "btn btn-default btn-sm btn-vote", onClick: this.handleUnVote}, 
          "Vote Down ", React.createElement("span", {className: "glyphicon glyphicon-minus", "aria-hidden": "true"})
        )
      )
    );
  }
});

var VoteForm = React.createClass({displayName: "VoteForm",
  handleSubmit: function(e) {
    e.preventDefault();

    var topic = React.findDOMNode(this.refs.topic).value.trim();
    this.props.onTopicSubmit(topic);

    React.findDOMNode(this.refs.topic).value = '';
    return;
  },
  render: function() {
    return (
      React.createElement("form", {className: "VoteForm navbar-form navbar-left", role: "search", onSubmit: this.handleSubmit}, 
        React.createElement("div", {className: "form-group"}, 
          React.createElement("input", {type: "text", className: "form-control", placeholder: "New topic", ref: "topic"})
        ), 
        React.createElement("button", {type: "submit", className: "btn btn-default"}, "Add!")
      )
    );
  }
});

gadgets.util.registerOnLoadHandler(function() {
  React.render(
    React.createElement(VoteBox),
    document.getElementById('content')
    );
});
