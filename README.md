# Tab ReLoader

Reload your chrome tab under a certain condition. Currently, the conditition is hard-coded in `background.js`.

NOTE: The tab must be in it's own window for the tab to reload properly. If it is not, the tab will reload but the page may not reload fully until it gains focus. (ex, a music player won't start until you click the tab). Placing the tab in it's own window seems to be a work around.
