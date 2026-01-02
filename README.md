# Japanese Lyrics Editor (J-Lyrics)

日本語の歌詞作成を支援する VS Code 拡張機能です。
各行のモーラ数（拍数）と、行末の母音をリアルタイムで表示します。
Suno AI等の作詞作業に便利かもしれません。

> **Note:** This is an unofficial extension designed for Japanese lyrics editing.
> It features mora (syllable) counting and vowel detection to assist in rhyme schemes.

## Features (機能)
* **Mora Counter (モーラカウント)**
  * 行頭にその行のモーラ数（拍数）を表示します。
  * 拗音（きゃ、しゅ等）や促音（っ）も正しくカウントします。

* **Vowel Display (母音表示)**
  * 行頭の数値の横に、その行の「最後の母音 (a, i, u, e, o, n)」を表示します。
  * 母音は色分け表示します。
  * 韻（ライム）を踏む際の参考です。

* **Real-time Updates**
  * 入力に合わせてリアルタイムに更新されます。

* **Kanji Support**
  * 漢字が含まれていても、自動的に読みを判定してカウントします（Powered by Kuroshiro）。

* **Suno Ruby Support**
  * `漢字(よみ)` や `[Chorus]` などのメタタグ形式に対応しています。

* **Syntax Highlighting (構文ハイライト)**
  * メタタグ（`[Intro]`, `[Verse]`, `[Chorus]` など）を色分け表示します。
  * ルビ記法の括弧部分も強調表示されます。

* **Outline & Folding (アウトライン表示と折りたたみ)**
  * サイドバーのアウトラインに曲の構造を表示します。
  * 各セクションを折りたたんで見やすく管理できます。

* **Snippets & Auto-completion (スニペットと自動補完)**
  * `[` を入力すると、メタタグの候補が表示されます。
  * `intro`, `verse`, `chorus` などのプレフィックスでも挿入できます。

* **Hover Details (ホバー詳細表示)**
  * モーラ数表示部分にマウスをホバーすると、詳細情報が表示されます。
  * モーラ分解（例: `が / っ / こ / う`）を確認できます。
  * 変換前/変換後のテキストやルビ記法の解釈も表示されます。

## Usage (使い方)

1. 拡張子が `.jlyrics` のファイルを作成します
（Create a file with **`.jlyrics`** extension.）
2. 歌詞を入力してください
（Start writing Japanese lyrics.）
3. 行頭にグレーの文字で、モーラ数と母音が表示されます
（Mora counts and vowels will appear at the beginning of each line as decorations.）
4. モーラ数にマウスをホバーすると、詳細な分解情報が表示されます
（Hover over the mora count to see detailed breakdown information.）

> **Tip:** If the counts do not appear, verify that the language mode is set to "Japanese Lyrics" (bottom right of the window).


## Example

```text
     [Chorus]
10 e 君の名前を呼んで
 8 e 夜に響く声
 7 o 明日(あした)も今日も
 3 o きっと
```

*(The numbers and vowels are displayed as decorations, not actual text)*

## Settings (設定)

この拡張機能は以下の設定をサポートしています：

* **`jlyrics.showMoraCount`** (デフォルト: `true`)
  * モーラ数を行頭に表示します。
  * Show mora count at the beginning of each line.

* **`jlyrics.showVowel`** (デフォルト: `true`)
  * 行末の母音を表示します。
  * Show ending vowel of each line.

* **`jlyrics.colorizeVowel`** (デフォルト: `true`)
  * 母音を色分けして表示します。
  * Colorize vowels by type.

設定を変更するには、VS Code の設定画面（`Ctrl+,`）で「jlyrics」を検索してください。

## Requirements

* VS Code 1.80.0 or higher
* Internet connection (Required for the first time to load the Kanji dictionary)

## License & Credits

This software includes the following third-party libraries:
* **kuroshiro** (MIT License)
* **kuroshiro-analyzer-kuromoji** (MIT License)

This extension is released under the [MIT License](LICENSE).

---

**Disclaimer:** This is an unofficial tool and is not affiliated with Suno AI or any other music generation services.
