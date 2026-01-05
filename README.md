# Japanese Lyrics Editor (J-Lyrics)

日本語の歌詞作成を支援する VS Code 拡張機能です。
各行のモーラ数（拍数）と、行末の母音をリアルタイムで表示します。
Suno AI等の作詞作業に便利かもしれません。

> **Note:** This extension is designed **exclusively for Japanese lyrics**. It will not work with other languages.
> Features include mora (syllable) counting and vowel detection specific to Japanese phonetics.

## 機能 (Features)
* **モーラ数表示 (Mora Counter)**
  * 行頭にその行のモーラ数（拍数）を表示します。
  * 拗音（きゃ、しゅ等）や促音（っ）も正しくカウントします。
  * 漢字が含まれていても、読みを判定してカウントします（Powered by Kuroshiro）。
  * `漢字(よみ)`のようにルビで読み方を指定できます。
  * モーラ数表示部分にマウスをホバーすると、モーラ分解（例: `が / っ / こ / う`）を確認できます。

* **行末の母音表示 (Vowel Display)**
  * ガター領域（行番号の左側）に、その行の「最後の母音」をアイコンで表示します。
  * 母音ごとに背景色で色分けされます（柔らかいパステルカラー）。
  * 韻（ライム）を踏む際の参考です。
  * 表示スタイル（カタカナ、ひらがな、ローマ字）は設定で変更できます。デフォルトはカタカナ表示。

* **リアルタイム更新 (Real-time Updates)**
  * 入力に合わせてリアルタイムにモーラ数、母音の表示を更新します。

* **Suno の表記サポート (Suno Support)**
  * `漢字(よみ)` や `[Chorus]` などのSunoのメタタグ形式に対応しています。
  * メタタグ（`[Intro]`, `[Verse]`, `[Chorus]` など）を色分け表示します。
  * サイドバーのアウトラインに曲の構造を表示します。
  * 各セクションを折りたたんで見やすく管理できます。
  * `[` を入力すると、メタタグの候補が表示されます。
  * `intro`, `verse`, `chorus` などのプレフィックスでも挿入できます。

## 表示例 (Example)

![表示例](https://raw.githubusercontent.com/dokonidemoiruhito/japanese-lyrics-editor/master/images/screenshot.png)


## 導入手順 (Installation)

### 1. VS Code のインストール

まだ VS Code をインストールしていない場合：

1. [Visual Studio Code 公式サイト](https://code.visualstudio.com/) にアクセス
2. 「Download」ボタンをクリック（自動的にお使いのOSが検出されます）
3. ダウンロードしたファイルを実行してインストール
4. インストール完了後、VS Code を起動

### 2. 拡張機能のインストール

現在、この拡張機能はマーケットプレイスで公開されていません。以下の手順で手動インストールしてください：

1. [リリースページ](https://github.com/dokonidemoiruhito/japanese-lyrics-editor/releases)から最新の `.vsix` ファイルをダウンロード
2. VS Code を起動
3. 左側のアクティビティバーから「拡張機能」アイコンをクリック（または `Ctrl+Shift+X`）
4. 右上の「...」メニューをクリック
5. 「VSIX からのインストール...」を選択
6. ダウンロードした `.vsix` ファイルを選択
7. インストール完了後、VS Code を再読み込み

## 使い方 (Usage)

1. 新しいファイルを作成（`Ctrl+N`）
2. ファイルを保存（`Ctrl+S`）し、拡張子を `.jlyrics` にする
   - 例: `my-song.jlyrics`
3. 日本語の歌詞を入力
4. 行頭にモーラ数、ガター領域（行番号の左側）に母音が表示されます
5. モーラ数にマウスをホバーすると、詳細な分解情報が表示されます

> **ヒント**: 初回起動時は漢字辞書の読み込みに数秒かかります。インターネット接続が必要です。

## 設定 (Settings)

この拡張機能は以下の設定をサポートしています：

* **`jlyrics.showMoraCount`** (デフォルト: `true`)
  * モーラ数を行頭に表示します。

* **`jlyrics.showVowel`** (デフォルト: `true`)
  * 行末の母音をガター領域に表示します。

* **`jlyrics.vowelDisplayStyle`** (デフォルト: `katakana`)
  * 母音の表示スタイルを選択します。
  * 選択肢:
    * `romaji` - ローマ字（小文字）: ａ, ｉ, ｕ, ｅ, ｏ, ｎ
    * `romaji-upper` - ローマ字（大文字）: Ａ, Ｉ, Ｕ, Ｅ, Ｏ, Ｎ
    * `hiragana` - ひらがな: あ, い, う, え, お, ん
    * `katakana` - カタカナ: ア, イ, ウ, エ, オ, ン（デフォルト）

設定を変更するには、VS Code の設定画面（`Ctrl+,`）で「jlyrics」を検索してください。

## 動作環境 (Requirements)

* VS Code 1.80.0 以上
* インターネット接続（初回起動時の漢字辞書読み込みに必要）

## ライセンスとクレジット (License & Credits)

このソフトウェアは以下のサードパーティライブラリを使用しています：
* **kuroshiro** (MIT License)
* **kuroshiro-analyzer-kuromoji** (MIT License)

この拡張機能は [MIT License](LICENSE) の下で公開されています。

---

**免責事項**: この拡張機能は非公式ツールであり、Suno AI やその他の音楽生成サービスとは一切関係ありません。
