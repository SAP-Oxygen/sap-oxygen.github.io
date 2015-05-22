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