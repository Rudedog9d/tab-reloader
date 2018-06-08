function SendMessage(message, done){
    chrome.runtime.sendMessage(message, function(response) {
        // todo handle success/error response
        console.log(`response: ${response}`);
        if(!response.success)
            console.error('an error occured')

        done(response)
      });
}

function checkIsReloading() {
  SendMessage({action: CHECK_RELOAD}, function(result) {
    $('#reloading').text(result.isReloading)
  })
}

$(document).ready(function() { 
    $('#start').on('click', function(){
        // this.balls = true
      // This kind of sucks - we need to query the chrome tabs API
      // from the popup js, otherwise no tabs will be returned from 'current window'
      // however, we don't have a good way to pass args in, so we jut add the tabid
      // to the 'args' array in the message
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs.length !== 1) {
            console.error('something went wrong, expected length of 1');
            return false;
          }

          let tab = tabs[0];
          let tabId = tab.id;
          SendMessage({action: START_RELOAD, args: [tabId], this: this}, function () {
            // Set reloading notification
            checkIsReloading();
          });
        });
    });

    $('#stop').on('click', function(){
        SendMessage({action: STOP_RELOAD}, function () {
          // Set reloading notification
          checkIsReloading();
        });
    });

    checkIsReloading()
});