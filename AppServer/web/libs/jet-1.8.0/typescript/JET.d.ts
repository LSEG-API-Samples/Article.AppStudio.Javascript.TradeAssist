/* JET: version = 1.8.0, released date = 19/09/2014 */

// #2
declare module JET {
	// ========== JET =========
	var ContainerDescription:any;

	interface InitObj {
		ID: string;
		Title?: string;
		NavigationSupport?: JET.NavigationSupport;
		HelpURL?: string;
		Context?: Object[];
		Toolbar?: Object;
	}

	enum NavigationSupport {
		ShowRelatedTradeInToolbar = 1,
		ShowRelatedTradeOnRightClick = 2,
		CanPublishContext = 32,
		CanReceiveContext = 64
	}

	function init(initObj:InitObj):void;

	function unload():void;

	function onLoad(handler:Function):void;

	function onUnload(handler:Function):void;

	function onContextChange(handler:Function):void;

	function onActivate(handler:Function):void;

	function onDeactivate(handler:Function):void;

	function onLinked(handler:Function):void;

	function onUnlinked(handler:Function):void;

	function getUserInfo():any;

	function getActiveSymbol():any;

	function getActiveContext():any[];

	interface NavigationData {
		name?: string;
		url?: string;
		location?: Object;
		entities?: Object[];
		properties?: Object[];
		target?: string;
	}

	function navigate(data:NavigationData):void;

	function contextChange(data:Object[]):void;

	interface ContextMenuData {
		mouse?: Object;
		entities?:Object[];
		menu?:Object[];
	}

	function contextMenu(data:ContextMenuData):void;

	interface ToastData {
		id: string;
		title?: string;
		message?: string;
		value?: string;
		duration?: number;
		iconUrl?: string;
		handler?: Function;
	}

	function toast(data:ToastData):void;

	function loggingSource(sourceStr:string):void;

	function debug(message:string):void;

	function information(message:string):void;

	function warning(message:string):void;

	function high(message:string):void;

	function critical(message:string):void;

	interface ClipboardData {
		entries: Object[];
	}

	function copyToClipboard(data:ClipboardData):void;

	function getClipboardData():string;

	interface TransferData {
		entities: Object[];
	}

	function dragStart(data:TransferData):void;

	function onDragOver(handler:Function):void;

	function onDrop(handler:Function):void;

	function appHit(appName:string, subProduct:string, feature?:string):void;

	function publish(channel:string, message:string):void;

	function subscribe(channel:string, handler:Function, context?:Object):any;

	function unsubscribeAll():void;

	function sendByMail(data:string):void;

	function screenshot():void;

	function resizeTo(width:number, height:number, inner?:boolean):void;

	function resizeBy(xDelta:number, yDelta:number):void;

	function updateAppMenu(menu:Object[]):void;


	// ========== Archive =========
	module Archive {
		function put(key:string, value:Object);

		function get(key:string):any;

		function getAllKeys():string[];

		function clear():void;

		function save():void;
	}


	// ========== Quotes =========
	module Quotes {
		interface Subscription {
			rics(...args:string[]):Subscription;
			rics(rics:string[]):Subscription;
			rawFields(...args:string[]):Subscription;
			rawFields(fields:string[]):Subscription;
			formattedFields(...args:any[]):Subscription;
			formattedFields(fields:string[], precision:number):Subscription;
			sort(field:string, direction?:number):Subscription;
			chain(chain:string):Subscription;
			filter(start:number, count:number):Subscription;
			start():Subscription;
			stop():Subscription;
			pause():Subscription;
			resume():Subscription;
			rangeTracking(...args:string[]):Subscription;
			rangeTracking(fields:string[]):Subscription;
			pauseOnDeactivate(isPausedOnDeactivate:boolean):Subscription;
			getRange(field:string):any;
			getFieldsValues(ric:string):any;

			onUpdate(handler:Function):Subscription;
			onNewRow(handler:Function):Subscription;
			onRemoveRow(handler:Function):Subscription;
			onError(handler:Function):Subscription;
		}

		function create(subscriptionID?:string):Subscription;

		function get(subscriptionID:string):Subscription;
	}

	// ========== News =========
	module News {
		interface Subscription {
			newsExpression(expression:string):Subscription;
			topSize(size:number):Subscription;
			basketSize(size:number):Subscription;
			onAppend(handler:Function):Subscription;
			onInsert(handler:Function):Subscription;
			onDelete(handler:Function):Subscription;
			onClear(handler:Function):Subscription;
			onNewsServiceStatus(handler:Function):Subscription;
			onHistoricalNewsReceived(handler:Function):Subscription;
			template(template:Template):Subscription;
			highlightExpression(expression:string):Subscription;
			highlightKeywords(keywords:string):Subscription;
			highlightKeywordType(highlightKeywordType:number):Subscription;
			dateTemplate(template:string):Subscription;
			timeTemplate(template:string):Subscription;
			more(numberOfHeadlines:number):Subscription;
			start():Subscription;
			stop():Subscription;
			pause():Subscription;
			resume():Subscription;
		}

		interface Template {
			highlightedHeadline(template:string):Template;
			highlightedKeyword(template:string):Template;
		}

		function create(subscriptionID?:string):Subscription;

		function get(subscriptionID:string):Subscription;

		function newTemplate():Template;
	}

	// ========== Settings =========
	module Settings {
		interface ReadingSettingInfo {
			providerName: string;
			settingName: string;
			expandValue?: boolean;
		}

		function read(handler:Function, data:ReadingSettingInfo, errorHandler?:Function):void;

		interface WritingSettingInfo {
			providerName: string;
			settingName: string;
			settingValue: string;
		}

		function write(data:WritingSettingInfo):void;
	}

	// ========== QuickTips =========
	module QuickTips {
		interface Tip {
			step: number;
			message: string;
			x?: number;
			y?: number;
			element?: Element;
			elementAnchor?: string;
			lineLength?: number;
			direction?: string
			showWithPriorStep?: boolean;
			includeNextStep?: boolean;
		}

		interface Session {
			tips(listOfTips:Tip[]):Session;
			clearShownStatus():void;
			getStorageKey():string;
			hasShownBefore():boolean;
			onStarted(handler:Function):Session;
			onEnded(handler:Function):Session;
			onClicked(handler:Function):Session;
			onAfterStep(handler:Function):Session;
			onError(handler:Function):Session;
			start(showOnlyOnce?:boolean):Session;
			end():Session;
		}

		function create(tipID:string):Session;
	}
}