"use strict";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Autotrack =
/*#__PURE__*/
function () {
  // eslint-disable-line no-unused-vars
  function Autotrack(trackingId) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Autotrack);

    this.trackingId = trackingId;
    this.defaultOptions = {
      debug: false,
      fileTracker: {
        fileSelector: 'a[href$=".pdf"], a[href$=".zip"]',
        getFileTitle: function getFileTitle(link) {
          var title = link.textContent;

          if (!title) {
            var images = link.getElementsByTagName('img');
            [].forEach.call(images, function (elem) {
              title += ' ' + elem.getAttribute('alt');
            });
          }

          return title.trim();
        }
      },
      bannerTracker: {
        eventAction: 'Click',
        getImageLabel: function getImageLabel(img) {
          return img.getAttribute('alt');
        }
      },
      youtubeTracker: {
        playerSelector: 'iframe[src*="youtube.com/embed"]'
      }
    };
    this.options = _extends(this.defaultOptions, options); // https://stackoverflow.com/questions/5660131/how-to-removeeventlistener-that-is-addeventlistener-with-anonymous-function#answer-5660165

    this.listenerIds = [];

    this.eventHandler = function () {
      var i = 1;
      var listeners = {};
      return {
        addListener: function addListener(element, event, handler) {
          var capture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
          element.addEventListener(event, handler, capture);
          listeners[i] = {
            element: element,
            event: event,
            handler: handler,
            capture: capture
          };
          return i++;
        },
        removeListener: function removeListener(id) {
          if (id in listeners) {
            var handler = listeners[id];
            handler.element.removeEventListener(handler.event, handler.handler, handler.capture);
            delete listeners[id];
          }
        }
      };
    }();
  }

  _createClass(Autotrack, [{
    key: "_valueIsFunction",
    value: function _valueIsFunction(value, errorMsg) {
      if (typeof value !== 'function') {
        throw errorMsg;
      }
    }
  }, {
    key: "_valueIsString",
    value: function _valueIsString(value, errorMsg) {
      if (typeof value !== 'string' || value === '') {
        throw errorMsg;
      }
    }
  }, {
    key: "_valueIsInteger",
    value: function _valueIsInteger(value, errorMsg) {
      var minValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      if (!Number.isInteger(value)) {
        throw errorMsg;
      }

      if (minValue && value < minValue) {
        throw errorMsg;
      }
    }
  }, {
    key: "_sendPageView",
    value: function _sendPageView(pageTitle, pagePath) {
      try {
        this._valueIsString(pageTitle, 'string "pageTitle" is required.');

        this._valueIsString(pagePath, 'string "pagePath" is required.');
      } catch (e) {
        console.warn(e); // eslint-disable-line no-console

        return;
      }

      gtag('config', this.trackingId, {
        'page_title': pageTitle,
        'page_path': pagePath
      });
    }
  }, {
    key: "_sendEvent",
    value: function _sendEvent(eventAction, eventCategory, eventLabel) {
      var eventValue = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

      try {
        this._valueIsString(eventAction, 'string "eventAction" is required.');

        this._valueIsString(eventCategory, 'string "eventCategory" is required.');

        this._valueIsString(eventLabel, 'string "eventLabel" is required.');

        if (eventValue) {
          this._valueIsInteger(eventValue, 'number "eventValue" must be an integer greater than or equal to 1', 0);
        }
      } catch (e) {
        console.warn(e); // eslint-disable-line no-console

        return;
      }

      gtag('event', eventAction, {
        'event_category': eventCategory,
        'event_label': eventLabel,
        'value': eventValue
      });
    }
  }, {
    key: "fileTracker",
    value: function fileTracker() {
      var _this = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var trackerOptions = _extends(this.defaultOptions.fileTracker, options);

      var links = document.querySelectorAll(trackerOptions.fileSelector);
      var getFileTitle = trackerOptions.getFileTitle;
      var handlerId = null;
      [].forEach.call(links, function (link) {
        handlerId = _this.eventHandler.addListener(link, 'click', function (e) {
          var pageTitle = getFileTitle(link);
          var pagePath = link.getAttribute('href');

          if (_this.options.debug) {
            e.preventDefault();
            console.log('pageTitle:', pageTitle); // eslint-disable-line no-console
          }

          _this._sendPageView(pageTitle, pagePath);
        });

        _this.listenerIds.push(handlerId);
      });
    }
  }, {
    key: "bannerTracker",
    value: function bannerTracker() {
      var _this2 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var trackerOptions = _extends(this.defaultOptions.bannerTracker, options);

      var links = document.querySelectorAll(trackerOptions.bannerSelector);
      var eventAction = trackerOptions.eventAction;
      var eventCategory = trackerOptions.eventCategory;
      var getImageLabel = trackerOptions.getImageLabel;
      var handlerId = null;
      [].forEach.call(links, function (link) {
        handlerId = _this2.eventHandler.addListener(link, 'click', function (e) {
          var images = link.getElementsByTagName('img');
          var eventLabel = getImageLabel(images[0]);

          if (_this2.options.debug) {
            e.preventDefault();
            console.log('eventAction:', eventAction); // eslint-disable-line no-console

            console.log('eventCategory:', eventCategory); // eslint-disable-line no-console

            console.log('eventLabel:', eventLabel); // eslint-disable-line no-console
          }

          _this2._sendEvent(eventAction, eventCategory, eventLabel);
        });

        _this2.listenerIds.push(handlerId);
      });
    }
  }, {
    key: "youTubeTracker",
    value: function youTubeTracker() {
      var _this3 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var trackerOptions = _extends(this.defaultOptions.youtubeTracker, options);

      var players = document.querySelectorAll(trackerOptions.playerSelector);
      var eventAction = trackerOptions.eventAction;
      var eventCategory = trackerOptions.eventCategory;
      var videoIds = [];
      var playedVideoIds = [];

      if (!trackerOptions.apiScriptSrc) {
        console.error('YoutubeTracker option "apiScriptSrc" is required.'); // eslint-disable-line no-console
      }

      if (players.length > 0) {
        var firstScriptTag = document.getElementsByTagName('script')[0];
        var youtubeApiScript = document.createElement('script');
        youtubeApiScript.src = trackerOptions.apiScriptSrc;
        firstScriptTag.parentNode.insertBefore(youtubeApiScript, firstScriptTag);
      }

      [].forEach.call(players, function (player) {
        var videoId = player.getAttribute('src').replace(/.*embed\/(.*)\?.*/, '$1');
        player.setAttribute('id', videoId);
        videoIds.push(videoId);
      });

      var onPlayerStateChange = function onPlayerStateChange(event) {
        if (event.data === 1) {
          var videoData = event.target.getVideoData();

          if (playedVideoIds.indexOf(videoData.video_id) === -1) {
            if (_this3.options.debug) {
              console.log('eventAction:', eventAction); // eslint-disable-line no-console

              console.log('eventCategory:', eventCategory); // eslint-disable-line no-console

              console.log('eventLabel:', videoData.title); // eslint-disable-line no-console

              window.youTubeIframeMovieIsPlaying = true;
            }

            _this3._sendEvent(eventAction, eventCategory, videoData.title);

            playedVideoIds.push(videoData.video_id);
          }
        }
      };

      window.onYouTubeIframeAPIReady = function () {
        var players = [];
        videoIds.forEach(function (id) {
          var player = new YT.Player(id, {
            events: {
              'onStateChange': onPlayerStateChange
            }
          });
          players.push(player);
        });

        if (_this3.options.debug) {
          window.youTubeIframeAPIIsReady = true;
          window.youTubePlayerForTest = players[0];
        }
      };
    }
  }, {
    key: "removeAllTracker",
    value: function removeAllTracker() {
      var _this4 = this;

      this.listenerIds.forEach(function (id) {
        _this4.eventHandler.removeListener(id);
      });
    }
  }]);

  return Autotrack;
}();