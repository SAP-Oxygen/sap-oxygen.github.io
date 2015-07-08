var Input = ReactBootstrap.Input;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonInput = ReactBootstrap.ButtonInput;
var Button = ReactBootstrap.Button;

var DialogBox = React.createClass({
  handleSubmit: function(e){
    e.preventDefault();
  },
  render: function() {
    return(
      <div>
        <h3>
        Add New Agenda Topic
        </h3>
        <form onSubmit={this.handlesubmit}>
          <Input type='text' label='Topic' placeholder='Enter Agenda Topic' />
          <Input type='textarea' label='Details' placeholder='Describe This Topic' />
          <ButtonInput type='submit' bsSize='small'>Submit</ButtonInput>
          <ButtonInput bsSize='small'>Close</ButtonInput>
        </form>
      </div>
    );
  }
});

React.render(<DialogBox />, document.body);
