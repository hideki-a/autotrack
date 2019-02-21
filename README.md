# Autotrack

Google AnalyticsでHTMLファイルのページビュー以外の計測を容易に実現する機能を提供します。

- PDFファイル等の閲覧数
- バナーのクリック数
- YouTube動画の再生数

## 使い方

`dist`ディレクトリ内のファイルを使うか、`src`ディレクトリ内のファイルをあなたのスクリプトファイルと結合し[Babel](https://babeljs.io/)でトランスパイルして使います。

※Babelでトランスパイルする際は[babel-plugin-transform-object-assign](https://www.npmjs.com/package/babel-plugin-transform-object-assign)を使用しました。

### 事前準備

gtag.jsを`head`要素に挿入します。その際、トラッキングIDを定数`GA_TRACKING_ID`に格納します。

```
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-12345678-9"></script>
<script>
  const GA_TRACKING_ID = 'UA-12345678-9';
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', GA_TRACKING_ID);
</script>
```

### PDFファイル等の閲覧数計測

下記コードでAutotrackインスタンスを生成し、`fileTracker()`メソッドで計測を開始します。
デフォルトでは`.pdf`と`.zip`が対象になります。
（インスタンスの生成は1度でOK）

```
const autotrack = new Autotrack(GA_TRACKING_ID);
autotrack.fileTracker();
```

対象ファイルを自分で定義する場合や、計測する要素を限定する場合は`fileSelector`オプションで指定します。（設定値は`document.querySelectorAll()`に渡されます。）

```
autotrack.fileTracker({
  fileSelector: 'main a[href$=".pdf"], main a[href$=".zip"], main a[href$=".xlsx"]'
});
```

デフォルトではa要素内のテキストをタイトルとして送信しますが、`getFileTitle`オプションにタイトル収集のための関数を書くことで`data-*`属性を利用することも可能です。

```
autotrack.fileTracker({
  getFileTitle: function (link) {
    return link.dataset.title;
  },
});
```

### バナーのクリック数計測

下記コードでAutotrackインスタンスを生成し、`bannerTracker()`メソッドで計測を開始します。
（インスタンスの生成は1度でOK）

- 対象となるバナーは`bannerSelector`オプションで指定します。（設定値は`document.querySelectorAll()`に渡されます。）
- Google Analyticsに表示されるイベントアクション名を`eventAction`オプションで変更できます。（デフォルトは`Click`。）
- カテゴリ名（バナーの位置等を示す名前）を`eventCategory`オプションで指定します。

```
const autotrack = new Autotrack(GA_TRACKING_ID);
autotrack.bannerTracker({
  bannerSelector: '.list-banner-01 a',
  eventAction: 'クリック',
  eventCategory: 'Banners 1'
});
```

デフォルトでは画像の代替テキストをラベルとして送信しますが、`getImageLabel`オプションにラベル収集のための関数を書くことで`data-*`属性を利用することも可能です。

```
autotrack.bannerTracker({
  bannerSelector: '.list-banner-01 a',
  eventCategory: 'Banners 1'
  getImageLabel: function (img) {
    return img.dataset.label;
  }
});
```

### YouTube動画の再生数計測

下記コードでAutotrackインスタンスを生成し、`youTubeTracker()`メソッドで計測を開始します。
（インスタンスの生成は1度でOK）

- YouTube動画をiframeで埋め込む際、URLに`?enablejsapi=1`を付与します。

```
const autotrack = new Autotrack(GA_TRACKING_ID);
autotrack.youTubeTracker({
  eventCategory: '動画',
  eventAction: '再生',
});
```

## デバッグモード

Autotrackインスタンスを生成する際、オプションで`debug`を`true`にすると、下記のような挙動になります。

- ブラウザのコンソールに送信する値を表示します。（オプションで設定した内容が正しいか確認できます。）
- a要素をクリックしても画面遷移をしません。

```
const options = {
  debug: true,
};
const autotrack = new Autotrack(GA_TRACKING_ID, options);
```

## テスト

[Jasmine](https://jasmine.github.io/)を使用してテスト（`htdocs/test/test/js`）を記述し、`htdocs/test/index.html`を各ブラウザで表示して動作確認をしました。
