class EditDialog extends React.Component {
  constructor(props) {
    super(props);
  }

  saveItem() {
    const item = {
      text: ReactDOM.findDOMNode(this.refs.content).value.trim(),
      shouldDelete: false
    };
    if (this.validateItem(item)) {
      gadgets.views.setReturnValue(item);    
      gadgets.views.close();    
    }
  }

  validateItem(item) {
    const length = item.text.length;
    if (length != 0) {
      return true;
    } else {
      return false;
    }
  }

  cancel() {
    gadgets.views.setReturnValue(null);
    gadgets.views.close();
  }

  deleteItem() {
    const item = {
      shouldDelete: true
    };
    gadgets.views.setReturnValue(item)
    gadgets.views.close();
  }

  moveCaretToEnd(el) {
    el.selectionStart = el.selectionEnd = el.value.length;
  }

  render() {
    const type = this.props.type;
    const existingContent = this.props.existingContent;
    var title = '';
    if (type === "item") {
      title = getLocale("edit_item");
    } else {
      title = getLocale("edit_topic");
    }
    return (
      <div>
        <div className="dialog-header">{title}</div>
        <div>
          <div className="dialog-section">
            <textarea id="content" ref="content">{existingContent}</textarea>
          </div>
          <div className="dialog-buttons">
            <button className="btn btn-primary" onClick={() => this.saveItem()}>
              {getLocale("save")}
            </button>
            <button className="btn" onClick={() => this.cancel()}>
              {getLocale("cancel")}
            </button>
            <button className="btn btn-left" onClick={() => this.deleteItem()}>
              {getLocale("delete")}
            </button>
          </div>
        </div>
      </div>
    );    
  }

  componentDidMount() {
    var content = ReactDOM.findDOMNode(this.refs.content);
    content.focus();
    this.moveCaretToEnd(content);

    gadgets.window.adjustHeight();
    gadgets.window.adjustWidth();
  }
}

gadgets.util.registerOnLoadHandler(() => {
  var params = gadgets.views.getParams();
  gadgets.sapjam.asyncMessage.get(params.paramsKey, function(existingContent) {
    ReactDOM.render(<EditDialog {...gadgets.views.getParams()} existingContent={existingContent}/>, document.getElementById('react-mount'));
  })
});