(function($, React){
  var VoteBox = React.createClass({
    getInitialState: function() {
      return {data: {}};
    },
    componentDidMount: function() {
      var self = this;
      function onWaveUpdate() {
        gadgets.window.adjustHeight();
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
        self.setState({data: waveData});
      }

      wave.setStateCallback(onWaveUpdate);
      wave.setParticipantCallback(onWaveUpdate);
      console.log("setStateCallback + setParticipantCallback are called")
    },
    // invoked immediately after the component's updates are flushed to the DOM
    componentDidUpdate: function() {
      console.log("componentDidUpdate is called");
      // gadgets.window.adjustHeight();
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
      var index = $.inArray(viewerId, voteData.votes);
      if (index === -1) {
        // optimistic local update
        voteData.votes.push(viewerId);
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
        <div className="VoteBox">
          <nav className="navbar navbar-inverse navbar-fixed-top">
            <div className="container-fluid">
              <div className="navbar-header">
                <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                  <span className="sr-only">Toggle navigation</span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                </button>
                <a className="navbar-brand" href="#">OpenSocial Tutorial</a>
              </div>
              <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                <VoteForm onTopicSubmit={this.handleTopicSubmit} />
              </div>
            </div>
          </nav>
          <VoteList data={data} onHandleVoteSubmit={this.handleVoteSubmit} onHandleUnVoteSubmit={this.handleUnVoteSubmit} />
        </div>
      );
    }
  });

  var VoteList = React.createClass({
    render: function() {
      var voteNodes = this.props.data.map(function (voteData) {
        return (
          <VoteTopic voteData={voteData} onHandleVoteSubmit={this.props.onHandleVoteSubmit} onHandleUnVoteSubmit={this.props.onHandleUnVoteSubmit}>
            {voteData.topic}
          </VoteTopic>
        );
      }, this);
      return (
        <div className="VoteList" >
          {voteNodes}
        </div>
      );
    }
  });

  var VoteTopic = React.createClass({
    render: function() {
      return (
        <div className="VoteTopic">
          <div className="panel panel-primary">
            <div className="panel-heading clearfix narrow-panel-heading">
              <h4 className="panel-title pull-left topic-align">{this.props.children}</h4>
                <VoteButton topic={this.props.children} onHandleVoteSubmit={this.props.onHandleVoteSubmit} onHandleUnVoteSubmit={this.props.onHandleUnVoteSubmit}/>
            </div>
            <div className="panel-body narrow-panel-body">
              <VoteThumbnail votes={this.props.voteData.votes} />
            </div>
          </div>
        </div>
      );
    }
  });

  var VoteThumbnail = React.createClass({
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
            <img className="img-rounded img-fixed" title={name} src={thumbnail} />
          );
        }, this);
      }
      return (
        <div className="VoteThumbnail">
            {thumbnails}
        </div>
      );
    }
  });

  var VoteButton = React.createClass({
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
        <div className="btn-group btn-group-sm pull-right" role="group" arial-label="...">
          <button type="button" className="btn btn-default btn-sm btn-vote" onClick={this.handleVote}>
            Vote Up <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
          </button>
          <button type="button" className="btn btn-default btn-sm btn-vote" onClick={this.handleUnVote}>
            Vote Down <span className="glyphicon glyphicon-minus" aria-hidden="true"></span>
          </button>
        </div>
      );
    }
  });

  var VoteForm = React.createClass({
    handleSubmit: function(e) {
      e.preventDefault();

      var topic = React.findDOMNode(this.refs.topic).value.trim();
      this.props.onTopicSubmit(topic);

      React.findDOMNode(this.refs.topic).value = '';
    },
    render: function() {
      return (
        <form className="VoteForm navbar-form navbar-left" role="search" onSubmit={this.handleSubmit}>
          <div className="form-group">
            <input type="text" className="form-control" placeholder="New topic" ref="topic" />
          </div>
          <button type="submit" className="btn btn-default" >Add!</button>
        </form>
      );
    }
  });

  gadgets.util.registerOnLoadHandler(function() {
    React.render(
      React.createElement(VoteBox),
      document.getElementById('content')
      );
  });
})(jQuery, React);
