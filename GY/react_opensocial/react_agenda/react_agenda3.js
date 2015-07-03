// variables for using React-Bootstrap
var Table = ReactBootstrap.Table;
var Button = ReactBootstrap.Button;
var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Glyphicon = ReactBootstrap.Glyphicon;

function rename(obj, oldName, newName) {
    if(!obj.hasOwnProperty(oldName)) {
        return false;
    }

    obj[newName] = obj[oldName];
    delete obj[oldName];
    return true;
}

var Agenda = React.createClass({displayName: "Agenda",
  getInitialState: function() {
    // if (this.props.data.startTime) {
    //   var startTime = moment(this.props.data.startTime);
    // } else {
    //   var startTime = moment();
    // }
    var startTime = moment();
    var counter = 0;
    return {
      items: [],
      startTime: startTime,
      counter: counter,
      people: []
    } 
  },
  componentDidMount: function() {
    var self = this;

    var onWaveUpdate = function() {
      console.log("onWaveUpdate");
      var waveState = wave.getState();
      var waveData = waveState.state_;

      debugger;
      if (!$.isEmptyObject(waveData)) {
        if (waveData.items) {
          // convert string moment representation to an moment object
          var startTime = moment(waveData.startTime);
          self.setState({
            items: waveData.items,
            startTime: startTime,
            counter: waveData.counter
          }); 
        } else {
          self.handleAdd();
        }
      } else {
        // setup wave
        var newData = {items: self.state.items, startTime: self.state.startTime, counter: self.state.counter};
        waveState.submitDelta(newData);
      }
    };

    var onWaveParticipant = function() {
      if (wave.getViewer()) {
        var people = [];  
        var participants = wave.getParticipants();
        participants.forEach(function(val, i, arr) {
          people.push({id: val.id_, text: val.displayName_});
        });
        self.setState({
          people: people
        });
        console.log("updated people");
        console.log(participants);
      } else {
        return;
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
    var time = {};
    time['startTime'] = newTime;
    wave.getState().submitDelta(newTime);
    console.log("sent startTime to wave");
  },
  handleSort: function(newOrder) {
    var newItems = newOrder.map(function(index) {
      return this.state.items[index];
    }.bind(this));
    this.setState({
      items: newItems
    });

    console.log(this.state.items);
  },
  handleAdd: function() {
    var newItems = this.state.items.concat([{id: this.state.counter, topic: "", desc: "",time: 0, owner: ""}]);
    var newCounter = this.state.counter + 1;
    this.setState({
      items: newItems,
      counter: newCounter
    });
    console.log("added an item");
    console.log(newItems);
    var waveData = {items: newItems, counter: newCounter};
    wave.getState().submitDelta(waveData);
    console.log("sent updated items to wave (add)");
  },
  handleRemove: function() {
    // TODO
  },
  handleEdit: function(index, type, value) {
    debugger;
    var newItems = this.state.items.slice();
    newItem = newItems[index];
    if (type === 'topic') {
      newItem['topic'] = value;
    } else if (type === 'desc') {
      newItem['desc'] = value;
    } else if (type === 'owner') {
      newItem['owner'] = value;
    } else if (type === 'time') {
      newItem['time'] = value;
    }
      this.setState({
      items: newItems
    });
    console.log("edited an item");
    console.log(newItems);
    var waveData = {items: newItems};
    wave.getState().submitDelta(waveData);
    console.log("sent updated items to wave (edit)");
  },
  render: function() {
    return (
      React.createElement(Grid, null, 
        React.createElement("br", null), 
        React.createElement(Row, null
        ), 
        React.createElement("br", null), 
        React.createElement(AgendaTable, {items: this.state.items, startTime: this.state.startTime, people: this.state.people, onSort: this.handleSort, onEdit: this.handleEdit}), 
        React.createElement(AddButton, {onAdd: this.handleAdd})
      )
    );
  }
});

var AgendaTable = React.createClass({displayName: "AgendaTable",
  componentWillMount: function() {
    $.fn.editable.defaults.mode = 'inline';
    $.fn.editableform.buttons = '<button type="submit" class="btn btn-default btn-sm editable-submit">ok</button>' + 
                                '<button type="button" class="btn btn-default btn-sm editable-cancel">cancel</button>';
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
      React.createElement(Table, {responsive: true}, 
        React.createElement("thead", null, 
          React.createElement("tr", null, 
            React.createElement("th", {className: "index"}, "#"), 
            React.createElement("th", {className: "short"}, "Start Time"), 
            React.createElement("th", {className: "short"}, "Duration"), 
            React.createElement("th", {className: "med"}, "Topic"), 
            React.createElement("th", {className: "short"}, "Presenter"), 
            React.createElement("th", null, "Notes")
          )
        ), 
        React.createElement(TableBody, {startTime: this.props.startTime, people: this.props.people, onSort: this.props.onSort, onEdit: this.props.onEdit}, 
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
    // Helper function to keep table row from collapsing when being sorted
    // got from http://www.avtex.com/blog/2015/01/27/drag-and-drop-sorting-of-table-rows-in-priority-order/
    var fixHelperModified = function(e, tr) {
      var $originals = tr.children();
      var $helper = tr.clone();
      $helper.children().each(function(index) {
        $(this).width($originals.eq(index).width())
        $(this).height($originals.eq(index).height())
      });
      return $helper;
    };

    // this helper function got from
    // http://www.paulund.co.uk/fixed-width-sortable-tables
    var fixWidthHelper = function(e, ui) {
        ui.children().each(function() {
            $(this).width($(this).width());
        });
        return ui;
    };
    // helper end

    var lastItemEndTime = null;

    $(this.getDOMNode()).sortable({
      axis: 'y',
      helper: fixWidthHelper,
      stop: this.handleDrop,
    });
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
      React.render(React.createElement(RowItem, {index: index, item: child.props.item, people: this.props.people, onEdit: this.props.onEdit}), node);
      lastItemEndTime.add(child.props.item.time, 'm');
    }.bind(this));

    // gadgets.window.adjustHeight();
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
      React.render(React.createElement(RowItem, {index: index, item: item, people: this.props.people, onEdit: this.props.onEdit}), nodes[nodeIndex]);
      childIndex++;
      nodeIndex++;
      lastItemEndTime.add(item.time, 'm');
    }
  
    while (nodeIndex < numNodes) {
      React.unmountComponentAtNode(nodes[nodeIndex]);
      $(nodes[nodeIndex]).remove();
      nodeIndex++;
    }

    // gadgets.window.adjustHeight();
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
    var notesId = "notes-" + index;
    var timeId = "time-" + index;
    var ownerId = "owner-" + index;
    $('#'+topicId).editable({
      url: function(params) {
        var d = new $.Deferred;
        var newTopic = params.value;
        self.props.onEdit(index, 'topic', newTopic);
        d.resolve();
        return d.promise();
      },
      emptytext: 'new topic here',
      showbuttons: false
    });
    $('#'+timeId).editable({
      url: function(params) {
        var d = new $.Deferred;
        var newTopic = params.value;
        self.props.onEdit(index, 'time', newTopic);
        d.resolve();
        return d.promise();
      },
      showbuttons: false
    });
    $('#'+ownerId).editable({
      url: function(params) {
        var d = new $.Deferred;
        var newTopic = params.value;
        self.props.onEdit(index, 'owner', newTopic);
        d.resolve();
        return d.promise();
      },
      source: self.props.people,
      emptytext: 'select a presenter',
      select2: {
        multiple: true,
        maximumSelectionSize: 1,
      },
      showbuttons: false
    });
    $('#'+notesId).editable({
      url: function(params) {
        var d = new $.Deferred;
        var newDesc = params.value;
        self.props.onEdit(index, 'desc', newDesc);
        d.resolve();
        return d.promise();
      },
      emptytext: 'new notes here',
      escape: false,
      rows: 2
    });
  },
  render: function() {
    var index = this.props.index;
    var id = index + 1;
    var topicId = "topic-" + index;
    var notesId = "notes-" + index;
    var timeId = "time-" + index;
    var ownerId = "owner-" + index;
    return (
      React.createElement("tr", null, 
        React.createElement("td", {className: "index"}, 
          React.createElement("span", {className: "off-hover"}, id), 
          React.createElement("span", {className: "glyphicon glyphicon-menu-hamburger on-hover"})
        ), 
        React.createElement("td", null, this.props.item.startTime.format('LT')), 
        React.createElement("td", null, 
          React.createElement("span", {className: "grey-text", id: timeId, "data-inputclass": "time-input input-sm", "data-type": "text"}, this.props.item.time), " min"
        ), 
        React.createElement("td", null, 
          React.createElement("span", {className: "topic", id: topicId, "data-inputclass": "input-sm", "data-type": "text"}, this.props.item.topic)
        ), 
        React.createElement("td", {className: "link-text"}, 
          React.createElement("span", {className: "owner", id: ownerId, "data-inputclass": "input-owner", "data-value": this.props.item.owner, "data-type": "select2"})
        ), 
        React.createElement("td", {className: "notes"}, 
          React.createElement("span", {className: "grey-text", id: notesId, "data-inputclass": "input-sm", "data-type": "textarea"}, this.props.item.desc)
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

gadgets.util.registerOnLoadHandler(function() {
  React.render(React.createElement(Agenda, {data: DATA}), document.body);
});
