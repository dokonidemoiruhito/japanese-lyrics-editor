import * as vscode from 'vscode';
// @ts-ignore - kuroshiroはTypeScript型定義がないため
import Kuroshiro from 'kuroshiro';
// @ts-ignore
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

let kuroshiroInstance: any = null;
let kuroshiroReady = false;
let kuroshiroInitializing = false; // 初期化中フラグ
let paddingDecorationType: vscode.TextEditorDecorationType; // 透明な"0"
let moraDecorationType: vscode.TextEditorDecorationType; // モーラ数
let gutterVowelDecorationTypes: { [key: string]: vscode.TextEditorDecorationType } = {}; // ガター母音表示（母音ごと）

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

// 母音ごとの色設定
const vowelColors: { [key: string]: string } = {
    'a': '#ffcdd2ff',  // Red 100 (優しい赤)
    'i': '#b3e5fcff',  // Light Blue 100 (空色)
    'u': '#c8e6c9ff',  // Green 100 (若草色)
    'e': '#f0f4c3ff',  // Lime 100 (ライムイエロー)
    'o': '#e1bee7ff',  // Purple 100 (ラベンダー)
    'n': '#cfd8dcff'   // Blue Grey 100 (シルバーグレー)
};

// 母音の表示マッピング（スタイル別）
const vowelDisplayMaps: { [style: string]: { [key: string]: string } } = {
    'romaji': {
        'a': 'ａ', 'i': 'ｉ', 'u': 'ｕ', 'e': 'ｅ', 'o': 'ｏ', 'n': 'ｎ'
    },
    'romaji-upper': {
        'a': 'Ａ', 'i': 'Ｉ', 'u': 'Ｕ', 'e': 'Ｅ', 'o': 'Ｏ', 'n': 'Ｎ'
    },
    'hiragana': {
        'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お', 'n': 'ん'
    },
    'katakana': {
        'a': 'ア', 'i': 'イ', 'u': 'ウ', 'e': 'エ', 'o': 'オ', 'n': 'ン'
    }
};

// SVG Data URIを生成
function createVowelSvg(vowel: string, displayStyle: string = 'katakana'): vscode.Uri {
    const color = vowelColors[vowel] || '#808080';
    const displayMap = vowelDisplayMaps[displayStyle] || vowelDisplayMaps['katakana'];
    const displayText = displayMap[vowel] || vowel;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
        <rect x="0" y="0" width="16" height="16" fill="${color}" />
        <text x="8" y="13" text-anchor="middle" font-size="14" font-family="Consolas" fill="black">${displayText}</text>
    </svg>`;
    const encoded = Buffer.from(svg).toString('base64');
    return vscode.Uri.parse(`data:image/svg+xml;base64,${encoded}`);
}

// Kuroshiro初期化（遅延初期化）
async function initKuroshiro(): Promise<void> {
    if (kuroshiroReady || kuroshiroInitializing) {
        return; // 既に初期化済みまたは初期化中
    }

    kuroshiroInitializing = true;

    try {
        console.log('Initializing Kuroshiro...');
        vscode.window.showInformationMessage('J-Lyrics: 漢字辞書を読み込んでいます...');

        kuroshiroInstance = new Kuroshiro();
        const analyzer = new KuromojiAnalyzer();
        await kuroshiroInstance.init(analyzer);
        kuroshiroReady = true;

        console.log('Kuroshiro initialized successfully');
        vscode.window.showInformationMessage('J-Lyrics: 漢字辞書の読み込みが完了しました');

        // 初期化完了後、アクティブなエディタを更新
        if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === 'jlyrics') {
            updateMoraDecorations(vscode.window.activeTextEditor);
        }
    } catch (error) {
        console.error('Kuroshiro initialization failed:', error);
        kuroshiroReady = false;
        vscode.window.showErrorMessage('J-Lyrics: 漢字辞書の読み込みに失敗しました');
    } finally {
        kuroshiroInitializing = false;
    }
}

// モーラを分解して配列で返す関数
async function decomposeMora(text: string): Promise<string[]> {
    if (!text || text.trim() === '') return [];

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

    const moraList: string[] = [];
    const smallKana = ['ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ゃ', 'ゅ', 'ょ', 'ゎ',
                      'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ャ', 'ュ', 'ョ', 'ヮ'];

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        // 日本語文字かチェック
        const isJapanese = (char >= 'ぁ' && char <= 'ん') ||
                          (char >= 'ァ' && char <= 'ヶ') ||
                          (char >= 'ー' && char <= 'ー');

        if (isJapanese) {
            // 小書き文字（拗音）は前の文字と結合
            if (smallKana.includes(char) && moraList.length > 0) {
                moraList[moraList.length - 1] += char;
            } else {
                moraList.push(char);
            }
        }
    }

    return moraList;
}

// モーラ数カウント関数
async function countMora(text: string): Promise<number> {
    const moraList = await decomposeMora(text);
    return moraList.length;
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

    // Kuroshiroが初期化されていない場合は初期化を開始
    if (!kuroshiroReady && !kuroshiroInitializing) {
        console.log('Starting Kuroshiro initialization on first jlyrics file open');
        initKuroshiro(); // 非同期で初期化開始
        return; // 初期化完了後に再度呼ばれる
    }

    // 初期化中または未完了の場合はスキップ
    if (!kuroshiroReady) {
        console.log('Kuroshiro not ready yet, skipping mora update');
        return;
    }

    // 設定を読み込む
    const config = vscode.workspace.getConfiguration('jlyrics');
    const showMoraCount = config.get<boolean>('showMoraCount', true);
    const showVowel = config.get<boolean>('showVowel', true);

    const paddingDecorations: vscode.DecorationOptions[] = [];
    const moraDecorations: vscode.DecorationOptions[] = [];
    const gutterVowelDecorations: { [key: string]: vscode.DecorationOptions[] } = {
        'a': [], 'i': [], 'u': [], 'e': [], 'o': [], 'n': []
    };
    const document = editor.document;

    for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
        const line = document.lineAt(lineIndex);
        const text = line.text;

        const mora = await countMora(text);
        const vowel = await getEndVowel(text);
        const moraList = await decomposeMora(text);

        // ホバーメッセージを作成
        const hoverMessage = new vscode.MarkdownString();
        hoverMessage.appendMarkdown(`**モーラ数**: ${mora}`);
        if (vowel) {
            hoverMessage.appendMarkdown(` | **母音**: ${vowel}`);
        }
        hoverMessage.appendMarkdown(`  \n`);

        if (moraList.length > 0) {
            hoverMessage.appendMarkdown(`**分解**: \`${moraList.join(' / ')}\`  \n`);
        }

        hoverMessage.appendMarkdown(`\n---\n`);
        hoverMessage.appendMarkdown(`**変換前**: \`${text}\`  \n`);

        // Sunoのルビ記法を処理前に保存
        const rubyMatches = [...text.matchAll(/([一-龯々〆ヵヶ]+)\(([ぁ-んー]+)\)/g)];
        if (rubyMatches.length > 0) {
            const rubyInfo = rubyMatches.map(m => `${m[1]}→${m[2]}`).join(', ');
            hoverMessage.appendMarkdown(`**ルビ**: ${rubyInfo}  \n`);
        }

        // 変換後のテキストを取得
        let convertedText = text.replace(/\[.*?\]/g, '').replace(/([一-龯々〆ヵヶ]+)\(([ぁ-んー]+)\)/g, '$2');
        if (kuroshiroReady && kuroshiroInstance && moraList.length > 0) {
            try {
                const tempConverted = await kuroshiroInstance.convert(convertedText, { to: 'hiragana', mode: 'normal' });
                if (tempConverted !== convertedText) {
                    hoverMessage.appendMarkdown(`**変換後**: \`${tempConverted}\`  \n`);
                }
            } catch (error) {
                // 変換エラーは無視
            }
        }

        // ガターに母音を表示
        if (showVowel && mora > 0 && vowel && gutterVowelDecorations[vowel]) {
            gutterVowelDecorations[vowel].push({
                range: new vscode.Range(lineIndex, 0, lineIndex, 0)
            });
        }

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
                    hoverMessage: hoverMessage,
                    renderOptions: {
                        before: {
                            contentText: mora.toString(),
                            color: new vscode.ThemeColor('editorCodeLens.foreground'),
                            fontWeight: 'normal',
                            margin: '0 0.5em 0 0'
                        }
                    }
                });
            } else {
                // モーラ数が0のときは空白を入れて位置を調整
                moraDecorations.push({
                    range: new vscode.Range(lineIndex, 0, lineIndex, 0),
                    renderOptions: {
                        before: {
                            contentText: '',
                            margin: '0 0.5em 0 0'
                        }
                    }
                });
            }
        }

    }

    // ガター母音デコレーションを母音ごとに適用
    for (const vowel of ['a', 'i', 'u', 'e', 'o', 'n']) {
        if (gutterVowelDecorationTypes[vowel]) {
            editor.setDecorations(gutterVowelDecorationTypes[vowel], gutterVowelDecorations[vowel]);
        }
    }

    editor.setDecorations(paddingDecorationType, paddingDecorations);
    editor.setDecorations(moraDecorationType, moraDecorations);
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

    // 母音ごとのガターアイコンデコレーションタイプを作成（初期設定を読み込み）
    const config = vscode.workspace.getConfiguration('jlyrics');
    const vowelDisplayStyle = config.get<string>('vowelDisplayStyle', 'katakana');
    for (const vowel of ['a', 'i', 'u', 'e', 'o', 'n']) {
        gutterVowelDecorationTypes[vowel] = vscode.window.createTextEditorDecorationType({
            gutterIconPath: createVowelSvg(vowel, vowelDisplayStyle)
        });
    }

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

    // 遅延初期化：Kuroshiroは最初の.jlyricsファイルを開いたときに初期化される
    // 起動時に既にjlyricsファイルが開いている場合は即座に処理
    if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === 'jlyrics') {
        updateMoraDecorations(vscode.window.activeTextEditor);
    }

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
                // 母音表示スタイルが変更された場合、デコレーションタイプを再生成
                if (event.affectsConfiguration('jlyrics.vowelDisplayStyle')) {
                    // 既存のデコレーションタイプを破棄
                    for (const vowel in gutterVowelDecorationTypes) {
                        if (gutterVowelDecorationTypes[vowel]) {
                            gutterVowelDecorationTypes[vowel].dispose();
                        }
                    }

                    // 新しい設定で再生成
                    const config = vscode.workspace.getConfiguration('jlyrics');
                    const vowelDisplayStyle = config.get<string>('vowelDisplayStyle', 'katakana');
                    for (const vowel of ['a', 'i', 'u', 'e', 'o', 'n']) {
                        gutterVowelDecorationTypes[vowel] = vscode.window.createTextEditorDecorationType({
                            gutterIconPath: createVowelSvg(vowel, vowelDisplayStyle)
                        });
                    }
                }

                // 表示中のすべてのjlyricsエディタを更新
                for (const editor of vscode.window.visibleTextEditors) {
                    if (editor.document.languageId === 'jlyrics') {
                        updateMoraDecorations(editor);
                    }
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
    for (const vowel in gutterVowelDecorationTypes) {
        if (gutterVowelDecorationTypes[vowel]) {
            gutterVowelDecorationTypes[vowel].dispose();
        }
    }
}
