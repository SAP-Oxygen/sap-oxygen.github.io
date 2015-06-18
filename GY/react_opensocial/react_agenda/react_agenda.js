var Table = ReactBootstrap.Table;
var Button = ReactBootstrap.Button;
var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Glyphicon = ReactBootstrap.Glyphicon;

var Agenda = React.createClass({displayName: "Agenda",
  getInitialState: function() {
    return {
      createdTime: moment(),
      startTime: moment()
    } 
  },
  onDateTimeChange: function(dateTime) {
    this.setState({
      startTime: dateTime
    });
  },
  render: function() {
    return (
      React.createElement(Grid, null, 
        React.createElement("br", null), 
        React.createElement(DatePicker, {handleDateTimeChange: this.onDateTimeChange}), 
        React.createElement("br", null), 
        React.createElement(AgendaTable, {items: this.props.items.items, startTime: this.state.startTime}), 
        React.createElement(AddButton, null)
      )
    );
  }
});

var AgendaTable = React.createClass({displayName: "AgendaTable",
  render: function() {
    var self = this;
    var rowsArr = [];
    var lastItemEndTime = null;
    this.props.items.forEach(function(item, index) {
      if (!lastItemEndTime) {
        lastItemEndTime = self.props.startTime;
      }
      rowsArr.push(React.createElement(RowItem, {item: item, startTime: lastItemEndTime.clone()}))
      lastItemEndTime.add(item.time, 'm');
    })
    return (
      React.createElement(Table, {striped: true, bordered: true, hover: true, id: "sortable"}, 
        React.createElement("thead", null, 
          React.createElement("tr", null, 
            React.createElement("th", null, "Start"), 
            React.createElement("th", null, "Duration"), 
            React.createElement("th", null, "Topic"), 
            React.createElement("th", null, "Presenter")
          )
        ), 
        React.createElement("tbody", null, 
          rowsArr
        )
      )
    );
  }
});

var RowItem = React.createClass({displayName: "RowItem",
  render: function() {
    return (
      React.createElement("tr", null, 
        React.createElement("td", null, this.props.startTime.format("h:mm A")), 
        React.createElement("td", null, this.props.item.time, " min"), 
        React.createElement("td", null, this.props.item.topic), 
        React.createElement("td", null, 
          this.props.item.owner, 
          React.createElement(Glyphicon, {glyph: "edit", className: "pull-right"})
        )
      )
    );
  }
});

var AddButton = React.createClass({displayName: "AddButton",
  render: function() {
    return (
      React.createElement(Button, null, "Add an item")
    );
  }
});

var DatePicker = React.createClass({displayName: "DatePicker",
  componentDidMount: function() {
    var self = this;
    // Datepicker
    $(function () {
        $('#datetimepicker').datetimepicker({
          sideBySide: true,
          showClose: true,
          showTodayButton: true
        });
    });
    $('#datetimepicker').on("dp.change", function (e) {
      var dateTime = $('#datetimepicker').data("DateTimePicker").viewDate();
      self.onDateTimeChange(dateTime);
    });
  },
  onDateTimeChange: function(dateTime) {
    this.props.handleDateTimeChange(dateTime);
  },
  render: function() {
    return (
      React.createElement(Row, {className: "show-grid"}, 
        React.createElement(Col, {sm: 12}, 
          React.createElement("div", {className: "input-group date", id: "datetimepicker"}, 
            React.createElement("input", {type: "text", className: "form-control"}), 
            React.createElement("span", {className: "input-group-addon"}, 
              React.createElement("span", {className: "glyphicon glyphicon-calendar"})
            )
          )
        )
      )
    );
  }
});

$(document).ready(function() {

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
  $('#sortable tbody').sortable({
    helper: fixHelperModified
  }).disableSelection();
  // up to here
  
});

var ITEMS = {
  "items": [
      {
          "id": "1",
          "topic": "Sales Demo",
          "desc": "this is about topic 1",
          "time": 5,
          "owner": "Allen"
      },
      {
          "id": "2",
          "topic": "Jam on HANA",
          "desc": "this is about topic 2",
          "time": 10,
          "owner": "Harsimran"
      },
      {
          "id": "3",
          "topic": "Open Social Gadgets",
          "desc": "this is about topic 3",
          "time": 15,
          "owner": "GY"
      },
      {
          "id": "Jyr5zDe7JIc14dfe1b6bca1",
          "topic": "Workers",
          "desc": "this is about topic 4",
          "time": 20,
          "owner": "Vivek"
      }
  ],
  "startTime": 1433923200000
}


React.render(React.createElement(Agenda, {items: ITEMS}), document.body);