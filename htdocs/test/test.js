(function () {
  afterEach(function () {
    data = {};
  });

  describe('Testing FileTracker', function () {
    let autotrack = null;

    beforeEach(function () {
      const options = {
        debug: true,
      };
      autotrack = new Autotrack(GA_TRACKING_ID, options);
      autotrack.fileTracker({
        fileSelector: '.list-files-01 a[href$=".pdf"], .list-files-01 a[href$=".zip"], .list-files-01 a[href$=".xlsx"]'
      });
      autotrack.fileTracker({
        fileSelector: '.list-files-02 a[href$=".pdf"], .list-files-02 a[href$=".zip"], .list-files-02 a[href$=".xlsx"]',
        getFileTitle: function (link) {
          return link.dataset.title;
        },
      });
    });

    afterEach(function () {
      autotrack.removeAllTracker();
    });

    it('Testing .list-files-01', function () {
      const elem = document.querySelectorAll('.list-files-01 a');
      elem[0].click();
      expect(data.object.page_title).toBe('Test PDF');
      expect(data.object.page_path).toBe('/test.pdf');
    });

    it('Testing .list-files-01(link with image)', function () {
      const elem = document.querySelectorAll('.list-files-01 a');
      elem[3].click();
      expect(data.object.page_title).toBe('Pamphlet');
      expect(data.object.page_path).toBe('/test.pdf');
    });

    it('Testing .list-files-02', function () {
      const elem = document.querySelectorAll('.list-files-02 a');
      elem[1].click();
      expect(data.object.page_title).toBe('時刻表（Excel版）');
      expect(data.object.page_path).toBe('/test.xlsx');
    });
  });

  describe('Testing BannerTracker', function () {
    let autotrack = null;

    beforeEach(function () {
      const options = {
        debug: true,
      };
      autotrack = new Autotrack(GA_TRACKING_ID, options);
      autotrack.bannerTracker({
        bannerSelector: '.list-banner-01 a',
        eventCategory: 'Banners 1'
      });
      autotrack.bannerTracker({
        bannerSelector: '.list-banner-02 a',
        eventAction: 'クリック',
        eventCategory: 'Banners 2',
        getImageLabel: function (img) {
          return img.dataset.label;
        }
      });
    });

    afterEach(function () {
      autotrack.removeAllTracker();
    });

    it('Testing .list-banner-01', function () {
      const elem = document.querySelectorAll('.list-banner-01 a');
      elem[0].click();
      expect(data.value).toBe('Click');
      expect(data.object.event_category).toBe('Banners 1');
      expect(data.object.event_label).toBe('バナー1');
    });

    it('Testing .list-banner-02', function () {
      const elem = document.querySelectorAll('.list-banner-02 a');
      elem[0].click();
      expect(data.value).toBe('クリック');
      expect(data.object.event_category).toBe('Banners 2');
      expect(data.object.event_label).toBe('Webアクセシビリティ');
    });
  });

  describe('Testing YouTubeTracker', function () {
    let autotrack = null;
    let intervalId = null;

    beforeEach(function (done) {
      const options = {
        debug: true,
      };
      autotrack = new Autotrack(GA_TRACKING_ID, options);
      autotrack.youTubeTracker({
        eventCategory: '動画',
        eventAction: '再生',
      });

      let intervalId = window.setInterval(function () {
        if (window.youTubeIframeAPIIsReady) {
          window.clearInterval(intervalId);
          done();
        }
      }, 1000);
    });

    afterEach(function () {
      autotrack.removeAllTracker();
      window.clearInterval(intervalId);
    });

    it('Testing movie play', function (done) {
      intervalId = window.setInterval(function () {
        if (window.youTubeIframeMovieIsPlaying) {
          window.clearInterval(intervalId);
          expect(data.value).toBe('再生');
          expect(data.object.event_category).toBe('動画');
          expect(data.object.event_label).toBe('大名行列2017');
          done();
        }
      }, 1000);
    });
  });
}());
