(function($) {
  var BulletList = React.createClass({displayName: "BulletList",
    // Standard React API
    render: function() {
      var self = this;
      return (
        React.createElement("div", {onClick: self.cancelHighlight}, 
          React.createElement("ul", null, 
          
            $.map(this.getAllItems(), function(pair, index) {
              return (React.createElement("li", {key: pair.key, style: pair.shouldHighlight ? {color: 'blue'} : {}}, pair.value.text));
            })
          
          ), 
          React.createElement("input", {id: "item-to-add", type: "text"}), 
          React.createElement("input", {id: "add-button", type: "button", onClick: self.onAddButtonClick, value: "Add"})
        )
      );
    },
    getInitialState: function() {
      return {data: {}, users: []};
    },
    componentDidMount: function() {
      gadgets.window.adjustHeight();

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

      window.setTimeout(function() {
        wave.setStateCallback(onWaveUpdate);
        wave.setParticipantCallback(onWaveUpdate);
        
        gadgets.sapjam && gadgets.sapjam.navigation.registerObjectNavigationCallback(function(objectId) {
          window.console && console.log("Navigate to: " + objectId);
          self.setState({viewState: {highlight: objectId}});
        });
      }, 0);
    },
    componentDidUpdate: function(prevProps, prevState) {
      gadgets.window.adjustHeight();
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
      // add a feed entry
      osapi.activitystreams.create({
        activity: {
          title: "#{addItem}",
          content: "#{addItemContent}",
          object: {
            displayName: newItem,
            id: newId,
            attachments: [
              {displayName: window.navigator.userAgent}
            ]
          }
        }
      }).execute(function (result) {
        window.console && console.log(result);
      });
    },
    getAllItems: function() {
      var viewState = this.state.viewState;
      return $.map(this.state.data, function(value, key) {
        return {key: key, value: value, shouldHighlight: (viewState && viewState.highlight === key)};
      }).sort(function(a, b) {
        return a.value.timestamp - b.value.timestamp;
      });
    },
    cancelHighlight: function() {
      this.setState({viewState: {}});
    }
  });

  gadgets.util.registerOnLoadHandler(function() {
    React.render(
      React.createElement(BulletList, null),
      document.body
    );
  });
})(jQuery);