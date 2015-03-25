(function($) {
  var CoSequence = React.createClass({
    // Standard React API
    render: function() {
      var self = this;
      return (
        <div>
          <script type="text/jumly+sequence">
          {this.getSequenceDefinition()}
          </script>
          <input id="definition" type="textarea" onChange={self.onDefinitionChange}/>
        </div>
      );
    },
    getInitialState: function() {
      return {data: {text: ""}, users: []};
    },
    componentDidMount: function() {
      // init sequence - Wave
      var self = this;

      function onWaveUpdate() {
        var newData = {};
        var waveState = wave.getState();

        $.each(waveState.getKeys(), function(index, key) {
          newData[key] = waveState.get(key);
        });

        self.setState({data: newData, users: wave.getParticipants()});
      }

      gadgets.util.registerOnLoadHandler(function() {
        wave.setStateCallback(onWaveUpdate);
        wave.setParticipantCallback(onWaveUpdate);
      });
    },
    // Our own code
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
      return this.state.data.seqDef.text
    },
  });

  gadgets.util.registerOnLoadHandler(function() {
    React.render(
      <CoSequence/>,
      document.body
    );
  });
})(jQuery);