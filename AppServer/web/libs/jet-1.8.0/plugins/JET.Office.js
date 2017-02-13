/* JET: version = 1.8.0, released date = 19/09/2014 */

//Office JET extension to handle Excel/Power point related events. It supports
//1. Export data to excel.
//2. Cell Reference
//3. Get Active Cell Value
//4. Parent object - Excel for now.

JET.extend(0, "Office", function (utils) {
    var subscriptions = {};
    var baseSubId = ((new Date()).getTime() + "");
    var eikonOfficeVersion = "1.0.0.0";
    var lastSubId = 0;
    var basechannel = "/Office/";
    var channel;
    var queue = new Array();
    var init = function () {
        JET.onLoad(function () {
            if (JET.ContainerDescription && JET.ContainerDescription.GUID) {
                baseSubId = JET.ContainerDescription.GUID;
            }
        })

        JET.onLoad(function () {
            JET.subscribe(basechannel + baseSubId, function (eventObj) {
                var data = eval("(function(){return " + eventObj + ";})()");
                if (data.a = "v") {
                    eikonOfficeVersion = data.v;
                }
            });
            var params = { a: "v", c: basechannel + baseSubId, v: JET.Office.version };
			JET.publish(basechannel + baseSubId, JSON.stringify(params));
        })
    }
    var validateParameter = function (value, paramName, type, optional) {
        if (optional && typeof (value) == "undefined") {
            return;
        }
        if (value === "" || value === null) {
            throw "Invalid argument. Parameter '" + paramName;
        }
    };
    var seed = function () {
        return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
    };
    var GenerateUniqueId = function () {
        return seed() + seed() + '-' + seed() + '-' + seed() + '-' +
         seed() + '-' + seed() + seed() + seed();
    };
    var generateChannelId = function () {
        return "Office-" + ((new Date()).getTime() + "");
    };
    var constructParamter = function (data, event, newchannel) {
        var cdata = undefined;
        if (data == undefined || data == null) {
            cdata = "";
        }
        else if (data.constructor === {}.constructor  || (typeof data) === "object") {
            cdata = JSON.stringify(data);
        }
        else {
            cdata = data.toString();
        }
        var c = channel;
        //In case of sync call it would have its own channel
        if (newchannel != undefined) {
            c = newchannel;
        }
        return JSON.stringify({ e: event, c: c, data: cdata });

    };
    var newInstance = function (title, summary) {
        if (JET.ContainerDescription && JET.ContainerDescription.GUID) {
            channel = basechannel + JET.ContainerDescription.GUID + "/";
        } else {
            channel = basechannel + GenerateUniqueId() + "/";
        }
        var id = baseSubId + (lastSubId++);
        var _isSubscribed = false;
        //Event handlers on receiving of data from container
        var _getCellHandler = undefined;
        var _onExecuteHandler = undefined;
        var _onActiveObjectHandler = undefined;
        var _onCellValueHandler = undefined;
        var _onFocusHandler = undefined;
        handleCommand = function (command) {
            if (command == undefined || command == "")
                return;
            var result = JSON.parse(command);
            //Make sure channel of office channel
            if (result.c == undefined || result.e == undefined || result.e == "" || ((result.e != "execute" || result.e == "cellReference") && result.c.indexOf("Office") < 0)) {
                return;
            }
            switch (result.e) {
                case "getCell":
                    {
                        if (_getCellHandler != undefined) {
                            _getCellHandler(result.data);
                        }
                        break;
                    }
                case "execute":
                    {
                        //get channel
                        if (result.c != channel && queue[result.c] != undefined) {
                            queue[result.c](result.data);
                        }
                        else if (_onExecuteHandler != undefined) {
                            _onExecuteHandler(result.data);
                        }
                        break;
                    }
                case "activeObject":
                    {
                        if (_onActiveObjectHandler != undefined) {
                            _onActiveObjectHandler(result.data);
                        }
                        break;
                    }
                case "cellReference":
                    {
                        if (result.c != channel && queue[result.c] != undefined) {
                            queue[result.c](result.data);
                        }
                        else if (_onCellValueHandler != undefined) {
                            _onCellValueHandler(result.data);
                        }
                        break
                    }
                case "setFocus":
                    {
                        if (_onFocusHandler != undefined) {
                            _onFocusHandler(result.data);
                        }
                        break;
                    }
                default:
                    {
                        break;
                    }
            }

        };
        var defaultHandler = function (eventObj) {
            //Make object is not null
            if (!eventObj) {
                return;
            }
            handleCommand(eventObj);
        };

        var _subscribeMe = function () {
            if (!_isSubscribed) {
                JET.subscribe(channel, defaultHandler);
                _isSubscribed = true;
            }
        };
        //Public interface methods
        var interface = {
            //Export data to Office
            insert: function (data) {
                if (!JET.Loaded) {
                    JET.onLoad(this.insert(data));
                    return this;
                }
                _subscribeMe();
                validateParameter(data, "input", "object", false);
                var d = constructParamter(data, "insert");
                JET.publish(channel, d);
            },
            getCell: function (r, c) {
                if (!JET.Loaded) {
                    JET.onLoad(this.getCell(r, c));
                    return this;
                }
                _subscribeMe();
                var d = constructParamter({ Row: r, Column: c }, "getCell");
                JET.publish(channel, d);
            },
            getAciveObject: function () {
                if (!JET.Loaded) {
                    JET.onLoad(this.getAciveObject());
                    return this;
                }
                _subscribeMe();
                var d = constructParamter(null, "activeObject");
                JET.publish(channel, d);
            },
            execute: function (data, handler) {
                if (!JET.Loaded) {
                    JET.onLoad(this.execute(data, handler));
                    return this;
                }
                _subscribeMe();
                validateParameter(handler, "input", "function", true);
                var cid = generateChannelId();
                if (handler != undefined) {
                    queue[cid] = handler;
                }
                var d = constructParamter(data, "execute", cid);
                JET.publish(channel, d);
            },
            subscribeCellReference: function (handler) {
                if (!JET.Loaded) {
                    JET.onLoad(this.subscribeCellReference(handler));
                    return this;
                }
                _subscribeMe();
                validateParameter(handler, "input", "function", true);
                var cid = generateChannelId();
                if (handler != undefined) {
                    queue[cid] = handler;
                }
                var d = constructParamter(null, "subscribeToCellReference", cid);
                JET.publish(channel, d);
            },
            unSubscribeCellReference: function () {
                if (!JET.Loaded) {
                    JET.onLoad(this.subscribeCellReference(handler));
                    return this;
                }
                _subscribeMe();
                var d = constructParamter(null, "unSubscribeToCellReference");
                JET.publish(channel, d);
            },
            dragStart: function (data) {
                if (!JET.Loaded) {
                    JET.onLoad(this.dragStart(data));
                    return this;
                }
                _subscribeMe();
                validateParameter(data, "input", "string", false);
                var d = constructParamter(data, "dragStart");
                JET.dragStart(d);
            },
            windowProperties:function(properties) {
                if (!JET.Loaded) {
                    JET.onLoad(this.windowProperties(properties));
                    return this;
                }
                _subscribeMe();
                var d = constructParamter(properties, "windowProperties");
                JET.publish(channel, d);
            },            
            closeWindow: function () {
                if (!JET.Loaded) {
                    JET.onLoad(this.closeWindow());
                    return this;
                }
                _subscribeMe();
                var d = constructParamter(null, "closeWindow");
                JET.publish(channel, d);
            },
            positionWindow:function(data) {
                if (!JET.Loaded) {
                    JET.onLoad(this.positionWindow(data));
                    return this;
                }
                _subscribeMe();
                var d = constructParamter(data, "positionWindow");
                JET.publish(channel, d);
            },
            onGetCellCallback: function (handler) {
                validateParameter(handler, "onGetCell-handler", "function");
                _getCellHandler = handler;
            },
            onExecuteCallback: function (handler) {
                validateParameter(handler, "onCell-handler", "function");
                _onExecuteHandler = handler;
            },
            onActiveObjectCallback: function (handler) {
                validateParameter(handler, "onActiveObject-handler", "function");
                _onActiveObjectHandler = handler;
            },
            onCellReferenceCallback: function (handler) {
                validateParameter(handler, "onCellValue-handler", "function");
                _onCellValueHandler = handler;
            },
            onSetFocusCallback: function (handler) {
                validateParameter(handler, "onFocus-handler", "function");
                _onFocusHandler = handler;
            }
        };

        return interface;
    }

    return { //Initialize 
        init: init,
        create: newInstance //Initialize and return instance of office object
    }
});
JET.Office.init(); //Self call to initialize the JET