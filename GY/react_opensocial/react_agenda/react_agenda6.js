'use strict'

var init = function(React, ReactBootstrap, $, moment, gadgets, wave) {

  // variables for using React-Bootstrap
  var Table = ReactBootstrap.Table;
  var Button = ReactBootstrap.Button;
  var Grid = ReactBootstrap.Grid;
  var Row = ReactBootstrap.Row;
  var Col = ReactBootstrap.Col;
  var Glyphicon = ReactBootstrap.Glyphicon;
  var initHeight = 400;

  var adjustHeight = function() {
    var height = $("#grid").height();
    if (height > initHeight) {
      gadgets.window.adjustHeight();
    }
  };

  var Agenda = React.createClass({displayName: "Agenda",
    getInitialState: function() {
      // if (this.props.data.startTime) {
      //   var startTime = moment(this.props.data.startTime);
      // } else {
      //   var startTime = moment();
      // }
      var startTime = moment();
      return {
        items: [],
        order: [],
        itemsMap: {},
        startTime: startTime,
        people: [],
        dragging: false,
        lastWaveData: {}
      } 
    },
    componentDidMount: function() {
      var self = this;

      var onWaveUpdate = function() {
        // currently disabled writing startTime variable in wave
        console.log("onWaveUpdate has been called");
        var waveState = wave.getState();
        var waveData = {};
        $.each(waveState.getKeys(), function(index, key) {
          waveData[key] = waveState.get(key);
        });
        var lastWaveData = self.state.lastWaveData;
        console.log("waveData: ");
        console.log(waveData);
        console.log("lastWaveData: ");
        console.log(lastWaveData);
        console.log("dragging: ");
        console.log(self.state.dragging);

        // if dragging variable of the current state is true,
        // then store the current waveData and do not update the state
        if (self.state.dragging) {
          self.setState({
            lastWaveData: waveData
          });
        } else if (!$.isEmptyObject(waveData)) {
          // when (items === null) it is supposed to be an empty array
          var items = [];
          var order = waveData["order"] || [];
          var startTime = waveData["startTime"];
          order.forEach(function(itemId, index) {
            items.push(waveData[itemId]);
          });
          // }
          // // convert string moment representation to an moment object
          // // var startTime = moment(waveData.startTime);
          // // if the local update has already been made for the items, then do not update the items again
          // if (JSON.stringify(self.state.items) === JSON.stringify(items)) {
          //   self.setState({
          //     startTime: startTime
          //   });
          self.setState({
            items: items,
            order: order
          });
        }
      };

      var onWaveParticipant = function() {
        if (wave.getViewer()) {
          var people = [];  
          var participants = wave.getParticipants();
          participants.forEach(function(value) {
            people.push({id: value.id_, text: value.displayName_, thumbnailUrl: value.thumbnailUrl_});
          });
          self.setState({
            people: people
          });
          console.log("updated people");
          console.log(participants);
        }
      };

      wave.setStateCallback(onWaveUpdate);
      wave.setParticipantCallback(onWaveParticipant);
    },
    handleTimeChange: function(newTime) {
      this.setState({
        startTime: newTime
      });
      console.log("changed startTime: ");
      console.log(newTime);
      var waveData = {startTime: newTime};
      wave.getState().submitDelta(waveData);
      console.log("sent startTime to wave");
    },
    handleSort: function(newOrder) {
      // var newItems = newOrder.map(function(index) {
      //   return this.state.items[index];
      // }.bind(this));
      // this.setState({
      //   items: newItems
      // });
      // console.log("sorted items");
      // console.log(newItems);
      // var waveData = {items: newItems};
      // wave.getState().submitDelta(waveData);
      // console.log("sent updated items to wave (sort)");
      var newItems = [];
      var itemsMap = this.state.itemsMap;
      newOrder.forEach(function(itemId, index) {
        items.push(itemsMap[itemId]);
      });
      this.setState({
        items: newItems,
        order: newOrder
      });
      console.log("sorted items");
      console.log(newItems);
      var waveData = {};
      waveData["order"] = newOrder;
      wave.getState().submitDelta(waveData);
      console.log("sent updated items to wave (sort)");
    },
    handleAdd: function() {
      // var newItems = this.state.items.concat([{id: this.state.counter, topic: "", desc: "",time: 0, owner: ""}]);
      // var newCounter = this.state.counter + 1;
      // this.setState({
      //   items: newItems,
      //   counter: newCounter
      // });
      // console.log("added an item");
      // console.log(newItems);
      // var waveData = {items: newItems, counter: newCounter};
      // wave.getState().submitDelta(waveData);
      // console.log("sent updated items to wave (add)");

      // generate a random number from 0 to 1000 for newItemId
      var getRandomInt = function() {
        return Math.floor(Math.random() * (1000 - 1));
      };
      // generate a timestamp for newItemId
      var getCurrentTime = function() {
        if (!Date.now) {
          return new Date().getTime();
        } else {
          return Date.now(); 
        }
      };
      var newItemId = "item-" + getCurrentTime() + "-" + getRandomInt();
      var newItem = {id: newItemId, topic: "", desc: "", time: 0, owner: ""};
      var newItems = this.state.items.concat([newItem]);
      var newOrder = this.state.order.concat([newItemId]);
      var newItemsMap = $.extend(this.state.itemsMap, newItem);
      this.setState({
        items: newItems,
        order: newOrder,
        itemsMap: newItemsMap
      });
      console.log("added an item");
      console.log(newItems);
      var waveData = {};
      waveData[newItemId] = newItem;
      waveData["order"] = newOrder;
      wave.getState().submitDelta(waveData);
      console.log("sent updated items to wave (add)");
    },
    handleRemove: function(index) {
      var newItems = this.state.items;
      newItems.splice(index, 1);
      this.setState({
        items: newItems
      });
      console.log("removed an item");
      console.log(newItems);
      var waveData = {items: newItems};
      wave.getState().submitDelta(waveData);
      console.log("sent updated items to wave (remove)");
    },
    handleDialogEdit: function(index, item) {
      var newItems = this.state.items.slice();
      newItems[index] = item;
      this.setState({
        items: newItems
      });
      console.log("edited an item");
      console.log(newItems);
      var waveData = {items: newItems};
      wave.getState().submitDelta(waveData);
      console.log("sent updated items to wave (dialog edit)");
    },
    handleDialogSubmit: function(result) {
      var newItems = this.state.items.concat([result]);
      this.setState({
        items: newItems
      });
      console.log("added an item");
      console.log(newItems);
      var waveData = {items: newItems};
      wave.getState().submitDelta(waveData);
      console.log("sent updated items to wave (dialog add)");
    },
    handleDraggingStatus: function(status) {
      // when current dragging is true and the status passed to this function is false
      // (an item has been dropped) set the state with data in lastWaveData
      // and reset lastWaveData to an empty object
      if (this.state.dragging && !$.isEmptyObject(this.state.waveData) && !status) {
        // make a deep copy of lastWaveData to avoid reference problems
        var lastWaveData = jQuery.extend(true, {}, this.state.lastWaveData);
        this.setState({
          items: lastWaveData.items,
          lastWaveData: {}
        });
      }
      // set dragging to the status passed to this function
      this.setState({
        dragging: status
      });
    },
    render: function() {
      return (
        React.createElement(Grid, {className: "container-fluid", id: "grid"}, 
          React.createElement("br", null), 
          React.createElement(Row, {className: "show-grid"}, 
            React.createElement(DateTimePicker, {onTimeChange: this.handleTimeChange})
          ), 
          React.createElement("br", null), 
          React.createElement(Row, {className: "show-grid"}, 
            React.createElement(Col, {xs: 1}, 
              React.createElement(DragBar, {order: this.state.order, onSort: this.handleSort})
            ), 
            React.createElement(Col, {xs: 11}, 
              React.createElement(AgendaTable, {items: this.state.items, 
                startTime: this.state.startTime, 
                people: this.state.people, 
                onSort: this.handleSort, 
                onEdit: this.handleEdit, 
                onRemove: this.handleRemove, 
                onDialogEdit: this.handleDialogEdit, 
                onDraggingStatus: this.handleDraggingStatus}), 
              React.createElement(AddButton, {onAdd: this.handleAdd})
            )
          )
        )
      );
    }
  });

  var AgendaTable = React.createClass({displayName: "AgendaTable",
    componentWillMount: function() {
    },
    componentDidMount: function() {
    },
    componentDidUpdate: function() {
    },
    render: function() {
      var self = this;
      var rowsArr = [];
      var itemId = null;
      var lastItemEndTime = null;
      var items = this.props.items.map(function(item) {
        return (React.createElement("tr", {key: item.id, item: item}));
      })
      return (
        React.createElement(Table, {className: "agenda-table", responsive: true}, 
          React.createElement("thead", null, 
            React.createElement("tr", null, 
              React.createElement("th", {className: "index"}, "#"), 
              React.createElement("th", {className: "short"}, "Start Time"), 
              React.createElement("th", {className: "short"}, "Duration"), 
              React.createElement("th", {className: "med"}, "Topic"), 
              React.createElement("th", {className: "short"}, "Presenter")
            )
          ), 
          React.createElement(TableBody, {startTime: this.props.startTime, 
            people: this.props.people, 
            onSort: this.props.onSort, 
            onEdit: this.props.onEdit, 
            onRemove: this.props.onRemove, 
            onDialogEdit: this.props.onDialogEdit, 
            onDraggingStatus: this.props.onDraggingStatus}, 
            items
          )
        )
      );
    }
  });

  // the proxy rendering design pattern borrowed from the following link (gist)
  // https://gist.github.com/petehunt/7882164
  // https://gist.github.com/fversnel/4aed612b69d3ec196157
  var TableBody = React.createClass({displayName: "TableBody",
    getDefaultProps: function() {
      return {component: 'tbody', childComponent: 'tr'};
    },
    render: function() {
      var props = $.extend({}, this.props);
      delete props.children;
      return (
        React.createElement(this.props.component, React.__spread({},  props))
      );
    },
    componentDidMount: function() {
      var self = this;
      // this helper function got from
      // http://www.paulund.co.uk/fixed-width-sortable-tables
      var fixWidthHelper = function (e, ui) {
          ui.children().each(function() {
              $(this).width($(this).width());
          });
          return ui;
      };
      // helper end

      var onSortableStart = function() {
        self.props.onDraggingStatus(true);
      };

      var onSortableStop = function() {
        // set draggingStatus to false so any updates from wave is applied first
        // and then apply the user's change
        self.props.onDraggingStatus(false);
        setTimeout(self.handleDrop, 0);
      };

      $(this.getDOMNode()).sortable({
        axis: 'y',
        helper: fixWidthHelper,
        start: onSortableStart,
        stop: onSortableStop,
      });
      var lastItemEndTime = null;
      this.getChildren().forEach(function(child, i) {
        if (!lastItemEndTime) {
          lastItemEndTime = this.props.startTime.clone();
        }
        var item = child.props.item;
        var index = i;
        $.extend(item, {startTime: lastItemEndTime.clone()});
        $(this.getDOMNode()).append('<' + this.props.childComponent + ' />');
        var node = $(this.getDOMNode()).children().last()[0];
        node.dataset.reactSortablePos = i;
        React.render(React.createElement(RowItem, {index: index, item: child.props.item, people: this.props.people, onEdit: this.props.onEdit, onRemove: this.props.onRemove, onDialogEdit: this.props.onDialogEdit}), node);
        lastItemEndTime.add(child.props.item.time, 'm');
      }.bind(this));

      adjustHeight();
    },
    componentDidUpdate: function() {
      var childIndex = 0;
      var nodeIndex = 0;
      var children = this.getChildren();
      var nodes = $(this.getDOMNode()).children();
      var numChildren = children.length;
      var numNodes = nodes.length;

      var lastItemEndTime = null;
    
      while (childIndex < numChildren) {
        if (!lastItemEndTime) {
          lastItemEndTime = this.props.startTime.clone();
        }
        var item = children[childIndex].props.item;
        var index = childIndex;
        $.extend(item, {startTime: lastItemEndTime.clone()});
        if (nodeIndex >= numNodes) {
          $(this.getDOMNode()).append('<' + this.props.childComponent + '/>');
          nodes.push($(this.getDOMNode()).children().last()[0]);
          nodes[numNodes].dataset.reactSortablePos = numNodes;
          numNodes++;
        }
        React.render(React.createElement(RowItem, {index: index, item: item, people: this.props.people, onEdit: this.props.onEdit, onRemove: this.props.onRemove, onDialogEdit: this.props.onDialogEdit}), nodes[nodeIndex]);
        childIndex++;
        nodeIndex++;
        lastItemEndTime.add(item.time, 'm');
      }
    
      while (nodeIndex < numNodes) {
        React.unmountComponentAtNode(nodes[nodeIndex]);
        $(nodes[nodeIndex]).remove();
        nodeIndex++;
      }

      adjustHeight();
    },
    componentWillUnmount: function() {
      $(this.getDOMNode()).children().get().forEach(function(node) {
        React.unmountComponentAtNode(node);
      });
    },
    getChildren: function() {
      // TODO: use mapChildren()
      return this.props.children || [];
    },
    handleDrop: function() {
      var newOrder = $(this.getDOMNode()).children().get().map(function(child, i) {
        var rv = child.dataset.reactSortablePos;
        child.dataset.reactSortablePos = i;
        return rv;
      });
      this.props.onSort(newOrder);
    }
  });

  var RowItem = React.createClass({displayName: "RowItem",
    componentDidMount: function() {
      var self = this;
      var index = this.props.index;
      var topicId = "topic-" + index;
      var timeId = "time-" + index;
      // onwerId here is not the real id of own
      var ownerId = "owner-" + index;
      var editId = "edit-" + index;
      var editData = {
        index: index, 
        topic: this.props.item.topic, 
        desc: this.props.item.desc, 
        time: this.props.item.time, 
        owner: this.props.item.owner,
        people: this.props.people
      };
      $("#" + editId + ", #" + topicId + ", #" + timeId + ", #" + ownerId).click(function() {
        gadgets.views.openGadget(function(result) {
          if (result) {
            self.props.onDialogEdit(result.index, result.item);
          }
        }, 
        function(site){},
        {view: "dialog", viewTarget: "MODALDIALOG", viewParams: editData});
      });
    },
    handleRemove: function() {
      this.props.onRemove(this.props.index);
    },
    render: function() {
      var index = this.props.index;
      var id = index + 1;
      var topicId = "topic-" + index;
      var timeId = "time-" + index;
      // onwerId here is not the real id of owner
      var ownerId = "owner-" + index;
      var topic;
      if (this.props.item.topic === "") {
        topic = "Click to edit";
      } else {
        topic = this.props.item.topic;
      }
      var thumbnail;
      var ownerName;
      if (this.props.item.owner) {
        var thumbnailUrl = wave.getParticipantById(this.props.item.owner).thumbnailUrl_;
        thumbnail = React.createElement("img", {className: "img-circle", src: thumbnailUrl});
        ownerName = wave.getParticipantById(this.props.item.owner).displayName_;
      }
      return (
        React.createElement("tr", null, 
          React.createElement("td", {className: "index"}, 
            React.createElement("span", {className: "off-hover"}, id), 
            React.createElement("span", {className: "glyphicon glyphicon-menu-hamburger on-hover"})
          ), 
          React.createElement("td", null, 
            React.createElement("span", null, this.props.item.startTime.format('LT'))
          ), 
          React.createElement("td", {className: "cursor-pointer", id: timeId}, 
            React.createElement("span", null, this.props.item.time, " min")
          ), 
          React.createElement("td", {className: "cursor-pointer", id: topicId}, 
            React.createElement("span", null, topic), 
            React.createElement("br", null), 
            React.createElement("span", null, this.props.item.desc)
          ), 
          React.createElement("td", {className: "link-text cursor-pointer", id: ownerId}, 
            thumbnail, " ", React.createElement("span", {className: "owner"}, ownerName), 
            React.createElement("span", {className: "pull-right on-hover"}, 
              React.createElement(Glyphicon, {className: "cursor-pointer", glyph: "trash", onClick: this.handleRemove})
            )
          )
        )
      );
    }
  });

  var AddButton = React.createClass({displayName: "AddButton",
    handleAdd: function() {
      this.props.onAdd();
    },
    render: function() {
      return (
        React.createElement(Button, {onClick: this.handleAdd}, "Add a new Topic")
      );
    }
  });

  var DateTimePicker = React.createClass({displayName: "DateTimePicker",
    componentDidMount: function() {
      var self = this;
      var startTime = this.props.startTime;
      // Datepicker
      $(function () {
          $('#datetimepicker').datetimepicker({
            showClose: true,
            allowInputToggle: true,
            toolbarPlacement: 'bottom',
            defaultDate: startTime,
            debug: true
          });
      });
      $('#datetimepicker').on("dp.change", function (e) {
        var newTime = $('#datetimepicker').data("DateTimePicker").viewDate();
        self.onTimeChange(newTime);
      });
      // $('#datepicker').on("dp.show", function (e) {
      //   $('#timepicker').data("DateTimePicker").hide();
      // });
      // if (startTime) {
      //   $('#datepicker').datetimepicker({
      //     defaultDate: startTime
      //   });
      // }
    },
    onTimeChange: function(time) {
      this.props.onTimeChange(time);
    },
    render: function() {
      return (
        React.createElement(Col, {xs: 4, id: "date"}, 
          React.createElement("div", {className: "input-group date", id: "datetimepicker"}, 
            React.createElement("input", {type: "text", className: "form-control"}), 
            React.createElement("span", {className: "input-group-addon"}, 
              React.createElement("span", {className: "glyphicon glyphicon-calendar"})
            )
          )
        )
      );
    }
  });

  var DatePicker = React.createClass({displayName: "DatePicker",
    componentDidMount: function() {
      var self = this;
      var startTime = this.props.startTime;
      // Datepicker
      $(function () {
          $('#datepicker').datetimepicker({
            format: 'll',
            showClose: true,
            showTodayButton: true,
            allowInputToggle: true,
            toolbarPlacement: 'bottom',
            debug: true
          });
      });
      $('#datepicker').on("dp.change", function (e) {
        var newTime = $('#datepicker').data("DateTimePicker").viewDate();
        self.onTimeChange(newTime);
      });
      // $('#datepicker').on("dp.show", function (e) {
      //   $('#timepicker').data("DateTimePicker").hide();
      // });
      // if (startTime) {
      //   $('#datepicker').datetimepicker({
      //     defaultDate: startTime
      //   });
      // }
    },
    onTimeChange: function(time) {
      this.props.onTimeChange(time);
    },
    render: function() {
      return (
        React.createElement(Col, {xs: 4, id: "date"}, 
          React.createElement("div", {className: "input-group date", id: "datepicker"}, 
            React.createElement("input", {type: "text", className: "form-control"}), 
            React.createElement("span", {className: "input-group-addon"}, 
              React.createElement("span", {className: "glyphicon glyphicon-calendar"})
            )
          )
        )
      );
    }
  });

  var TimePicker = React.createClass({displayName: "TimePicker",
    componentDidMount: function() {
      var self = this;
      // Datepicker
      $(function () {
          $('#timepicker').datetimepicker({
            format: 'LT',
            extraFormats: ['LT'],
            showClose: true,
            showTodayButton: true,
            allowInputToggle: true,
            toolbarPlacement: 'bottom',
            useCurrent: false,
            debug: true
          });
      });
      $('#timepicker').on("dp.change", function (e) {
        var newTime = $('#timepicker').data("DateTimePicker").viewDate();
        self.onTimeChange(newTime);
      });
      // $('#timepicker').on("dp.show", function (e) {
      //   $('#datepicker').data("DateTimePicker").hide();
      // });
      if (this.props.startTime) {
        $('#timepicker input').attr('placeholder', this.props.startTime.format('LT'));
      }
    },
    onTimeChange: function(time) {
      this.props.onTimeChange(time);
    },
    render: function() {
      return (
        React.createElement(Col, {xs: 3, id: "time"}, 
          React.createElement("div", {className: "input-group date", id: "timepicker"}, 
            React.createElement("input", {type: "text", className: "form-control"}), 
            React.createElement("span", {className: "input-group-addon"}, 
              React.createElement("span", {className: "glyphicon glyphicon-time"})
            )
          )
        )
      );
    }
  });

  var DialogButton = React.createClass({displayName: "DialogButton",
    componentDidMount: function() {
      var self = this;
      $("#dialog-btn").click(function() {
        gadgets.views.openGadget(function(result) {
          if (result) {
            self.props.onDialogSubmit(result);
          }
        }, 
        function(site){},
        {view: "dialog", viewTarget: "MODALDIALOG"});
      });
    },
    render: function() {
      return(
        React.createElement(Button, {id: "dialog-btn"}, "Open a dialog")
      );
    }
  });

  var DragBar = React.createClass({displayName: "DragBar",
    componentDidMount: function() {
      var self = this;

      var onSortableStop = function(event, ui) {
        var sortedIds = $( "#sortable-buttons" ).sortable( "toArray" );
        self.props.onSorted(sortedIds);
      };

      $("#sortable-buttons").sortable({
        axis: 'y',
        handle: 'button',
        cancel: '',
        stop: onSortableStop
      });
    },
    render: function() {
      var bar = this.props.order.map(function(itemId) {
        return(
          React.createElement("li", null, 
            React.createElement("button", {type: "button", className: "btn btn-default btn-lg", id: itemId}, 
              React.createElement("span", {className: "glyphicon glyphicon-sort", "aria-hidden": "true"})
            )
          )
        );
      });
      return(
        React.createElement("div", null, 
          React.createElement("ul", {id: "sortable-buttons"}, 
            bar
          )
        )
      );
    }
  });

  // example data
  var DATA = {
    "items": [
        {
            "id": "1",
            "topic": "A",
            "desc": "A",
            "time": 5,
            "owner": "Android"
        },
        {
            "id": "2",
            "topic": "B",
            "desc": "B",
            "time": 10,
            "owner": "Bond"
        },
        {
            "id": "3",
            "topic": "C",
            "desc": "C",
            "time": 15,
            "owner": "Captain America"
        },
        {
            "id": "4",
            "topic": "D",
            "desc": "D",
            "time": 20,
            "owner": "DB"
        },
        {
            "id": "5",
            "topic": "E",
            "desc": "E",
            "time": 60,
            "owner": "EA"
        },
        {
            "id": "6",
            "topic": "F",
            "desc": "F",
            "time": 120,
            "owner": "Function"
        },
        {
            "id": "7",
            "topic": "G",
            "desc": "G",
            "time": 1,
            "owner": "Gnome"
        },
        {
            "id": "8",
            "topic": "H",
            "desc": "H",
            "time": 2,
            "owner": "Hulk"
        }
    ],
    "startTime": 1433923200000,
    "people": [{ id: 0, text: 'enhancement' }, { id: 1, text: 'bug' }, { id: 2, text: 'duplicate' }, { id: 3, text: 'invalid' }, { id: 4, text: 'wontfix' },
    { id: 5, text: 'enhancement' }, { id: 6, text: 'bug' }, { id: 7, text: 'duplicate' }, { id: 8, text: 'invalid' }, { id: 9, text: 'wontfix' }]
  }

  React.render(React.createElement(Agenda, {data: DATA}), document.body);
};

gadgets.util.registerOnLoadHandler(function() {
  init(React, ReactBootstrap, jQuery, moment, gadgets, wave);
});
