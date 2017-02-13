/* JET: version = 1.8.0, released date = 19/09/2014 */

// Streaming Quotes subsystem
JET.extend(0, "Quotes", function(utils) {
    var lastSubID = 0;
    var baseSubID = ((new Date()).getTime() + "");
    var subscriptions = {};
    var statusMap = {
        0: "PENDING",
        1: "OK",
        2: "STALE",
        3: "INFO",
        4: "CLOSED",
        5: "DELAYED",
        6: "NOPERM",
        7: "REACHLIMIT",
        8: "C_COMPLETE",
        9: "C_CLOSE",
        10: "C_EMPTY",
        11: "C_NOTCHAIN",
        12: "C_ERR",
        13: "C_NOBEGIN",
        14: "C_NOEND"
    }; 

    JET.onLoad(function() {
        if (JET.ContainerDescription && JET.ContainerDescription.GUID) {
            baseSubID = JET.ContainerDescription.GUID;
        }
    });

    // JET.Quotes.newSubscription()
    // Creates a new blank subscription. 
    // The subscription should then be configured. After that it can be started, paused, resumed and finally stoped.
    // Each method returns the subscription object back, so method calls can be chained.
    // Example:
    // var s = JET.Quotes.newSubscription()
    //      .rics(".DJI", "IBM")
    //      .fieldFormat("CF_NETCHNG", 2)
    //      .onUpdate(function(upd) { console.log(upd); })
    //      .start()
    //  ...
    //  s.stop()
    function newSubscription(subscriptionID) {
        // ID generation and management
        var channelID = baseSubID + (lastSubID++);
        var id = typeof(subscriptionID) != 'undefined' ? subscriptionID : channelID;

        if(subscriptions[id]) {
            console.error("Subscription with ID = " + id + " already exists");
            return {
                create : newSubscription,
                get : function(subscriptionID) {
                   return subscriptions[subscriptionID];
                }
            }
        }

        // Internal state
        var request = { a: "sub", c: "/MD/" + channelID, f : {}, rf : []};//dm:data model, default is mp (marketprice)
        var subscriptionHandle = null;
        var newRowHandler;
        var removeRowHandler;
        var updateHandler;
        var updateChainHandler;
        var batchStartHandler;
        var batchFinishHandler;
        var errorHandler;
        var updateBatch = false;
        var isSubscribed = false;
        var isPaused = false;
        var atLeastOneFieldSpecified = false;
        var ricToRowIndex = {};
        var rowToRicIndex = [];
        var symbolState = {};
        var rangeTrackedFields = {};
        var isStartPaused = false;
        var pauseOnDeactivate = true;

        function lock(f) {
            var queue = [];

            setInterval(function() {
                while(queue.length > 0) {
                    var args = queue.shift();
                    f.apply(args[0], args[1]);
                }
            }, 100);

            return function() {
                queue.push([this, arguments]);
            };
        } 

        function callNewRowHandler(ric, fields, index) {
            if (newRowHandler) {
                utils.debug("Calling JET.Quotes onNewRow handler. Parameters:", ric, fields, index);
                newRowHandler(subscription, ric, fields, index);
            }
        }

        function callUpdateHandler(ric, fields, index) {
            if (updateHandler) {
                utils.debug("Calling JET.Quotes onUpdate handler. Parameters:", ric, fields, index);
                updateHandler(subscription, ric, fields, index);
            }
        }

        function handleEvents(events) {
            for(var eventN = 0; eventN < events.length; eventN++) {
                var event = events[eventN];
                if (!event) {
                    continue;
                }
                var ricState = symbolState[event.s] || {};
                switch(event.e) {
                    case 0: // Add item
                            while(event.i > rowToRicIndex.length) {
                                callNewRowHandler(null, {}, rowToRicIndex.length);
                                rowToRicIndex.push(null);
                            }

                            ricToRowIndex[event.s] = event.i;   
                            rowToRicIndex[event.i] = event.s;

                            if (event.i == rowToRicIndex.length - 1) {
                                callNewRowHandler(event.s, ricState, event.i);
                            } else {
                                callUpdateHandler(event.s, ricState, event.i);
                            }
                        break;
                    case 1: // Remove item
                            delete ricToRowIndex[event.s];

                            if(removeRowHandler) {
                                utils.debug("Calling JET.Quotes onRemoveRow handler. Parameters:", event.s, ricState, event.i);
                                removeRowHandler(subscription, event.s, ricState, event.i);
                            }
                        break;
                    case 2: // Update row
                            if (event.ps && ricToRowIndex[event.ps] == event.i) {
                                delete ricToRowIndex[event.ps];
                            }
                            ricToRowIndex[event.s] = event.i;
                            rowToRicIndex[event.i] = event.s;

                            callUpdateHandler(event.s, ricState, event.i);
                        break;
                }
            }
        }

        function handleUpdates(multiUpdate) {
            var updates = [];
            for(var updateN = 0; updateN < multiUpdate.length; updateN++) {
                var ricUpdate = multiUpdate[updateN];
                symbolState[ricUpdate.s] = symbolState[ricUpdate.s] || {};
                var ricState = symbolState[ricUpdate.s];
                var rowN = ricToRowIndex[ricUpdate.s];
                if (rowN != null) {
                    var update = {};

                    for(var fieldName in (ricUpdate.u || {})) {                       
                        var formattedValue = ricUpdate.u[fieldName];

                        ricState[fieldName] = ricState[fieldName] || {};
                        ricState[fieldName].formatted = formattedValue;

                        update[fieldName] = update[fieldName] || {};
                        update[fieldName].formatted = formattedValue;
                    }

                    for(var fieldName in (ricUpdate.ru || {})) {
                        var rawValue = ricUpdate.ru[fieldName];

                        if (rawValue === null) {
                            rawValue = 0;
                        }

                        ricState[fieldName] = ricState[fieldName] || {};
                        ricState[fieldName].raw = rawValue;

                        update[fieldName] = update[fieldName] || {};
                        update[fieldName].raw = rawValue;

                        var minMax = rangeTrackedFields[fieldName];
                        if (minMax) {
                            minMax.min = Math.min(minMax.min, rawValue);
                            minMax.max = Math.max(minMax.max, rawValue);
                        }
                    }

                    if(updateHandler) {
                        updates.push([ricUpdate.s, update, rowN]);
                    }
                }
            }

            // Update handlers invocation is delayed because we want get min/max values only when the whole batch is processed.
            if( updateBatch === true ) {
                callUpdateHandler(updates);
            } else {
                for(var updateN = 0; updateN < updates.length; updateN++) {
                    var upd = updates[updateN];
                    callUpdateHandler(upd[0], upd[1], upd[2]);
                }
            }
        }

        // Parameter validation helpers
        function denyOnStarted() {
            if (isSubscribed) {
                throw "Can't change subsription configuration of started subsription";
            }
        }

        function checkParameter(value, paramName, type, optional) {
            if (optional && typeof(value) == "undefined") {
                return;
            }
            if (value === "" || value === null || typeof(value) !== type) {
                throw "Parameter '" + paramName + "' must be a " + type;
            }
        }

        function parseArgumentsList(parameters, optionalType) {
            var args = Array.prototype.slice.call(parameters, 0);

            function throwBadArgs() {
                throw "Invalid arguments. List of strings: f('a','b','c') or array f(['a','b','c']) are supported."                
            }

            var result = {
                list : [],
                optional : null
            };

            if (args.length < 1) {
                throwBadArgs();
            }

            if (args !== null && args.length > 0 && typeof args[0] !== "undefined" && Object.prototype.toString.call(args[0]) === '[object Array]') {
                result.list = args.shift();
                for (var n = 0; n < result.list.length; n++) {
                    var item = result.list[n];
                    if (!item || !(typeof item == "string") || item == "") {
                        throwBadArgs();
                    }
                }
            } else {
                while (args.length > 0 && typeof args[0] == "string" && args[0] != "") {
                    result.list.push(args.shift());
                }
            }

            if (optionalType && args.length > 0 && (typeof args[0] == optionalType)) {
                result.optional = args.shift();
            }

            if (args.length > 0) {
                throwBadArgs();
            }

            return result;
        }

        // Public interface
        var subscription = { 
            id: id,
            // Adds on or several RICs to the subsription. You can pass strings or arrays of strings.
            // Examples:
            // subscription.rics(".DJI", "IBM")
            // subscription.rics(["MSFT.n", "IBM"])
            rics: function() {  
                denyOnStarted();

                if (request.ch) {
                    console.error("Can't subscribe to both RIC list and a chain");
                    return this;
                }               

                var params = parseArgumentsList(arguments);

                request.s = (request.s || []).concat(params.list);

                return this;
            },
            // Specifies a chain for the subscription
            // Only one chain can be specified.
            // You can use either rics or chain.
            // Example: subscription.chain("0#.FCHI")
            chain: function(chain) {
                checkParameter(chain, "chain", "string");
                denyOnStarted();
                if (request.s) {
                    console.error("Can't subscribe to both RIC list and a chain");
                    return this;
                }

                request.ch = chain;
                return this;
            },
            
            dataModel: function(dm) {
                checkParameter(dm, "dm", "string");
                denyOnStarted();
                request.dm = dm;
                return this;
            },
            
            feedName: function(df) {
                checkParameter(df, "df", "string");
                denyOnStarted();
                request.df = df;
                return this;
            },
            
            feedAlias: function(kl) {
                checkParameter(kl, "kl", "string");
                denyOnStarted();
                request.kl = kl;
                return this;
            },
            
            
            // Adds a raw (unformatted) field to the subscription.
            // Example: subscription.rawField("CF_BID")
            rawFields: function() {
                denyOnStarted();

                var params = parseArgumentsList(arguments);

                utils.each(params.list, function(field) {
                    for(var n = 0; n < request.rf.length; n++) {
                        if (request.rf[n] == field) {
                            return this;
                        }
                    }

                    request.rf.push(field);

                    if (!(field in request.f)) {
                        request.f[field] = "";
                    }

                    atLeastOneFieldSpecified = true;
                });

                return this;
            },
            // Adds a formatted field to the subscription.
            // The second optional parameter specifies decimal precision.
            // Examples: 
            //      subscription.formattedField("CF_NETCHNG")
            //      subscription.formattedField("CF_LAST", 2)
            formattedFields: function() {
                denyOnStarted();

                var params = parseArgumentsList(arguments, "number");

                var format = "";

                if (params.optional != null) {
                    format = "%." + Math.floor(params.optional) + "f";
                }

                utils.each(params.list, function(field) {
                    request.f[field] = format;
                    atLeastOneFieldSpecified = true;                    
                })

                return this;
            },
            // Enables tracking of min/max values for certain fields.
            // Min and max values can be obtain with getMin/getMax function after subscription will be started.
            rangeTracking: function() {
                denyOnStarted();

                utils.each(parseArgumentsList(arguments).list, function(field) {
                    rangeTrackedFields[field] = {
                        min: Infinity,
                        max: -Infinity
                    };
                });

                return this;
            },
            // Specifies sorting options for the subscription
            // The second optional parameter specifies sorting direction: 0 for Ascending, 1 for descending
            // Example: 
            //      subsciption.sort("CF_NAME", 1) // Sort by CF_NAME descending
            sort: function(field, direction) {
                checkParameter(field, "field", "string");
                checkParameter(direction, "direction", "number", true);
                denyOnStarted();

                request.sf = field;
                request.sd = (direction == 1) ? 1 : 0;
                return this;
            },
            // Specifies range filter for the subscription
            // Example:
            //      subscription.filter(2,10) // Display 10 records starting from record #2 (counting from 0)
            filter: function(start, count) {
                checkParameter(start, "start", "number");
                checkParameter(count, "count", "number");
                denyOnStarted();

                request.bi = start;
                request.di = count;
                return this;
            },
            onNewRow: function(handler) {
                checkParameter(handler, "handler", "function");
                newRowHandler = handler;
                return this;
            },
            onRemoveRow: function(handler) {
                checkParameter(handler, "handler", "function");
                removeRowHandler = handler;
                return this;
            },
            onUpdate: function(handler, batch) {
                checkParameter(handler, "handler", "function");
                updateBatch = (batch === true) ? true : false;
                updateHandler = handler;
                return this;
            },
            onChainUpdate: function(handler) {
            checkParameter(handler, "handler", "function");
                updateChainHandler = handler;
                return this;
            },
            onBatchStart: function(handler) {
            checkParameter(handler, "handler", "function");
                batchStartHandler = handler;
                return this;
            },
            onBatchFinish: function(handler) {
                checkParameter(handler, "handler", "function");
                batchFinishHandler = handler;
                return this;
            },
            onError: function(handler) {
                checkParameter(handler, "handler", "function");
                errorHandler = handler;
                return this;
            },            
            // Starts subscription
            start: function() {
                if (!JET.Loaded) {
                    JET.onLoad(this.start);
                    return this;
                }
                
                if (!isSubscribed) {
                    if (!(request.s || request.ch) || !atLeastOneFieldSpecified) {
                        console.error("Chain or a RICs and at least one field should be specified to start a subscription");
                        return this;
                    }
                    
                    var c = JET.ContainerDescription;
                    if (c.major<8?0:(c.minor == 0 && c.build < 55?0:1))
                    {
                        if (!JET.isActive())
                        {
                            isStartPaused = true;
                            return this;
                        }
                    }
                    //Fill row numbers lookup for static RICs sets
                    var rics = (request.s || []);
                    for(var ricN = 0; ricN < rics.length; ricN++) {
                        ricToRowIndex[rics[ricN]] = ricN;
                    }   
                    var sub = this;
                    var mainHandler = function(event) {
                        // Can't use this because of invalid JSON data sent by the desktop
                        // var data = JSON.parse(event); 
                        var data = eval("(function(){return " + event + ";})()");

                        if (data.a == "e") {
                            handleEvents(data.me);
                        } else if (data.a == "u") {
                            if (batchStartHandler && data.mu.length > 1) {
                                batchStartHandler();
                            }                            
                            handleUpdates(data.mu);
                            if (batchFinishHandler && data.mu.length > 1) {
                                batchFinishHandler();
                            }                            
                        } else if (data.a == "s") {
                            if (data.s) { // Symbol status
                                symbolState[data.s] = symbolState[data.s] || {};
                                var state = symbolState[data.s];
                                var status = {
                                            formatted: statusMap[data.st],
                                            raw: data.st
                                        };                                       
                                state["STATUS"] = status;
                                rowN = ricToRowIndex[data.s];
                                if (rowN != null) {
                                    if (updateHandler) {
                                        updateHandler(subscription, data.s, {
                                            "STATUS" : status
                                        }, rowN);
                                    }
                                }
                            } else { // TODO: Chain status
                                if (updateChainHandler) {
                                    var status = {
                                        formatted: statusMap[data.st],
                                        raw: data.st
                                    };
                                    updateChainHandler(subscription, data.ch, { "STATUS" : status });
                                }
                            }
                        } else if(data.a == 'gme') {
                            //{"a":"gme","err":{"errorcode":x,"description":"xxx"}}
                            if(errorHandler) errorHandler(subscription, data.err.errorcode, data.err.description);
                        }
                    };

                    subscriptionHandle = JET.subscribe(request.c, mainHandler);
					JET.publish("/MD/ControlChannel", JSON.stringify(request));
                    isSubscribed = true;
                    isPaused = false;
                    isStartPaused = false;
                }
                return this;
            },
            // Stops subscription
            stop: function() {
                if (isSubscribed) {
					JET.publish("/MD/ControlChannel", JSON.stringify({ "a": "unsub", "c": request.c }));
                    subscriptionHandle.unsubscribe();
                    isPaused = false;
                    isSubscribed = false;
                    isStartPaused = false;
                }
                return this;
            },

            // Pauses subscription
            pause: function() {
                if(isSubscribed && !isPaused) {
					JET.publish("/MD/ControlChannel", JSON.stringify({ "a": "p", "c": request.c }));
                   isPaused = true;
                }
                return this;
            },
            
            sendGenericMessage: function(msgName,msgPayload) {
                if(isSubscribed && !isPaused) {
					JET.publish("/MD/ControlChannel", JSON.stringify({ "a": "sendgenmsg", "msgname": msgName, "msgpayload": msgPayload, "s": request.s, "c": request.c}));
                }
                return this;
            },

            sendGenericJSONMessage: function(json) {
                return this.sendGenericMessage("CUSTOM_APP_OMM_JSON", JSON.stringify(json));
            },

            // Resumes paused subscription
            resume: function() {
                if (isStartPaused) this.start();
                else if (isSubscribed && isPaused) {
					JET.publish("/MD/ControlChannel", JSON.stringify({ "a": "r", "c": request.c }));
                    isPaused = false;
                }
                return this;
            },

            pauseOnDeactivate: function(isPausedOnDeactivate) {
                pauseOnDeactivate = isPausedOnDeactivate;
                return this;
            },

            // Activate the subscription (used when the app is activated)
            activate: function() {
                if (pauseOnDeactivate) {
                    this.resume();
                }
                return this;
            },

            // De-Activate the subscription (used when the app is deactivated)
            deactivate: function() {
                if (pauseOnDeactivate) {
                    this.pause();
                }
                return this;
            },

            // State-fetching functions 
            getFieldsValues: function(ric) {
                if (ric) {
                    return symbolState[ric];
                } else {
                    return {};
                }
            },

            getRange: function(field) {
               checkParameter(field, "field", "string");
               return rangeTrackedFields[field];
            },

            getLineRic: function(line) {
               checkParameter(ric, "line", "number");
               return rowToRicIndex[line];
            }
        };

        // Stop on window reload/close; pause/resume on window visibility changes.
        
        JET.onUnload(function() { subscription.stop(); });

        if (JET.onActivate) {
			JET.onActivate(function () {
				subscription.activate();
			});
		}

        if (JET.onDeactivate) {
			JET.onDeactivate(function () {
				subscription.deactivate();
			});
		}

        subscriptions[id] = subscription;

        if (Object.freeze) {
           Object.freeze(subscription);
        }

        return subscription; 
    }
    
    return {
        create : newSubscription,
        get : function(subscriptionID) {
           return subscriptions[subscriptionID];
        }
    }
});