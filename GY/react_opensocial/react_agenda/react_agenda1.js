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
        React.createElement(AgendaTable, {data: this.props.items, startTime: this.state.startTime}), 
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
        React.createElement(TableBody, {data: this.props.data, startTime: this.props.startTime, onSort: this.props.onSort})
      )
    );
  }
});

var TableBody = React.createClass({displayName: "TableBody",
  getInitialState: function() {
    return {
      data: this.props.data
    }
  },
  componentDidMount: function() {
    // var self = this;
    // // the following is borrowed from http://www.avtex.com/blog/2015/01/27/drag-and-drop-sorting-of-table-rows-in-priority-order/
    // // to keep the table row from collapsing when being sorted
    // var fixHelperModified = function(e, tr) {
    //   var $originals = tr.children();
    //   var $helper = tr.clone();
    //   $helper.children().each(function(index) {
    //     $(this).width($originals.eq(index).width())
    //   });
    //   return $helper;
    // };
    // // make the table sortable
    // $('#sortable').sortable({
    //   helper: fixHelperModified,
    //   stop: function(event, ui) {

    //     var newOrder = $('#sortable').sortable('toArray', {attribute: 'data-id'});
    //     console.log(newOrder);
    //     self.onSort(newOrder);
    //   }
    // }).disableSelection();
    // up to here
  },
  componentDidUpdate: function() {
    // gadgets.window.adjustHeight();
  },
  // onSort: function(newOrder) {
  //   var self = this;
  //   var newItems = newOrder.map(function(index) {
  //     return self.state.tempItems[index];
  //   });
  //   this.setState({tempItems: newItems});
  //   console.log(this.state.tempItems);
  // },
  sort: function(items, dragging) {
    var data = this.state.data;
    data.items = items;
    data.dragging = dragging;
    this.setState({data: data});
  },
  dragEnd: function() {
    this.sort(this.state.data.items, undefined);
    console.log(this.state.data.items);
  },
  dragStart: function(e) {
    this.dragged = Number(e.currentTarget.dataset.id);
    e.dataTransfer.effectAllowed = 'move';

    // Firefox requires calling dataTransfer.setData
    // for the drag to properly work
    e.dataTransfer.setData("text/html", null);
  },
  dragOver: function(e) {
    e.preventDefault();

    var over = e.currentTarget
    var dragging = this.state.data.dragging;
    var from = isFinite(dragging) ? dragging : this.dragged;
    var to = Number(over.dataset.id);
    if((e.clientY - over.offsetTop) > (over.offsetHeight / 2)) to++;
    if(from < to) to--;

    // Move from 'a' to 'b'
    var items = this.state.data.items;
    items.splice(to, 0, items.splice(from,1)[0]);
    this.sort(items, to);
  },
  render: function() {
    var self = this;
    var rowsArr = [];
    var itemId = 0;
    var lastItemEndTime = null;
    // this.state.tempItems.forEach(function(item, index, items) {
    //   if (!lastItemEndTime) {
    //     lastItemEndTime = self.props.startTime.clone();
    //   }
    //   rowsArr.push(<RowItem id={itemId} item={item} startTime={lastItemEndTime.clone()} />);
    //   lastItemEndTime.add(item.time, 'm');
    //   itemId++;
    // });
    var rows = this.state.data.items.map(function(item, i, arr) {
      var dragging = (i == self.state.data.dragging) ? "dragging" : "";
      if (!lastItemEndTime) {
        lastItemEndTime = self.props.startTime.clone();
      }
      return (
        React.createElement("tr", {"data-id": i, 
          className: dragging, 
          key: i, 
          draggable: "true", 
          onDragEnd: self.dragEnd, 
          onDragOver: self.dragOver, 
          onDragStart: self.dragStart}, 
          React.createElement("td", null, i), 
          React.createElement("td", null, lastItemEndTime.format('LT')), 
          React.createElement("td", null, item.time, " min"), 
          React.createElement("td", null, item.topic), 
          React.createElement("td", null, item.owner), 
          React.createElement("td", null, item.desc)
        )
      );
    })
    return (
      React.createElement("tbody", null, 
        rows
      )
    );
  }
});

var RowItem = React.createClass({displayName: "RowItem",
  render: function() {
    return this.transferPropsTo(
        React.createElement("tr", {className: this.isDragging() ? "dragging" : ""}, 
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
          "topic": "Adam",
          "desc": "A",
          "time": 5,
          "owner": "A"
      },
      {
          "id": "1",
          "topic": "Bob",
          "desc": "B",
          "time": 10,
          "owner": "B"
      },
      {
          "id": "2",
          "topic": "Chalie",
          "desc": "C",
          "time": 15,
          "owner": "C"
      },
      {
          "id": "3",
          "topic": "David",
          "desc": "D",
          "time": 20,
          "owner": "D"
      }
  ],
  "startTime": 1433923200000,
  "nextId": 4
}


React.render(React.createElement(Agenda, {items: ITEMS}), document.body);