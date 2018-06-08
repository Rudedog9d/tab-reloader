// todo create an acutal logger, ditch this console.log shit
/* Global Variables */
let _reloadTimerId = null; /* GLOBAL timer ID */
let _reloadCount = 0; // todo don't reload forever
let FUNC_MAP = {
    // Square braces force the variable to be evaluated (ES6)
    [START_RELOAD]: StartReloading,
    [STOP_RELOAD]: StopReloading,
    [CHECK_RELOAD]: isReloading,
    // DO_RELOAD: ReloadTab
};

/* Configurable options - todo make them configurable */
let interval = 20000;
let focus = true; /* whether to focus tab on reload */

/*
 * Helper functions for returning data through the pipe/API
 */
function _sendResponse(done, success, ops) {
  return done(Object.assign({
    success: success
  }, ops))
}

function _respondSuccess(done, msg) {
    return _sendResponse(done, true, {message: msg})
}

function _respondError(done, err) {
  return _sendResponse(done, false, {error: err})
}

/*
 * Defined Actions
 */
function isReloading() {
    return {
        isReloading: Number.isFinite(_reloadTimerId)
    }
}

function StartReloading(tabId) {
    if(_reloadTimerId !== null) {
        console.error('a timer is already started! refusing to start another');
        return false /* Todo display an error to user here */
    }

    // If interval is not a number, default to 60 seconds
    if(!Number.isInteger(interval))
        interval = 60000;

    console.log('starting reloader')
    // console.log(chrome)

  // console.log('ball test 2', this.balls)

    // todo properly handle 'returning' values from this async func
    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    //     if(tabs.length !== 1) {
    //         console.error('something went wrong, expected length of 1');
    //         return false;
    //     }
    //
    //     let tab = tabs[0];
    //     let tabId = tab.id;

        /**
         * Whether to reload tab
         * @param {chrome.tab.Tab} tab 
         * @returns {Boolean} True to reload tab
         */
        let reloadCondition = function(tab) {
            /* Todo: make this function user-configurable */
            console.log(`tab is audible: ${tab.audible}`)
            return !tab.audible
        };

        // Set timer
        _reloadTimerId = setInterval(function(){
            console.log('checking...')
            chrome.tabs.get(tabId, function(tab){
                if(reloadCondition(tab))
                    ReloadTab(tabId);
            })
        }, interval);

        return true;
    // })
}

function ReloadTab(tabId) {
    // let promise = Promise.resolve(null);
    // let currentTabId;
    
    /* 
     * Fuck this stuff, the tab being reloaded
     * just needs to be in it's own window
     */

    // if(focus) {
    //     promise = chrome.tabs.query({active: true, currentWindow: true}, function(tabs){            
    //         currentTabId = tabs[0].id;
            
    //     });
    // }

    // Promise.all([promise]).then(function(){
    //     chrome.tabs.reload(tabId);
    // })
    chrome.tabs.reload(tabId);
}

function StopReloading() {
    if(_reloadTimerId === null) {
        console.error("a timer hasn't been started!");
        return /* Todo display an error to user here */
    }

    console.log('stopping reloader')

    // Clear timer
    clearInterval(_reloadTimerId);
    _reloadTimerId = null;
}

/*
 * Create pipe listener
 */
chrome.runtime.onMessage.addListener(
    function(request, sender, done) {
        console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");

        // Check if an action was specified
        if(!request || !request.action) {
            let err = `must specify request.action`;
            console.error(err);
            return _respondError(done, err);
        }

        // Retrieve action from function map
        let action = FUNC_MAP[request.action];

        // Check if action is a valid function
        if(!(typeof action === "function")) {
          let err = `invalid action specified: ${request.action}`;
          console.error(err);
          return _respondError(done, err)
        }

        // Valid action, call it with option `this` and `args` array
      // console.log('ball test 1', request.this.balls)
        let ret = action.apply(request.this, request.args);
        let success = ret ? ret.success : true; // default to successful result

        // Coerce bool val to an object
        if(typeof ret === 'boolean') {
            success = ret;
            ret = {}
        }

        // Send response
        return _sendResponse(done, success, ret);
});
