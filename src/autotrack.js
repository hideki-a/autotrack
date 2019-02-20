class Autotrack { // eslint-disable-line no-unused-vars
  constructor(trackingId, options = {}) {
    this.trackingId = trackingId;
    this.defaultOptions = {
      debug: false,
      fileTracker: {
        fileSelector: 'a[href$=".pdf"], a[href$=".zip"]',
        getFileTitle: (link) => {
          let title = link.textContent;
          if (!title) {
            const images = link.getElementsByTagName('img');
            [].forEach.call(images, elem => {
              title += ' ' + elem.getAttribute('alt');
            });
          }
          return title.trim();
        },
      },
      bannerTracker: {
        eventAction: 'Click',
        getImageLabel: (img) => {
          return img.getAttribute('alt');
        },
      },
      youtubeTracker: {
        playerSelector: 'iframe[src*="youtube.com/embed"]',
      },
    };

    this.options = Object.assign(this.defaultOptions, options);

    // https://stackoverflow.com/questions/5660131/how-to-removeeventlistener-that-is-addeventlistener-with-anonymous-function#answer-5660165
    this.listenerIds = [];
    this.eventHandler = (() => {
      let i = 1;
      let listeners = {};

      return {
        addListener: (element, event, handler, capture = false) => {
          element.addEventListener(event, handler, capture);
          listeners[i] = {
            element: element,
            event: event,
            handler: handler,
            capture: capture
          };
          return i++;
        },
        removeListener: (id) => {
          if (id in listeners) {
            let handler = listeners[id];
            handler.element.removeEventListener(handler.event, handler.handler, handler.capture);
            delete listeners[id];
          }
        }
      }
    })();
  }

  _valueIsFunction(value, errorMsg) {
    if (typeof(value) !== 'function') {
      throw errorMsg;
    }
  }

  _valueIsString(value, errorMsg) {
    if (typeof(value) !== 'string' || value === '') {
      throw errorMsg;
    }
  }

  _valueIsInteger(value, errorMsg, minValue = null) {
    if (!Number.isInteger(value)) {
      throw errorMsg;
    }
    if (minValue && value < minValue) {
      throw errorMsg;
    }
  }

  _sendPageView(pageTitle, pagePath) {
    try {
      this._valueIsString(pageTitle, 'string "pageTitle" is required.');
      this._valueIsString(pagePath, 'string "pagePath" is required.');
    } catch (e) {
      console.warn(e);  // eslint-disable-line no-console
      return;
    }

    gtag('config', this.trackingId, {
      'page_title': pageTitle,
      'page_path': pagePath,
    });
  }

  _sendEvent(eventAction, eventCategory, eventLabel, eventValue = null) {
    try {
      this._valueIsString(eventAction, 'string "eventAction" is required.');
      this._valueIsString(eventCategory, 'string "eventCategory" is required.');
      this._valueIsString(eventLabel, 'string "eventLabel" is required.');
      if (eventValue) {
        this._valueIsInteger(eventValue, 'number "eventValue" must be an integer greater than or equal to 1', 0);
      }
    } catch (e) {
      console.warn(e);  // eslint-disable-line no-console
      return;
    }

    gtag('event', eventAction, {
      'event_category': eventCategory,
      'event_label': eventLabel,
      'value': eventValue,
    });
  }

  fileTracker(options = {}) {
    const trackerOptions = Object.assign(this.defaultOptions.fileTracker, options);
    const links = document.querySelectorAll(trackerOptions.fileSelector);
    const getFileTitle = trackerOptions.getFileTitle;
    let handlerId = null;
    [].forEach.call(links, link => {
      handlerId = this.eventHandler.addListener(link, 'click', (e) => {
        const pageTitle = getFileTitle(link);
        const pagePath = link.getAttribute('href');

        if (this.options.debug) {
          e.preventDefault();
          console.log('pageTitle:', pageTitle);  // eslint-disable-line no-console
        }

        this._sendPageView(pageTitle, pagePath);
      });

      this.listenerIds.push(handlerId);
    });
  }

  bannerTracker(options = {}) {
    const trackerOptions = Object.assign(this.defaultOptions.bannerTracker, options);
    const links = document.querySelectorAll(trackerOptions.bannerSelector);
    const eventAction = trackerOptions.eventAction;
    const eventCategory = trackerOptions.eventCategory;
    const getImageLabel = trackerOptions.getImageLabel;
    let handlerId = null;
    [].forEach.call(links, link => {
      handlerId = this.eventHandler.addListener(link, 'click', (e) => {
        const images = link.getElementsByTagName('img');
        const eventLabel = getImageLabel(images[0]);

        if (this.options.debug) {
          e.preventDefault();
          console.log('eventAction:', eventAction);  // eslint-disable-line no-console
          console.log('eventCategory:', eventCategory);  // eslint-disable-line no-console
          console.log('eventLabel:', eventLabel);  // eslint-disable-line no-console
        }

        this._sendEvent(eventAction, eventCategory, eventLabel);
      });

      this.listenerIds.push(handlerId);
    });
  }

  youTubeTracker(options = {}) {
    const trackerOptions = Object.assign(this.defaultOptions.youtubeTracker, options);
    const players = document.querySelectorAll(trackerOptions.playerSelector);
    const eventAction = trackerOptions.eventAction;
    const eventCategory = trackerOptions.eventCategory;
    let videoIds = [];
    let playedVideoIds = [];

    if (players.length > 0) {
      const firstScriptTag = document.getElementsByTagName('script')[0];
      const youtubeApiScript = document.createElement('script');
      youtubeApiScript.src = 'https://www.youtube.com/iframe_api';
      firstScriptTag.parentNode.insertBefore(youtubeApiScript, firstScriptTag);
    }

    [].forEach.call(players, player => {
      const videoId = player.getAttribute('src').replace(/.*embed\/(.*)\?.*/, '$1');
      player.setAttribute('id', videoId);
      videoIds.push(videoId);
    });

    const onPlayerStateChange = event => {
      if (event.data === 1) {
        const videoData = event.target.getVideoData();

        if (playedVideoIds.indexOf(videoData.video_id) === -1) {
          if (this.options.debug) {
            console.log('eventAction:', eventAction);  // eslint-disable-line no-console
            console.log('eventCategory:', eventCategory);  // eslint-disable-line no-console
            console.log('eventLabel:', videoData.title);  // eslint-disable-line no-console
            window.youTubeIframeMovieIsPlaying = true;
          }

          this._sendEvent(eventAction, eventCategory, videoData.title);
          playedVideoIds.push(videoData.video_id);
        }
      }
    };

    window.onYouTubeIframeAPIReady = () => {
      videoIds.forEach(id => {
        new YT.Player(id, {
          events: {
            'onStateChange': onPlayerStateChange
          }
        });
      });

      if (this.options.debug) {
        window.youTubeIframeAPIIsReady = true;
      }
    };
  }

  removeAllTracker() {
    this.listenerIds.forEach((id) => {
      this.eventHandler.removeListener(id);
    });
  }
}
