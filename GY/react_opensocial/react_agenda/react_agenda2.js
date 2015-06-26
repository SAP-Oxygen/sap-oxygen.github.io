// variables for using React-Bootstrap
var Table = ReactBootstrap.Table;
var Button = ReactBootstrap.Button;
var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Glyphicon = ReactBootstrap.Glyphicon;

var Agenda = React.createClass({displayName: "Agenda",
  getInitialState: function() {
    if (this.props.data.startTime) {
      var startTime = moment(this.props.data.startTime);
    } else {
      var startTime = moment();
    }
    return {
      items: this.props.data.items,
      nextId: this.props.data.nextId,
      startTime: startTime,
      counter: this.props.data.items.length
    } 
  },
  onTimeChange: function(newTime) {
    this.setState({
      startTime: newTime
    });
  },
  // onAddTopic: function() {
  //   var newList = this.state.items;
  //   newList.push({id: this.state.nextId, topic: "", desc: "",time: 0, ownder: ""});
  //   var nextId = this.state.nextId;
  //   this.setState({
  //     items: newList,
  //     nextId: ++nextId
  //   });
  // },
  handleSort: function(newOrder) {
    var newItems = newOrder.map(function(index) {
      return this.state.items[index];
    }.bind(this));
    this.setState({items: newItems});
    console.log(this.state.items);
  },
  render: function() {
    return (
      React.createElement(Grid, null, 
        React.createElement("br", null), 
        React.createElement(Row, null, 
          React.createElement(DatePicker, null), 
          React.createElement(TimePicker, {handleDateTimeChange: this.onTimeChange})
        ), 
        React.createElement("br", null), 
        React.createElement(AgendaTable, {items: this.state.items, startTime: this.state.startTime, onSort: this.handleSort}), 
        React.createElement(AddButton, {onAddTopic: this.onAddTopic})
      )
    );
  }
});

var AgendaTable = React.createClass({displayName: "AgendaTable",
  render: function() {
    var self = this;
    var rowsArr = [];
    var itemId = null;
    var lastItemEndTime = null;
    var items = this.props.items.map(function(item) {
      return (React.createElement("tr", {key: item.id, item: item}));
    })
    return (
      React.createElement(Table, {bordered: true, hover: true, responsive: true}, 
        React.createElement("thead", null, 
          React.createElement("tr", null, 
            React.createElement("th", null, "#"), 
            React.createElement("th", null, "Start Time"), 
            React.createElement("th", null, "Duration"), 
            React.createElement("th", null, "Topic"), 
            React.createElement("th", null, "Presenter"), 
            React.createElement("th", null, "Notes")
          )
        ), 
        React.createElement(TableBody, {startTime: this.props.startTime, onSort: this.props.onSort}, 
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
    var props = jQuery.extend({}, this.props);
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
      });
      return $helper;
    };

    var lastItemEndTime = null;

    jQuery(this.getDOMNode()).sortable({
      helper: fixHelperModified,
      stop: this.handleDrop
    });
    this.getChildren().forEach(function(child, i) {
      if (!lastItemEndTime) {
        lastItemEndTime = this.props.startTime.clone();
      }
      var item = child.props.item;
      jQuery.extend(item, {startTime: lastItemEndTime.clone()});
      jQuery(this.getDOMNode()).append('<' + this.props.childComponent + ' />');
      var node = jQuery(this.getDOMNode()).children().last()[0];
      node.dataset.reactSortablePos = i;
      React.render(React.createElement(RowItem, {id: i+1, item: child.props.item}), node);
      lastItemEndTime.add(child.props.item.time, 'm');
    }.bind(this));
  },
  
  componentDidUpdate: function() {
    var childIndex = 0;
    var nodeIndex = 0;
    var children = this.getChildren();
    var nodes = jQuery(this.getDOMNode()).children();
    var numChildren = children.length;
    var numNodes = nodes.length;

    var lastItemEndTime = null;
  
    while (childIndex < numChildren) {
      if (!lastItemEndTime) {
        lastItemEndTime = this.props.startTime.clone();
      }
      var item = children[childIndex].props.item;
      jQuery.extend(item, {startTime: lastItemEndTime.clone()});
      if (nodeIndex >= numNodes) {
        jQuery(this.getDOMNode()).append('<' + this.props.childComponent + '/>');
        nodes.push(jQuery(this.getDOMNode()).children().last()[0]);
        nodes[numNodes].dataset.reactSortablePos = numNodes;
        numNodes++;
      }
      React.render(React.createElement(RowItem, {id: childIndex+1, item: item}), nodes[nodeIndex]);
      childIndex++;
      nodeIndex++;
      lastItemEndTime.add(item.time, 'm');
    }
  
    while (nodeIndex < numNodes) {
      React.unmountComponentAtNode(nodes[nodeIndex]);
      jQuery(nodes[nodeIndex]).remove();
      nodeIndex++;
    }
  },
  
  componentWillUnmount: function() {
    jQuery(this.getDOMNode()).children().get().forEach(function(node) {
      React.unmountComponentAtNode(node);
    });
  },
  
  getChildren: function() {
    // TODO: use mapChildren()
    return this.props.children || [];
  },
  
  handleDrop: function() {
    var newOrder = jQuery(this.getDOMNode()).children().get().map(function(child, i) {
      var rv = child.dataset.reactSortablePos;
      child.dataset.reactSortablePos = i;
      return rv;
    });
    this.props.onSort(newOrder);
  }
});

var RowItem = React.createClass({displayName: "RowItem",
  render: function() {
    return (
      React.createElement("tr", null, 
        React.createElement("td", null, this.props.id), 
        React.createElement("td", null, this.props.item.startTime.format('LT')), 
        React.createElement("td", null, this.props.item.time, " min"), 
        React.createElement("td", null, this.props.item.topic), 
        React.createElement("td", null, this.props.item.owner), 
        React.createElement("td", null, this.props.item.desc)
      )
    );
  }
});

var AddButton = React.createClass({displayName: "AddButton",
  handleAdd: function() {
    this.props.onAddTopic();
  },
  render: function() {
    return (
      React.createElement(Button, {onClick: this.handleAdd}, "Add an item")
    );
  }
});

var DatePicker = React.createClass({displayName: "DatePicker",
  componentDidMount: function() {
    var self = this;
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
    $('#datepicker').on("dp.show", function (e) {
      $('#timepicker').data("DateTimePicker").hide();
    });
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
          showClose: true,
          showTodayButton: true,
          allowInputToggle: true,
          toolbarPlacement: 'bottom',
          debug: true
        });
    });
    $('#timepicker').on("dp.change", function (e) {
      var newTime = $('#timepicker').data("DateTimePicker").viewDate();
      self.onTimeChange(newTime);
    });
    $('#timepicker').on("dp.show", function (e) {
      $('#datepicker').data("DateTimePicker").hide();
    });
  },
  onTimeChange: function(time) {
    this.props.handleDateTimeChange(time);
  },
  render: function() {
    return (
      React.createElement(Col, {xs: 3, id: "time"}, 
        React.createElement("div", {className: "input-group date", id: "timepicker"}, 
          React.createElement("input", {type: "text", className: "form-control"}), 
          React.createElement("span", {className: "input-group-addon"}, 
            React.createElement("span", {className: "glyphicon glyphicon-calendar"})
          )
        )
      )
    );
  }
});

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
  "nextId": 4
}


React.render(React.createElement(Agenda, {data: DATA}), document.body);