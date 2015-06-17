var Table = ReactBootstrap.Table;
var Button = ReactBootstrap.Button;

var Agenda = React.createClass({
  render: function() {
    return (
      <div>
        <AgendaTable items={this.props.items.items} />
        <AddButton />
      </div>
    );
  }
});

var AgendaTable = React.createClass({
  render: function() {
    var rows = this.props.items.map(function(item) {
      return (
        <RowItem item={item} />
      )
    });
    return (
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Duration</th>
            <th>Topic</th>
            <th>Presenter</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Table>
    );
  }
});

var RowItem = React.createClass({
  render: function() {
    return (
      <tr>
        <td>{this.props.item.time}</td>
        <td>{this.props.item.topic}</td>
        <td>{this.props.item.owner}</td>
      </tr>
    );
  }
});

var AddButton = React.createClass({
  render: function() {
    return (
      <Button>Add an item</Button>
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


React.render(<Agenda items={ITEMS} />, document.body);