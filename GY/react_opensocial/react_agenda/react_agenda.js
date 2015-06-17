var Table = ReactBootstrap.Table;
var Button = ReactBootstrap.Button;

var Agenda = React.createClass({displayName: "Agenda",
  render: function() {
    return (
      React.createElement("div", null, 
        React.createElement(AgendaTable, {items: this.props.items.items}), 
        React.createElement(AddButton, null)
      )
    );
  }
});

var AgendaTable = React.createClass({displayName: "AgendaTable",
  render: function() {
    var rows = this.props.items.map(function(item) {
      return (
        React.createElement(RowItem, {item: item})
      )
    });
    return (
      React.createElement(Table, {striped: true, bordered: true, hover: true}, 
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