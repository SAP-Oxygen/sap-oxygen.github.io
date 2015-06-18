var Table = ReactBootstrap.Table;
var Button = ReactBootstrap.Button;
var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;

var Agenda = React.createClass({
  render: function() {
    return (
      <Grid>
        <DatePicker />
        <AgendaTable items={this.props.items.items} />
        <AddButton />
      </Grid>
    );
  }
});

var AgendaTable = React.createClass({
  getInitialState: function() {
    var currentTime = moment();
    console.log('current time: ' + );

    return {
      createdTime: moment(),
      startTime: moment()
    }
  },
  render: function() {
    var rows = this.props.items.map(function(item) {
      return (
        <RowItem item={item} />
      )
    });
    var rowsArr = [];
    var lastItemEndTime = null;
    this.props.items.forEach(function(item, index) {
      if (!lastItemEndTime) {
        lastItemEndTime = this.state.startTime;
      }
      rowsArr.push(<RowItem item={item} startTime={lastItemEndTime}/>)
      lastItemEndTime.add(item.time, 'm')
    })
    return (
      <Table striped bordered hover id="sortable">
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

var DatePicker = React.createClass({
  render: function() {
    return (
      <Row className='show-grid'>
        <Col sm={12}>
          <div className='input-group date' id='datetimepicker'>
            <input type='text' className='form-control' />
            <span className='input-group-addon'>
              <span className='glyphicon glyphicon-calendar'></span>
            </span>
          </div>
        </Col>
      </Row>
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


React.render(<Agenda items={ITEMS} />, document.body);