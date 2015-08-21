(function($, React){
  var VoteBox = React.createClass({displayName: "VoteBox",
    // getInitialState function (supported by React) sets the very first state 
    // of this React object
    // set the initial state with an empty value
    // NOTE: it is important to keep VoteBox's state in sync with wave's state
    //       in order to avoid any troubles with wave's live-updating state
    getInitialState: function() {
      return {data: {}};
    },
    // componentDidMount function (supported by React) is called once, immediately
    // after the first render of this React object
    // define functions for wave here since componentDidMount is only called once
    // after VoteBox is rendered
    componentDidMount: function() {
      var self = this;
      // define callback function that is called when wave's state is changed
      function onWaveUpdate() {
        var waveData = {};
        var waveState = wave.getState();
        // go through all the keys in wave's state and store the key-value pair in
        // the waveData object to retrieve all the data from wave
        $.each(waveState.getKeys(), function(index, key) {
          waveData[key] = waveState.get(key);
        });
        // check if waveData object is empty (due to empty state of wave)
        // if not, then update VoteBox's state with current waveData object
        if (!$.isEmptyObject(waveData)) {
          self.setState({data: waveData});
        }
      }
      // set wave's callback on onWaveUpdate function
      wave.setStateCallback(onWaveUpdate);
    },
    // componentDidUpdate function (supported by React) is "invoked immediately after 
    // the component's updates are flushed to the DOM"
    componentDidUpdate: function() {
      // adjust the height whenever the view is updated and re-rendered
      gadgets.window.adjustHeight();
    },
    // handler function for adding a topic item
    handleTopicSubmit: function(topic) {
      // create a new topic with the given topic name
      var newTopic = {};
      newTopic[topic] = {topic: topic, timestamp: new Date().getTime(), votes: []};
      // optimistic local update (optional): update VoteBox's state first locally
      //                                     so the view is rendered right away
      //                                     even before wave's state is updated
      var localData = this.state.data;
      // use jQuery's extend function to avoid changing the actual value in VoteBox's state
      $.extend(localData, newTopic);
      this.setState({data: localData});
      var waveState = wave.getState();
      waveState.submitDelta(newTopic);
    },
    // handler function for a user's voting up action
    handleVoteSubmit: function(topic, viewerId) {
      var updatedEntry = {};
      // retrieve the data from VoteBox's current state
      var localData = this.state.data;
      var voteData = localData[topic];
      // if votes array does not exist, then create a new one
      voteData.votes = voteData.votes || [];
      // get the index of the viewerId in votes array
      // if votes array does not have the current viewerId, then push the viewerId to the
      // votes array
      var index = $.inArray(viewerId, voteData.votes);
      if (index === -1) {
        voteData.votes.push(viewerId);
        // optimistic local update
        this.setState({data: localData});
        updatedEntry[topic] = voteData;
        var waveState = wave.getState();
        waveState.submitDelta(updatedEntry);
      }
    },
    // handler function for a user's voting down action
    handleUnVoteSubmit: function(topic, viewerId) {
      var updatedEntry = {};
      // retrieve the data from VoteBox's current state
      var localData = this.state.data;
      var voteData = localData[topic];
      // if votes array does not exist, then create a new one
      voteData.votes = voteData.votes || [];
      // get the index of the viewerId in votes array
      // if votes array has the current viewerId, then remove the viewerId from the votes
      // array
      var index = $.inArray(viewerId, voteData.votes);
      if (index !== -1) {
        voteData.votes.splice(index, 1);
        // optimistic local update
        this.setState({data: localData});
        updatedEntry[topic] = voteData;
        var waveState = wave.getState();
        waveState.submitDelta(updatedEntry);
      }
    },
    // render function is where all the rendering logics happen. return HTML elements,
    // including custom React elements, that are to be rendered in the browser
    // NOTE: class attribute in HTML tag is replaced with className in jsx
    render: function() {
      var localData = this.state.data;
      var data = [];
      var keys = Object.keys(this.state.data);
      // recreate data as an array sorted by timestamp because data stored in wave's state
      // is not fully consistent. One way to keep the data being rendered consistent is
      // sorting items by their timestamps.
      $.each(keys, function(index, key) {
        data[index] = localData[key];
      });
      data.sort(function(a, b) {
        return a.timestamp - b.timestamp;
      });
      // in the following HTML format, pass the sorted data to VoteList object as it is
      // responsible for populating VoteTopic objects with contents of the sorted data.
      // also pass down handler functions to appropriate React objects
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
      // this.props.* contains the references to functions/objects passed from the parent
      // create a list of VoteTopic objects based on the data given from the parent
      var voteNodes = this.props.data.map(function (voteData) {
        return (
          // key value used for reconciliation
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
      // HTML elements defining VoteTopic object
      return (
        React.createElement("div", {className: "VoteTopic", key: this.props.children}, 
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
          // use wave API to get voter's information, including the thumbnail url
          // and the display name
          var voter = wave.getParticipantById(viewerId);
          if (!voter) {
            return;
          }
          var thumbnail = voter.getThumbnailUrl();
          var name = voter.getDisplayName();
          return (
            React.createElement("img", {className: "img-rounded img-fixed", title: name, src: thumbnail})
          );
        }, this);
      }
      // HTML elements defining VoteThumbnail object
      return (
        React.createElement("div", {className: "VoteThumbnail"}, 
            thumbnails
        )
      );
    }
  });

  var VoteButton = React.createClass({displayName: "VoteButton",
    handleVote: function() {
      // get the topic name and the viewer's ID, then call VoteBox's handleVoteSubmit
      // function with those two parameters
      var topic = this.props.topic;
      var viewerId = wave.getViewer().getId();
      this.props.onHandleVoteSubmit(topic, viewerId);
    },
    handleUnVote: function() {
      // get the topic name and the viewer's ID, then call VoteBox's handleUnVoteSubmit
      // function with those two parameters
      var topic = this.props.topic;
      var viewerId = wave.getViewer().getId();
      this.props.onHandleUnVoteSubmit(topic, viewerId);
    },
    render: function() {
      // HTML elements defining VoteButton object
      return (
        React.createElement("div", {className: "btn-group btn-group-sm pull-right", role: "group"}, 
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
      // retrieve the input value with reference to the ref value
      var topic = React.findDOMNode(this.refs.topic).value.trim();
      // call VoteBox's handleTopicSubmit function
      this.props.onTopicSubmit(topic);
      // reset the input value to an empty string
      React.findDOMNode(this.refs.topic).value = '';
    },
    render: function() {
      // HTML elements defining VoteForm object
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

  // executed when the gadget loads
  gadgets.util.registerOnLoadHandler(function() {
    // render the topmost parent VoteBox under the DOM element with an ID, 'content'
    React.render(
      React.createElement(VoteBox),
      document.getElementById('content')
      );
  });
})(jQuery, React);
