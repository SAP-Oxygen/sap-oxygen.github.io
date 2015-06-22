var Table = ReactBootstrap.Table;
var Button = ReactBootstrap.Button;
var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Glyphicon = ReactBootstrap.Glyphicon;
var harsimran = "jfweieuwflkfj";

var Agenda = React.createClass({
  getInitialState: function() {
    if (this.props.startTime) {
      var startTime = this.props.startTime;
    } else {
      var startTime = moment();
    }
    return {
      items: this.props.items.items,
      nextId: this.props.nextId,
      startTime: startTime
    } 
  },
  onTimeChange: function(newTime) {
    this.setState({
      startTime: newTime
    });
  },
  onAddTopic: function() {
    this.setState({
      items: this.state.items.push({id: this.state.nextId}),
      nextId: this.setState.nextId++
    });
  },
  render: function() {
    return (
      <Grid>
        <br />
        <Row>
          <DatePicker />
          <TimePicker handleDateTimeChange={this.onTimeChange} />
        </Row>
        <br />
        <AgendaTable items={this.state.items} startTime={this.state.startTime} />
        <AddButton onAddTopic={this.onAddTopic} />
      </Grid>
    );
  }
});

var AgendaTable = React.createClass({
  getInitialState: function() {
    return {
      rowOrder: []
    }
  },
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
    $('#sortable tbody').sortable({
      helper: fixHelperModified,
      update: function(event, ui) {
        console.log(ui);
      }
      // stop: function(event, ui) {
      //   console.log(arguments);
      //   console.log($('#sortable tbody').sortable('toArray'));
      //   self.setState({
      //     // get the order of id's after sorted
      //     rowOrder: $('#sortable tbody').sortable('toArray')
      //   })
      //   self.forceUpdate();
      // }
    }).disableSelection();
    // up to here
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
    this.props.items.forEach(function(item, index, items) {
      if (!lastItemEndTime) {
        lastItemEndTime = self.props.startTime.clone();
      }
      rowsArr.push(<RowItem item={item} itemId={itemId} startTime={lastItemEndTime.clone()} />);
      lastItemEndTime.add(item.time, 'm');
    });
    return (
      <Table striped bordered hover responsive id="sortable">
        <thead>
          <tr>
            <th> </th>
            <th>Start Time</th>
            <th>Duration</th>
            <th>Topic</th>
            <th>Presenter</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {rowsArr}
        </tbody>
      </Table>
    );
  }
});

var RowItem = React.createClass({
  render: function() {
    return (
      <tr id={this.props.item.id}>
        <td>{this.props.item.id}</td>
        <td>{this.props.startTime.format('LT')}</td>
        <td>{this.props.item.time} min</td>
        <td>{this.props.item.topic}</td>
        <td>{this.props.item.owner}</td>
        <td>{this.props.item.desc}</td>
      </tr>
    );
  }
});

var AddButton = React.createClass({
  handleAdd: function() {
    this.props.onAddTopic();
  },
  render: function() {
    return (
      <Button onClick={this.handleAdd}>Add an item</Button>
    );
  }
});

var DatePicker = React.createClass({
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
      <Col xs={4} id='date'>
        <div className='input-group date' id='datepicker'>
          <input type='text' className='form-control' />
          <span className='input-group-addon'>
            <span className='glyphicon glyphicon-calendar'></span>
          </span>
        </div>
      </Col>
    );
  }
});

var TimePicker = React.createClass({
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
      <Col xs={3} id='time'>
        <div className='input-group date' id='timepicker'>
          <input type='text' className='form-control' />
          <span className='input-group-addon'>
            <span className='glyphicon glyphicon-calendar'></span>
          </span>
        </div>
      </Col>
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


React.render(<Agenda items={ITEMS} />, document.body);