import * as vscode from 'vscode';
// @ts-ignore - kuroshiroはTypeScript型定義がないため
import Kuroshiro from 'kuroshiro';
// @ts-ignore
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

let kuroshiroInstance: any = null;
let kuroshiroReady = false;
let paddingDecorationType: vscode.TextEditorDecorationType; // 透明な"0"
let moraDecorationType: vscode.TextEditorDecorationType; // モーラ数
let vowelDecorationType: vscode.TextEditorDecorationType; // 母音（width設定）

// 母音マッピング
const vowelMap: { [key: string]: string } = {
    'あ': 'a', 'か': 'a', 'が': 'a', 'さ': 'a', 'ざ': 'a', 'た': 'a', 'だ': 'a', 'な': 'a', 'は': 'a', 'ば': 'a', 'ぱ': 'a', 'ま': 'a', 'や': 'a', 'ら': 'a', 'わ': 'a',
    'ア': 'a', 'カ': 'a', 'ガ': 'a', 'サ': 'a', 'ザ': 'a', 'タ': 'a', 'ダ': 'a', 'ナ': 'a', 'ハ': 'a', 'バ': 'a', 'パ': 'a', 'マ': 'a', 'ヤ': 'a', 'ラ': 'a', 'ワ': 'a',
    'い': 'i', 'き': 'i', 'ぎ': 'i', 'し': 'i', 'じ': 'i', 'ち': 'i', 'ぢ': 'i', 'に': 'i', 'ひ': 'i', 'び': 'i', 'ぴ': 'i', 'み': 'i', 'り': 'i',
    'イ': 'i', 'キ': 'i', 'ギ': 'i', 'シ': 'i', 'ジ': 'i', 'チ': 'i', 'ヂ': 'i', 'ニ': 'i', 'ヒ': 'i', 'ビ': 'i', 'ピ': 'i', 'ミ': 'i', 'リ': 'i',
    'う': 'u', 'く': 'u', 'ぐ': 'u', 'す': 'u', 'ず': 'u', 'つ': 'u', 'づ': 'u', 'ぬ': 'u', 'ふ': 'u', 'ぶ': 'u', 'ぷ': 'u', 'む': 'u', 'ゆ': 'u', 'る': 'u',
    'ウ': 'u', 'ク': 'u', 'グ': 'u', 'ス': 'u', 'ズ': 'u', 'ツ': 'u', 'ヅ': 'u', 'ヌ': 'u', 'フ': 'u', 'ブ': 'u', 'プ': 'u', 'ム': 'u', 'ユ': 'u', 'ル': 'u',
    'え': 'e', 'け': 'e', 'げ': 'e', 'せ': 'e', 'ぜ': 'e', 'て': 'e', 'で': 'e', 'ね': 'e', 'へ': 'e', 'べ': 'e', 'ぺ': 'e', 'め': 'e', 'れ': 'e',
    'エ': 'e', 'ケ': 'e', 'ゲ': 'e', 'セ': 'e', 'ゼ': 'e', 'テ': 'e', 'デ': 'e', 'ネ': 'e', 'ヘ': 'e', 'ベ': 'e', 'ペ': 'e', 'メ': 'e', 'レ': 'e',
    'お': 'o', 'こ': 'o', 'ご': 'o', 'そ': 'o', 'ぞ': 'o', 'と': 'o', 'ど': 'o', 'の': 'o', 'ほ': 'o', 'ぼ': 'o', 'ぽ': 'o', 'も': 'o', 'よ': 'o', 'ろ': 'o', 'を': 'o',
    'オ': 'o', 'コ': 'o', 'ゴ': 'o', 'ソ': 'o', 'ゾ': 'o', 'ト': 'o', 'ド': 'o', 'ノ': 'o', 'ホ': 'o', 'ボ': 'o', 'ポ': 'o', 'モ': 'o', 'ヨ': 'o', 'ロ': 'o', 'ヲ': 'o',
    'ん': 'n', 'ン': 'n',
    'ー': ''
};

// Kuroshiro初期化
async function initKuroshiro(): Promise<void> {
    try {
        console.log('Initializing Kuroshiro...');
        kuroshiroInstance = new Kuroshiro();
        const analyzer = new KuromojiAnalyzer();
        await kuroshiroInstance.init(analyzer);
        kuroshiroReady = true;
        console.log('Kuroshiro initialized successfully');
    } catch (error) {
        console.error('Kuroshiro initialization failed:', error);
        kuroshiroReady = false;
    }
}

// モーラ数カウント関数
async function countMora(text: string): Promise<number> {
    if (!text || text.trim() === '') return 0;

    // タグを除外
    text = text.replace(/\[.*?\]/g, '');

    // Sunoのルビ記法を処理：漢字(よみ) → よみ
    text = text.replace(/([一-龯々〆ヵヶ]+)\(([ぁ-んー]+)\)/g, '$2');

    // Kuroshiroが準備できている場合は漢字をひらがなに変換
    if (kuroshiroReady && kuroshiroInstance) {
        try {
            text = await kuroshiroInstance.convert(text, { to: 'hiragana', mode: 'normal' });
        } catch (error) {
            console.error('Conversion error:', error);
        }
    }

    let count = 0;
    const smallKana = ['ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ゃ', 'ゅ', 'ょ', 'ゎ',
                      'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ャ', 'ュ', 'ョ', 'ヮ'];

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        // 日本語文字かチェック
        const isJapanese = (char >= 'ぁ' && char <= 'ん') ||
                          (char >= 'ァ' && char <= 'ヶ') ||
                          (char >= 'ー' && char <= 'ー');

        if (isJapanese) {
            // 小書き文字（拗音）は前の文字と合わせて1モーラ
            if (smallKana.includes(char) && i > 0) {
                // カウントしない（前の文字と合わせて1モーラ）
            } else {
                count++;
            }
        }
    }

    return count;
}

// 行末の母音を取得
async function getEndVowel(text: string): Promise<string> {
    if (!text || text.trim() === '') return '';

    // タグを除外
    text = text.replace(/\[.*?\]/g, '').trim();
    if (!text) return '';

    // Sunoのルビ記法を処理
    text = text.replace(/([一-龯々〆ヵヶ]+)\(([ぁ-んー]+)\)/g, '$2');

    // Kuroshiroで漢字をひらがなに変換
    if (kuroshiroReady && kuroshiroInstance) {
        try {
            text = await kuroshiroInstance.convert(text, { to: 'hiragana', mode: 'normal' });
        } catch (error) {
            console.error('Vowel conversion error:', error);
        }
    }

    // 末尾の文字を取得
    let lastChar = text[text.length - 1];

    // 長音記号の場合は、その前の文字の母音を使う
    if (lastChar === 'ー') {
        if (text.length >= 2) {
            lastChar = text[text.length - 2];
        }
    }

    // 母音を返す
    return vowelMap[lastChar] || '';
}

// DocumentSymbolProvider - アウトライン表示用
class JLyricsDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
        const symbols: vscode.DocumentSymbol[] = [];
        const metaTagPattern = /^\s*\[(Intro|Verse(?:\s+\d+)?|Pre-Chorus|Chorus|Bridge|Outro|Break|Instrumental)\]\s*$/i;

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const match = line.text.match(metaTagPattern);

            if (match) {
                const tagName = match[1];
                // 次のメタタグまでの範囲を取得
                let endLine = i;
                for (let j = i + 1; j < document.lineCount; j++) {
                    if (document.lineAt(j).text.match(metaTagPattern)) {
                        endLine = j - 1;
                        break;
                    }
                    endLine = j;
                }

                const range = new vscode.Range(i, 0, endLine, document.lineAt(endLine).text.length);
                const selectionRange = new vscode.Range(i, 0, i, line.text.length);

                const symbol = new vscode.DocumentSymbol(
                    `[${tagName}]`,
                    '',
                    vscode.SymbolKind.Array,
                    range,
                    selectionRange
                );

                symbols.push(symbol);
            }
        }

        return symbols;
    }
}

// FoldingRangeProvider - 折りたたみ機能用
class JLyricsFoldingRangeProvider implements vscode.FoldingRangeProvider {
    provideFoldingRanges(document: vscode.TextDocument): vscode.FoldingRange[] {
        const foldingRanges: vscode.FoldingRange[] = [];
        const metaTagPattern = /^\s*\[(Intro|Verse(?:\s+\d+)?|Pre-Chorus|Chorus|Bridge|Outro|Break|Instrumental)\]\s*$/i;

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);

            if (line.text.match(metaTagPattern)) {
                // 次のメタタグまでの範囲を取得
                let endLine = i;
                for (let j = i + 1; j < document.lineCount; j++) {
                    if (document.lineAt(j).text.match(metaTagPattern)) {
                        endLine = j - 1;
                        break;
                    }
                    endLine = j;
                }

                if (endLine > i) {
                    foldingRanges.push(new vscode.FoldingRange(i, endLine));
                }
            }
        }

        return foldingRanges;
    }
}

// モーラ数を表示する関数
async function updateMoraDecorations(editor: vscode.TextEditor): Promise<void> {
    if (!editor || editor.document.languageId !== 'jlyrics') {
        return;
    }

    // Kuroshiroが初期化されていない場合は待つ
    if (!kuroshiroReady) {
        console.log('Kuroshiro not ready yet, skipping mora update');
        return;
    }

    // 設定を読み込む
    const config = vscode.workspace.getConfiguration('jlyrics');
    const showMoraCount = config.get<boolean>('showMoraCount', true);
    const showVowel = config.get<boolean>('showVowel', true);
    const colorizeVowel = config.get<boolean>('colorizeVowel', true);

    const paddingDecorations: vscode.DecorationOptions[] = [];
    const moraDecorations: vscode.DecorationOptions[] = [];
    const vowelDecorations: vscode.DecorationOptions[] = [];
    const document = editor.document;

    for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
        const line = document.lineAt(lineIndex);
        const text = line.text;

        const mora = await countMora(text);
        const vowel = await getEndVowel(text);

        // 1つ目: 透明な"0"（一桁なら1個、二桁なら無し、メタタグなら2個）
        if (showMoraCount) {
            let paddingText = '';
            if (mora === 0) {
                paddingText = '00';
            } else if (mora < 10) {
                paddingText = '0';
            }

            if (paddingText) {
                paddingDecorations.push({
                    range: new vscode.Range(lineIndex, 0, lineIndex, 0),
                    renderOptions: {
                        before: {
                            contentText: paddingText,
                            color: 'transparent',
                            fontWeight: 'normal'
                        }
                    }
                });
            }

            // 2つ目: モーラ数（メタタグの時は無し）
            if (mora > 0) {
                moraDecorations.push({
                    range: new vscode.Range(lineIndex, 0, lineIndex, 0),
                    renderOptions: {
                        before: {
                            contentText: mora.toString(),
                            color: new vscode.ThemeColor('editorCodeLens.foreground'),
                            fontWeight: 'normal'
                        }
                    }
                });
            }
        }

        // 3つ目: 母音（width設定、母音ごとに色分け）
        if (showVowel) {
            const vowelText = mora > 0 && vowel ? ` ${vowel}` : '';

            // 母音の色を決定
            let vowelColor: string | vscode.ThemeColor;
            if (colorizeVowel) {
                // 母音ごとの色設定
                const vowelColors: { [key: string]: string } = {
                    'a': '#ff0000ff',  // 赤
                    'i': '#4fb0ffff',  // 青
                    'u': '#51cf66',  // 緑
                    'e': '#f5ff3bff',  // 黄
                    'o': '#fa71ffff',  // ピンク
                    'n': '#b9bdc1ff'   // グレー
                };
                vowelColor = vowelColors[vowel] || new vscode.ThemeColor('editorCodeLens.foreground');
            } else {
                vowelColor = new vscode.ThemeColor('editorCodeLens.foreground');
            }

            vowelDecorations.push({
                range: new vscode.Range(lineIndex, 0, lineIndex, 0),
                renderOptions: {
                    before: {
                        contentText: vowelText,
                        color: vowelColor,
                        fontWeight: 'normal',
                        width: '1em',
                        margin: '0 0.5em 0 0.5em'
                    }
                }
            });
        }
    }

    editor.setDecorations(paddingDecorationType, paddingDecorations);
    editor.setDecorations(moraDecorationType, moraDecorations);
    editor.setDecorations(vowelDecorationType, vowelDecorations);
}

// 拡張機能のアクティベーション
export function activate(context: vscode.ExtensionContext) {
    console.log('japanese-lyrics-editor extension is now active');

    // Decoration typeを3つ作成
    paddingDecorationType = vscode.window.createTextEditorDecorationType({
        before: {
            color: 'transparent',
        }
    });

    moraDecorationType = vscode.window.createTextEditorDecorationType({
        before: {
            color: new vscode.ThemeColor('editorCodeLens.foreground'),
        }
    });

    vowelDecorationType = vscode.window.createTextEditorDecorationType({
        before: {
            color: new vscode.ThemeColor('editorCodeLens.foreground'),
        }
    });

    // Completion Provider を登録
    const metaTags = [
        { label: '[Intro]', description: 'イントロ' },
        { label: '[Verse]', description: 'ヴァース' },
        { label: '[Verse 2]', description: 'ヴァース2' },
        { label: '[Pre-Chorus]', description: 'プリコーラス' },
        { label: '[Chorus]', description: 'コーラス（サビ）' },
        { label: '[Bridge]', description: 'ブリッジ' },
        { label: '[Outro]', description: 'アウトロ' },
        { label: '[Break]', description: 'ブレイク' },
        { label: '[Instrumental]', description: 'インストゥルメンタル' }
    ];

    const completionProvider = vscode.languages.registerCompletionItemProvider(
        'jlyrics',
        {
            provideCompletionItems(document, position) {
                const linePrefix = document.lineAt(position).text.substring(0, position.character);

                // `[` を入力したときに候補を表示
                if (!linePrefix.endsWith('[')) {
                    return undefined;
                }

                return metaTags.map(tag => {
                    const item = new vscode.CompletionItem(tag.label, vscode.CompletionItemKind.Snippet);
                    item.detail = tag.description;
                    // `[` と `]` の両方を除く（autoClosingPairsにより `]` も自動挿入されるため）
                    item.insertText = tag.label.substring(1, tag.label.length - 1);
                    return item;
                });
            }
        },
        '[' // `[` を入力したときにトリガー
    );

    context.subscriptions.push(completionProvider);

    // DocumentSymbolProvider を登録（アウトライン表示）
    const documentSymbolProvider = vscode.languages.registerDocumentSymbolProvider(
        'jlyrics',
        new JLyricsDocumentSymbolProvider()
    );
    context.subscriptions.push(documentSymbolProvider);

    // FoldingRangeProvider を登録（折りたたみ機能）
    const foldingRangeProvider = vscode.languages.registerFoldingRangeProvider(
        'jlyrics',
        new JLyricsFoldingRangeProvider()
    );
    context.subscriptions.push(foldingRangeProvider);

    // Kuroshiroを初期化（バックグラウンドで）
    initKuroshiro().then(() => {
        vscode.window.showInformationMessage('japanese-lyrics-editor: Kuroshiro initialized');

        // アクティブなエディタを更新
        if (vscode.window.activeTextEditor) {
            updateMoraDecorations(vscode.window.activeTextEditor);
        }
    }).catch(error => {
        vscode.window.showErrorMessage('japanese-lyrics-editor: Failed to initialize Kuroshiro');
        console.error(error);
    });

    // エディタが変更されたときにモーラ数を更新
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                updateMoraDecorations(editor);
            }
        })
    );

    // テキストが変更されたときにモーラ数を更新
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.activeTextEditor;
            if (editor && event.document === editor.document) {
                updateMoraDecorations(editor);
            }
        })
    );

    // 設定が変更されたときにデコレーションを更新
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('jlyrics')) {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    updateMoraDecorations(editor);
                }
            }
        })
    );
}

// 拡張機能の非アクティベーション
export function deactivate() {
    if (paddingDecorationType) {
        paddingDecorationType.dispose();
    }
    if (moraDecorationType) {
        moraDecorationType.dispose();
    }
    if (vowelDecorationType) {
        vowelDecorationType.dispose();
    }
}
