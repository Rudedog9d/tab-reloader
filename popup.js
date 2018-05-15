function SendMessage(message){
    chrome.runtime.sendMessage(message, function(response) {
        // todo handle success/error response
        console.log(`response: ${response}`);
        if(!response.success)
            console.error('an error occured')
      });
}

$(document).ready(function() { 
    $('#start').on('click', function(){
        SendMessage({action: START_ACTION})
        // Set reloading notification to true
        // TODO only set on success
        $('#reloading').text(true)
    })

    $('#stop').on('click', function(){
        SendMessage({action: STOP_ACTION})
        // Set reloading notification to false
        // TODO only set on success
        $('#reloading').text(false)
    })
});