/* Global Variables */
let _reloadTimerId = null; /* GLOBAL timer ID */
let _reloadCount = 0; // todo don't reload forever

/* Configurable options - todo make them configurable */
let interval = 20000
let focus = true; /* whether to focus tab on reload */

function StartReloading() {
    if(_reloadTimerId !== null) {
        console.error('a timer is already started! refusing to start another');
        return false /* Todo display an error to user here */
    }

    // If interval is not a number, default to 60 seconds
    if(Number(interval) === NaN)
        interval = 60000

    console.log('starting reloader')
    console.log(chrome)
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        if(tabs.length !== 1) {
            console.error('something went wrong, expected length of 1');
            return false;
        }
        
        let tab = tabs[0];
        let tabId = tab.id;

        /**
         * Whether to reload tab
         * @param {chrome.tab.Tab} tab 
         * @returns {Boolean} True to reload tab
         */
        let reloadCondition = function(tab) {
            /* Todo: make this function user-configurable */
            console.log(`tab is audible: ${tab.audible}`)
            return !tab.audible
        }

        // Set timer
        _reloadTimerId = setInterval(function(){
            console.log('checking...')
            chrome.tabs.get(tabId, function(tab){
                if(reloadCondition(tab))
                    ReloadTab(tabId);
            })
        }, interval)

        return true
    })
}

function ReloadTab(tabId) {
    let promise = Promise.resolve(null);
    let currentTabId;
    
    /* 
     * Fuck this stuff, the tab being reloaded
     * just needs to be in it's own window
     */

    // if(focus) {
    //     promise = chrome.tabs.query({active: true, currentWindow: true}, function(tabs){            
    //         currentTabId = tabs[0].id;
            
    //     });
    // }

    Promise.all([promise]).then(function(){
        chrome.tabs.reload(tabId);
    })
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

    // Set reloading notification to true
    $('#reloading').text(false)
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
        if (request.action === START_ACTION)
            success = StartReloading();
        else if (request.action === STOP_ACTION)
            success = StopReloading();
        return sendResponse({success: success});
});
