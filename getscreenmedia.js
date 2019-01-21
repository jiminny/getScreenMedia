module.exports = function(constraints, browser) {
  return new Promise((resolve, reject) => {
    let error;

    if (browser.name === "Chrome") {
      // check that the extension is installed by looking for a
      // sessionStorage variable that contains the extension id
      // this has to be set after installation unless the content
      // script does that
      if (sessionStorage.getScreenMediaJSExtensionId) {
        chrome.runtime.sendMessage(
          sessionStorage.getScreenMediaJSExtensionId,
          { type: "getScreen", id: 1 },
          null,
          function(data) {
            if (!data || data.sourceId === "") {
              // user canceled
              error = new Error("NavigatorUserMediaError");
              error.name = "NotAllowedError";
              reject(error);
            } else {
              constraints.video.mandatory = Object.assign(
                constraints.video.mandatory,
                {
                  chromeMediaSource: "desktop",
                  chromeMediaSourceId: data.sourceId
                }
              );

              window.navigator.mediaDevices
                .getUserMedia(constraints)
                .then(function(stream) {
                  resolve(stream);
                })
                .catch(function(err) {
                  reject(err);
                });
            }
          }
        );
      } else {
        error = new Error("Screensharing is not supported");
        error.name = "NotSupportedError";
        reject(error);
      }
    } else if (
      browser.name === "Firefox" &&
      parseInt(browser.version, 10) >= 63
    ) {
      constraints.video.mediaSource = "window";

      window.navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
          resolve(stream);
        })
        .catch(function(err) {
          reject(err);
        });
    } else if (
      browser.name === "Edge" &&
      "getDisplayMedia" in window.navigator
    ) {
      window.navigator
        .getDisplayMedia({ video: true })
        .then(function(stream) {
          resolve(stream);
        })
        .catch(function(err) {
          reject(err);
        });
    } else {
      error = new Error("Screensharing is not supported");
      error.name = "NotSupportedError";
      reject(error);
    }
  });
};
