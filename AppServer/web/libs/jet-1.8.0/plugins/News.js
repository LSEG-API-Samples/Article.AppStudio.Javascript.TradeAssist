/* JET: version = 1.8.0, released date = 19/09/2014 */

JET.extend(0, "News", function(utils) {
	var subscriptions = {};
	var lastSubID = 0;
	var baseSubID = ((new Date()).getTime() + "");
	var desktopVersion = "1.0.0.0";
	var applyWorkarounds = true;
	
	function init()
	{
	   JET.onLoad(function() {
			if (JET.ContainerDescription && JET.ContainerDescription.GUID) {
				baseSubID = JET.ContainerDescription.GUID;
			}
		})

		JET.onLoad(function(){
			JET.subscribe("/News/" + baseSubID, function (eventObj) {
				var data = eval("(function(){return " + eventObj + ";})()");
				if (data.a = "v") {
					desktopVersion = data.v
					applyWorkarounds = false;
				}
			});
			var params = { a: "v", c: "/News/" + baseSubID, v: "" };
			JET.publish("/News/ControlChannel", JSON.stringify(params));
		})
	}
	
	// Check before sending the appHit
	function sendAppHit(Title, Extend)
	{
		if(JET.appHit && JET.ID)
		{
			var id = JET.ID;
			if(Title.length + id.length + Extend.length  > 40){
				var NbElem = 40 - (Title.length + Extend.length);
				id = id.substr(0, NbElem);
			}

			JET.appHit("JETNews", "ve", Title + id + Extend);
		}
	};
	
	//Current number of items in top and bucket

	//helper function, allows to check presence and type of passed parameters
	//params: value - parameter value to check
	//paramName - name of parameter, is needed for error message
	//type - string that represents expected type of parameter
	//optional boolean value that indicate if parameter is optional
	function checkParameter(value, paramName, type, optional) {
		if (optional && typeof (value) == "undefined") {
			return;
		}
		if (value === "" || value === null || typeof (value) !== type) {
			throw "Invalid argument. Parameter '" + paramName + "' must be a " + type
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

        if (args !== null && args.length > 0 && typeof args[0] !== "undefined" && args[0].constructor == Array) {
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

	function lock(f) {
		var queue = [];

		setInterval(function() {
			while(queue.length > 0) {
				var args = queue.pop();
				f.apply(args[0], args[1]);
			}
		}, 100);

		return function() {
			queue.unshift([this, arguments]);
		};
	}
	
	function resolve(newsExpression, resolveCallback, returnOptions) {
		if (!JET.Loaded) throw new Error("JET.News cannot resolve any expression until JET is fully loaded !");
		if (!resolveCallback) throw new Error("Incorrect usage : JET.News.resolve needs a callback to notify upon resolving expression.");
		checkParameter(resolveCallback, "resolveCallback", "function");
		
		var id = baseSubID + (lastSubID++);
		var newsParams = { a: "aod",
			e: newsExpression,
			c: "/News/" + id
		}
		if (returnOptions != undefined)
		{
			checkParameter(returnOptions, "returnOptions", "object");
			var t = newsParams.t = {};
			t["l"] = !!returnOptions.languagesInDescription;
			t["t"] = !!returnOptions.languagesInTokens;
			t["c"] = !!returnOptions.commandLineContent;
			t["e"] = !!returnOptions.expertExpression;
			if("dataSource" in returnOptions)
			{
				t["s"] = returnOptions.dataSource;
			}

		}
		
		var subscriptionHandle = "";
		
		var callback = function(eventObj) {
			var data = eval("(function(){return " + eventObj + ";})()");
			resolveCallback({expressionDescription:data.m, expressionTokens:data.s, extras:data.x});
			subscriptionHandle.unsubscribe();
		}
		
		subscriptionHandle = JET.subscribe(newsParams.c, callback);
		JET.publish("/News/ControlChannel", JSON.stringify(newsParams));
	}

	// JET.News.NewSubscription()
	// Creates a new blank subscription. 
	// Then, the subscription should be configured. After that it can be paused, resumed,  stoped and so on.
	// Each method returns the subscription object back, so methods can be chained.
	// Example:
	// var s = JET.News.NewSubscription()
	//      .newsExpression("LEN")
	//      .basketSize(5)
	//      .SetNewsHandler(function(upd) { console.log(upd); })
	//      .Start()
	//  ...
	//  s.Stop()

	function newSubscription(subID) {
		// ID generation and management
		var id = subID ? subID : baseSubID + (lastSubID++);
		var restartID = 0;
		if (subscriptions[id] !== undefined) {
			throw "Subscription with ID = " + id + " already exists";
		}
		//private members
		var isSubscribed = false;
		var newsParams = { a: "sub",
			top: 1,
			b: 10,
			t: JET.News.newTemplate().getRawTemplate(),
			hh: "",
			hk: 1,
			hkl: "",
			dt: "dd-MMM-yyyy",
			tt: "hh:mm:ss"
		}
		var itemsCount = [0,0];
		var maxCounts = [0,0];

		var newsHandler;
		var appendHandler;
		var insertHandler;
		var deleteHandler;
		var clearHandler;
		var titleChangeHandler;
		var showNewsServiceStatusHandler;
		var showSubscriptionStatusHandler;
		var historicalNewsReceivedHandler;
		var subscriptionHandle;
		var isIndividualHandlersSet = false;
		var isCommonHandlerSet = false;
		var dateRangeExpression = "";
		var isStartPaused = false;


		function callInsertOrUpdate(command) {					
			if (command.i == itemsCount[command.tt]) {
				if (appendHandler) {
					utils.debug("Calling JET.News append handler. i:", command.i, " tt:", command.tt, " ht:", command.ht, " h:", command.h);
					appendHandler(command);
				}
			} else if(insertHandler) {	
				utils.debug("Calling JET.News insert handler. i:", command.i, " tt:", command.tt, " ht:", command.ht, " h:", command.h);
				insertHandler(command);
			}
		}

		function callDeleteHandler(command) {
			if (deleteHandler) {
				utils.debug("Calling JET.News delete handler. i:", command.i, " tt:", command.tt);
				deleteHandler(command);
			}
		}

		function callClearHandler(command) {
			if (clearHandler) {
				utils.debug("Calling JET.News clear handler. tt:", command.tt);
				clearHandler(command);
			}
		}

		function deleteExcessHeadlines(limit) {
			for(var n = 0; n < 2; n++) {
				while (itemsCount[n] > limit[n]) {
					callDeleteHandler({ tt: n, i: itemsCount[n] - 1 });
					itemsCount[n]--;
				}
			}
		};
		
		function callTitleChangeHandler(command) {
			if (titleChangeHandler) {
				utils.debug("Calling JET.News title change handler. title:", command.m);
				titleChangeHandler(command);
			}
		};
		
		function sendRequestForOtherHeadlines(ReqId, NumberOfHeadlines) {
				//Send the AppHits Usage Tracking 
				var action = "More";
				var dataSource = getDataSourceName(newsParams.ds);
				if(ReqId == "gn")
					action = "Newer";				
					
				sendAppHit(dataSource + action + "_" , "_" + NumberOfHeadlines.toString());
					
				maxCounts[1] += NumberOfHeadlines;
				JET.publish("/News/ControlChannel", JSON.stringify({ a: ReqId, c: newsParams["c"], nb: NumberOfHeadlines ? NumberOfHeadlines : -1 }));
		};		
			
		function sendSimpleRequest(ReqId) {
					JET.publish("/News/ControlChannel", JSON.stringify({ a: ReqId, c: newsParams["c"] }));
		};
		
		function getDataSourceName(ds) {
			var name = "";
			if(!ds){
				name = "NewsWire";
			}
			else{
				if(ds == 0)
					name = "NewsWire";
				else
					name = "NewsRoom";
			}
			return name;
		};	
		
		function handleCommand(command) {
			if (typeof(command.i) !== "undefined"){
				command.i--;
			}

			switch (command.a) {
				case "a":
					if (applyWorkarounds) {
						command.i = 0;
					} else {
						command.i = itemsCount[command.tt];
					}
					
					callInsertOrUpdate(command);
					itemsCount[command.tt]++;

					if (applyWorkarounds) {
						deleteExcessHeadlines(maxCounts);
					}
					break;
				case "i":
					callInsertOrUpdate(command);
					itemsCount[command.tt]++;

					if (applyWorkarounds) {
						deleteExcessHeadlines(maxCounts);
					}
					break;
				case "d":
					callDeleteHandler(command);
					itemsCount[command.tt]--;
					break;
				case "p":
					command.i = itemsCount[command.tt] - 1;
					callDeleteHandler(command);
					itemsCount[command.tt]--;
					break;
				case "c":
					if (typeof(command.tt) == "undefined") {
						command.tt = null;
					}
					var limit = [maxCounts[0], maxCounts[1]];
					if (command.tt != null) {
						limit[command.tt] = 0;
					} else {
						limit = [0,0];						
					}

					if (clearHandler) {
						if (command.tt != null) {
							itemsCount[command.tt] = 0;
							callClearHandler(command);
						} else {
							itemsCount = [0,0];						
							callClearHandler({a:"c", tt: 0});
							callClearHandler({a:"c", tt: 1});
						}
					} else {
						deleteExcessHeadlines(limit);
					}
					break;
				case "b":
					if (!command.c) {
						break;
					}
					for (var i = 0; i < command.c.length; i++) {
						handleCommand(command.c[i]);
					}
					break;
				case "s":
					if (showNewsServiceStatusHandler) {
						utils.debug("Calling JET.News onNewsServiceStatus handler", command);
						showNewsServiceStatusHandler(command);
					}
					break;
				case "st":
					if (showSubscriptionStatusHandler) {
						utils.debug("Calling JET.News onSubscriptionStatus handler", command);
						showSubscriptionStatusHandler(command);
					}
					break;
				case "hr": 
					if (historicalNewsReceivedHandler) {
						utils.debug("Calling JET.News onhistoricalNewsReceived handler");
						historicalNewsReceivedHandler();
					}
					break;
				case "e":
                    if (callTitleChangeHandler) {
                        utils.debug("Calling JET.News onTitleChange handler", command);
                        callTitleChangeHandler(command);
					}
			}
		};

		var defaultNewsHandler = function (eventObj) {
			if ((!eventObj)) {
				return;
			}

			var command = eval("(function(){return " + eventObj + ";})()");
			handleCommand(command);
		};

		//public interface object
		var subscription = {
			//Sets Template object for headline. Default template object can be obtained from:
			//JET.api.News.newTemplate() method and then configured
			//if template is not set before subscription was started default template object is used
			template: function (templateObject) {
				checkParameter(templateObject, "templateObject", "object");
				newsParams.t = templateObject.getRawTemplate();
				return this;
			},
			//Sets size of 'top' section of news headlines control. Defines how many headlines will be shown in top section as 'Realtime'
			topSize: function (size) {
				checkParameter(size, "size", "number");
				newsParams.top = size;
				return this;
			},
			//Sets size of 'basket' section of news headlines control. Defines how many headlines will be shown in basket
			basketSize: function (size) {
				checkParameter(size, "size", "number");
				newsParams.b = size;
				return this;
			},
			//Sets expression for selecting news headlines that will be received from container
			newsExpression: function (newsExpression) {
				checkParameter(newsExpression, "newsExpression", "string");
				if (dateRangeExpression.length > 0 && newsExpression.toLowerCase().indexOf("daterange:") >= 0)
					throw new Error("DateRange has been already defined by dateRange helper!");
				newsParams.e = newsExpression;
				return this;
			},

			//Sets Headline Highlight Expression
			highlightExpression: function (expressionString) {
				checkParameter(expressionString, "expressionString", "string");
				newsParams.hh = expressionString;
				return this;
			},

			//Sets type of keywords for highlight. Enumeration is defined in JET.News.HighlightKeyWordTypes
			highlightKeywordType: function (highlightKeywordType) {
				checkParameter(highlightKeywordType, "highlightKeywordType", "number");
				newsParams.hk = highlightKeywordType;
				return this;
			},
			
			//Sets string that contains words that should be highlighted
			highlightKeywords: function (HighlightKeywordsString) {
				checkParameter(HighlightKeywordsString, "HighlightKeywordsString", "string");
				newsParams.hkl = HighlightKeywordsString;
				return this;
			},

			//Sets string's template for date, like "dd-MMM-yyyy" (default value). More variants:
			//http://www.geekzilla.co.uk/View00FF7904-B510-468C-A2C8-F859AA20581F.htm
			dateTemplate: function (templateString) {
				checkParameter(templateString, "templateString", "string");
				newsParams.dt = templateString;
				return this;
			},

			//Sets string's template for time, like "hh:mm:ss" (default value). More variants:
			//http://www.geekzilla.co.uk/View00FF7904-B510-468C-A2C8-F859AA20581F.htm
			timeTemplate: function (templateString) {
				checkParameter(templateString, "templateString", "string");
				newsParams.tt = templateString;
				return this;
			},

			//Sets the flag for including Broker Research Headline
			setBrokerResearchHeadline: function () {
				newsParams.r = 1;
				return this;
			},

			//Clears the flag for including Broker Research Headline
			clearBrokerResearchHeadline: function () {
				newsParams.r = 0;
				return this;
			},
			
			//Sets the flag for including Broker Research Headline
			setNewsroomSource: function () {
				newsParams.ds = 1;
				return this;
			},			

			//Sets function that will receive original event string from the Container.
			//From this string all needed information can be obtained for further processing
			//In case if this handler is set, handlers for particular commands, like "append", "insert" cannot be set
			setNewsHandler: function (handler) {
				if (!isIndividualHandlersSet) {
					checkParameter(handler, "handler", "function");
					newsHandler = handler;
					isCommonHandlerSet = true;
					return this;
				}
				else {
					throw new Error("Common handler cannot be set, after any of individual handlers for commands had been set");
				}
			},

			//Initialize the Highlighting context
			setHighlighter: function(Pattern, HighlightObject )
			{
				checkParameter(Pattern, "Pattern", "string");
				checkParameter(HighlightObject, "HighlightObject", "object");
				newsParams.p = Pattern;
				newsParams.h = HighlightObject;
				return this;				
			},		

			dateRange: function (fromDate, toDate) {
				if (newsParams.e && newsParams.e.toLowerCase().indexOf("daterange:") >= 0)
					throw new Error("DateRange has already been defined in news expression!");
				if (!fromDate && !toDate) dateRangeExpression = "";
				else {
					if (fromDate) checkParameter(fromDate, "fromDate", "string");
					if (toDate) checkParameter(toDate, "toDate", "string");
					// prepare dateRange part of expression
					dateRangeExpression = ' AND DateRange:"' + (fromDate || "") + "," + (toDate || "") + '"';
				}
				return this;
			},

			//Sets handler for 'Append' command. Can not be used together with SetNewsHandler method.
			onAppend: function (handler) {
				if (!isCommonHandlerSet) {
					checkParameter(handler, "handler", "function");
					appendHandler = handler;
					isIndividualHandlersSet = true;
					return this;
				}
				else {
					throw new Error("Handler for 'Append' command, can not be set after common handler had been set");
				}
			},

			//Sets handler for 'Insert' command. Can not be used together with SetNewsHandler method.
			onInsert: function (handler) {
				if (!isCommonHandlerSet) {
					checkParameter(handler, "handler", "function");
					insertHandler = handler;
					isIndividualHandlersSet = true;
					return this;
				}
				else {
					throw new Error("Handler for 'Insert' command, can not be set after common handler had been set");
				}
			},

			//Sets handler for 'Delete' command. Can not be used together with SetNewsHandler method.
			onDelete: function (handler) {
				if (!isCommonHandlerSet) {
					checkParameter(handler, "handler", "function");
					deleteHandler = handler;
					isIndividualHandlersSet = true;
				return this;
				}
				else {
					throw new Error("Handler for 'Delete' command, can not be set after common handler had been set");
				}
			},
			
            //Sets handler for 'onTitleChange' command. Can not be used together with SetNewsHandler method.
            onTitleChange: function (handler) {
                if (!isCommonHandlerSet) {
                    checkParameter(handler, "handler", "function");
                    titleChangeHandler = handler;
                    return this;
                }
                else {
                    throw new Error("Handler for 'onTitleChange' command, can not be set after common handler had been set");
                }
            },
			
			//Sets handler for 'Clear' command. Can not be used together with SetNewsHandler method.
			onClear: function (handler) {
				if (!isCommonHandlerSet) {
				checkParameter(handler, "handler", "function");
				clearHandler = handler;
					isIndividualHandlersSet = true;
				return this;
				}
				else {
					throw new Error("Handler for 'Clear' command, can not be set after common handler had been set");
				}
			},

			onHistoricalNewsReceived: function(handler) {
				checkParameter(handler, "handler", "function");
				historicalNewsReceivedHandler = handler;
				return this;
			},

			//Sets handler for 'Service' command. By this command container tells about status of news service.
			//Can not be used together with SetNewsHandler method.
			onNewsServiceStatus: function (handler) {
				if (!isCommonHandlerSet) {
					checkParameter(handler, "handler", "function");
					showNewsServiceStatusHandler = handler;
					isIndividualHandlersSet = true;
					return this;
				}
				else {
					throw new Error("Handler for 'ShowNewsServiceStatus' command, can not be set after common handler had been set");
				}
			},

			//Sets handler for 'Status' command. By this command container tells about status of subscription.
			//Can not be used together with SetNewsHandler method.
			onSubscriptionStatus: function (handler) {
				if (!isCommonHandlerSet) {
					checkParameter(handler, "handler", "function");
					showSubscriptionStatusHandler = handler;
					isIndividualHandlersSet = true;
					return this;
				}
				else {
					throw new Error("Handler for 'ShowSubscriptionStatus' command, can not be set after common handler had been set");
				}
			},

			//Starts subscription:
			// - Creates a channel by sending special message to container with subscription params
			// - Subscribes on created channel either method that was set by SetNewsHandler method or internel handler, that will call  handlers were set by 
			//   onAppend, onInsert etc..
			// - Stores descriptor of subscription and channel id
			// This method shouldn't be called multiple times, throws an exception if called for already started subscription. Restart method should be used for re-subscribing
			start: function () {
				if (!JET.Loaded) {
					JET.onLoad(this.start);
					return this;
				}
				
				if (!isSubscribed) {
					if (!newsParams.e) {
						throw "A news expression should be specified to start a subscription"
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
					
					//Send the AppHits Usage Tracking 
					var dataSource = getDataSourceName(newsParams.ds);
					sendAppHit(dataSource + "Sub_" , "_" + newsParams.b.toString());
					
					newsParams.c = "/News/" + id + "-" + restartID;
					restartID++;
					if (newsHandler) {
						subscriptionHandle = JET.subscribe(newsParams.c, function (eventObj) {
							var data = eval("(function(){return " + eventObj + ";})()");
							newsHandler(data);
						});
					}
					else {
						subscriptionHandle = JET.subscribe(newsParams.c, defaultNewsHandler);
					}

					maxCounts = { 0: newsParams.top, 1: newsParams.b };

					// save original expression from the parameters
					var e = newsParams.e;
					// modify expression string
					newsParams.e += dateRangeExpression;
					// subscribe to the news channel
					JET.publish("/News/ControlChannel", JSON.stringify(newsParams))
					// restore saved expression
					newsParams.e = e;

					isSubscribed = true
					var subscription = this;
		        
					isStartPaused = false;

			        utils.info("JET.News subscription started");
				}
				return this;
			},

			restart: function () {
				this.stop();
				this.start();
				
				//return this;
			},

			//Stops current subscription:
			// - Unsubscribes handler from channel
			// - Sends special message to container in order to inform it about unsubscribing
			stop: function () {
				if (isSubscribed) {
					JET.publish("/News/ControlChannel", JSON.stringify({ a: "unsub", c: newsParams["c"] }));
					subscriptionHandle.unsubscribe();
					isSubscribed = false;
					isStartPaused = false;
		        	utils.info("JET.News subscription stopped");					
				}
				return this;
			},

			//Pauses current subscription.
			pause: function() {
				if (isSubscribed) {
					sendSimpleRequest("p");
				}
				return this;
			},
			
			//Freeze current subscription.
			freeze: function() {
				if (isSubscribed) {
					sendSimpleRequest("f");
				}
				return this;
			},			

			//Resumes current subscription
			resume: function() {
				if (isStartPaused) this.start();
				else if (isSubscribed) {
					sendSimpleRequest("r");
				}
				return this;
			},

			//Ask Container for more Older headlines. Number of requested headlines is specified in 'NumberOfHeadlines' parameter
			more: function (NumberOfHeadlines) {
				sendRequestForOtherHeadlines("go", NumberOfHeadlines);
				return this;
			},
			
			//Ask Container for more newer headlines. Number of requested headlines is specified in 'NumberOfHeadlines' parameter
			newer: function (NumberOfHeadlines) {
				sendRequestForOtherHeadlines("gn", NumberOfHeadlines);
				return this;
			},
			
			//Ask Container to update the Highlighting context
			updateHighlighter: function(Pattern, HighlightObject )
			{
				checkParameter(Pattern, "Pattern", "string");
				checkParameter(HighlightObject, "HighlightObject", "object");
				
				JET.publish("/News/ControlChannel", JSON.stringify({ a: "h", p: Pattern,  h: HighlightObject, c: newsParams.c}));
			}				
			
		}

        if (JET.onActivate && JET.onDeactivate) {
            JET.onActivate(function() { subscription.resume(); });
            JET.onDeactivate(function() { subscription.pause(); });		
        }

		JET.onUnload(function() { subscription.stop(); });        

		subscriptions[id] = subscription;

		utils.info("JET.News subscription created");
		return subscription;
	}
	
	//Returns new object that represents template for highlighter. Object is initialized with default values.	
	function  newHighlightObject(Expression,  ClassName){
		var newObject= {
			e:'',
			c:''
		};
		newObject.e = Expression;
		newObject.c = ClassName;
		return newObject;
	}
			
	//Returns new object that represents template for headline. Object is initialized with default values.
	function newTemplate() {
		var realTemplateObject = {
			r: '<span class="newsric" jet="JETDATA" e.RIC="%s">%s</span>',
			st: '<a href="cpurl://views.cp./Explorer/NEWSxSTORY.aspx?ric=%s" class="newsSearch">%s</a>',
			se: '<a href="%s" class="newsStory">%s</a> ',
			l: '<a href="%s" class="newsLink">%s</a> ',
			hk: '<b>%s</b>',
			hh: '<span style="background-color:red">%s</span>'
		};

		var templateObject = {
			//Sets template for a RIC
			ric: function (templateString) {
				checkParameter(templateString, "templateString", "string");
				realTemplateObject.r = templateString;
				return this;
			},
			//Sets template for News story link
			newsStoryLink: function (templateString) {
				checkParameter(templateString, "templateString", "string");
				realTemplateObject.st = templateString;
				return this;
			},
			//Sets template for News search link
			newsSearchLink: function (templateString) {
				checkParameter(templateString, "templateString", "string");
				realTemplateObject.se = templateString;
				return this;
			},
			//Sets template for link
			link: function (templateString) {
				checkParameter(templateString, "templateString", "string");
				realTemplateObject.l = templateString;
				return this;
			},
			//Sets template for highlighted headline
			highlightedHeadline: function (templateString) {
				checkParameter(templateString, "templateString", "string");
				realTemplateObject.hh = templateString;
				return this;
			},
			//Sets template for highlighted keyword
			highlightedKeyword: function (templateString) {
				checkParameter(templateString, "templateString", "string");
				realTemplateObject.hk = templateString;
				return this;
			},
			//Returns template object that can be passed to Container
			getRawTemplate: function () {
				return realTemplateObject;
			}
		}
		return templateObject;
	}

	var highlightKeyWordTypes = {
		none: 0,
		byDefault: 1,
		keyword_list: 2,
		all: 3
	}

	//Creates a blank top news subscription
	//  subscriptionID is an optional parameter. ID will be generated if omitted.
	// Subscription object support methods chaining:
	//   JET.createTopNews() 
	//	    .ids("id1", "id2")
	//      .onUpdate(function(id, ver) { ... }) 
	//      .start()
	function createTopNews(subID) {
		var id = subID ? subID : baseSubID + (lastSubID++);
		var request = { 
			a: "sub_top",
			c: "/News/" + id,
			ids: []
		};

		var subscriptionHandle = null;
		var updateHandler = null;
		var statusHandler = null;
		var isSubscribed = false;
		var pausedBuffer = null;
		var isStartPaused = false;

		var topNewsSubscription = {
			// ids : function(Array | Multiple String arguments)
			// Set an Array of Top Story IDs to the subscription,
			// or a list of Top Story IDs Strings
			// returns the modified TopNews subscription
			// Example:
			// s.addIDs(["ID1", "ID2", ...]);
			// or
			// s.addIDs("ID1", "ID2", ...);
			ids: function() {
				request.ids = parseArgumentsList(arguments).list;
				return this;
			},

			// Registers a handler to be called upon receiving Top News Story updates.
			// The handler is given 2 parameters :
			// storyID : String, The News Top Story ID
			// version : Integer, The Top Story Version
			// returns the modified TopNews subscription
			// Example:
			// var updateHandler = function(storyID, version) {
			//    console.log("The Top Story #"+storyID+
			//                " has been updated to version : "+version);
			// }
			// s.onUpdate(updateHandler);		
			onUpdate: function(handler) {
 				checkParameter(handler, "handler", "function");
                updateHandler = handler;
                return this;
            },

            onStatus: function(handler) {
				checkParameter(handler, "handler", "function");
                statusHandler = handler;
                return this;
            },

			// Send the subscription to start getting updates about the list of subscribed Top Story IDs
			// Example:
			// s.start();
            start: function() {
				if (!JET.Loaded) {
					JET.onLoad(this.start);
					return this;
				}
				
				if (!isSubscribed)
				{
					if (request.ids.length == 0) {
						throw "At least one id should be specified";
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
						
					var sub = this;

					var mainHandler = function(event) {
						// Can't use JSON.parse because of invalid JSON data sent by the desktop
						var data = eval("(function(){return " + event + ";})()");

						if (data.a == "topnews" && updateHandler) { 

							if (pausedBuffer) 
								pausedBuffer[data.id] = {"ver":data.ver, "time":(new Date().getTime())};
							else updateHandler(data.id, data.ver); 
							}

						if (data.a == "s" && statusHandler) { 
							statusHandler(data.s); 
						}

					};
					
					//Send the AppHits Usage Tracking 
					sendAppHit("TopNewsSub_" , "");

					subscriptionHandle = JET.subscribe(request.c, mainHandler);
					JET.publish("/News/ControlChannel", JSON.stringify(request));
					isSubscribed = true;
					pausedBuffer = null;
					isStartPaused = false;

					JET.onUnload(function() { topNewsSubscription.stop(); });
				}

	            return this;          
            },

			// Stops the subscription 
			// Example:
			// s.stop();
            stop: function() {
                if (isSubscribed) {
                    JET.publish("/News/ControlChannel", JSON.stringify({ "a": "unsub_top", "c": request.c }));
                    subscriptionHandle.unsubscribe();
                    pausedBuffer = null;
                    isSubscribed = false;
					isStartPaused = false;
                }
                return this;
            },

			// Pause the subscription
			// Example:
			// s.pause();
			pause: function() {
				if(isSubscribed && !pausedBuffer)
					pausedBuffer = {};
				return this;
			},

			// Resume sending updates
			// Example:
			// s.resume();
			resume: function() {
				if (isStartPaused) this.start();
				else if (isSubscribed && pausedBuffer) {
					for (var key in pausedBuffer) 
						updateHandler(key, pausedBuffer[key].ver, pausedBuffer[key].time);
					pausedBuffer = null; 
				}
				return this;
			}
		}

        if (JET.onActivate && JET.onDeactivate) {
            JET.onActivate(function() { topNewsSubscription.resume(); });
            JET.onDeactivate(function() { topNewsSubscription.pause(); });		
        }

		return topNewsSubscription;
	}
	
	//Creates a blank top news subscription
	//  subscriptionID is an optional parameter. ID will be generated if omitted.
	// Subscription object support methods chaining:
	//   JET.createNewsUpdate() 
	//	    .ids("id1", "id2")
	//      .onUpdate(function(id, ver, extend) { ... }) 
	//      .start()
	function createNewsUpdate(subID) {
		var id = subID ? subID : baseSubID + (lastSubID++);
		var request = { 
			a: "sub_upd",
			c: "/News/" + id,
			ids: []
		};

		var subscriptionHandle = null;
		var updateHandler = null;
		var statusHandler = null;
		var isSubscribed = false;
		var pausedBuffer = null;
		var isStartPaused = false;

		var NewsUpdateSubscription = {
			// ids : function(Array | Multiple String arguments)
			// Set an Array of Story IDs or Report ID to the subscription,
			// or a list of Story IDs Strings
			// returns the modified News Update subscription
			// Example:
			// s.addIDs(["ID1", "ID2", ...]);
			// or
			// s.addIDs("ID1", "ID2", ...);
			ids: function() {
				request.ids = parseArgumentsList(arguments).list;
				return this;
			},		

			// Registers a handler to be called upon receiving Top News Story updates.
			// The handler is given 2 parameters :
			// storyID : String, The News Story ID
			// version : Integer, The Story Version
			// returns the modified News Update subscription
			// Example:
			// var updateHandler = function(storyID, version, extend) {
			//    console.log("The Story #"+storyID+
			//                " has been updated to version : "+version);
			// }
			// s.onUpdate(updateHandler);		
			onUpdate: function(handler) {
 				checkParameter(handler, "handler", "function");
                updateHandler = handler;
                return this;
            },

            onStatus: function(handler) {
				checkParameter(handler, "handler", "function");
                statusHandler = handler;
                return this;
            },

			// Send the subscription to start getting updates about the list of subscribed Top Story IDs
			// Example:
			// s.start();
            start: function() {
				if (!JET.Loaded) {
					JET.onLoad(this.start);
					return this;
				}
				
				if (!isSubscribed)
				{
					if (request.ids.length == 0) {
						throw "At least one id should be specified";
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
						
					var sub = this;

					var mainHandler = function(event) {
						// Can't use JSON.parse because of invalid JSON data sent by the desktop
						var data = eval("(function(){return " + event + ";})()");

						if (data.a == "newsupd" && updateHandler) { 

							if (pausedBuffer) 
								pausedBuffer[data.id] = {"ver":data.ver, "time":(new Date().getTime())};
							else updateHandler(data.id, data.ver, data.alert); 
						}

						if (data.a == "s" && statusHandler) { 
							statusHandler(data.id, data.s, data.m); 
						}

					};
					
					//Send the AppHits Usage Tracking 
					sendAppHit("StorySub_" , "");

					subscriptionHandle = JET.subscribe(request.c, mainHandler);
					JET.publish("/News/ControlChannel", JSON.stringify(request));
					isSubscribed = true;
					pausedBuffer = null;
					isStartPaused = false;

					JET.onUnload(function() { NewsUpdateSubscription.stop(); });
				}

	            return this;          
            },

			// Stops the subscription 
			// Example:
			// s.stop();
            stop: function() {
                if (isSubscribed) {
                    JET.publish("/News/ControlChannel", JSON.stringify({ "a": "unsub_upd", "c": request.c }));
                    subscriptionHandle.unsubscribe();
                    pausedBuffer = null;
                    isSubscribed = false;
					isStartPaused = false;
                }
                return this;
            },

			// Pause the subscription
			// Example:
			// s.pause();
			pause: function() {
				if(isSubscribed && !pausedBuffer)
					pausedBuffer = {};
				return this;
			},

			// Resume sending updates
			// Example:
			// s.resume();
			resume: function() {
				if (isStartPaused) this.start();
				else if (isSubscribed && pausedBuffer) {
					for (var key in pausedBuffer) 
						updateHandler(key, pausedBuffer[key].ver, pausedBuffer[key].time);
					pausedBuffer = null; 
				}
				return this;
			}
		}

        if (JET.onActivate && JET.onDeactivate) {
            JET.onActivate(function() { NewsUpdateSubscription.resume(); });
            JET.onDeactivate(function() { NewsUpdateSubscription.pause(); });		
        }

		return NewsUpdateSubscription;
	}
	
	return { 
		//Initialize the JET News module
		init:init,
	
		// Creates a new headlines subscription
		create: newSubscription,		
		
		//Returns subscription by the id
		get: function(id) {
			return subscriptions[id];
		},
		
		// Resolve expression
		resolve: resolve,
		
		//Returns new template object with default settings
		newTemplate: newTemplate,
		
		//Return news template to define one highlighter object
		newHighlightObject: newHighlightObject,
		
		//Returns enumeration with types of words highlighting
		highlightKeyWordTypes: highlightKeyWordTypes,

		// Creates a new top news subscription
		createTopNews: createTopNews,
	
		// Creates a new news update subscription
		createNewsUpdate: createNewsUpdate,
		
		// Temporary fix for unit testing to toggle SR1 workarounds
		// Do not use in production code!
		setWorkaround: function(val) {
			applyWorkarounds = val;
		}
	}
});

JET.News.init();