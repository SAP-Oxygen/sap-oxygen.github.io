(function($) {
  var BulletList = React.createClass({
    // Standard React API
    render: function() {
      var self = this;
      return (
        <div>
          <ul>
          {
            $.map(this.getAllItems(), function(pair, index) {
              return (<li key={pair.key}>{pair.value.text}</li>);
            })
          }
          </ul>
          <input id="item-to-add" type="text"/>
          <input id="add-button" type="button" onClick={self.onAddButtonClick} value="Add"/>
        </div>
      );
    },
    getInitialState: function() {
      return {data: {}, users: []};
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
    onAddButtonClick: function() {
      var inputBox = $('#item-to-add');
      var newItem = $.trim(inputBox.val());
      if (newItem.length > 0) {
        this.addItem(newItem);
        inputBox.val('');
      }
    },
    addItem: function(newItem) {
      var newEntry = {};
      var randomId = Math.random().toString(16).replace('0.', '');
      var newId = "item_" + randomId;
      newEntry[newId] = {timestamp: new Date().getTime(), text: newItem};

      // optimistic local update
      this.setState({data: $.extend(this.state.data, newEntry), users: this.state.users});
      // remote update
      wave.getState().submitDelta(newEntry);
    },
    getAllItems: function() {
      return $.map(this.state.data, function(value, key) {
        return {key: key, value: value};
      }).sort(function(a, b) {
        return a.value.timestamp - b.value.timestamp;
      });
    },
  });

  gadgets.util.registerOnLoadHandler(function() {
    React.render(
      <BulletList/>,
      document.body
    );
  });
})(jQuery);