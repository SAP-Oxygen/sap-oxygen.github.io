(function () {
    // module namespace
    var ts = streamwork;
    var ns = ts.module("core.ranking");
    if (!this.CSTAR) {
      this.CSTAR = {};
      
    }

    trans = {
        t: function(str) {
            return new gadgets.Prefs().getMsg(str);
        }
    };
    // GY: comment out for now
    // CSTAR.t = YAHOO.cubetree.util.t;
    
    var status_labels = {
        prioritize: trans.t("ranking.prioritize_options"),
        options_changed: trans.t("ranking.options_changed"),
        ranking_submitted: trans.t("ranking.ranking_submitted"),
        order_changed: trans.t("ranking.order_changed"),
        finished: trans.t("ranking.finished_ranking")
    };
    
    // module imports
    var $ = jQuery;

    
    ns.methodClient = function (elementId, initialData, options) {
        var proxy, view, controller;
        var isReadOnly = options.readOnly;

        waveCont = {
            init: function() {
                wave.setStateCallback(waveCont.log);
                var waveState = wave.getState();
                waveState.submitDelta(initialData);
            },
            log: function() {
                var waveData = wave.getState().state_;
                console.log(waveData);
            },
            add_option: function(option) {
                debugger;
                var waveState = wave.getState();
                var options = waveState.get("options") || [];
                // GY: need this for now because of the array turning into an object
                var optionsArr = waveCont.add_option_array(option, options);
                var waveData = {};
                waveData["options"] = optionsArr;
                debugger;
                waveState.submitDelta(waveData);
            },
            add_option_array: function (newOption, options) {
                var optionsArr = [];
                $.each(options, function(name, value) {
                    optionsArr.push({id: name, value: value});
                });
                optionsArr.push(newOption);
                return optionsArr;
            },
            update_title: function(title) {
                debugger;
                var waveState = wave.getState();
                var waveData = {title: title};
                waveState.submitDelta(waveData);
                debugger;
            }
        };

        proxy = {
            submit_rankings: function(value, has_ranked) {
                var action_type = has_ranked?'rank2':'rank',
                    data = {
                        path: ['rankings', ts.getViewerId()],
                        value: value,
                        touch_updated_at: "false",
                        event: {action: {type : action_type}},
                        return_msg: 'notify_update_rankings'
                    };
                
                controller.clientChannel.publish({
                    type: 'set_data',
                    data: data
                });
            },
            
            publish: function(title, options) {
                var data = {
                        actions: [ {
                            action: 'set_data',
                            params: {
                                path:'published',
                                value: true
                            }
                        },
                        {
                            action: 'set_data',
                            params: {
                                path: 'title',
                                value: title
                            }
                        },
                        {
                            action: 'set_data',
                            params: {
                                path: 'options',
                                value: options
                            }
                        },
                        {
                            action: 'set_data',
                            params: {
                                path: 'rankings',
                                value: {}
                            }
                        } ],
                        event: {action: {type: 'sh'}},
                        return_msg: 'notify_publish'
                    };
                
                controller.clientChannel.publish({
                    type: 'update_data_batch',
                    data: data
                });
            },
            
            edit_option: function(option, old_title) {
                var action_type = 'e',
                    action_data = {op1:old_title, op2:option.value.title},
                    data = {
                        path: ['options'],
                        id: option.id,
                        value: option.value,
                        event: {action: {type: action_type, data: action_data}},
                        return_msg: 'notify_edit_option'
                    };
                
                controller.clientChannel.publish({
                    type: 'update_array_item',
                    data: data
                });
            },
            
            add_option: function(option) {
                // GY: comment out for now
                // var action_type = 'a',
                //     action_data = {op: option.value.title},
                //     data = {
                //         path: ['options'],
                //         id: option.id,
                //         value: option.value,
                //         event: {action: {type: action_type, data: action_data}},
                //         return_msg: 'notify_add_option'
                //     };

                waveCont.add_option(option);
                
                // GY: comment out for now
                // controller.clientChannel.publish({
                //     type: 'insert_array_item',
                //     data: data
                // });
            },
            
            remove_option: function(option) {
                var action_type = 'd',
                    action_data = {op: option.value.title},
                    data = {
                        path: ['options'],
                        id: option.id,
                        value: option.value,
                        event: {action: {type: action_type, data: action_data}},
                        return_msg: 'notify_remove_option'
                    };
                
                controller.clientChannel.publish({
                    type: 'update_array_item',
                    data: data
                });
            },            
           
            lock: function(locked) {
                var action_type = locked?'su':'op',
                    data = {
                        path: 'locked',
                        value: locked,
                        event: {action: {type: action_type}, importance: 1},
                        return_msg: 'notify_locked'
                    };
                
                controller.clientChannel.publish({
                    type: 'set_data',
                    data: data
                });
            },
            
            update_title: function(title) {
                // var action_type = 'tt',
                //     action_data = {t:title},
                //     data = {
                //         path: 'title',
                //         value: title,
                //         event: {action: {type:action_type, data: action_data}},
                //         return_msg: 'notify_update_title'
                //     };
                
                waveCont.update_title(title);

                // GY: comment out for now
                // controller.clientChannel.publish({
                //     type: 'set_data',
                //     data: data
                // });
            },
            
           clear_users_rank_list: function() {
                var data = {
                        actions: [ {
                            action: 'set_data',
                            params: {
                                path:'published',
                                value: false
                            }
                        }, 
                        
                        {
                            action: 'set_data',
                            params: {
                                path: 'rankings',
                                value: {}
                            }
                        } ],
                        event: {action: {type: 'clear'}},
                        return_msg: 'notify_clear_users_rank_list'
                    };
                
                controller.clientChannel.publish({
                    type: 'update_data_batch',
                    data: data
                });
            },
            
            remove_my_ranking: function() {                
                var action_data = {u:CSTAR.current_user.nickname},
                    data = {
                        path: ['rankings', ts.getViewerId()],
                        value: [],
                        touch_updated_at: "false",
                        event: {action: {type : 'remove' , data: action_data}},
                        return_msg: 'notify_remove_my_ranking'
                    };
                
                controller.clientChannel.publish({
                    type: 'set_data',
                    data: data 
                });
            }           
            
        };

        view = {
            div: $("#" + elementId),
            
            edit_div_id: elementId + '_edit',
            
            rank_place_holder_html_string: '<div class="rank_placeholder_view"><div class="rank_status_bar">' + 
                                           '<div class="build_ranking_status"><span class="status_label">1.</span><span class="status_content">&nbsp;' + trans.t("ranking.build_ranking_list") + '</span></div>' + 
                                           '<div class="submit_ranking_status"><span class="status_label">2.</span><span class="status_content">&nbsp;' + trans.t("ranking.rank_items_submit_results") + '</span></div>' +
                                           '<div class="lock_ranking_status"><span class="status_label">3.</span><span class="status_content">&nbsp;' + trans.t("ranking.freeze_ranking") + '</span></div></div></div>',
            default_input_string: trans.t("ranking.add_to_ranking_list"),
            default_rank_statement: trans.t("ranking.type_statement_ranking"),
            start_ranking_hint: trans.t("ranking.two_items_required"),
            drag_and_drop_hint: trans.t("ranking.drag_n_drop_items"),
           
            

            hookup_back_to_build_tooltip: function() {
                var back_to_build_tooltip_content = "<div class='rank_tooltip_content'>" + trans.t("ranking.reset_and_return_to_build") + "</div>";
                var rank_view_back_btn_dom = view.div.find('.rank_view_back_btn').get(0);
                var back_to_build_options = {html: true, placement: "bottom", title: back_to_build_tooltip_content, delay: {show: 500, hide: 0}};
                $(rank_view_back_btn_dom).tooltip(back_to_build_options);
            },

            /**
             * Displays ranking method edit view. User can only use this view to add, edit or remove rank options
             */
            show_edit_view: function() {                
                var edit_div_string = '<div class="rank_edit">' + 
                                       '<div class="rank_title_holder"><div class="rank_title_top"></div><div class="rank_title_background"><div class="rank_title"></div></div></div>' + 
                                       '<div class="rank_option_input_holder">' + sap.sw.ui.button.createHtml(trans.t("infrastructure.add"), "add_option_btn action_button", true) +
                                       '<div class="rank_option_input_container"><input class="rank_option_input rank_option_input_default" value="' + view.default_input_string.escapeHTML() + '"/></div>' +
                                       '</div><div class="rank_options empty_option"></div><div class="rank_option_input_bottom"></div>' + 
                                       '</div><div class="rank_view_back_btn_container"><div class="start_ranking_hint">' + view.start_ranking_hint.escapeHTML() + '</div>' + 
                                       sap.sw.ui.button.createHtml(trans.t("ranking.start_ranking"), "start_ranking action_button", true) +
                                       '</div>';

                var edit_div = $(edit_div_string).attr('id', view.edit_div_id);                         
                view.div.find('.rank_placeholder_view').append(edit_div);                
                view.div.find('.rank_title').text(view.div.data('title'));
                view.div.find('.submit_ranking_status').addClass('disabled_status');
                view.div.find('.lock_ranking_status').addClass('disabled_status');
                view.change_status_bar();
                
                view.div.find('.rank_title').editable(function(value, settings) {
                    if (!value || !value.length ||$.trim(value) === '') {
                        $(this).text(this.revert);                       
                        return;
                    }
                    
                    //enable start ranking button
                    if (view.div.find('.rank_option_holder').length > 1){
                        sap.sw.ui.button.enable($(".start_ranking", view.div));
                    }
                    
                    controller.update_title(value, true);
                },
                {
                    type: 'text',
                    onreadytoedit: function() {
                        // cancel other edits
                        view.cancel_edits();                        
                        $(this).addClass('rank_editing');
                        $(this).css('min-height', '17px');                        
                       
                    },
                    onfinishededit: function() {
                        if ($(this).is('.rank_editing')) {
                            $(this).removeClass('rank_editing');
                        }                      
                        if ($(this).text() !== view.default_rank_statement) {
                            $(this).css('color', '#333333');
                        }                                               
                    },
                    height: '15px',
                    width: '380px',
                    cssclass: 'buttonInplaceEdit',
                    tooltip: trans.t('common.click_to_edit'),
                    placeholder: view.default_rank_statement
                });
               
                $('.rank_title_holder', view.div).hover(                   
                    function(){                      
                        if ($(this).find('.buttonInplaceEdit').length < 1) {
                            var rank_title = $(this).find('.rank_title');
                            rank_title.addClass('rank_title_editable');                            
                        }
                    },
                    function (){
                        var rank_title = $(this).find('.rank_title');
                        rank_title.removeClass('rank_title_editable');                      
                    }
                );                
                
                
                view.div.find('.rank_title_holder').click(function(){
                    var rank_title = $(this).find('.rank_title');
                    rank_title.removeClass('rank_title_editable');                
                });
                
                view.div.find('.rank_option_input').click(function(){                   
                    if ($(this).val() === view.default_input_string) {                      
                        $(this).val('');
                    }
                });
                
                              
                var optionsHolder = $('.rank_options', edit_div);
                $.each(view.div.data('options'), function() {
                    if (!this.value.deleted) {                       
                        view.add_option_input(this, optionsHolder);
                    }
                });
                
                if (view.div.find('.rank_option_title').length > 0){                   
                    view.div.find('.rank_options').removeClass('empty_option'); 
                }                
                
                view.div.find('.add_option_btn').click(function(){
                    if (sap.sw.ui.button.isEnabled($(this))){
                        view.add_option(optionsHolder); 
                        view.disable_add_option_btn();
                    }
                });
                
                view.div.find('.rank_option_input').keyup(function(evt) {
                    var current_input_value = $(this).val();
                    if (current_input_value.length === 0 || $.trim(current_input_value) === ''){
                        $(this).addClass('rank_option_input_default');
                        view.disable_add_option_btn();                        
                        
                    } else {
                        $(this).removeClass('rank_option_input_default');                        
                        view.enable_add_option_btn();
                        if (evt.keyCode === 13) {
                            // user pressed enter to add new option
                            view.add_option(optionsHolder);                       
                        }
                    }                   
                    
                });
                
                view.div.find('.rank_option_input').keydown(function(evt) {                 
                    if (evt.keyCode === 9) {
                        var current_input_value = $(this).val();
                        if (current_input_value.length === 0 || $.trim(current_input_value) === ''){
                            $(this).val(view.default_input_string);
                            $(this).addClass('rank_option_input_default');
                            view.disable_add_option_btn(); 
                        }
                     }
                });
                
                view.div.find('.rank_option_input').blur(function() {
                    var current_input_value = $(this).val();
                    if (current_input_value.length === 0 || $.trim(current_input_value) === ''){
                        $(this).val(view.default_input_string);
                        $(this).addClass('rank_option_input_default');
                        view.disable_add_option_btn(); 
                    }
                });
                
                $('.start_ranking', view.div).hover(function(){
                    var start_ranking_tooltip_content = "<div class='rank_tooltip_content'>" + trans.t("ranking.starting_ranking_allows") + "</div>";
                    var container_object = view.div ;
                    
                    var start_ranking_list_tooltip_target_dom = container_object.find('.start_ranking').get(0);      
                                  
                    var start_ranking_options = {html: true, placement: "bottom", title: start_ranking_tooltip_content, delay: {show: 500, hide: 0}};
                    $(start_ranking_list_tooltip_target_dom).tooltip(start_ranking_options);

                });

                $('.start_ranking', view.div).click(function(){                   
                    
                    if (sap.sw.ui.button.isEnabled($(this))) {
                        view.cancel_edits();
                        var title_input = view.div.find('.rank_title'),
                            title = title_input.text();                     
                        if (title === '' || title === view.default_rank_statement){
                            lipstick.alert(trans.t("ranking.empty_rank_item_title"));
                            return;
                        }
                        
                        var labels = {
                            title: trans.t("ranking.start_ranking"),                            
                            warning_msg1: trans.t("ranking.once_you_start_ranking"),  
                            warning_msg2: trans.t("ranking.starting_ranking_allows"),
                            question: trans.t("ranking.confirm_start_ranking")
                        };

                        var options = [];
                        
                        timestamp = get_timestamp();                                  
                   
                        $('.rank_option_title', edit_div).each(function() {
                            options.push({
                                id: $(this).data('id'),
                                value: { 
                                    title: $(this).text(),
                                    timestamp: timestamp
                                }
                            });
                        }); 

                         controller.publish(title, options); 
                         $('.tooltip').hide();
                    }
                    
                });

                $(window).blur(function() {
                    $("input").blur();
                });
            },
            
            /*
             * Display ranking view. Users can only use this view to change their ranking.
             */
            show_ranking_view: function() {             
                controller.calculate_results();
                var rank_div_string = '<div class="rank_holder ranking_view">' + 
                                    '<div class="rank_title_holder"><div class="rank_title_top"></div><div class="rank_title_background"><div class="rank_title"></div></div></div>' +
                                    '<div class="rank_list_header">' +
                                    '<div class="your_ranking">' + trans.t("ranking.rank") + '</div>' +
                                    '<div class="rank_instruction">&nbsp;' + trans.t("items.items") + ' <span class="rank_sub_instruction" title="' + view.drag_and_drop_hint.escapeHTML() + '">(' + view.drag_and_drop_hint.escapeHTML() +')</span></div></div>' +
                                    '<div class="rank_body">' +
                                    '<div class="rank_list"></div><div class="rank_view_bottom"><div class="num_submissions"></div>' +
                                    sap.sw.ui.button.createHtml(trans.t("ranking.submit_ranking"), "rank_submit_btn action_button") + 
                                    '</div></div></div>' +   
                                    '<div class="rank_view_back_btn_container">' + 
                                    sap.sw.ui.button.createHtml(trans.t("ranking.edit_ranking_list"), "rank_view_back_btn action_button") + 
                                    '</div>';
                view.div.find('.rank_placeholder_view').append($(rank_div_string));
                view.div.find(".core_ranking").removeClass("locked");
                view.div.find('.lock_ranking_status').addClass('disabled_status');
                $('.rank_title', view.div).text(view.div.data('title'));               
                view.change_status_bar();               
                
                // initialize the list of options
                var list = view.div.find('.rank_list'),
                    sorted_options = controller.get_ordered_options();
                
                $.each(sorted_options, function(i) {
                    if (!this.value.deleted) {
                        view.add_ranking_option(this, list, i + 1);
                    }
                });
                
                view.update_row_backgrounds();

                var isDragging = false, mouseDownCur = function (){
                    list.children().addClass('rank_draggable_mouse_down');
                }, mouseUpCur = function () {
                    list.children().removeClass('rank_draggable_mouse_down');
                };
                
                list.children().mousedown(mouseDownCur).bind ('mouseup mouseleave', function(){
                    if(!isDragging) {
                        mouseUpCur();
                    }
                })

                // make the list of options sortable
                list.sortable({
                    items: '.rank_option_holder',
                    cancel: '.rank_disabled', /* disable drag */
                    placeholder: 'rank_drag_placeholder',
                    forcePlaceholderSize: true,
                    axis: 'y',
                    opacity: 0.7,
                    helper: 'clone',
                    start: function(evt, ui) {
                        var $this = $(this),
                            item = $(ui.item);
                        $(ui.helper).addClass('rank_dragging');
                        
                        // set the placeholder height to the same as the drag item
                        $(ui.placeholder).height(item.height());

                        isDragging = true;
                        mouseDownCur();
                    },
                    stop: function(evt, ui) {
                        isDragging = false;
                        mouseUpCur();
                    },
                    change: function(evt, ui) {
                        var rank = 1, $parent = $(this), $dragging = ui.item.add(ui.helper), children = $parent.children();
                        children.each(function (i, child) {
                            var $child = $(child);
                            if($child.hasClass('rank_drag_placeholder')) {
                                $dragging.find('.your_ranking').text((rank).toString());
                                rank++;
                            }
                            else if($.inArray(child, $dragging.get()) >= 0) {
                                return;
                            }
                            else {
                                $child.find('.your_ranking').text((rank).toString());
                                rank++;
                            }
                        });
                    },
                    update: function(evt, ui) {
                        // change in dom position
                        controller.list_changed();
                    }
                });
                
                
                // hook up the submit button functionality
                view.div.find('.rank_submit_btn').click(function() {
                    var options = $('.rank_option_holder', view.div),
                        ranking_order = [];
                    
                    options.each(function() {
                        var id = $(this).data('id'),
                            timestamp = $(this).data('timestamp');
                        ranking_order.push({id: id, timestamp: timestamp});
                    });
                    
                    controller.submit_rankings(ranking_order);
                });
                
                // hook up the back button functionality
                view.hookup_back_to_build_tooltip();
                $('.rank_view_back_btn', view.div).click(function() {
                    view.display_back_btn_warning_dialog();                                    
                });
                
                view.update_submission_count();
            },
            
            /*
             * Display my ranking result
             */
            show_my_ranking_view: function(){
                controller.calculate_results();
                var rank_div_string = '<div class="rank_holder my_ranking_view">' + 
                                      '<div class="rank_title_holder"><div class="rank_title_top"></div><div class="rank_title_background"><div class="rank_title"></div></div></div>' +
                                      '<div class="rank_body"><div class="rank_list_header"><div class="your_ranking">' + trans.t("ranking.your_rank") + '</div><div class="collective_ranking">&nbsp;' + trans.t("ranking.aggregate_ranking_results") + '</div></div>' +
                                      '<div class="rank_list rank_result_list"></div><div class="rank_view_bottom"><div class="num_submissions"></div>' +
                                      sap.sw.ui.button.createHtml(trans.t("ranking.re_rank"), "edit_my_ranking_btn action_button") +
                                      '</div></div></div>' + 
                                      '<div class="rank_view_back_btn_container">' +
                                      sap.sw.ui.button.createHtml(trans.t("ranking.edit_ranking_list"), "rank_view_back_btn action_button") +
                                       sap.sw.ui.button.createHtml(trans.t("ranking.freeze_ranking"), "lock_ranking_btn action_button") +
                                      '</div>';
                view.div.find('.rank_placeholder_view').append($(rank_div_string));
                view.div.find(".core_ranking").removeClass("locked");

                view.div.find('.rank_status_bar').children().removeClass('disabled_status');

                $('.rank_title', view.div).text(view.div.data('title'));         
                view.change_status_bar();               
                
                view.hookup_back_to_build_tooltip();
                $('.rank_view_back_btn', view.div).click(function() {
                    view.display_back_btn_warning_dialog();
                });
                
                // hook up the submit button functionality
                view.div.find('.edit_my_ranking_btn').click(function() {
                    controller.remove_my_ranking(true, ts.getViewerId());                                 
                });                
                
                var lock_ranking_tooltip_content = "<div class='rank_tooltip_content'>" + trans.t("ranking.close_ranking") + "</div>";
                var lock_ranking_list_tooltip_target_dom = view.div.find('.lock_ranking_btn').get(0);
                var lock_ranking_options = {html: true, placement: "bottom", title: lock_ranking_tooltip_content, delay: {show: 500, hide: 0}};
                $(lock_ranking_list_tooltip_target_dom).tooltip(lock_ranking_options);

                view.div.find('.lock_ranking_btn').click(function() {                   
                    var labels = {
                             title: trans.t("ranking.freeze_ranking"),                            
                             warning_msg1: trans.t("ranking.close_ranking"),  
                             warning_msg2: trans.t("ranking.no_more_submissions"),
                             question: trans.t("ranking.confirm_lock_ranking")
                         };
                    
                    $('.tooltip').hide();
                    // CUB-4308 the delay on the lock/unlock button tooltip might cause it to show up after the dom element has been removed, 
                    // so manually trigger mouseout to get rid of the tooltip
                    $(lock_ranking_list_tooltip_target_dom).mouseout(); 
                    controller.lock(true, true);
                });
                
                view.update_results();
                view.update_row_backgrounds();
                view.update_submission_count();
            },
            
            /*
             * Display locked ranking view
             */
            show_results_view: function(read_only) {
                controller.calculate_results();
                var unlock_btn_string = '';
                
                if (!read_only){
                    unlock_btn_string = sap.sw.ui.button.createHtml(trans.t("ranking.unfreeze_ranking"), "rank_unlock_btn action_button");
                }
                var rank_result_div_string = '<div class="rank_holder locked">' + 
                                      '<div class="rank_title_holder"><div class="rank_title_top"></div><div class="rank_title_background"><div class="rank_title"></div></div></div>' +
                                      '<div class="rank_body"><div class="rank_list_header"><div class="your_ranking">' + trans.t("ranking.your_rank") + '</div><div class="collective_ranking">&nbsp;' + trans.t("ranking.aggregate_ranking_results") + '</div></div>' +
                                      '<div class="rank_list rank_results_list"></div><div class="rank_view_bottom"><div class="num_submissions"></div>' +                
                                      '</div></div></div><div class="rank_view_back_btn_container">' + unlock_btn_string + 
                                      '</div>' ;
                view.div.find('.rank_placeholder_view').append($(rank_result_div_string));               
                view.div.find('.rank_title').text(view.div.data('title'));
                view.div.find('.rank_status_bar').children().removeClass('disabled_status');
                if(read_only) {
                    view.div.find('.build_ranking_status').addClass('disabled_status');
                    view.div.find('.submit_ranking_status').addClass('disabled_status');
                }
                view.change_status_bar();               
                
                var unlock_ranking_tooltip_content = "<div class='rank_tooltip_content'>" + trans.t("ranking.open_ranking") + "</div>";
                var unlock_ranking_list_tooltip_target_dom = view.div.find('.rank_unlock_btn').get(0);
                var unlock_ranking_options = {html: true, placement: "bottom", title: unlock_ranking_tooltip_content, delay: {show: 500, hide: 0}};
                $(unlock_ranking_list_tooltip_target_dom).tooltip(unlock_ranking_options);

                view.div.find('.rank_unlock_btn').click(function() {                    
                    var labels = {
                            title: trans.t("ranking.unfreeze_ranking"),                            
                            warning_msg1: trans.t("ranking.open_ranking"),  
                            warning_msg2: '',
                            question: trans.t("ranking.confirm_unlock_ranking")
                        };

                    $('.tooltip').hide();
                    // CUB-4308 the delay on the lock/unlock button tooltip might cause it to show up after the dom element has been removed, 
                    // so manually trigger mouseout to get rid of the tooltip
                    $(unlock_ranking_list_tooltip_target_dom).mouseout();
                    controller.lock(false, true);
                });
                
                view.update_results();               
                view.update_submission_count();
            },
            
            add_option: function(optionsHolder) {
                var new_option_title = $.trim(view.div.find('.rank_option_input').val());
                if (new_option_title === view.default_input_string || new_option_title === '') {
                    lipstick.alert('Option cannot be empty', function(){view.div.find('.rank_option_input').val('');view.div.find('.rank_option_input').focus();});                     
                    return;
                }
                
                if (view.check_duplicate_option(new_option_title, null) === true) {
                    lipstick.alert(trans.t("items.no_duplicate_options"), function(){view.div.find('.rank_option_input').focus();});                        
                    return;
                }                   
                 
                var option = { 
                    id: generate_id(),                        
                    value: { 
                        title: new_option_title,
                        timestamp: get_timestamp()
                    }
                 };
                
                 var placeholder_option = null;
                 placeholder_option = view.add_option_input(option, optionsHolder);                 
                
                 if (view.div.find('.rank_options').hasClass('empty_option')){                      
                     view.div.find('.rank_options').removeClass('empty_option');                        
                 }else {                        
                     placeholder_option.trigger('validate');
                 }
                 
                 view.div.find('.rank_option_input').val('').focus();
                 
                 view.enable_start_ranking_button();                   
                 
                 controller.add_option(option, true);
            },
            
            /**
             * Adds a new option input in the edit view
             * 
             * @param option [Object { id, value }] New option to add
             * @param container [jQuery object] .rank_options element            
             */           
            add_option_input: function(option, container) {             
                if (!container || !container.length) {
                    container = $('.rank_options', '#'+view.edit_div_id);
                }
                
                var $option = $('<div class="rank_option_holder" style="display:none;"><div class="rank_option_buttons"><span class="rank_edit_option" title="' + trans.t("items.edit_this_option") + '"></span><span class="rank_remove_option" title="' + trans.t("items.remove_this_option") + '"></span></div><span class="rank_option_title"></span></div>')              
                    .attr('id', 'rank_option_'+ option.id)
                    .find('.rank_option_title')
                    .attr('name', option.id)
                    .data('id', option.id)
                    .text(option.value.title)                    
                    .end()
                    .appendTo(container);        
                
                if (view.div.find('.rank_options').hasClass('empty_option')){                       
                    view.div.find('.rank_options').removeClass('empty_option');
                }
                
                view.add_edit_events($option, option.id);               
                $option.show();                
                view.enable_start_ranking_button(); 
             
                return $option;
            },
            
            add_ranking_option: function(option, option_list, rank) {
                var list = option_list?option_list:$('.rank_list', view.div),
                    title = option.value.title?option.value.title:'',
                    timestamp = option.value.timestamp,
                    option_element;
                
                option_element = $('<div class="rank_option_holder rank_draggable"><div class="your_ranking"></div><div class="rank_inner_holder"><span class="rank_option_title"></span></div></div>')
                    .appendTo(list)
                    .attr('id', 'rank_option_'+option.id)
                    .attr('title', view.drag_and_drop_hint)
                    .data('id', option.id)
                    .data('timestamp', timestamp);

                if(rank) {
                    option_element.find('.your_ranking').text(rank.toString());
                }
                
                option_element.find('.rank_option_title')
                    .text(title);
                  
                return option_element;
            },
            
            /**
             * Adds event bindings to options in the edit view 
             * 
             * @param option_holder_elements [jQuery Object] Collection of .option_holder 
             *  elements
             */
            add_edit_events: function(option_holder_elements, option_id) {              
                $(option_holder_elements).find('.rank_remove_option').click(function() {                                              
                    controller.remove_option(option_id, true);                        
                });
                
                
                $(option_holder_elements).find('.rank_option_title').editable(function(value, settings) {                   
                    if (!value || !value.length ||$.trim(value) === '') {
                        $(this).text(this.revert);
                        return;
                    }
                    
                    if (view.check_duplicate_option(value, $(this).parent().attr('id')) === true) {
                        lipstick.alert(trans.t("items.no_duplicate_options"));
                        $(this).text(this.revert);                        
                        return;
                    }  
                    
                    var id = $(this).data('id'),
                        time_stamp = get_timestamp(),                      
                        option = {
                            id: id,
                            value: {
                                title: value,
                                timestamp: time_stamp
                            }
                        };
                    
                     controller.edit_option(option, true);                  
                },
                {
                    type: 'text',
                    onreadytoedit: function() {
                        // cancel other edits
                        view.cancel_edits();
                        $(this).addClass('rank_editing');
                        $(this).siblings('.rank_option_buttons').hide();                      
                    },
                    onfinishededit: function() {
                        if ($(this).is('.rank_editing')) {
                            $(this).removeClass('rank_editing');
                        }                       
                        view.div.find('.rank_option_input').val('').focus();                        
                    },
                    height: '15px',
                    width: '400px',
                    cssclass: 'buttonInplaceEdit',                   
                    event: 'rank_edit_event'
                }).end()
                  .find('.rank_edit_option').click(function() {
                      // edit button click handler
                      // trigger the custom event on the option title
                      $(this).parent().siblings('.rank_option_title').trigger('rank_edit_event');
                  });
               
                
                // add hover event to show the delete button
                $(option_holder_elements).hover(function() {
                    if (!$(this).find('.rank_option_title').hasClass('rank_editing')) {
                        $(this).find('.rank_option_buttons').show();
                    }
                    
                    // make sure all others are hidden
                    $(this).siblings('.rank_option_holder').children('.rank_option_buttons:visible').hide();
                },
                function() {
                    $(this).find('.rank_option_buttons').hide();
                });
            },            
            
            update_results: function() {
                
                if (!view.div.find('.rank_holder').length ||
                !view.div.data('results')){                 
                    return;
                }
                
                var list = $('.rank_list', view.div),
                    last_rating = null,
                    ranking = 0,
                    place = 0;  // ranking place
                list.children().remove();
                $.each(view.div.data('results'), function() {
                    if (!this.rating || this.value.deleted) {
                        return;
                    }                    
                  
                    var option = $('<div class="rank_option_holder"><div class="your_ranking"></div>' + '<div class="rank_inner_holder"><div class="rank_option_ranking_value"></div><div class="rank_option_title"></div></div></div>')
                        .appendTo(list)
                        .attr('id', 'rank_option_'+this.id);
                    
                    option.find('.rank_option_title').text(this.value.title);
                    
                    // calculate the ranking position
                    place += 1;
                    if (this.rating != last_rating) {
                        ranking = place;
                    }
                    last_rating = this.rating;
                    
                    var num_votes_str = this.rankings.length + (this.rankings.length == 1 ? ' vote' : ' votes');
                    option.find('.rank_option_ranking_value').text(ranking).attr('title', num_votes_str);
                    
                    var current_user_ranking_list = view.div.data('user_rankings')[CSTAR.current_user.uuid];
                    // display the current user's ranking
                   if (current_user_ranking_list === undefined || current_user_ranking_list === '' ) {
                        option.find('.your_ranking').text("-");
                    } else {
                        option.find('.your_ranking').text(view.div.data('user_rankings')[CSTAR.current_user.uuid][this.id]);
                    }
                    
                });
                view.update_row_backgrounds();
            },
            
            update_row_backgrounds: function() {
                $('.rank_option_holder', view.div)
                    .filter(':even').css('background-color', '#FFFFFF')
                    .end()
                    .filter(':odd').css('background-color', '#F8FBFC');
            },
            
            remove_ranking_option: function(id) {               
                view.div.find('#rank_option_'+id).remove();             
                if (view.div.find('.rank_option_holder').length < 1) { 
                    view.div.find('.rank_options').addClass('empty_option');
                }                
            },
            
            update_option_title: function(option) {
                var id = option.id, 
                    title = option.value.title,
                    timestamp = option.value.timestamp,
                    option_element = view.div.find('#rank_option_'+id),
                    edit_element = option_element.find('.rank_editing');
                   
                
                // don't modify the option if it is being edited 
                if (edit_element.length) {
                    // persist the updated title for convenience
                    option_element.data('updated_title', title);
                    
                    // change the jeditable variable so that if the edit is cancelled,
                    // it'll revert to the new title
                    edit_element.each(function() {
                        this.revert = title;
                    });
                    return;
                }               
                  
                view.flutter_option(id);               
                
                // update title and timestamp
                option_element.data('timestamp', timestamp) 
                    .find('.rank_option_title').text(title); 
           
            },
            
            cancel_edits: function() {
                view.div.find('.rank_editing').editable('cancel');
            },
            
            update_title: function() {
                var title = view.div.data('title');
                // GY: comment out for now
                // lipstick.flutter(view.div.find('.rank_title').text(title));
                view.div.find('.rank_title').css('color','#333333');                
                view.enable_start_ranking_button();
            },
            
            flutter_option: function(option_id) {
                // GY: comment out for now
                // lipstick.flutter(view.div.find('#rank_option_'+option_id));
            },            
          
            update_submission_count: function() {
                var num_submissions = parseInt(view.div.data('num_submissions'), 10);
                var text;
                if (num_submissions === 1) {
                    text = trans.t("ranking.1_person_submitted_ranking");
                } else if (num_submissions > 1) {
                    text = trans.t("ranking.n_people_submitted_ranking", {n: view.div.data('num_submissions')});  
                } else {
                    text = trans.t("ranking.noone_submitted_ranking");
                }
                $(view.div).find('.num_submissions').text(text).attr("title", text);
            }, 
            
            toggle_locked: function(locked) {
                if (locked) {
                    // show results view
                    view.back_button_trigger_actions('lock');
                } else {
                    // show ranking view
                    view.back_button_trigger_actions('unlock');
                }
            },        
                  

            add_status_bar: function(){             
                view.div.html(view.rank_place_holder_html_string);
                
                 //Hook up displaying tooltip with hover on status images                
                 view.hover_show_rank_status_tooltip(view.div);
                 
                 //Hook up click events to make them clickable
                 view.bind_rank_status_click_events(view.div);
            },
            
            back_button_trigger_actions : function(action_type) {
                //Remove ranking view, but keep status bar on the top
                view.div.find('.rank_holder').remove(); 
                view.div.find('.rank_edit').remove();
                view.div.find('.start_ranking').remove();
                view.div.find('.rank_view_back_btn_container').remove(); 
                
                switch(action_type)
                {
                case 'lock' :    
                    view.show_results_view();
                    break;
                case 'unlock':   
                    if (controller.check_current_user_ranking_status()){
                        view.show_my_ranking_view();
                    } else {
                        view.show_ranking_view();
                    }
                    break;
                case 'rank':
                    view.show_ranking_view();
                    break;
                default:
                    view.show_edit_view();
                }                   
               
                view.div.find('.rank_options').removeClass('empty_option'); 
                
                // Change title default color
                view.div.find('.rank_title').css('color', '#333333');                
                
                // Enable start ranking button
                if (action_type === 'back') {
                    sap.sw.ui.button.enable(view.div.find(".start_ranking"));                   
                }
            },
            
            change_status_bar: function(){              
                var status_bar = view.div.find('.rank_status_bar');
                if (view.div.find('.rank_edit').length > 0) {                   
                    status_bar.css('background-position','0 0');
                    view.change_tooltip_content_format(status_bar, "build_ranking_status");                 
                } else if (view.div.find('.ranking_view').length > 0 || view.div.find('.my_ranking_view').length > 0) {                 
                    status_bar.css('background-position','0px -24px');
                    view.change_tooltip_content_format(status_bar, "submit_ranking_status");                  
                } else {
                    status_bar.css('background-position','0px -48px');
                    view.change_tooltip_content_format(status_bar, "lock_ranking_status");                  
                }
            },          
            
            enable_start_ranking_button: function(){
                //Enable submit rank button if the number of options are more than 1 and rank statement is not empty
                var btn = view.div.find(".start_ranking");
                if (view.div.find(".rank_option_holder").length > 1 && view.div.find(".rank_title").text() !== view.default_rank_statement) {
                    sap.sw.ui.button.enable(btn);
                    btn.removeAttr('title');
                    view.div.find('.submit_ranking_status').removeClass('disabled_status');
                }
            },
            
            disable_start_ranking_button: function(){               
                //Disable submit rank button if the number of options are less than 2  
                var btn = view.div.find(".start_ranking");
                if (view.div.find(".rank_option_holder").length < 2 && sap.sw.ui.button.isEnabled(btn)) {
                    sap.sw.ui.button.disable(btn);
                    btn.attr('title', this.start_ranking_hint);
                    view.div.find('.submit_ranking_status').addClass('disabled_status');
                }
            },
            
            enable_add_option_btn: function() {
                var btn = view.div.find('.add_option_btn')
                sap.sw.ui.button.enable(btn);
                btn.removeAttr('title');
            },
            
            disable_add_option_btn: function(){
                var btn = view.div.find('.add_option_btn');
                sap.sw.ui.button.disable(btn);
                btn.attr('title', this.default_input_string);
            },
            
            change_tooltip_content_format: function(status_bar, target_class_name){
                status_bar.children().removeClass('rank_status_selected');
                status_bar.children('.' + target_class_name).addClass('rank_status_selected');
            },
            
            display_back_btn_warning_dialog: function(){
                var labels = {
                    title: trans.t("ranking.back_build_ranking_list"),                             
                    warning_msg1: trans.t("ranking.reset_ranking_submissions"),  
                    warning_msg2: '',
                    question: trans.t("ranking.confirm_build_ranking_list")
                };
                  
                view.show_warning_dialog(labels, function() {
                   controller.clear_users_rank_list(true);
                });      
            },
            
             /**
             * Pop up a warning dialog
             *
             * @param labels Object containing messages for the dialog
             *      header: header message
             *      warning: main warning message
             *      question: question message
             * @param callback Function to call back when the user clicks the YES button
             */
             show_warning_dialog: function(labels, callback) {
                var  warning_msg2_dom_string = '<div class="rank_warning_msg2 rank_warning_content_div"></div>';
                if (labels.warning_msg2 === ''){
                    warning_msg2_dom_string = '';
                }               
                var warning_html = '<div class="rank_warning_body"><div class="rank_warning_icon_container">' +
                                    '<div class="rank_warning_message_container"><div class="rank_warning_msg1 rank_warning_content_div"></div>' +
                                    warning_msg2_dom_string +
                                    '<div class="rank_warning_msg3 rank_warning_content_div"></div></div>',
                     warning = $(warning_html),
                     options = {
                         onOK: callback,
                         title: labels.title,
                         okLabel: trans.t("infrastructure.ok"),
                         cancelLabel: trans.t("infrastructure.cancel")
                };
                
                // set the messages
                warning.find('.rank_warning_msg1').text(labels.warning_msg1);
                warning.find('.rank_warning_msg2').text(labels.warning_msg2);
                warning.find('.rank_warning_msg3').text(labels.question);                  
                
                lipstick.dialog(warning, options);
             },
            
             /**
             * Find all jQuery objects in given object which contain predefined rank status classes and add hover call back to show tooltips for each status
             */
            hover_show_rank_status_tooltip: function(container_object){
                var build_ranking_tooltip_content = "<div class='rank_tooltip_header'>" + trans.t("ranking.build_ranking_list") + "</div>" + 
                                                    "<div class='rank_tooltip_content'>" + trans.t("ranking.build_edit_items") + "</div>";
                var submit_ranking_tooltip_content = "<div class='rank_tooltip_header'>" + trans.t("ranking.rank_items_submit_results") + "</div>" + 
                                                     "<div class='rank_tooltip_content'>" + trans.t("ranking.order_ranking_items") + "</div>";
                var lock_ranking_tooltip_content = "<div class='rank_tooltip_header'>" + trans.t("ranking.freeze_ranking") + "</div>" + 
                                                   "<div class='rank_tooltip_content'>" + trans.t("ranking.close_off_ranking") + "</div>";
                
                var build_ranking_list_tooltip_target_dom = container_object.find('.build_ranking_status').get(0);      
                var submit_ranking_list_tooltip_target_dom = container_object.find('.submit_ranking_status').get(0);    
                var lock_ranking_list_tooltip_target_dom = container_object.find('.lock_ranking_status').get(0);        
                
                var build_ranking_options = {html: true, placement: "top", title: build_ranking_tooltip_content, delay: {show: 500, hide: 0}};
                $(build_ranking_list_tooltip_target_dom).tooltip(build_ranking_options);

                var submit_ranking_options = {html: true, placement: "top", title: submit_ranking_tooltip_content, delay: {show: 500, hide: 0}};
                $(submit_ranking_list_tooltip_target_dom).tooltip(submit_ranking_options);

                var freeze_ranking_options = {html: true, placement: "top", title: lock_ranking_tooltip_content, delay: {show: 500, hide: 0}};
                $(lock_ranking_list_tooltip_target_dom).tooltip(freeze_ranking_options);


                $(build_ranking_list_tooltip_target_dom).mouseenter(function(){
                    view.change_status_background('enter', $(this));
                }).mouseleave(function(){
                    view.change_status_background('leave', $(this));
                });
                $(submit_ranking_list_tooltip_target_dom).mouseenter(function(){
                    view.change_status_background('enter', $(this));
                }).mouseleave(function(){
                    view.change_status_background('leave', $(this));
                });
                $(lock_ranking_list_tooltip_target_dom).mouseenter(function(){
                    view.change_status_background('enter', $(this));
                }).mouseleave(function(){
                    view.change_status_background('leave', $(this));
                });
            },
            bind_rank_status_click_events: function(container_object){
                container_object.find('.build_ranking_status').click(function() {
                    if(!$(this).hasClass('disabled_status') && !$(this).hasClass('rank_status_selected')) {
                        view.display_back_btn_warning_dialog();
                    }
                });

                container_object.find('.submit_ranking_status').click(function() {
                    if(!$(this).hasClass('disabled_status')) {
                        var $button = container_object.find('.start_ranking');
                        if($button.length > 0) {
                            $button.click();
                        }
                        else {
                            container_object.find('.rank_unlock_btn').click();
                        }
                    }
                });

                container_object.find('.lock_ranking_status').click(function() {
                    if(!$(this).hasClass('disabled_status')) {
                        container_object.find('.lock_ranking_btn').click();
                    }
                });
            },
            change_status_background: function(action_type, hover_target){
                if(hover_target.hasClass('disabled_status')) {
                    action_type = 'disable';
                }
                
                var status_bar = view.div.find('.rank_status_bar');
                if (view.div.find('.rank_edit').length > 0){
                    if (action_type === 'enter'){                       
                        if (hover_target.hasClass('submit_ranking_status')){
                            status_bar.css('background-position','0px -171px');
                        }else if (hover_target.hasClass('lock_ranking_status')){
                            status_bar.css('background-position','0px -195px');
                        }else{
                            status_bar.css('background-position','0 0');
                        }                       
                    }else{
                        status_bar.css('background-position','0 0');
                    }
                }else if (view.div.find('.ranking_view').length > 0 || view.div.find('.my_ranking_view').length > 0){                   
                    if (action_type === 'enter'){                       
                        if (hover_target.hasClass('build_ranking_status')){
                            status_bar.css('background-position','0px -219px');
                        }else if (hover_target.hasClass('lock_ranking_status')){
                            status_bar.css('background-position','0px -243px');
                        } else {
                           status_bar.css('background-position','0 -24px');
                        }                       
                     }else{
                         status_bar.css('background-position','0 -24px');
                     }
                 }else {
                     if (action_type === 'enter'){                      
                         if (hover_target.hasClass('build_ranking_status')){
                             status_bar.css('background-position','0px -267px');
                         }else if (hover_target.hasClass('submit_ranking_status')){
                             status_bar.css('background-position','0px -291px');
                         } else {
                             status_bar.css('background-position','0 -48px');
                         }                      
                     }else{
                         status_bar.css('background-position','0 -48px');
                     }
                }
            },
            
            check_duplicate_option: function(new_option_value, rank_option_id) {
                var all_options = view.div.find('.rank_option_title');
                var is_duplicated = false;
                if (all_options.length !== 0) {             
                    all_options.each(function(){
                       if (($.trim($(this).text())) === $.trim(new_option_value) && is_duplicated === false && rank_option_id !== $(this).parent().attr('id')){
                           is_duplicated = true;                            
                       }                        
                    });                 
                }
                return is_duplicated;
            }
        };
        
        controller = {
            /**
         * Initialization method.  Copies the data from the initialData parameter
         * into the container div and initializes the view.
         */
            init: function() {
                waveCont.init();
                console.log(initialData);
                // persist the data on the container div
                $.each(initialData, function(key, value) {
                    view.div.data(key, value);
                });
                
                view.add_status_bar();                              
                
                if (isReadOnly) {
                    view.show_results_view(true);
                } else if (initialData.published) {
                    if (initialData.locked) {
                        view.show_results_view(false);
                    }
                    else {                      
                        if (controller.check_current_user_ranking_status()) {                           
                            view.show_my_ranking_view();
                        } else {                            
                            view.show_ranking_view();
                        }
                    }
                } else {                                
                    view.show_edit_view();
                    if (view.div.find('.rank_title').text() !== view.default_rank_statement){                       
                        view.div.find('.rank_title').css('color', '#333333'); 
                    }
                }                
                return controller;
            },
            
            check_current_user_ranking_status: function(){
                var rankings = view.div.data('rankings');
                var is_current_user_ranked = false;             
                $.each(rankings, function(user_id, ranking){
                    if (user_id === CSTAR.current_user.uuid){                   
                        if (ranking.length > 0){                            
                            is_current_user_ranked = true;
                            return is_current_user_ranked;
                        }
                        
                    }
                });
                
                return is_current_user_ranked;
            },
            
            /**
         * Calculates the final ranking using the bayesian_avg function (see below).
         * This function attaches the results (an ordered array of options) to the
         * view.div jQuery data as "results".
         */
            calculate_results: function() {
                var rankings = view.div.data('rankings'),
                    user_rankings = {},
                    ranks_by_id = {},
                    results = view.div.data('options').slice(), // copy
                    sum_ratings = 0,
                    count_ratings = 0,
                    count_options = 0,
                    count_ranked_users = 0,
                    avg_num_ratings,
                    avg_rating;
                
                $.each(rankings, function(user_id, ranking) {
                    user_rankings[user_id] = {};
                    
                    $.each(ranking, function(i) {
                        var option_id = this.id,
                            rank = i + 1;

                        user_rankings[user_id][this.id] = rank;
                        
                        if (!ranks_by_id[option_id]) {
                            ranks_by_id[option_id] = [];
                            count_options++;
                        }
                        
                        sum_ratings += rank;
                        count_ratings++;
                        
                        ranks_by_id[option_id].push(rank);
                    });
                    
                    if (ranking.length > 0){
                        count_ranked_users++;
                    }
                });
                
                avg_num_ratings = count_ratings / count_options;
                avg_rating = sum_ratings / count_ratings;
                
                $.each(results, function() {
                    var ranks = ranks_by_id[this.id];
                    this.rating = bayesian_avg(ranks, avg_num_ratings, avg_rating);
                    this.rankings = ranks;
                });
                
                view.div.data('results', results.sort(function(item1, item2) {
                    var diff = item1.rating - item2.rating;
                    // sort by rating value first, then fall back to alphabetical
                    if (diff !== 0) {
                        return diff;
                    }
                    else {
                        // sort by option name
                        return compare_alphabetically(item1, item2);
                    }
                }));
                
                view.div.data('user_rankings', user_rankings); // store user rankings
                view.div.data('num_submissions', count_ranked_users); // store number of submissions
            },
            
            submit_rankings: function(ranking_order) {
                var rankings = view.div.data('rankings'),
                    has_ranking = !!rankings[ts.getViewerId()];
                
                // persist the ranking
                rankings[ts.getViewerId()] = ranking_order;
                
                // submit to server
                proxy.submit_rankings(ranking_order, has_ranking);
                
                view.div.find('.rank_holder').remove();
                view.div.find('.rank_view_back_btn_container').remove();
                view.div.removeData('ranking_changed');
                view.div.removeData('options_changed');
                view.show_my_ranking_view();
            },
            
            publish: function(title, options) {
                view.div.data('title', title);
                view.div.data('options', options);
                view.div.data('published', true);
                
                // send to server
                proxy.publish(title, options);               
                return true;
            },          
            
            remove_option: function(id, broadcast) {               
                var options = view.div.data('options'),
                    idx = get_option_index(options, id);
                if (idx === null) {
                    return;
                }
                
                options[idx].value.deleted = true;             
                if (broadcast) {                
                    proxy.remove_option(options[idx]);
                } else {                    
                   view.remove_ranking_option(id);
                   view.disable_start_ranking_button();
                }
                controller.options_changed();
            },
            
            add_option: function(option, broadcast) {
                var options = view.div.data('options'),
                    exists = get_option_index(options, option.id) !== null;
                
                if (exists) {
                    return;
                }
                
                // flag this has been added
                option.value.added = true;
                options[options.length] = option;
                
                if (broadcast) {
                    proxy.add_option(option);
                }
                else {
                    // in the case where we broadcast the change, the option was 
                    // already added
                    var new_option = $.extend(true, {is_new:true}, option);
                    view.add_option_input(new_option);                   
                }

                controller.options_changed();                
                view.flutter_option(option.id);
            },
            
            edit_option: function(option, broadcast) {
                var options = view.div.data('options'),
                    option_index = get_option_index(options, option.id),
                    org_option = options[option_index],
                    old_title = org_option.value.title,
                    exists = option_index !== null;
                
                if (!exists) {
                    return;
                }
                
                // flag this has been edited
                option.value.edited = true;
                
                // preserve any other information
                $.extend(true, org_option.value, option.value);                
                
                if (broadcast) {                    
                    view.update_option_title(option);
                    proxy.edit_option(option, old_title);                   
                } else {                                        
                    view.update_option_title(option);                   
                }
                
                controller.options_changed();                
            },
            
            update_title: function(title, broadcast) {
                view.div.data('title', title);
                view.update_title();
                if (broadcast) {
                    proxy.update_title(title);
                }
            },
            
            clear_users_rank_list: function(broadcast) {              
                if (broadcast) {                    
                    proxy.clear_users_rank_list();
                }else {
                    view.div.data('locked', false);
                    view.back_button_trigger_actions('back');
                }
            },
            
            remove_my_ranking: function(broadcast, user_id){              
                var rankings = view.div.data('rankings'),
                    issuer_id = ts.getViewerId();
                if (user_id !== null) {                  
                    issuer_id = user_id;                    
                }                    
                
                // persist the ranking
                rankings[issuer_id] = [];                
                view.div.data('rankings', rankings);
                
                if (user_id === ts.getViewerId()){
                    view.back_button_trigger_actions('rank');           
                 } else {
                    controller.calculate_results();                   
                    if (view.div.find('.ranking_view').length < 1) {
                        view.update_results();
                    }
                    view.update_submission_count();
                 }
                
                if (broadcast) {                  
                    proxy.remove_my_ranking();
                }               
            },            
            
            get_ordered_options: function() {
                var rankings = view.div.data('rankings'),
                    my_ranking = rankings[ts.getViewerId()],
                    option_list = view.div.data('options'),
                    options_changed = false;
                
                if (!my_ranking) {
                    // no user ranking -- order alphabetically
                    return option_list.sort(compare_alphabetically);
                }
                
                var option_hash = {},
                    remainder = [],
                    results = [];
                
                // hash the options
                $.each(option_list, function(i) {
                    option_hash[this.id] = $.extend(true, {}, this);
                });
                
                $.each(my_ranking, function() {
                    var option_id = this.id,
                        option = option_hash[option_id],
                        deleted = option.value.deleted,
                        modified = this.timestamp != option.value.timestamp;

                    if (deleted || modified) {
                        options_changed = true;
                    }
                    
                    results[results.length] = option;
                    option_hash[option_id] = null;
                });
                
                $.each(option_hash, function(id, option) {
                    if (option && !option.value.deleted) {
                        options_changed = true;
                        option.is_new = true;
                        remainder[remainder.length] = option;
                    }
                });
                
                view.div.removeData('ranking_changed');
                view.div.data('options_changed', options_changed);
                
                remainder.sort(compare_alphabetically);
                return results.concat(remainder);
            },
            
            lock: function(locked, broadcast) {
                var current_value = view.div.data('locked'),
                    new_value = locked;
            
                if (new_value == current_value) {
                    return;
                }
                
                view.div.data('locked', new_value);
                view.toggle_locked(new_value);
                
                if (broadcast) {
                    proxy.lock(locked);
                }
            },
            
            list_changed: function() {
                view.div.data('ranking_changed', true);
                view.update_row_backgrounds();
            },
            
            options_changed: function() {
                view.div.data('options_changed', true);
                view.update_row_backgrounds();
            },
            
            
            /**
         * Syncs the UI with the data model for a give option
         */
            revert_option_text: function(id) {
                var options = view.div.data('options'),
                    option_index = get_option_index(options, id),
                    option = option_index!==null ? options[option_index] : null;
                
                // apply the currently saved option title/timestamp to the view
                if (option) {
                    view.update_option_title(option);
                }
            },
            
            notify_publish: function(data) {
                var actions = data.actions;
                
                $.each(actions, function() {
                    var action = this.action, 
                        path = this.params.path,
                        value = this.params.value;
                    
                    if (action != 'set_data') {
                        return; // sanity check
                    }
                    
                    // path will only be single property name
                    view.div.data(path, value);
                });
                
                view.div.find('.rank_holder').remove(); 
                view.div.find('.rank_edit').remove();
                view.div.find('.start_ranking').remove();
                view.div.find('.rank_view_back_btn_container').remove(); 
                view.show_ranking_view();
            },
            
            notify_clear_users_rank_list: function(){
                controller.clear_users_rank_list(false);
            },
            
            notify_remove_my_ranking: function(data){
                controller.remove_my_ranking(false, data.path[1]);
            },

            // ***** PBE notification handler *****
            notify_update_rankings: function(data) {
                var path = data.path,
                    uuid = path.length==2?path[1]:null,
                    value = data.value,
                    is_locked_view = false,
                    rankings = view.div.data('rankings');
                
                if (!uuid) {
                    return;
                }
                
                // update the data model
                rankings[uuid] = value;
                controller.calculate_results();
                
                // update the view
                if (view.div.find('.ranking_view').length < 1) {
                    
                    view.update_results();
                }
                view.update_submission_count();
            },          
            
            notify_add_option: function(data) {
                controller.add_option({id:data.id, value:data.value}, false);
            },
            
            notify_edit_option: function(data) {
                controller.edit_option({id:data.id, value:data.value}, false);
            },
            
            notify_remove_option: function(data) {
                controller.remove_option(data.id, false);
            },           
            
            notify_locked: function(data) {
                controller.lock(data.value, false);
            },
            
            notify_update_title: function(data) {
                controller.update_title(data.value, false);
            }
        };
        
        return controller.init();
    };
   
    /**
     * Calculate the "Bayesian average" (aka weighted average) for the given
     * array of rating values.  For more info on this algorithm, see
     * http://www.thebroth.com/blog/118/bayesian-rating and http://all-thing.net/bayesian-average.
     *
     * @param ratings_arr An array of numbers that represent the ratings for a single option
     * (the returned average corresponds to this option).
     * @param avg_num_votes The average number of votes (aka rankings) for all options
     * @param avg_rating The average rating value for all options
     *
     * @return A Number representing the weighted value for the option, or null if the
     * option received 0 ratings.
     */
    function bayesian_avg(ratings_arr, avg_num_votes, avg_rating) {
        if (!ratings_arr || !ratings_arr.length) {
            return null;
        }
        
        var this_rating = average(ratings_arr),
            this_num_votes = ratings_arr.length;
        
        return (avg_num_votes * avg_rating + this_num_votes * this_rating) /
        (avg_num_votes + this_num_votes);
    }
    
    /**
     * Calculates the mean value of an array of numbers.
     *
     * @param arr Array containing number values (no nulls)
     * @return Number representing the mean value of the input
     */
    function average(arr) {
        var len = arr.length,
            count = 0;
        for (var i = 0; i < len; i++) {
            count += arr[i];
        }
        return count / len;
    }
    
    // return current timestamp
    function get_timestamp() {
        return new Date().getTime();
    }
    
    function get_option_index(option_list, option_id) {
        var idx = null;
        
        $.each(option_list, function(i) {
            if (this.id == option_id) {
                // found the option
                idx = i;
                return false;
            }
        });
        
        return idx;
    }
    
    function generate_id() {
        var chars = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","1","2","3","4","5","6","7","8","9","0"];
        var rand = Math.random, flr = Math.floor;
        var id = [];
        var i;
        for (i = 0; i < 12; i++) {
            id[i] = chars[flr(rand() * 62)];
        }
        return id.join('');
    }
    
    function compare_alphabetically(option1, option2) {
        var title1 = option1.value.title?option1.value.title.toLowerCase():'',
            title2 = option2.value.title?option2.value.title.toLowerCase():'',
            eq = title1 == title2;
        return eq?0:(title1 < title2)?-1:1;
    }
    
    /**
     * Given an text input element, this function will add a class ("rank_placeholder_text")
     * to signify that the element contains default placeholder text.  When the user
     * changes the value of the input, the class will be removed.
     *
     * @param input jQuery object containing a text input element
     */
    function make_placeholder(input) {
        // initialize the data on the element
        input.addClass('rank_placeholder_text')
            .one('focus', function(evt) {
                $(this).removeClass('rank_placeholder_text').val('');
            });
    }
   
    
})();
