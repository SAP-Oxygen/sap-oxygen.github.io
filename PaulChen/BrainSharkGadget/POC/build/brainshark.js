function init(ReactBootstrap, jQuery){
  var BrainSharkGadget = React.createClass({displayName: "BrainSharkGadget",
    getInitialState: function() {
      return {url: "http://www.baidu.com", tempUrl:"http://www.baidu.com", isCollapse: true, isOwner: true, scaleOption: 2, tempScaleOption: 2, height: "400px"};
    },
    
    getSettingsPaneClass: function(){
      if (this.state.isCollapse)
      {
        return "collapse";
      } else {
        return "";
      }
    },
    
    getSettingsPaneLabel: function(){
      if (this.state.isCollapse)
      {
        return "";
      } else {
        return "Settings";
      }
    },
    
    changeCollapseState: function(){
      if (this.state.isCollapse)
      {
        this.setState({isCollapse: false});
      } else {
        this.hideSettinsPane();
      }
    },
    
    getScaleText: function(){
      if (this.state.tempScaleOption == 1){
        return "16:9 without Menu";
      } else if (this.state.tempScaleOption == 2){
        return "16:9 with Menu";
      } else if (this.state.tempScaleOption == 3){
        return "4:3 without Menu";
      } else {
        return "4:3 with Menu";
      }
    },
    
    setScaleOption: function(option){
      this.setState({scaleOption: option});
    },
    
    hideSettingsPane: function(){
      this.setState({isCollapse: true, tempUrl: this.state.url, tempScaleOption: this.state.scaleOption});
    },
    
    okBtnClickHandler: function(){
      if(this.state.url != this.state.tempUrl){
        this.setState({url: this.state.tempUrl});
      }
      
      if(this.state.scaleOption != this.state.tempScaleOption){
        this.setState({scaleOption: this.state.tempScaleOption});
        this.changeHeightBaseOnScaleOption();
      }
      
      this.hideSettingsPane();
    },
    
    changeHeightBaseOnScaleOption: function(){
      if (typeof(gadgets) != "undefined" && gadgets){
        var width = gadgets.window.getViewportDimensions().width;
        if (this.state.tempScaleOption == 1){
          var targetHeight = width * 3 / 4.0;
          this.setState({height: targetHeight});
        }
      }
    },
    
    onSelectHandler: function(eventKey){
      this.setState({tempScaleOption: eventKey});
    },
    
    tempUrlChanged: function(e) {
      this.setState({tempUrl: e.target.value});
    },
    
    adjustHeight: function(){
      typeof(gadgets) != "undefined" && gadgets && gadgets.window.adjustHeight();
    },
    
    componentDidMount: function() {
      this.adjustHeight();
    },

    componentDidUpdate: function() {
      this.adjustHeight();
    },
    
    render: function(){
      var Button = ReactBootstrap.Button;
      var DropdownButton = ReactBootstrap.DropdownButton;
      var MenuItem = ReactBootstrap.MenuItem;
      return(
        React.createElement("div", null, 
          React.createElement("div", {id: "input-group-main"}, 
            React.createElement(Button, {id: "settings-btn", onClick: this.changeCollapseState}, "Settings")
          ), 
          React.createElement("div", {id: "settings-pane", className: this.getSettingsPaneClass()}, 
            React.createElement("div", {id: "settings-pane-label"}, React.createElement("h2", null, this.getSettingsPaneLabel())), 
            React.createElement("div", null, 
              React.createElement("table", {style: {width: "100%"}}, 
                React.createElement("tr", {style: {height: "50px"}}, 
                  React.createElement("td", {style: {width: "50px"}}, React.createElement("label", {className: "col-sm-1"}, "URL")), 
                  React.createElement("td", null, React.createElement("input", {type: "text", className: "form-control", name: "settings-url", placeholder: "https://www.brainshark.com/...", value: this.state.tempUrl, onChange: this.tempUrlChanged}))
                ), 
                React.createElement("tr", {style: {height: "50px"}}, 
                  React.createElement("td", {style: {width: "50px"}}, React.createElement("label", {className: "col-sm-1 "}, "Scale")), 
                  React.createElement("td", null, 
                    React.createElement(DropdownButton, {title: this.getScaleText()}, 
                      React.createElement(MenuItem, {eventKey: "1", onSelect: this.onSelectHandler}, "16:9 without Menu"), 
                      React.createElement(MenuItem, {eventKey: "2", onSelect: this.onSelectHandler}, "16:9 with Menu"), 
                      React.createElement(MenuItem, {eventKey: "3", onSelect: this.onSelectHandler}, "4:3 without Menu"), 
                      React.createElement(MenuItem, {eventKey: "4", onSelect: this.onSelectHandler}, "4:3 with Menu")
                    )
                  )
                )
              ), 
              React.createElement("div", {id: "settings-input-group"}, 
                React.createElement(Button, {onClick: this.okBtnClickHandler, bsStyle: "primary", style: {marginLeft: "15px", marginRight: "5px"}}, "Save"), 
                React.createElement(Button, {onClick: this.hideSettingsPane}, "Cancel")
              )
            )
          ), 
          React.createElement("div", {id: "content"}, 
            React.createElement("iframe", {id: "url-frame", src: this.state.url, style: {height: this.state.height}})
          )
        )
      );
    }
  });

  React.render(React.createElement(BrainSharkGadget, null), document.body);
}

if (typeof(gadgets) != "undefined" && gadgets) {
  gadgets.util.registerOnLoadHandler(function() { init(ReactBootstrap, jQuery); });
} else {
  init(ReactBootstrap, jQuery);
}