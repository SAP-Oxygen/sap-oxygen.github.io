// variables for using React-Bootstrap
var Table = ReactBootstrap.Table;
var Button = ReactBootstrap.Button;
var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Glyphicon = ReactBootstrap.Glyphicon;

var Agenda = React.createClass({displayName: "Agenda",
  getInitialState: function() {
    if (this.props.startTime) {
      var startTime = this.props.startTime;
    } else {
      var startTime = moment();
    }
    return {
      items: this.props.items.items,
      nextId: this.props.items.nextId,
      startTime: startTime
    } 
  },
  onTimeChange: function(newTime) {
    this.setState({
      startTime: newTime
    });
  },
  onAddTopic: function() {
    var newList = this.state.items;
    newList.push({id: this.state.nextId, topic: "", desc: "",time: 0, ownder: ""});
    var nextId = this.state.nextId;
    this.setState({
      items: newList,
      nextId: ++nextId
    });
  },
  onSort: function(newOrder) {
    var self = this;
    var newItems = newOrder.map(function(index) {
      return self.state.items[index];
    });
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
        React.createElement(AgendaTable, {items: this.state.items, startTime: this.state.startTime, onSort: this.onSort}), 
        React.createElement(AddButton, {onAddTopic: this.onAddTopic})
      )
    );
  }
});

var AgendaTable = React.createClass({displayName: "AgendaTable",
  getInitialState: function() {
    return {
      rowOrder: []
    }
  },
  render: function() {
    var self = this;
    var rowsArr = [];
    var itemId = null;
    var lastItemEndTime = null;
    // var rowOrder = this.state.rowOrder;
    // var orderedItems = [];
    // if (rowOrder.length !== 0) {
    //   rowOrder.forEach(function(element, index) {
    //     orderedItems.push(self.props.items[element]); 
    //   });
    // } else {
    //   orderedItems = this.props.items;
    // }
    // orderedItems.forEach(function(item, index, items) {
    //   if (!lastItemEndTime || !itemId) {
    //     itemId = 0;
    //     lastItemEndTime = self.props.startTime.clone();
    //   }
    //   rowsArr.push(<RowItem item={item} itemId={itemId} startTime={lastItemEndTime.clone()} />);
    //   itemId++;
    //   lastItemEndTime.add(item.time, 'm');
    // });
    // this.props.items.forEach(function(item, index, items) {
    //   if (!lastItemEndTime) {
    //     lastItemEndTime = self.props.startTime.clone();
    //   }
    //   rowsArr.push(<RowItem item={item} itemId={itemId} startTime={lastItemEndTime.clone()} />);
    //   lastItemEndTime.add(item.time, 'm');
    // });
    return (
      React.createElement(Table, {striped: true, bordered: true, hover: true, responsive: true}, 
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
        React.createElement(TableBody, {items: this.props.items, startTime: this.props.startTime, onSort: this.props.onSort})
      )
    );
  }
});

var TableBody = React.createClass({displayName: "TableBody",
  componentDidMount: function() {
    var self = this;
    // the following is borrowed from http://www.avtex.com/blog/2015/01/27/drag-and-drop-sorting-of-table-rows-in-priority-order/
    // to keep the table row from collapsing when being sorted
    var fixHelperModified = function(e, tr) {
      var $originals = tr.children();
      var $helper = tr.clone();
      $helper.children().each(function(index) {
        $(this).width($originals.eq(index).width())
      });
      return $helper;
    };
    // make the table sortable
    $('#sortable').sortable({
      helper: fixHelperModified,
      update: function(event, ui) {
        console.log(ui);
      },
      stop: function(event, ui) {
        var newOrder = $('#sortable').sortable('toArray', {attribute: 'data-id'});
        console.log(newOrder);
        self.props.onSort(newOrder);
        self.forceUpdate();
      }
    }).disableSelection();
    // up to here
  },
  componentDidUpdate: function() {
    // gadgets.window.adjustHeight();
  },
  handleDrop: function() {
    this.props.onSort(newOrder);
  },
  render: function() {
    var self = this;
    var rowsArr = [];
    var itemId = 0;
    var lastItemEndTime = null;
    this.props.items.forEach(function(item, index, items) {
      if (!lastItemEndTime) {
        lastItemEndTime = self.props.startTime.clone();
      }
      rowsArr.push(React.createElement("tr", {"data-id": itemId}, React.createElement("td", null, itemId), React.createElement("td", null, lastItemEndTime.clone().format('LT')), React.createElement("td", null, item.time), React.createElement("td", null, item.topic), React.createElement("td", null, item.owner), React.createElement("td", null, item.desc)));
      lastItemEndTime.add(item.time, 'm');
      itemId++;
    });
    return(
      React.createElement("tbody", {id: "sortable"}, 
        rowsArr
      )
    );
  }
});

var RowItem = React.createClass({displayName: "RowItem",
  render: function() {
    return (
      React.createElement("tr", {id: this.props.id}, 
        React.createElement("td", null, this.props.id), 
        React.createElement("td", null, this.props.startTime.format('LT')), 
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

var ITEMS = {
  "items": [
      {
          "id": "0",
          "topic": "Sales Demo",
          "desc": "slaesales demosales demosales demosales demosales demosales demosales demosales demosales demosales demosales demo",
          "time": 5,
          "owner": "Allen"
      },
      {
          "id": "1",
          "topic": "Jam on HANA",
          "desc": "HANA",
          "time": 10,
          "owner": "Harsimran"
      },
      {
          "id": "2",
          "topic": "Open Social Gadgets",
          "desc": "this is about topic 3",
          "time": 15,
          "owner": "GY"
      },
      {
          "id": "3",
          "topic": "Workers",
          "desc": "this is about topic 4",
          "time": 20,
          "owner": "Vivek"
      }
  ],
  "startTime": 1433923200000,
  "nextId": 4
}


React.render(React.createElement(Agenda, {items: ITEMS}), document.body);