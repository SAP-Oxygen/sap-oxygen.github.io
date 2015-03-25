(function($) {
  var CoSequence = React.createClass({displayName: "CoSequence",
    // Standard React API
    render: function() {
      var self = this;
      return (
        React.createElement("div", null, 
          React.createElement("div", {id: "diagram"}), 
          React.createElement("textarea", {rows: "20", cols: "100", id: "definition", onChange: self.onDefinitionChange}, 
          this.getSequenceDefinition()
          )
        )
      );
    },
    getInitialState: function() {
      return {data: {seqDef: {text: ""}}, users: []};
    },
    componentDidMount: function() {
      // init sequence - Wave
      var self = this;

      function onWaveUpdate() {
        var newData = {};
        var waveState = wave.getState();
        if (waveState === null) {
          return;
        }

        $.each(waveState.getKeys(), function(index, key) {
          newData[key] = waveState.get(key);
        });

        self.setState({data: newData, users: wave.getParticipants()});
      }

      gadgets.util.registerOnLoadHandler(function() {
        wave.setStateCallback(onWaveUpdate);
        wave.setParticipantCallback(onWaveUpdate);
      });

      // init sequence - JUMLY
      updateDiagram();
    },
    componentDidUpdate: function() {
      updateDiagram();
    },
    // Our own code
    updateDiagram: function() {
      JUMLY.eval(this.getSequenceDefinition(), {into: $('#diagram')});
    },
    onDefinitionChange: function() {
      var inputBox = $('#definition');
      var newDef = $.trim(inputBox.val());
      this.setSequenceDefinition(newDef);
    },
    setSequenceDefinition: function(newDef) {
      var newEntry = {};
      newEntry.seqDef = {timestamp: new Date().getTime(), text: newDef};

      // optimistic local update
      this.setState({data: $.extend(this.state.data, newEntry), users: this.state.users});
      // remote update
      wave.getState().submitDelta(newEntry);
    },
    getSequenceDefinition: function() {
      try {
        return this.state.data.seqDef.text;
      } catch (e) {
        return "";
      }
    },
  });

  gadgets.util.registerOnLoadHandler(function() {
    React.render(
      React.createElement(CoSequence, null),
      document.body
    );
  });
})(jQuery);