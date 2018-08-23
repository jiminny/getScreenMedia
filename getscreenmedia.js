module.exports = function (constraints) {
  return new Promise((resolve, reject) => {
    let error;

    if (
      !window.navigator.userAgent.match('Chrome') ||
      !sessionStorage.getScreenMediaJSExtensionId
    ) {
      error = new Error('Screensharing is not supported');
      error.name = 'NotSupportedError';
      reject(error);
      return;
    }

    chrome.runtime.sendMessage(
      sessionStorage.getScreenMediaJSExtensionId,
      {type: 'getScreen', id: 1},
      null,
      function (data) {
        if (!data || data.sourceId === '') { // user cancelled
          error = new Error('NavigatorUserMediaError');
          error.name = 'NotAllowedError';
          reject(error);
        } else {
          constraints.video.mandatory = Object.assign(constraints.video.mandatory, {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: data.sourceId
          });

          window.navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            resolve(stream);
          }).catch(function (err) {
            reject(err);
          });
        }
      }
    );
  });
};
