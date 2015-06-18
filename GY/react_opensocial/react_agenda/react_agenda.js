var Table = ReactBootstrap.Table;
var Button = ReactBootstrap.Button;
var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;

var Agenda = React.createClass({displayName: "Agenda",
  render: function() {
    return (
      React.createElement(Grid, null, 
        React.createElement(DatePicker, null), 
        React.createElement(AgendaTable, {items: this.props.items.items}), 
        React.createElement(AddButton, null)
      )
    );
  }
});

var AgendaTable = React.createClass({displayName: "AgendaTable",
  getInitialState: function() {
    console.log('current time: ' + moment());
    return {
      startTime: moment()
    }
  },
  render: function() {
    var rows = this.props.items.map(function(item) {
      return (
        React.createElement(RowItem, {item: item})
      )
    });
    return (
      React.createElement(Table, {striped: true, bordered: true, hover: true, id: "sortable"}, 
        React.createElement("thead", null, 
          React.createElement("tr", null, 
            React.createElement("th", null, "Duration"), 
            React.createElement("th", null, "Topic"), 
            React.createElement("th", null, "Presenter")
          )
        ), 
        React.createElement("tbody", null, 
          rows
        )
      )
    );
  }
});

var RowItem = React.createClass({displayName: "RowItem",
  render: function() {
    return (
      React.createElement("tr", null, 
        React.createElement("td", null, this.props.item.time), 
        React.createElement("td", null, this.props.item.topic), 
        React.createElement("td", null, this.props.item.owner)
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
  $(function () {
      $('#datetimepicker').datetimepicker({
        sideBySide: true,
        showClose: true,
        showTodayButton: true
      });
  });

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
          "topic": "topic 1",
          "desc": "this is about topic 1",
          "time": 15,
          "owner": "1"
      },
      {
          "id": "2",
          "topic": "topic 2",
          "desc": "this is about topic 2",
          "time": 15,
          "owner": "2"
      },
      {
          "id": "3",
          "topic": "topic 3",
          "desc": "this is about topic 3",
          "time": 15,
          "owner": "1"
      },
      {
          "id": "Jyr5zDe7JIc14dfe1b6bca1",
          "topic": "topic 4",
          "desc": "this is about topic 4",
          "time": 15,
          "owner": "2"
      }
  ],
  "startTime": 1433923200000
}


React.render(React.createElement(Agenda, {items: ITEMS}), document.body);