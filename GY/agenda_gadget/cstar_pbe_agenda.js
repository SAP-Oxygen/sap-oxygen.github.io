/*
 * PBE handler for the agenda
 */
/*global CSTAR, lipstick, setInterval, clearInterval, streamwork, sap */
if (!this.CSTAR) {
    this.CSTAR = {};
}
var widget = CSTAR.agenda.widget;
var id = CSTAR.agenda.ctlId;
var uuid = CSTAR.agenda.itemUuid;
var acURL = CSTAR.agenda.acURL;
var read_only = CSTAR.agenda.readOnly;
var init_data = CSTAR.agenda.initial_data;
var military_time = CSTAR.agenda.militaryTime || false;

(function (ns, $) {

    debugger;
    var widgetRegistry = {};
    //// bypass jamApp function and add corresponding stubs
    // date_format_pattern = $.fullCalendar.TranslateDateFormat(
    //     'date.formats.default', 'date.formats.default_date_delimiter');
    // date_format_symbols = $.fullCalendar.TranslateDateFormat(
    //     'date.formats.default', 'date.formats.default_date_delimiter');
    date_format_pattern = "";
    date_format_symbols = "";
 
     function formatTime(time){
        if(!(time instanceof Date)){
            return;
        }
        var parsedTime;
        var hour = time.getHours();
        var minute = time.getMinutes();

        if (minute === 0){
            minute="00";
        }
        if (minute > 0 && minute < 10){
            minute="0"+minute;
        }
        if (military_time) {
            return hour+":"+minute
        }

        var AMPM = " AM";
        
        if (hour === 0){
            hour = 12; //Show 12am instead of 0am     
        }
        else if (hour === 12){
            AMPM = " PM"; //Show 12pm instead of 12am when it's noon
        }        
        else if (hour > 12){
            AMPM = " PM";
            hour -= 12;
        }

        parsedTime = hour+":"+minute+AMPM;

        return parsedTime;
    }

    ns.agenda = {
        makeWidget : function(options) {
            var DEF_OWNER = {id:null,email:''};
            var MIN_H = 80;
            
            var _widget;
            var _noticeQueue=[];
            var _bc=0;
            var _inited = false;
            var _loaded = false;
            var _nid = 1;

            var agenda;
            var agenda_id;

            // create a pop-up dialog
            function _makeItemEditForm(agenda) {
                function _initTimeCtl (jcntr) {
                    var _jcntr = jcntr;
                    var _jhour = jcntr.find('.time #hour_text');
                    var _jmin = jcntr.find('.time #minute_text');
                    var _jHourDD = jcntr.find('.time #hour_dropdown');
                    var _jMinuteDD = jcntr.find('.time #minute_dropdown');
                    var _jtbox = jcntr.find('.time .tbox');
                    var _jDDClick = false;
                    var _minute=0;
                    var _hour=0;
                    var _tboxTimer=null;
                    
                    function _acceptEditMinute (val) {
                        _jmin.val(val);
                        if(!isNaN(val) && val >= 0  && val < 1000) {
                            if(val >= 60){
                                var min = val%60;
                                var hour = val/60;
                                _acceptEditMinute(min);
                                _acceptEditHour(parseInt(_jhour.val(),10) + parseInt(Math.floor(hour),10));
                            }
                            else{
                                _jmin.css("background-color", "white");
                                _setMinutes(val);
                            }
                        }
                        else{
                            _jmin.css("background-color", "#FAAFBA");
                        }              
                    }
                    
                    function _acceptEditHour (val) {
                        _jhour.val(val);
                        if(!isNaN(val) && val >= 0  && val < 24) {
                           _jhour.css("background-color", "white");
                           $(".tbox_warning").css("display", "none");
                           _setHours(val);
                        }
                        else if(isNaN(val)){
                            $(".tbox_warning").css("display", "none");
                            _jhour.css("background-color", "#FAAFBA");
                        }
                        else{
                            _jhour.css("background-color", "#FAAFBA");
                            $(".tbox_warning").css("display", "block");
                        }
                    }

                    
                    function _bindDDFocus() {
                        _jhour.focus( function(e) {
                            e.stopPropagation();
                            if (_jHourDD.is(':hidden')) {
                                _showHourDD ();
                            } else {
                                _hideHourDD ();
                            }
                        });
                    
                        _jhour.focusout( function(e) {
                            e.stopPropagation();
                            _acceptEditHour(_jhour.val());
                        });
                    
                        _jmin.focus( function(e) {
                            e.stopPropagation();
                            if (_jMinuteDD.is(':hidden')) {
                                _showMinuteDD ();
                            } else {
                                _hideMinuteDD ();
                            }
                        });
                    
                        _jmin.focusout( function(e) {
                            e.stopPropagation();
                            _acceptEditMinute(_jmin.val());
                        });
                    }
        
                    function _bindDDBlur () {
                        _jhour.blur( function(e) {
                            e.stopPropagation();
                            if(!_jDDClick){
                                _hideHourDD();
                            }
                            
                        });
                    
                        _jmin.blur( function(e) {
                            e.stopPropagation();
                            if(!_jDDClick){
                                _hideMinuteDD();
                            }
                            
                        });
                    }
                    
                    function _showHourDD () {
                        _jHourDD.css("display", "block");
                        _bindDDBlur ();
                    }
                    
                    function _showMinuteDD () {
                        _jMinuteDD.css("display", "block");
                        _bindDDBlur ();
                    }

                    function _hideHourDD () {
                        _jHourDD.css("display", "none");
                    }
                    
                    function _hideMinuteDD () {
                        _jMinuteDD.css("display", "none");
                    }
                    
                    function _bindDDItemEvents () {
                        _jMinuteDD.children().each(function(i) {
                            $(this).click( function(e){
                                    e.stopPropagation();
                                    $(this).removeClass('hilight');
                                    var m = 15;
                                    switch (i) {
                                        case 0:m=0;break;
                                        case 1:m=5;break;
                                        case 2:m=10;break;
                                        case 3:m=15;break;
                                        case 4:m=20;break;
                                        case 5:m=30;break;
                                        case 6:m=60;break;
                                    }
                                    _acceptEditMinute(m);
                                    _hideMinuteDD ();
                            }).hover (
                            function() {
                                $(this).addClass('hilight');
                                _jDDClick = true;
                            },
                            function() {
                                $(this).removeClass('hilight');
                                _jDDClick = false;
                            });
                        });     
                        
                        _jHourDD.children().each(function(i) {
                            $(this).click( function(e){
                                    e.stopPropagation();
                                    $(this).removeClass('hilight');
                                    var m = 1;
                                    switch (i) {
                                        case 0:m=0;break;
                                        case 1:m=1;break;
                                        case 2:m=2;break;
                                        case 3:m=3;break;
                                        case 4:m=4;break;
                                        case 5:m=5;break;
                                        case 6:m=6;break;
                                    }
                                    _acceptEditHour(m);
                                    _hideHourDD ();
                                }).hover (
                                function() {
                                    $(this).addClass('hilight');
                                    _jDDClick = true;
                                },
                                function() {
                                    $(this).removeClass('hilight');
                                    _jDDClick = false;
                                });
                        }); 
                    }
                    
                    function _setMinutes (v) {
                        _minute = parseInt(v,10);
                        if(!_jmin.val()){
                            _jmin.val(v);
                        }
                    }
                    
                    function _setHours (v) {
                        _hour = parseInt(v,10);
                        if(!_jhour.val()){
                            _jhour.val(v);
                        }
                    }
                    
                    _bindDDFocus ();
                    _bindDDItemEvents ();
                    
                    return {
                        getMinutes : function () {
                            return _minute;
                        },
                        
                        getHours : function () {
                            return _hour;
                        },
                    
                        setMinutes : function (v) {
                            _setMinutes(v);
                        },
                        
                        setHours : function (v) {
                            _setHours(v);
                        }
                    };
                }

                function _getTimeHtml () {
                    var sb=[];
                    sb.push('<div class="time">');
                    sb.push('<input type="hidden" class="value"/>');
                    
                    sb.push('<div class="tbox_time">');
                    sb.push('<span class="tbox_hour">' + "agenda.hour" + ': <input id="hour_text" type="text" tabindex="3">');
                    sb.push('<ul id="hour_dropdown" class="agenda_dropdown" tabindex=0><li>--</li>' + getTimeHourHelper(1) + getTimeHourHelper(2) + getTimeHourHelper(3) + getTimeHourHelper(4) + getTimeHourHelper(5) + getTimeHourHelper(6) + '</ul>');
                    sb.push('</span>');
                    
                    sb.push('<span class="tbox_minute">' + "agenda.minute" + ': <input id="minute_text" type="text" tabindex="4">');
                    sb.push('<ul id="minute_dropdown" class="agenda_dropdown" tabindex=0><li>--</li>' + getTimeMinuteHelper(5) + getTimeMinuteHelper(10) + getTimeMinuteHelper(15) + getTimeMinuteHelper(20) + getTimeMinuteHelper(30) + getTimeMinuteHelper(60) + '</ul>');
                    sb.push('</span>');
                    sb.push('</div>');

                    sb.push('</div>');
                  
                    return sb.join('');
                }
                
                
                var getTimeHourHelper = function(time) {
                    return "<li>" + CSTAR.t("time.x_hours", {n: time}) + "</li>";
                };
                
                var getTimeMinuteHelper = function(time) {
                    return "<li>" + CSTAR.t("time.x_minutes", {n: time}) + "</li>";
                };
                
                function _getFormHtml() {
                    var sb=[];
                    sb.push('<div class="agenda-edit">');
                    sb.push('<div class="agenda-edit-form">');
                    
                    sb.push('<div id="agenda_topic">');
                    sb.push('<div class="agenda_label">' + "agenda.topic" + '<span class="required-label"> (' + "common.required" + ')</span></div>');
                    sb.push('<input type="text" class="topic blank" tabindex="1" value="' + "agenda.enter_agenda_topic" + '"/>');
                    sb.push('</div>');
                    
                    sb.push('<div id="agenda_owner">');
                    sb.push('<div class="agenda_label">' + "agenda.topic_presenter" + '</div>');
                    sb.push('<div class="memberAutoComplete">')
                    sb.push('</div>');
                    sb.push('</div>');
                    
                    sb.push('<div id="agenda_duration">');
                    sb.push('<div class="agenda_label">' + "agenda.topic_duration" + '<span class="tbox_warning">' + "agenda.duration_warning" + '</span></div>');
                    sb.push(_getTimeHtml());
                    sb.push('</div>');
                    
                    sb.push('<div id="agenda_details">');
                    sb.push('<div class="agenda_label">' +  "common.details" + '</div>');
                    sb.push('<textarea class="descen blank" value="" tabindex="5">' + "agenda.describe_this_topic" + '</textarea>');
                    sb.push('</div>');
                    
                    sb.push('</div>');
                    sb.push('</div>');
                    return sb.join('');
                }

                var _fieldValidator;
                
                function _startValidator (jcntr) {
                    var jokBtn = $('.okBtn', jcntr);
                    var jtopic = $('.agenda-edit-form .topic', jcntr);
                    
                    _fieldValidator = setInterval(function () {
                        var v = '';
                        var hour = $('.agenda-edit-form .time #hour_text', jcntr);
                        var min = $('.agenda-edit-form .time #minute_text', jcntr);
                        if (!jtopic.hasClass('blank')) {
                            v = $.trim(jtopic.get(0).value);
                        }
                        var zeroTime = false;
                        if(hour.val() === "0" && min.val() === "0"){
                            zeroTime = true;
                        }
                        var validMin = false;
                        if(min.val()>=0 && min.val()<60){
                            validMin = true;
                        }
                        lipstick.enableOkButton(jokBtn, (v.length > 0) && (hour.val() < 24) && !zeroTime && validMin);
                    }, 1000);
                }
                
                function _clearValidator (jcntr) {
                    if (_fieldValidator) {
                        clearInterval(_fieldValidator);
                        _fieldValidator = null;
                    }
                }
                
                var form = {
                    agenda: null,
                    item :null,
                    owner:null,

                    init: function(agenda){
                        this.agenda = agenda;
                    },
        
                    show : function(opts) {
                        _enterBusyState();
                        _disableItemMarker ();
                        if (opts) {
                            this.item = opts.item;
                        }
                        
                        var h =  _getFormHtml();
                        var content = $(h);
    
                        var saveLabel, title;
                        if (this.item && this.item.topic) {
                            saveLabel = "infrastructure.save";
                            title = "agenda.edit_agenda_topic"; 
                       } else {
                            saveLabel = "infrastructure.add";
                            title = "agenda.add_new_agenda_topic";
                       }
                       var btns = [{css:'c22-dialog-close cancel', label:"infrastructure.cancel", isCancel:true}, 
                                   {css:'create', label:saveLabel, disabled:true}];
                       
                        
                        var jform = lipstick.basicForm(content, {
                            title: title ,
                            buttons : btns,
                            width: 426,
                            bodyClass: 'lipstick_dialog_content'
                            }
                        );
                        lipstick.dialog(h, {
                            id: "agendaForm",
                            title: title,
                            okLabel: saveLabel,
                            onClose: _.bind(this.onClose,this),
                            onShow: _.bind(this.onShow,this),
                            onOK: _.bind(this.onOK,this),
                            okDisabled: true,
                            zIndex: 400
                        });
                    },

                    onClose : function(dlg) {
                        _clearValidator();
                        form.item = null;
                        form.owner = null;
                        _enableItemMarker ();
                        _exitBusyState();
                    },

                    onOK : function() {
                        var jcntr = $("body").find('.simplemodal-container');
                        var jokBtn = jcntr.find('.okBtn'); 
                        var topic = '';
                        var jtopic = jcntr.find('.topic');
                       

                        if (!jtopic.hasClass('blank')) {
                            topic = jtopic.get(0).value;
                         }

                        topic = $.trim(topic);
                        
                        if (topic.length === 0) {
                            return;
                        }
                        
                        var desc = '';
                        var jdesc = jcntr.find('.descen');
                        if (!jdesc.hasClass('blank')) {
                            desc = jdesc.get(0).value;
                        }
                        var time = this.timeCtl.getMinutes();
                        time = time + (this.timeCtl.getHours()*60);

                        var append=true;
                        var item;
                        if(form.item) {
                            item = form.item;
                            append=false;
                        } else {
                            item = _makeItem();
                        }
                        
                        if (!item.id) {
                            item.id = _getNextItemId();
                        }
                        
                        item.topic=topic;
                        item.desc=desc;
                        item.time=time;
                        item.owner = form.owner;
                        form.owner = null ;


                        if (append) {
                            agenda.appendItem(item);
                        }
                        else {
                            agenda.updateItem(item);
                        }
                    },

                    onShow : function(dlg) {
                        var jcntr = dlg.container;
                        var self = this;
                        this.timeCtl = _initTimeCtl(jcntr);
                        var jokBtn = jcntr.find('.okBtn'); 
                        var jtopic = jcntr.find('.topic');
                        jtopic.focus ( function() {
                            if($(this).hasClass('blank')) {
                                this.value='';
                                $(this).removeClass('blank');
                            }
                        });

                        var self = this ;
                        var dialog = $('#agendaForm');
                        this.member_input = new jamApp.MembersInput({model: this});
                        var container = dialog.find(".memberAutoComplete");  
                        var member_input_el = this.member_input.$el;
                        container.append(this.member_input.el);   
                        
                        this.member_input.$el.tokenInput(
                            "/search/member_auto_complete?options=tokenize:true&group_ids=" + jamApp.currentGroup.id, 
                            {
                              queryParam: 'query', 
                              minChars: 2, 
                              propertyToSearch: 'FullName',
                              hintText: 'inbox.enter_name_of_presenter',
                              noResultsText: 'inbox.no_matching_members',
                              searchingText: 'inbox.searching',
                              resultsLimit: 10,
                              theme: 'facebook',      
                              tokenDelimiter: ';',
                              tokenLimit:1,
                              resultsFormatter: function(item)  {  return JST['messages/members_input']({item: item});},
                              tokenFormatter: function(item) { 
                                if(item && item.id){
                                    return "<li><p>" + item[this.propertyToSearch].escapeHTML() + "</p></li>"
                                }else{
                                    return "<li><p>" +item.escapeHTML()+ "</p></li>"
                                }
                              },
                              onAdd: function(item) { 
                                if(item.id){
                                    self.owner = item.id;
                                }
                                else{
                                    self.owner = item;
                                }
                                dialog.find('.token-input-list-facebook').find('.token-input-token-facebook').attr("tabindex",2);
                              },
                              onDelete: function(item) { self.owner = null; },
                              onResult: function(results){
                                    var input_box = $('#token-input-');
                                    input_box.unbind("blur");
                                    input_box.blur(function(){
                                        if(input_box.val()){
                                            member_input_el.tokenInput("add",input_box.val());
                                        } 
                                        $('.token-input-dropdown-facebook').hide();
                                    });
                                    return results;
                              }

                            }
                        );
                        
                        var jdesc = jcntr.find('.descen');
                        jdesc.focus ( function() {
                            if($(this).hasClass('blank')) {
                                this.value='';
                                $(this).removeClass('blank');
                            }
                        });
                       
                        var _setOwnerData = function(owner) {
                            var userInfo = com.streamwork.getUserInfoById(owner);
                            var name;
                            
                            form.owner = owner;     

                            if(userInfo){
                                name = userInfo.name ;
                            }
                            else{
                                name = owner ; 
                            }

                            var innerHtml = '<li class = "token-input-token-facebook"><p>'+name.escapeHTML()+'</p><span class="token-input-delete-token-facebook">'
                             +'×</span></li>';
                            dialog.find('.token-input-list-facebook').prepend(innerHtml);

                            dialog.find('.token-input-delete-token-facebook').click(function(){
                                $(this).parent().remove();
                                dialog.find('#token-input-').attr("tabindex",2);
                                self.owner = null;
                            });
                            
                        }
                        if(form.item && form.item.topic) {  // existing agenda item
                            var item = form.item;
                            if (item.time) {
                                this.timeCtl.setMinutes(item.time%60);
                                this.timeCtl.setHours(Math.floor(item.time/60));
                            }
                            
                            jtopic.removeClass('blank').get(0).value = item.topic;
                            lipstick.enableOkButton(jokBtn, true);
                            
                            if (item.desc) {
                                jdesc.removeClass('blank').get(0).value = item.desc;
                            }
                            if (item.owner) {
                                dialog.find('.token-input-list-facebook').blur();
                                _setOwnerData(item.owner);
                                dialog.find('.token-input-list-facebook').find('.token-input-token-facebook').attr("tabindex",2);
                            }
                            else{
                               dialog.find('#token-input-').setPlaceholder("agenda.type_name_and_email"); 
                               dialog.find('#token-input-').attr("tabindex",2); 
                            }   
                        } else {  // new agenda item
                            // init time field
                            dialog.find('#token-input-').setPlaceholder("agenda.type_name_and_email");
                            dialog.find('#token-input-').attr("tabindex",2);
                            this.timeCtl.setMinutes(15);
                            this.timeCtl.setHours(0);
                        }

                        _startValidator(jcntr);

                    }
                };

                form.init(agenda);
                    
                return form;
            }
            
             // create a pop-up dialog for startTime
            function _makeAgendaSetupForm() {
                function _initAgendaSetupForm(jcntr){
                    var _startTimeDD = jcntr.find('#start_time_dropdown');
                    var _jStartDate = jcntr.find('#event_date_input');
                    var _jDDClick = false;
                    var _startTime = null;
                    var _startDate = null;
                    
                    function _bindStartDate(){
                        _jStartDate.focus( function(e) {
                            if($(this).hasClass("blank")){
                                $(this).val("");
                            }
                        });

                        var dpt = lipstick.createDatePicker("event_date_input", null, "common.select_a_date");
                        var cal = dpt.oCalendar();
                        var panel = dpt.oPanel();
                        var panelC = $('#'+panel.id+'_c');
                        var zIndex = parseInt(jcntr.css('z-index'));
                        panelC.css('z-index',zIndex+1);
                        var pos = _jStartDate.offset();
                        panelC.css('left',pos.left+"px");
                        panelC.css('top',pos.top+29+"px");

                        var setDateCallback = function(val) {
                            if (val !== '') {
                                var date = lipstick.parseDate('mm/dd/yy', val);
                                val = jamApp.ui.localizeDate(dueDate, 'date.formats.default');
                            }
                            $("event_date_input").val(val);
                        };

                        var getDateCallback = function() {
                            return jamApp.ui.localizeDate(_startDate, 'MM/dd/yyyy');
                        };

                        dpt.setDateFormatCallbacks(setDateCallback, getDateCallback);

                        function selectHandler(type, args, obj){
                            var selected = args[0][0];
                            var dateText = selected[1]+"/"+selected[2]+"/"+selected[0];
                              try {
                                    parsed = lipstick.parseDate(
                                        'mm/dd/yy',
                                        dateText,
                                        'mm/dd/yy');
                                }
                                catch(err) {
                                    _jStartDate.val("");
                                    _jStartDate.addClass("blank");
                                }
                                if(parsed){
                                    _setStartDate(parsed);
                                    _jStartDate.removeClass("blank");
                                }
                        }


                        cal.selectEvent.subscribe(selectHandler, this, true);

                        jcntr.find(".calendar_icon").click(function(){
                            _jStartDate.focus();
                        });   
                    }

                    function _setStartTime (v) {
                        if (v instanceof Date) {
                            _startTime = v;
                            var hours = v.getHours();
                            var mins = v.getMinutes();
                            if (!military_time){
                                if (hours === 0) {
                                    hours = 12;
                                } else if (hours >= 12) {
                                    if (hours > 12) {
                                        hours -= 12;
                                    }
                                    $("#start-ampm").val("PM");
                                }
                            }
                            $("#start-hour").val(hours);
                            $("#start-minute").val(mins);
                            return;
                        }
                    }

                    function _readStartTimeInput() {
                        var hour = parseInt($("#start-hour").val(), 10);
                        var min = parseInt($("#start-minute").val(), 10);
                        var ampm = $("#start-ampm").val();
                        _startTime = new Date();
                        if (ampm === "PM") {
                            if (hour < 12) {
                                hour += 12;
                            }
                        } else if (ampm === "AM") {
                            if (hour >= 12) {
                                hour -= 12;
                            }
                        }
                        _startTime.setHours(hour);
                        _startTime.setMinutes(min);
                    }
                    
                    function _setStartDate(v) {
                        _jStartDate.val(lipstick.formatDate(date_format_pattern, v, date_format_symbols) );
                        _startDate = v;
                    }

                    _bindStartDate();
                    
                    return {
                        getStartDate : function () {
                            return _startDate;
                        },
                        
                        getStartTime : function () {
                            return _startTime;
                        },
                    
                        readStartTimeInput : function() {
                            _readStartTimeInput();
                            return _startTime;
                        },

                        setStartDate : function (v) {
                            _jStartDate.removeClass("blank");
                            _setStartDate(v);
                        },
                        
                        setStartTime : function (v) {
                            _setStartTime(v);
                        }
                    };
                }
                    
                function _getFormHtml() {
                    var sb=[];
                    sb.push('<div class="agenda-edit">');
                    sb.push('<div class="agenda-edit-form" style="height:130px">');
                    
                    sb.push('<div id="event_date">');
                    sb.push('<div class="agenda_label">' + "agenda.date" + ':</div>');
                    sb.push('<input id="event_date_input" type="text" size="32" name="event_date_input" class="blank" value="' + "agenda.enter_date" + '"/>');
                    sb.push('<div id="calendar_icon_id" class="calendar_icon"></div>');
                    sb.push('</div>');         
                    
                    sb.push('<div id="event_start_time">');
                    sb.push('<div class="agenda_label">' + "agenda.start_time" + ':</div>');
                    if (military_time) {
                        sb.push('<select name="startHour" id="start-hour">' + get24HourHelper() + '</select>');
                        sb.push('<select name="startMinute" id="start-minute">' + getMinuteHelper() + '</select>');
                    } else {
                        sb.push('<select name="startHour" id="start-hour">' + getHourHelper() + '</select>');
                        sb.push('<select name="startMinute" id="start-minute">' + getMinuteHelper() + '</select>');
                        sb.push('<select name="startAmPm" id="start-ampm">' + getAmPmHelper() + '</select>');
                    }
                    sb.push('</div>');

                    sb.push('</div>');
                    sb.push('</div>');

                    return sb.join('');
                };
                
                var getHourHelper = function() {
                    var sb = [];
                    var i = 1;
                    for (i = 1; i <= 12; i++) {
                        sb.push("<option value='" + i + "'>" + i + "</option>");
                    }
                    return sb.join('');
                };

                var get24HourHelper = function() {
                    var sb = [];
                    for (var i = 0; i < 24; i++) {
                        sb.push("<option value='" + i + "'>" + i + "</option>");
                    }
                    return sb.join('');
                };

                var getMinuteHelper = function() {
                    var sb = [];
                    sb.push("<option value='0'>00</option><option value='5'>05</option>");
                    var i = 10;
                    while (i <= 55) {
                        sb.push("<option value='" + i + "'>" + i + "</option>");
                        i += 5;
                    }
                    return sb.join("");
                };

                var getAmPmHelper = function() {
                    return "<option value='AM'>" + "time.am" + "</option><option value='PM'>" + "time.pm" + "</option>";
                };

                var _fieldValidator;
                
                function _startValidator (jcntr) {
                    var jokBtn = $('.okBtn', jcntr);
                    var jtime = $('#event_start_time', jcntr);
                    var jdate = $('#event_date_input', jcntr);

                    _fieldValidator = setInterval(function () {
                        if (!jdate.hasClass("blank")) {
                            var date = '';
                            date = $.trim(jdate.val());
                            
                            try {
                                date = lipstick.parseDate(
                                date_format_pattern,
                                date,
                                date_format_symbols);
                            } catch (err) {
                                return;
                            }
                            if (date) {
                                lipstick.enableOkButton(jokBtn, date.getTime() > 0);                                
                            }
                        }
                    }, 1000);
                }
                
                function _clearValidator (jcntr) {
                    if (_fieldValidator) {
                        clearInterval(_fieldValidator);
                        _fieldValidator = null;
                    }
                }

                
                var form = {
                    agenda: null,
                    
                    init: function(agenda){
                        this.agenda = agenda;
                    },
        
                    show : function(opts) {
                        _enterBusyState();
                        _disableItemMarker ();
                        
                        var h = _getFormHtml();
                        var content = $(h);
                     
                        var saveLabel, title;
                        
                        if (opts.startTime) {
                            saveLabel = "infrastructure.save";
                            title = "agenda.agenda_setup"; 
                       } else {
                            saveLabel = "infrastructure.add";
                            title = "agenda.agenda_setup";
                       }
                        var btns = [{css:'c22-dialog-close cancel', label:"infrastructure.cancel", isCancel:true}, 
                                   {css:'create', label:saveLabel, disabled:true}];
                       
                        
                        var jform = lipstick.basicForm(content, {
                            title: title ,
                            buttons : btns,
                            bodyClass: 'lipstick_dialog_content'
                            }
                        );
                       
                        lipstick.dialog(h, {
                            id: "agendaSetupDialog",
                            title: title,
                            okLabel: saveLabel,
                            onClose: this.onClose,
                            onShow: this.onShow,
                            okDisabled: true,
                            keepOpenOnOk: true
                        });

                    },

                    onClose : function() {                 
                        _clearValidator();                  
                        form.item = null;
                        _enableItemMarker ();
                        $.modal.close();
                        _exitBusyState();
                    },
        
                    onShow : function(dlg) {
                        var jcntr = dlg.container;
                        var form = this;
                        var setupForm = _initAgendaSetupForm(jcntr);
                        if (widgetP.startTime) {
                            var initTime = new Date(widgetP.startTime);
                            setupForm.setStartDate(initTime);
                            setupForm.setStartTime(initTime);
                        }
                        
                        var jokBtn = jcntr.find('.okBtn'); 
                        jokBtn.click( function(event) {
                            event.preventDefault();
                            var startTime = setupForm.readStartTimeInput();
                            var startDate = setupForm.getStartDate();
                            
                            if (!startDate || !startTime) {
                                return;
                            }      
                            
                            var combinedTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), startTime.getHours(), startTime.getMinutes());

                            _widget.startTime = combinedTime.getTime();
                            _widget.update_startTime(_widget.startTime);

                            lipstick.addWaitOverlay(_widget.container);
                            _widget.render ();
                            $.modal.close();
                        });
                        _startValidator(jcntr);
                    }
                };
                
                form.init(agenda);
                    
                return form;
            }
            
            var _getWidgetUser = function(comparisonFunction) { 
                var users = _widget.users;
                var owner = _widget.owner;
                var user = null;
                
                // first we try to find the owner, if there's already one
                if (owner) {
                    if (comparisonFunction(owner)) {
                        user = owner;
                    }
                }
                
                // if the owner has changed (or this is the first owner), try to 
                // map to one of the other users already cached by the widget
                if (user === null) {
                    var i, c;
                    for (i = 0, c = users.length; i < c; i++) {
                        var _user = users[i];
                        if (comparisonFunction(_user)) {
                            user = _user;
                            break;
                        }
                    }
                }
                
                return user;
            };

            var _getUserById = function(id) {
                if (id) {
                    return _getWidgetUser(function(_user) {
                       return (id === _user.id); 
                    });
                }
                return null;
            };
             
            function _getUserByEmail(email) {
                if (email && email.length > 0) {
                    email = email.toLowerCase();
                    return _getWidgetUser(function(_user) {
                        var _email = null;
                        if (_user.email) {
                            _email = _user.email.toLowerCase();
                        }
                        return (email === _email || (_user.name && email === (_user.name.toLowerCase() + ' <'+_email+'>')));
                    });
                }
                return null;
            }
            
            function _getUserFullEmail (itemOwner) {
                if (itemOwner) {
                    if (itemOwner.id) {
                        var user=_getUserById(itemOwner.id);
                        if (user) {
                            // if there's a name and email, create a joined string
                            if (user.name && user.email && user.email.length > 0) {
                                return [user.name, ' <', user.email, '>'].join('');
                            }
                            // otherwise, if the owner is a non-email user, display just the name
                            if (user.name) {
                                return user.name;
                            }
                            // finally, default to the e-mail address, but this should never happen
                            return user.email;
                        }
                    }
                    
                    // if the user isn't found in the cache, or if the user is an unregistered
                    // email address, display the e-mail address by default. The former case isn't
                    // likely, so this will really only be called for unregistered users.
                    return itemOwner.email || "<Cannot display owner information>";
                }
                    // if there's no owner, the owner e-mail field should be empty
                return "";
            }
            
            function _getItemIndexInnerHtml(i) {
                return _getItemDragHandle();
                //return ['<div><span>', i+1, '</span></div>'].join('');
            }

            function _getItemDragHandle () {
                return ['<div class="agenda-move-handle"><div class="mid"><div class="drag agenda-drag-icon"></div></div></div>'].join('');
            }
            
            function _getItemTimeHoverHtml() {
                return '<div class="arrow"></div>';
            }

            function _getItemOwnerInnerHtml (item) {
                debugger;
                if(!item.owner)
                    return;
                
                var userInfo = com.streamwork.getUserInfoById(item.owner);
                var name, profile_url, avatar;

                if(userInfo){
                    name = userInfo.name || DEF_OWNER;
                    profile_url = userInfo.profile_url; 
                    avatar = userInfo.avatar_url;
                 }
                 else{
                    name = item.owner ;
                    profile_url = "";
                    avatar = "/images/personShadow48x48.png";
                 }   

                var sb = [];
                
                sb.push('<img class="avatar" title="" src="');
                sb.push(avatar);
                sb.push('" alt=""/>');
                if(name.length>0){
                    sb.push('<span class="name"><a href="');
                    sb.push(profile_url);
                    sb.push('">');
                    sb.push(_.escape(name));
                    sb.push('</a></span>');  
                }
                return sb.join('');
            }
            
            function _getValidItemHtml(i, item) {
                var j;
                var sb=[];
                var minuteOffset = 0;
                sb.push('<tr class="agenda-row');
                if (i % 2) {
                    sb.push(' agenda-odd-row');
                }
                sb.push('" topic_id="');
                sb.push(item.id);
                sb.push('"><td class="cell col-1">');
                sb.push(_getItemIndexInnerHtml(i));
                sb.push('</td><td class="cell col-2"><div class="agenda-row-time">');
                if(widgetP.startTime) {
                    if(item.time) {
                        for(j = 0; j < i; j++) {
                            minuteOffset += widgetP.items[j].time || 0;
                        }
                        sb.push('<div class="start">');
                        var startTime = new Date(widgetP.startTime + minuteOffset * 60 * 1000);
                        sb.push(formatTime(startTime));
                        sb.push('</div><div class="to">' + "agenda.to" + '</div><div class="end">');
                        var endTime = new Date(startTime.getTime() + item.time * 60 * 1000);
                        sb.push(formatTime(endTime));
                        sb.push("</div>");
                    }
                 }
                else {
                    sb.push('<div class="value">');
                    if (item.time) {
                        sb.push(item.time);
                    }
                    sb.push('</div>');
                    if (item.time) {
                        sb.push('<div class="unit">' + "agenda.minutes" + '</div>');
                    }
                    else {
                        sb.push('<div class="unit"></div>');
                    }
                }
                sb.push('</div></td><td class="cell col-3"><div class="agenda-row-core"><p class="topic">');
                sb.push(item.topic ? item.topic.escapeHTML():'&nbsp;');
                sb.push('</p><p class="descen">');
                sb.push((item.desc && item.desc.length)?item.desc.escapeHTML().replace(/\r?\n/g, '<br />'):'&nbsp;');
                //sb.push('</p><p class="reference_tag">');
                sb.push('</p></div></td><td class="trash-col"><div class="agenda-trash"></div></td></td><td class="cell col-4"><div class="agenda-row-owner">');
                
                sb.push(_getItemOwnerInnerHtml(item));
                sb.push('</div></td></tr>');
                
                return sb.join('');
            }
            
            
            
            function _getVoidItemHtml(i) {
                
                var sb=[];
                sb.push('<tr class="agenda-row');
                if (i % 2) {
                    sb.push(' agenda-odd-row');
                }
                sb.push('"><td class="cell col-1">');
                sb.push(_getItemIndexInnerHtml(i));
                if (widgetP.read_only) {
                  sb.push('</td><td class="cell" style="border-left:0"></td><td class="cell col-3"></td><td class="cell trash-col"><td class="cell"></td></tr>');
                }
                else {
                  sb.push('</td><td class="cell agenda-clickadd" style="border-left:0pt none;"></td><td class="cell agenda-clickadd col-3">' + "agenda.click_add_new_agenda_topic" + '</td><td class="cell trash-col"><div class="agenda-trash"></div></td><td class="cell agenda-clickadd"></td></tr>');
                } 
                return sb.join('');
            }
            
            function _getItemHtml(i, item) {
                return (item && item.topic) ? _getValidItemHtml(i, item) : _getVoidItemHtml(i);
            }

            function _getItemMarkerHtml(i) {
                var sb=[];
                var y = 45+70*i;
                sb.push('<div class="agenda-item-marker"><div class="trash_icon" /></div>');
                sb.push('<div class="agenda-item-move-marker" style="top:>');
                sb.push(y);
                sb.push('px"></div>');
                return sb.join('');
            }
            
            function _bindStartTimeForm() {
                $('.setup_button', this.container).unbind('click');
                $('.setup_button', this.container).click(function (e) {
                        e.stopPropagation();
                        _widget.showStartTimeForm();
                });
            }    
            
            function _getHtml (wg) {
                var sb = [];
                if (widgetP.read_only) {
                  sb.push('<div class="agenda-canvas locked">');
                } else {
                  sb.push('<div class="agenda-canvas">');  
                }
                var startTime = 0;
                if(widgetP.init_data && widgetP.init_data.agenda) {
                    startTime = widgetP.init_data.agenda.startTime;
                }
                else{
                    startTime = widgetP.startTime;
                } 
                
                if (startTime === 0) { //Newly created agenda item
                    _bindStartTimeForm();
                    sb.push('<div class="agenda-intro">');
                    sb.push('<p class="agenda_setup_hint" style="font-size:13px">');
                    sb.push("agenda.agenda_setup_hint");
                    sb.push('</p>');
                    sb.push(sap.sw.ui.button.createHtml("agenda.setup_the_agenda", "setup_button green"));
                    sb.push('</div>');
                }
                else {
                    var c = wg.items.length, i=0, item;
                    var endTime = new Date(0);
                    var totalDuration = 0;
                    
                    i = 0;
                    while (i < c) {
                        item = wg.items[i];
                        if(item.time>0){
                            totalDuration += item.time;    
                        }
                        i++;
                    }
                    
                    if(totalDuration===0 || isNaN(totalDuration)){
                        endTime = 0;
                    }
                    else{
                        endTime.setMinutes(totalDuration);
                        var endTimeMili = endTime.getTime();
                        endTime = new Date(startTime+endTimeMili);
                    }
                    
                    if (startTime > 0) {
                        startTime = new Date(startTime);
                    
                        sb.push('<div class="agenda_info">');
                        sb.push(_getItemInfoHtml(startTime, endTime));
                        sb.push('</div>');
                        sb.push('<table class="agenda-table"');
                    } else {
                        sb.push('<table class="agenda-table"');
                    }
                    
                    sb.push('>');
                    sb.push('<tr class="agenda-header nodrop nodrag">');
                    sb.push('<th class="col-1 left"></th>');
                    sb.push('<th class="col-2"><span class="agenda-time">' + "agenda.duration" + '</span></th>');
                    sb.push('<th class="col-3"><span>' + "agenda.TOPIC" + '</span></th>');
                    sb.push('<th class="trash-col">&nbsp;</th>');
                    sb.push('<th class="col-4"><span>' + "agenda.presenter" + '</span></th>');
                    sb.push('</tr>');
                    
                    i = 0;
                    while (i < c) {
                        item = wg.items[i];
                        sb.push(_getItemHtml(i++, item));
                    }
                    
                    sb.push('</table>');
                    
                    sb.push('<div class="agenda-table-marker">');
                    i = 0;
                    while (i < c) {
                        sb.push(_getItemMarkerHtml(i++));
                    }
                    sb.push('</div>');
                    
                    if (!widgetP.read_only) {
                        sb.push('<div class="agenda-add" style="text-align:left;">' + sap.sw.ui.button.createHtml("agenda.add_new_agenda_topic", "add_option_btn") + '</div>');
                    }
                    sb.push('<div class="agenda-indicator" style="bottom:-6px"></div>');
                    
                    sb.push('</div>');
                }
                
                return sb.join('');
            }
            
            function _getItemInfoHtml(startTime, endTime){
                var sb=[];
                
                sb.push('<span class="agenda-info-when"><span class="bold">' + "agenda.date" + ':</span> '+ lipstick.formatDate(date_format_pattern, new Date(startTime), date_format_symbols) +'</span>');

                sb.push('<span class="agenda-info-divider">|</span>');

                var startTimeString = formatTime(new Date(startTime));
                var endTimeString = formatTime(new Date(endTime));
                
                if (endTime===0){
                    sb.push('<span class="agenda-info-duration"><span class="agenda-info-startTime">'+ startTimeString +'</span><span class="dash" style="display:none"> - </span><span class="agenda-info-endTime" style="display:none"></span></span>');
                } else {
                    sb.push('<span class="agenda-info-duration"><span class="agenda-info-startTime">'+ startTimeString +'</span><span class="dash"> - </span><span class="agenda-info-endTime">'+ endTimeString +'</span></span>');    
                }
                if (!read_only) {
                    sb.push("<a href='javascript:void(0);' class='agenda-edit-datetime' onclick='CSTAR.agenda.showEditStartTimeDialog(" + uuid + ");'>" + "infrastructure.edit" + "</a>");
                }
                return sb.join('');
            }

            function _findItemMarkerPos(jIM) {
                return $('.agenda-item-marker .trash_icon', _widget.container).index(jIM);
            }

            function _findItemPos(jI) {
                return $('.agenda-row', _widget.container).index(jI);
            }

            function _findItemPosById (items, id) {
                if (items === null || id === null) {
                    return -1;
                }
                
                var c = items.length;
                var i;
                for(i=0;i<c;i++) {
                    if(items[i].id===id) {
                        return i;
                    }
                }

                return -1;
            }
            
            function _makeItem(owner) {
                var o = {
                        id:null,
                        topic:null,
                        desc:null,
                        time:15,
                        owner:owner
                };
                
                return o;
            }

            function _equalStrings(s1, s2) {
                if (s1) {
                    if(s2) {
                        return (s1===s2);
                    } 
                    return (s1.length===0);
                } 
                return !(s2 && s2.length>0);
            }

            function _equalOwners(owner1, owner2) {
                if (owner1) {
                    if (owner2) {
                        return (_equalStrings(owner1.id, owner2.id) && 
                                _equalStrings(owner1.email, owner2.email));
                    }
                    return false;
                } 
                return (!owner2);
            }
            
            function _equalItems(item1, item2) {
                if (item1) {
                    if (item2) {
                        return _equalStrings(item1.id, item2.id) &&
                            _equalStrings(item1.topic, item2.topic) &&
                            _equalStrings(item1.desc, item2.desc) &&
                            item1.time === item2.time &&
                            _equalOwners(item1.owner, item2.owner);
                    }
                    return false;
                } 
                return (!item2);
            }
            
            function _getNextItemId () {
                var nid = ((_widget && _widget.rid) ? _widget.rid : '') + _nid;
                _nid++;
                return nid;
            }
            
            function _itemClickHandler (pos) {
                if(_hasNotice()) {
                    _widget.hideEditors();
                }
                else {
                    _widget.showItemEditForm({item:_widget.items[pos]});
                }
            }
            
            function _onMoveRow (jrow) {
                var items=[];
                $('.agenda-table .agenda-row', _widget.container).each (function(i) {
                    items.push($(this).data('item'));
                });
                
                var p = _findItemPos(jrow);
                var item = items[p];
                
                var cp = _findItemPosById(_widget.items, item.id);
                if (cp !== p) {
                    _widget.setItems(items);
                    _widget.render();
                    _widget.pbe.move_item(item.id, p);
                }
            }
            
            function _moveItem(cp, np) {
                if (cp === np) {
                    return;
                }
                
                var items = _widget.items;
                var len=items.length;
                
                if (cp < 0 || cp >= len || np < 0 || np >= len) {
                    return;
                }
                
                _disableItemMarker();
                
                var jrows = $('.agenda-row', _widget.container);
                
                var jrow = jrows.eq(cp);
                var target = jrows.eq(np).get(0);
                var row = jrow.get(0);
                if (cp < np) {
                    row.parentNode.insertBefore(row, target.nextSibling);
                }
                else {
                    row.parentNode.insertBefore(row, target);
                }
                
                _enableItemMarker();
                
                _onMoveRow (jrow);
            }
            
            function _bindItemMoveHandle(jIMH, pos) {
                var jmid = $('.mid', jIMH);
                var jdrag = $('.drag', jmid);
                jmid.unbind('mouseenter.agenda')
                    .unbind('mouseleave.agenda')
                    .bind('mouseenter.agenda',
                        function() {
                            jdrag.addClass('drag-hint'); 
                        })
                    .bind('mouseleave.agenda',
                        function() {
                            jdrag.removeClass('drag-hint'); 
                        });         
            }
            
            function _unbindItemMoveHandle(jIMH) {
                jIMH.unbind('mouseenter.agenda').unbind('mouseleave.agenda');
            }
            
            function _bindItemTime (jIT, pos) {
                jIT.unbind().click(function(e){
                    e.stopPropagation();
                    _itemClickHandler(pos);
                });
            }

            function _unbindItemTime (jIT) {
                jIT.unbind();
            }

            function _bindItemRow (jI) {
                jI.unbind().hover(
                        function () {
                            if (_isItemMarkerDisabled()) {
                                return;
                            }
                            var p = _findItemPos($(this));
                            $('.agenda-item-marker .trash_icon', _widget.container).eq(p).show();
                        },
                        function () {
                            var p = _findItemPos($(this));
                            $('.agenda-item-marker .trash_icon', _widget.container).eq(p).hide();
                        });
            }
            
            function _bindItemOwner (jio, pos) {
                _unbindItemOwner(jio);

                jio.click(function (e) {
                    e.stopPropagation();
                    _itemClickHandler(pos);
                });
            }

            function _unbindItemOwner (jio) {
                jio.unbind();
            }
            
            function _bindItemTopic (jitp, pos, isTopic) {
                jitp.unbind().hover (
                        function() {
                            jitp.addClass('cstar_editable');
                        }, 
                        function() {
                            jitp.removeClass('cstar_editable');
                        }).click (function (e) {
                            if (_hasNotice()) {
                                _widget.hideEditors();
                            }
                            else {
                                _widget.showItemTopicEditor(jitp, pos, isTopic);
                            }
                        });
            }
            
            function _unbindItemTopic(jitp) {
                jitp.unbind();
            }
            
            function _bindItemCoreText(jict, pos) {
                jict.unbind().click (function (e) {
                    _itemClickHandler(pos);
                });
            }
            
            function _bindItem (pos, jI, jIM) {
                jI.data('item', _widget.items[pos]);
                
                _bindItemRow(jI);
                _bindItemMoveHandle(jI.find('.agenda-move-handle'), pos);
                _bindItemTime (jI.find('.agenda-row-time'), pos);
                _bindItemCoreText(jI.find('.agenda-row-core'), pos);
                
                jI.find('.agenda-clickadd').unbind().click(function (e) {
                        e.stopPropagation();
                        _widget.showItemEditForm({item:$(this).parents('.agenda-row').eq(0).data('item')});
                    });
                
                jIM.unbind().hover(
                        function () {
                            $(this).find('.trash_icon').show();
                        },
                        function () {
                            $(this).find('.trash_icon').hide();
                        });
                
                jI.find('.agenda-trash').unbind().click (
                        function(e) {
                          var p = $('.agenda-trash', _widget.container).index($(this));

                          if (_widget.items.length > 1) {

                            var message = "trash.confirmation.body";

                            jamApp.ui.confirm(message,
                              function () {
                                _removeItem(e, p);
                              },
                              {
                                title: 'trash.confirmation.title',
                                okLabel: 'infrastructure.delete'
                              });
                          }
                          else {
                            _removeItem(e, p);
                          }
                        });
            }

          function _removeItem(event, p) {
            event.stopPropagation();
            _enterBusyState();
            _widget.removeItem(p);
            _exitBusyState();
          }

            function _disableItemMarker () {
                _widget.itemMarkerDisabled = true;
                var jIMs=$('.agenda-item-marker', _widget.container);
                jIMs.find('.trash_icon').hide();
                jIMs.hide();
            }
            
            function _enableItemMarker () {
                _widget.itemMarkerDisabled = false;
                $('.agenda-item-marker', _widget.container).show(); 
            }
            
            function _isItemMarkerDisabled() {
                return _widget.itemMarkerDisabled;
            }
/*
            function _hideEditors () {
                _widget.hideEditors();
            }
*/
            function _beforeShowTimeEditor (jit, pos) {
                //_hideEditors ();
                _unbindItemTime(jit);
                jit.find('.arrow').remove();
                jit.find('.value').removeClass('cstar_editable').hide();
                jit.find('.unit').hide();
                $('.agenda-item-marker .trash_icon', _widget.container).hide();
            }
            
            function _afterHideTimeEditor (jit, pos) {
                jit.find('.value').show();
                jit.find('.unit').show();
                _bindItemTime(jit, pos);
            }
            
            function _beforeShowOwnerEditor (jio, pos) {
                //_hideEditors ();
                jio.find('.avatar').hide();
                jio.find('.name').hide().removeClass('cstar_editable');
                $('.agenda-item-marker .trash_icon', _widget.container).hide();
                
                _unbindItemOwner(jio);
            }
            
            function _afterHideOwnerEditor (jio, pos) {
                _bindItemOwner(jio,pos);
                
                jio.find('.avatar').show();
                jio.find('.name').show();
            }

            function _beforeShowTopicEditor(jitp, pos) {
                //_hideEditors ();
                _unbindItemTopic(jitp);
                jitp.removeClass('cstar_editable');
                $('.agenda-item-marker .trash_icon', _widget.container).hide();
            }
        
            function _afterHideTopicEditor(jitp, pos, isTopic) {
                _bindItemTopic(jitp, pos, isTopic);
            }
            
            function _startLoading() {
                if (!_widget.pbe) {
                    return;
                }
                debugger;
                setTimeout(function() {
                    if (_widget.init_data) {
                        _widget.notifyUpdate(_widget.init_data);
                        _widget.init_data = null;
                    } else {
                        _widget.fetch();
                        
                        setTimeout(function() {
                            if (!_loaded) {
                                _widget.fetch();
                            }
                        }, 20000);
                    }
                }, 1000);
            }
            
            function _endLoading () {
                _loaded = true;
            }
            
            
            function _hasNotice () {
                return (_noticeQueue.length > 0);
            }
            
            function _enterBusyState () {
                _bc++;
                _widget.hideEditors();
            }
    
            function _exitBusyState() {
                _bc--;
                
                if (_bc <= 0) {
                    _bc = 0;
                    if (_noticeQueue.length > 0) {
                        // [TODO] need to merge content
                        while (_noticeQueue.length > 0) {
                            _dispatchNotice(
                                    _noticeQueue.splice(0, 1)[0]);
                        }
                    }
                }
            }
            
            function _queueNotice(msg) {
                if (_bc > 0) {
                    if (msg.kind === MK_UPDATE) {
                        _noticeQueue.length = 0;
                    }
                    _noticeQueue.push(msg);
                    _widget.showIndicator("agenda.another_user_updated_contents");
                } else {
                    //if (this.pending_data.length > 0) alert('Data out of sync. please refresh now.');
                    _dispatchNotice(msg);
                }
            }

            var MK_UPDATE=1,
                MK_ITEM_TIME=2,
                MK_ITEM_OWNER=3,
                MK_ITEM_TOPIC=4,
                MK_ITEM_DESC=5,
                MK_ITEM=6,
                MK_REMOVE_ITEM=7,
                MK_MOVE_ITEM=8;
            
            function _dispatchNotice(msg) {
                _widget.hideIndicator();
                
                var k=msg.kind;
                var d=msg.data;
                switch (k) {
                case MK_UPDATE:
                    _doUpdate(d);
                    break;
                case MK_ITEM_TIME:
                    _doUpdateItemTime(d);
                    break;
                case MK_ITEM_OWNER:
                    _doUpdateItemOwner(d);
                    break;
                case MK_ITEM_TOPIC:
                    _doUpdateItemTopic(d);
                    break;
                case MK_ITEM_DESC:
                    _doUpdateItemDesc(d);
                    break;
                case MK_ITEM:
                    _doUpdateItem(d);
                    break;
                case MK_REMOVE_ITEM:
                    _doRemoveItem(d);
                    break;
                    
                case MK_MOVE_ITEM:
                    _doMoveItem(d);
                    break;
                }
            }
            
            function _doUpdate (data) {
                if (data) {
                    var o=_widget;
                    o.setItems(data.agenda.items);
                    o.setUsers(data.users);
                    o.setOwner(data.owner);
                    o.setStartTime(data.agenda.startTime);
                    o.render ();
                }
            }

            function _doUpdateItem (data, chk) {
                if (data) {
                    var item=data.item;
                    var id=item.id;
                    var o=_widget;
                    var users=data.users;
                    
                    var p=_findItemPosById(o.items, id);
                    if (p >= 0) {
                        if (!_equalItems(item, o.items[p])) {
                            if (!chk) {
                                o.items[p]=item;
                                o.addUsers(users);
                                o.redrawItem(p, item);
                            }
                            return true;
                        }
                    } else {
                        if (!chk) {
                            p = o.items.push(item)-1;
                            o.addUsers(users);
                            o.redrawItem(p, item, true);
                        }
                        return true;
                    }
                }
                
                return false;
            }
            
            function _verifyItem(data) {
                return _doUpdateItem(data, true);
            }
            
            function _doUpdateItemTime (data, chk) {
                if (data) {
                    var id=data.id;
                    var t=data.time;
                    var o=_widget;
                    
                    var p=_findItemPosById(o.items, id);
                    if (p >= 0) {
                        var item=o.items[p];
                        if (item.time !== t) {
                            if (!chk) {
                                item.time = t;
                                o.redrawItemTime(p, t);
                            }
                            return true;
                        }
                    }
                }
                
                return false;
            }
            
            function _verifyItemTime(data) {
                return _doUpdateItemTime(data, true);
            }

            function _doUpdateItemOwner (data, chk) {
                if (data) {
                    var id=data.id;
                    var owner=data.owner;
                    var users=data.users;
                    
                    var o=_widget;
                    
                    var p=_findItemPosById(o.items, id);
                    if (p >= 0) {
                        var item=o.items[p];
                        if (item.owner !== owner) {
                            if (!chk) {
                                item.owner = owner;
                                o.addUsers(users);
                                o.redrawItemOwner(p, item);
                            }
                            return true;
                        }
                    }
                }
                
                return false;
            }
            
            function _verifyItemOwner(data) {
                return _doUpdateItemOwner(data, true);
            }

            function _doUpdateItemTopic (data, chk) {
                if (data) {
                    var id=data.id;
                    var topic=data.topic;
                    
                    var o=_widget;
                    
                    var p=_findItemPosById(o.items, id);
                    if (p >= 0) {
                        var item=o.items[p];
                        if (topic !== item.topic) {
                            if (!chk) {
                                item.topic = topic;
                                o.redrawItemTopic(p, topic);
                            }
                            
                            return true;
                        }
                    }
                }
                
                return false;
            }
            
            function _verifyItemTopic(data) {
                return _doUpdateItemTopic(data, true);
            }

            function _doUpdateItemDesc (data, chk) {
                if (data) {
                    var id=data.id;
                    var desc=data.desc;
                    
                    var o=_widget;
                    
                    var p=_findItemPosById(o.items, id);
                    if (p >= 0) {
                        var item=o.items[p];
                        if (desc !== item.desc) {
                            if (!chk) {
                                item.desc = desc;
                                o.redrawItemDesc(p, desc);
                            }
                            
                            return true;
                        }
                    }
                }
                
                return false;
            }
            
            function _verifyItemDesc(data) {
                return _doUpdateItemDesc(data, true);
            }

            function _doRemoveItem (data, chk) {
                if (data) {
                    var id=data.id;
                    var o=_widget;
                    
                    var p=_findItemPosById(o.items, id);
                    if (p >= 0) {
                        if (!chk) {
                            o.items.splice(p, 1);
                            o.render();
                        }
                        
                        return true;
                    }
                }
                
                return false;
            }
            
            function _verifyRemoveItem(data) {
                return _doRemoveItem(data, true);
            }

            function _doMoveItem (data, chk) {
                if (data) {
                    var id=data.id;
                    var np = data.pos;
                    var o=_widget;
                    var items=o.items;
                    
                    var p=_findItemPosById(items, id);
                    if (p >= 0 && np !== null) {
                        if (p !== np) {
                            if (!chk) {
                                if (np > items.length - 1) {
                                    o.fetch();
                                } else {
                                    var item = items[p];
                                    items.splice(p, 1);
                                    items.splice(np, 0, item);
                                    o.render();
                                }
                            }
                            
                            return true;
                        }
                    }
                }
                
                return false;
            }
            
            function _verifyMoveItem(data) {
                return _doMoveItem(data, true);
            }
            
            /*function place_reference_container(currentItemId, agenda){
                var referencesContainer = _widget.referenceManager.create_reference_container();
                var itemDom = $('#'+agenda_id).find('.agenda-row[topic_id="'+currentItemId+'"]');
                referencesContainer.bind(CSTAR.references.CONTENTS_CHANGED, function() {
                    if(itemDom.find('.reference_inline_container').css('display') === 'block' ){
                        itemDom.find('.reference_tag').text('References:');
                    }
                    else{
                        itemDom.find('.reference_tag').text('');
                    }
                    agenda.adjustHeight();
                });
                
                return referencesContainer;
            }*/
            
            var widgetP;
            widgetP = {
        
                /**
                 * Will be set by PBE handler when it is started
                 */
                pbe :null,
        
                // html contailer (dom)
                container :null,
                
                // items
                items:[],
                
                // user map
                users:[],
                
                owner:null,

                // functions
                render : function() {
                    var htmlContent =  _getHtml(this);  
                    this.container.html(htmlContent);
                    this.container.show();
                    this.adjustHeight();
                    this.updateEndTime();
                    if (!widgetP.read_only) {
                      this.bindItems();
                      this.bindService(this.container);
                    } 
                },

                fetch : function() {
                    this.pbe.sendJoin();
                },
                
                adjustReferenceDiv : function() {
                    agenda = this;
                    agenda_id = this.id;
                    $.each(this.items, function(index, item){
                        var itemDom = $('#'+agenda_id).find('.agenda-row[topic_id="'+item.id+'"]');
                        if(!(itemDom.find('.reference_inline_container').length)){
                            var referencesContainer = place_reference_container(item.id, agenda);
                            itemDom.find('.col-3').append(referencesContainer);
                            _widget.referenceManager.register_container_for_updates(referencesContainer, item.id.toString());
                        }
                        if(itemDom.find('.reference_inline_container').css('display') === 'block' ){
                            itemDom.find('.col-3 .reference_tag').text('References:');
                        }
                        else{
                            itemDom.find('.reference_tag').text('');
                        }
                    });
                },
                
                adjustHeight : function() {

                    var startTime = false;
                    if(this.init_data && this.init_data.agenda.startTime && this.init_data.agenda.startDate){startTime = true;}
                    if(this.startDate && this.startTime){startTime = true;}
                    
                    
                    if (this.container.height() === 0) {
                        //Can't calculate height while the item is not visible
                        this.needToAdjustHeight = true;
                        return;
                    }
                    this.needToAdjustHeight = false;
                    
                    var h = 29; //Use 47 when there is startTime
                    var yItemOff = 27; //Use 45 when there is startTime
                    if(startTime){h=47;yItemOff=45;}
                    var jcntr=this.container;

                    var jIMHs = $('.agenda-move-handle', jcntr);
                    jIMHs.height(55);

                    var jIs=$('.agenda-row', jcntr);
                    var jIMs=$('.agenda-item-marker', jcntr);
                    var jIMMs=$('.agenda-item-move-marker', jcntr);
                    var i;
                    for (i=0, c=jIs.length; i<c;i++) {
                        var ih=jIs.eq(i).height();
                        
                        var jIMH = jIMHs.eq(i);
                        jIMH.height(ih);
                        var jmid=$('.mid', jIMH);
                        jmid.height(ih-14);
                        
                        var jdrag = $('.drag', jmid);
                         var dragH = Math.max(32, Math.floor((ih-14)/4));
                        jdrag.height(dragH).css('top', (ih-6-dragH)/2);
                        
                        var jIM=jIMs.eq(i);
                        jIM.height(ih).css('top', yItemOff);
                        
                        var jIMM=jIMMs.eq(i);
                        jIMM.height(ih).css('top', yItemOff);
                        
                        h+=ih;
                        yItemOff += ih;
                    }
                    
                    
                    var jfld=$('.agenda-add', jcntr);
                    if (!this.hasBlankItem()) {
                        h+=40;
                        jfld.show();
                    } else {
                        jfld.hide();
                    }
                    
                    if (this.hasIndicator() && this.hasBlankItem()) {
                        h += 40;
                    }
                    
                    if (h < MIN_H) {
                        h = MIN_H;
                    }
                    //$('.agenda-canvas', jcntr).css('height', h);
                },

                reindexItems : function (sp) {
                    if (sp === null) {
                        sp = 0;
                    }
                    
                    $('.agenda-row', this.container).each(function(i) {
                        if (i % 2) {
                            $(this).addClass('agenda-odd-row');
                        }
                        else {
                            $(this).removeClass('agenda-odd-row');
                        }
                    });
                },
                
                updateEndTime : function() {
                    var tm=0;
                    var items=this.items;
                    var startTime=this.startTime;
                    var i;
                    for(i=0,c=items.length;i<c;i++) {
                        var item=items[i];
                        tm += item.time || 0;
                    }
                    
                    var endTimeMili = new Date(0);
                    endTimeMili.setMinutes(tm);
                    
                    tm = startTime + endTimeMili.getTime();
                    
                    var endTime = new Date(tm);
                    
                    var sb=[];
                    sb.push(formatTime(endTime));
                    
                    $('.agenda-info-endTime', this.container).text(sb.join(''));
                },

                updateTableDnD: function () {
                    $('.agenda-table', this.container).tableDnDUpdate();
                },
                
                bindItems : function() {
                    var jIs = $('.agenda-row', this.container);
                    var jIHs = $('.agenda-item-marker', this.container);

                    var c = jIs.size();
                    var i;
                    for (i=0; i<c;i++) {
                        _bindItem(i, jIs.eq(i), jIHs.eq(i));
                    }
                },
                
                bindItem : function (pos) {
                    _bindItem(pos, 
                            $('.agenda-row', this.container).eq(pos),
                            $('.agenda-item-marker', this.container).eq(pos));
                },
                
                bindService : function (container) {

                    $('.setup_button', container).click(function(e) {
                        _widget.showStartTimeForm();
                    });
                    
                    $('.agenda-add', container).click(function (e) {
                        e.stopPropagation();
                        _widget.showItemEditForm();
                    });
                    
                    $('.agenda-table', this.container).tableDnD({
                        dragHandle: 'col-1',
                        onDragClass: 'agenda-item-dragging',
                        onDragStart: function (table, row) {
                            _enterBusyState();
                            _disableItemMarker();
                            $('.agenda-item-move-marker', this.container).show();
                        },
                        onDrop: function (table, row) {
                            _enableItemMarker();
                           $('.agenda-item-move-marker', this.container).hide();
                            _onMoveRow ($(row));
                            _exitBusyState();
                        }
                    });
                },
                
                on_started : function() {
                    _startLoading ();
                },
                
                notifyUpdate : function (data) {
                    _queueNotice({kind:MK_UPDATE, data: data});
                    
                    if (!_loaded) {
                        _endLoading();
                    }
                },
                
                notifyItemTime : function(data) {
                    if(_loaded && _verifyItemTime(data)) {
                        _queueNotice({kind:MK_ITEM_TIME, data: data});
                    }
                },
                
                notifyItemOwner : function(data) {
                    if(_loaded && _verifyItemOwner(data)) {
                        _queueNotice({kind:MK_ITEM_OWNER, data: data});
                    }
                },
                
                notifyItemTopic : function(data) {
                    if(_loaded && _verifyItemTopic(data)) {
                        _queueNotice({kind:MK_ITEM_TOPIC, data: data});
                    }
                },

                notifyItemDesc : function(data) {
                    if(_loaded && _verifyItemDesc(data)) {
                        _queueNotice({kind:MK_ITEM_DESC, data: data});
                    }
                },

                notifyItem : function(data) {
                    if(_loaded && _verifyItem(data)) {
                        _queueNotice({kind:MK_ITEM, data: data});
                    }
                },
                
                notifyRemoveItem : function(data) {
                    if(_loaded && _verifyRemoveItem(data)) {
                        _queueNotice({kind:MK_REMOVE_ITEM, data: data});
                    }
                },

                notifyMoveItem : function(data) {
                    if(_loaded && _verifyMoveItem(data)) {
                        _queueNotice({kind:MK_MOVE_ITEM, data: data});
                    }
                },
                
                init : function() {
                    if (_inited) {
                        return;
                    }

                    this.read_only = options.read_only;
                    
                    this.rid = streamwork.generateUniqueId();
                    if (!this.container) {
                        this.container = $('#agenda_' + this.id);
                    }
                    var controller = CSTAR.agenda.makePBEHandler(this); 
                    var objectType = "CstarAgendaAgent" ;
                    var handler = streamwork.module("com.streamwork.pbe").createMessageHandler("CstarAgenda", this.id , controller);
                    $.extend(controller, handler);  // add clientChannel to controller
                    //this.pbe = CSTAR.agenda.makePBEHandler(this);
                    this.buildItemEditForm();
                    this.buildStartTimeForm();
                    this.buildItemTimeDropdown();
                    this.buildItemTimeEditor();
                    this.buildItemOwnerEditor();
                    this.buildItemTopicEditor();
                    this.render ();
                    
                    if(this.init_data) {
                        this.showIndicator("common.loading");
                    }
                    
                    _inited = true;
                    
                    var that = this;
                    this.container.closest(".item_class").bind("selected", function() {
                        if (that.needToAdjustHeight) {
                            that.adjustHeight();
                        }
                    });
                    $("#activityItems").bind("viewChanged", function(e, viewType) {
                        if (viewType === "listView") {
                            if (that.needToAdjustHeight) {
                                that.adjustHeight();
                            }
                        }
                    });
                },

                setItems : function (items) {
                    if (items === null) {
                        items = [];
                    }
                    this.items = items;
                },
                
                setUsers : function(users) {
                    if (users === null) {
                        users = [];
                    }
                    this.users = users;
                },
                
                setOwner : function(owner) {
                    this.owner = owner;
                },

                setStartTime : function(startTime) {
                    this.startTime = startTime;
                },

                findUserById : function(uid) {
                    if (uid) {
                        var c=this.users.length;
                        var i;
                        for (i=0; i<c; i++) {
                            var _user=this.users[i];
                            if (_user.id === uid) {
                                return i;
                            }
                        }
                    }
                    
                    return -1;
                },
                
                addUsers : function(users) {
                    if (users) {
                        var c=users.length;
                        var i;
                        for (i=0; i<c; i++) {
                            var u=users[i];
                            if (this.findUserById(u.id) === -1) {
                                this.users.push(u);
                            }
                        }
                    }
                },
                
                redrawItem : function(pos, item, append) {
                    if (pos >= 0) {
                        if (append) {
                            $('.agenda-table', this.container).eq(0).append(_getItemHtml(pos, item));
                            $('.agenda-table-marker', this.container).eq(0).append(_getItemMarkerHtml(pos));

                        } else {
                           /* var referenceContainer= $('.agenda-row', this.container).find('.reference_inline_container');
                            _widget.referenceManager.unregister_container_for_updates(referenceContainer);
                            $('.agenda-row', this.container).eq(pos).replaceWith(_getItemHtml(pos, item));*/
                        }
                        this.bindItem(pos);
                    }
                    
                   // this.adjustReferenceDiv();
                    this.adjustHeight();
                    this.updateEndTime();
                    this.updateTableDnD();
                    
                    if($(".dash").is(":hidden") || $(".agenda-info-endTime").is(":hidden")){
                        $(".dash").show();
                        $(".agenda-info-endTime").show();
                    }  
                },
                
                appendItem : function(item) {
                    if (!item || !item.id) {
                        return;
                    }
                    var p = this.items.push(item)-1;
                    
                    this.redrawItem(p, item, true);
                    this.pbe.append_item(item);
                },

                update_startTime : function(startTime) {
                    $(".agenda-info-startTime").val(startTime);
                    this.pbe.update_start_time(startTime);
                },
                
                updateItem : function(item) {
                    var c = this.items.length;
                    var p = -1;
                    var i;
                    for(i=0;i<c;i++) {
                        if(this.items[i]===item) {
                            p=i;
                            break;
                        }
                    }

                    this.render();
                    this.pbe.update_item(item);
                },
                
                redrawItemTime : function(pos, time) {
                    var jit = this.container.find('.agenda-row').eq(pos).find('.agenda-row-time');
                    var itemStart='', itemEnd='';
                    if (time) {
                        itemStart += time;
                        itemEnd = (time===1) ? 'minute' : 'minutes';
                    }
                    
                    jit.find('.value').text(itemStart);
                    jit.find('.unit').text(itemEnd);
                    
                    this.updateEndTime();
                },
                
                changeItemTime : function(item, time) {
                    if (item.time === time) {
                        return;
                    }
                    
                    var c = this.items.length;
                    var p = -1;
                    var i;
                    for(i=0;i<c;i++) {
                        if(this.items[i].id===item.id) {
                            p=i;
                            break;
                        }
                    }
                    
                    item.time = time;
                                        
                    this.redrawItemTime(p, time);
                    
                    this.pbe.update_item_time(item);
                    
                },

                redrawItemOwner : function(pos, item) {
                    var jio = this.container.find('.agenda-row').eq(pos).find('.agenda-row-owner');
                    jio.html(_getItemOwnerInnerHtml(item));
                    _bindItemOwner(jio, pos);
                },
                
                changeItemEmail : function(item, email) {
                    var newOwner;
                    if (email && email.length > 0) {
                        var user=_getUserByEmail(email);
                        var id=null;
                        if (user) {
                            id=user.id;
                            email='';
                        }
                        
                        newOwner={id:id, email:email};
                    } else {
                        newOwner=null;
                    }
                    
                    if ((!item.owner && !newOwner) ||
                    (newOwner && item.owner && item.owner.id === newOwner.id &&
                    item.owner.email === newOwner.email)) {
                        return;
                    }
                    
                    
                    var c = this.items.length;
                    var p = -1;
                    var i;
                    for(i=0;i<c;i++) {
                        if(this.items[i].id===item.id) {
                            p=i;
                            break;
                        }
                    }
                    
                    item.owner = newOwner;
                    
                    this.redrawItemOwner(p, item);
                    this.pbe.update_item_owner(item);
                },

                redrawItemTopic : function(pos, topic) {
                    var jitp=this.container.find('.agenda-row').eq(pos).find('.agenda-row-core .topic');
                    jitp.text(topic);
                    
                    this.adjustHeight();
                },
                
                changeItemTopic : function(item, topic) {
                    if (!topic) {
                        return;
                    }
                    topic = $.trim(topic);
                    
                    if (topic.length === 0 ||
                    (topic && item.topic && item.topic === topic)) {
                        return;
                    }
                    
                    var c = this.items.length;
                    var p = -1;
                    var i;
                    for(i=0;i<c;i++) {
                        if(this.items[i].id===item.id) {
                            p=i;
                            break;
                        }
                    }
                    
                    item.topic = topic;
                    
                    this.redrawItemTopic(p, topic);
                   
                    this.pbe.update_item_topic(item);
                },

                redrawItemDesc : function(pos, desc) {
                    var jitd=this.container.find('.agenda-row').eq(pos).find('.agenda-row-core .descen');
                    jitd.text((desc && desc.length) ? desc:'\u00A0');
                    this.adjustHeight();
                },
                
                changeItemDesc : function(item, desc) {
                    desc = $.trim(desc);
                    
                    if ((!desc && !item.desc) ||
                    (desc && item.desc && item.desc === desc)) {
                        return;
                    }
                    
                    var c = this.items.length;
                    var p = -1;
                    var i;
                    for(i=0;i<c;i++) {
                        if(this.items[i].id===item.id) {
                            p=i;
                            break;
                        }
                    }
                    
                    item.desc = desc;
                    
                    this.redrawItemDesc(p, desc);
                    this.pbe.update_item_desc(item);
                },
                
                redrawOnRemoveItem : function (pos) {
                    $('.agenda-row', this.container).eq(pos).remove();
                    $('.agenda-item-marker:last', this.container).eq(0).remove();
                    
                    this.reindexItems(pos);
                    this.adjustHeight();
                    this.bindItems();
                    this.updateEndTime();
                    this.updateTableDnD();
                },
                
                removeItem : function(pos) {
                    if (pos < 0 || pos > this.items.length ||
                    this.items[pos].id === null) {
                        return;
                    }
                    
                    if(pos === 0 && this.items.length === 1){
                        lipstick.alert("agenda.cannot_delete_agenda");
                        return;
                    }
                    
                    var id=this.items[pos].id;
                    this.items.splice(pos, 1);
                    this.render();
                    
                    this.pbe.remove_item(id);
                },
                
                buildItemEditForm : function() {
                    this.itemEditForm = _makeItemEditForm(this);
                },
                
                buildStartTimeForm : function() {
                    this.startTimeForm = _makeAgendaSetupForm();
                },

                buildItemTimeDropdown : function () {
                    //this.itemTimeDropdown = _makeItemTimeDropdown(this);
                },
                
                buildItemTimeEditor : function () {
                    //this.itemTimeEditor = _makeItemTimeEditor(this);
                },
                
                buildItemOwnerEditor : function () {
                    //this.itemOwnerEditor = _makeItemOwnerEditor(this);
                },
                
                buildItemTopicEditor : function () {
                    //this.itemTopicEditor = _makeItemTopicEditor(this);
                },
                
                showItemEditForm : function (opt) {
                    //this.hideEditors();
                    this.itemEditForm.show(opt);
                },
                
                showStartTimeForm : function () {
                    this.startTimeForm.show({startTime: this.startTime});
                },
                
                showItemTimeDropdown : function (jtime, item){
                    // this.hideEditors();
                    //this.itemTimeDropdown.show(jtime, item);
                },

                hideItemTimeDropdown : function (){
                    //this.itemTimeDropdown.hide();
                },

                showItemTimeEditor : function (jit, pos) {
                    //this.itemTimeEditor.show(jit, pos);
                },
                
                hideItemTimeEditor : function () {
                    //this.itemTimeEditor.hide();
                },

                showItemOwnerEditor : function (jio, pos) {
                    //this.itemOwnerEditor.show(jio, pos);
                },
                
                hideItemOwnerEditor : function () {
                    //this.itemOwnerEditor.hide();
                },
                
                showItemTopicEditor : function (jitp, pos, isTopic) {
                    //this.itemTopicEditor.show(jitp, pos, isTopic);
                },
                
                hideItemTopicEditor : function () {
                    //this.itemTopicEditor.hide();
                },
                
                hideEditors : function () {
                    var o = this;
                    o.hideItemTimeEditor();
                    o.hideItemOwnerEditor();
                    o.hideItemTimeDropdown();
                    o.hideItemTopicEditor();
                },
                
                hasBlankItem : function() {
                    var c=this.items.length;
                    var i;
                    for(i=0; i<c; i++) {
                        if (!this.items[i].topic) {
                            return true;
                        }
                    }
                    
                    return false;
                },
                
                hasIndicator : function () {
                    return this.indicator? true:false; 
                },
                
                showIndicator : function(s) {
                    this.indicator = true;
                    this.adjustHeight();
                    $('.agenda-indicator', this.container).html('<img class="stub_spinner" style="vertical-align:middle" src="/images/3-Dots-small.gif">'+ s);
                    $('.agenda-indicator', this.container).show();
                },
                
                hideIndicator : function () {
                    this.indicator = false;
                    this.adjustHeight();
                    $('.agenda-indicator', this.container).hide();
                }
            };
        
            // jQuery.extend creates a new object combining our
            // prototype and the options
            
            _widget=$.extend(widgetP, options);
            _widget.init();
            widgetRegistry[options.uuid] = _widget;
            
            return _widget;
        },

        makePBEHandler : function(widget) {
            var _pbe = {
                // PBE message receiver methods
                // ____________________________________________________________________________
                started : function() {
                    widget.pbe = this;
                    widget.on_started();
                },
        
                widget :widget,
        
                requestCount :0,
        
                /**
                 * Receives the updated state of the widget
                 * 
                 * @param data
                 */
                notify_update : function(data) {
                    widget.notifyUpdate(data);
                },

                notify_item_time : function(data) {
                    widget.notifyItemTime(data);
                },

                notify_item_owner : function(data) {
                    widget.notifyItemOwner(data);
                },
                
                notify_item_topic : function(data) {
                    widget.notifyItemTopic(data);
                },
                
                notify_item_desc : function(data) {
                    widget.notifyItemDesc(data);
                },

                notify_item : function(data) {
                    widget.notifyItem(data);
                },

                notify_remove_item : function(data) {
                    widget.notifyRemoveItem(data);
                },

                notify_move_item : function(data) {
                    widget.notifyMoveItem(data);
                },
                
                fail_update : function(data) {
                    lipstick.alert(data.errors.join("\n"));
                },
                
                // PBE message sender methods
                // ______________________________________________________________________________
        
                /**
                 * Send a request - this allows us to wrap all sends with some standard
                 * setup code
                 */
                publish : function(msg) {
                    this.clientChannel.publish(msg);
                },
        
                /**
                 * Send a join message to get initial state
                 */
                sendJoin : function() {
                    this.publish( {
                        type :"join",
                        data : {}
                    });
                },

                update_start_time : function(startTime) {
                    this.publish({
                        type: 'update_start_time',
                        data : {
                            startTime: startTime
                        }
                    });
                },

                update_item : function (item) {
                    this.publish({
                        type: 'update_item',
                        data : {
                            item: item
                        }
                    });
                },

                update_item_time : function (item) {
                    this.publish({
                        type: 'update_item_time',
                        data : {
                            id: item.id,
                            time: item.time
                        }
                    });
                },
                
                update_item_owner : function (item) {
                    this.publish({
                        type: 'update_item_owner',
                        data : {
                            id: item.id,
                            owner: item.owner
                        }
                    });
                },

                update_item_topic : function (item) {
                    this.publish({
                        type: 'update_item_topic',
                        data : {
                            id: item.id,
                            topic: item.topic
                        }
                    });
                },
                
                update_item_desc : function (item) {
                    this.publish({
                        type: 'update_item_desc',
                        data : {
                            id: item.id,
                            desc: item.desc
                        }
                    });
                },
                
                /*
                 * append a new item request
                 * 
                 * */
                append_item : function (item) {
                    this.publish({
                        type: 'append_item',
                        data : {
                            item: item
                        }
                    });
                },

                /*
                 * remove an item request
                 * 
                 * */
                remove_item : function (id) {
                    this.publish({
                        type: 'remove_item',
                        data : {
                            id: id
                        }
                    });
                },
                
                /*
                 * move item
                 *  
                 * */
                move_item : function(id, p) {
                    this.publish({
                        type: 'move_item',
                        data : {
                            id: id,
                            pos: p
                        }
                    });
                    
                }

            };
            
            return _pbe;
        },

        showEditStartTimeDialog: function(uuid) {
            var widget = widgetRegistry[uuid];
            if(widget && !widget.read_only) {
                widget.showStartTimeForm();
            }
        }
    };


}(CSTAR, jQuery));


jQuery(document).ready(function($) {
        widget = CSTAR.agenda.makeWidget( {
            id : uuid,
            uuid : uuid,
            acURL: "",
            read_only: read_only,
            init_data: init_data
        });
        
        
});
