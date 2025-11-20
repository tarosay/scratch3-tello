# scratch3-tello (Fork by @tarosay)

このリポジトリは **kebhr/scratch3-tello** のフォークです。  
本フォークでは以下の変更・追加を行っています：

- Windows ユーザ向けの PowerShell ビルドスクリプト
  **`build-scratch3-tello.ps1`** を追加
- npm 依存関係エラー回避のため
  `react-responsive@4.1.0` に固定
- Electron アプリの `npm run build` までを Windows 環境で一括実行できるように調整
- Node / npm の動作確認バージョンを明記
- Tello の SSID を指定して接続できたかどうかを返す boolean ブロック
  **`connectTo`** を追加し、Scratch から直接 Wi-Fi 接続できるように変更

オリジナルプロジェクトはこちら：  
https://github.com/kebhr/scratch3-tello

---

## 📦 Verified Build Environment (Windows)

PowerShell ビルドスクリプトは、以下のバージョンで動作確認しています：

```
Node.js : v16.20.0
npm     : 8.19.4
```

> npm v7 以降は peerDependencies が厳格なため  
> `react-responsive@5.x` がインストールエラーになります。  
> 本フォークでは `react-responsive@4.1.0` を強制指定して解決しています。

---

## 🚀 How to Build (Windows / PowerShell) — *追加情報*

Windows ユーザは、以下の PowerShell スクリプトを使用することで  
依存関係の問題なくビルドが行えます：

```powershell
git clone https://github.com/tarosay/scratch3-tello.git
cd scratch3-tello

./build-scratch3-tello.ps1
```

成果物は次に生成されます：

```
scratch-desktop/dist/
```

※ Linux/macOS は従来どおり `build.sh` を使用してください  
（元 README の「How to build」セクション参照）

---

# ここから下は **オリジナル README** の内容です  
（原文を保持し、必要な整合性のみ注記）

---

<div align="center">
  <img src="https://user-images.githubusercontent.com/42484226/180014410-6c3868e4-f8ee-44a8-9a87-b89490061e03.png" alt="scratch3-tello Let's fly Tello with Scratch 3.0!" />
</div>
<div align="center">
  <a href="https://scratch3-tello.app/"><img src="https://user-images.githubusercontent.com/42484226/180016745-629f04e3-e7d5-40f3-bfd6-bf2f594ecdf3.png" alt="for more information: click this image" /></a>
</div>

<img width="1238" alt="screenshot of scratch3-tello" src="https://user-images.githubusercontent.com/42484226/199463133-0e678fb1-f309-4dd6-936f-633d8105fd0d.png">

![GitHub all releases](https://img.shields.io/github/downloads/kebhr/scratch3-tello/total?style=for-the-badge)

## Release
You can download the binary from [here](https://github.com/kebhr/scratch3-tello/releases).  

I am seeking sponsors on [Patreon](https://www.patreon.com/scratch3_tello) to continue the development of Scratch3-Tello.

### Instruction
1. Download the binary.
2. Start the app.
3. Activate Tello extension.
4. 新しい boolean ブロック **`connectTo`** を使って、接続したい Tello の SSID を指定し Wi-Fi に接続（成功すると `true`、失敗すると `false` を返します）。

**NOTE:**
- If you are having trouble connecting to Tello, close the app, restart Tello and start the app again.
- Scratch 内から接続できない場合は、従来どおりアプリを起動する前に手動で Tello に接続してください。
- If the drone does not take off after sending the `takeoff` command, use the `clear command queue` block.

## Supported languages
- English
- 日本語
- にほんご
- Ру́сский (Thanks to [@cirodil](https://github.com/cirodil))
- Français (Thanks to Ryan Perry)
- Deutsch (Thanks to [@DiWoWet](https://github.com/DiWoWet))
- Български (Thanks to [@aladzhov](https://github.com/aladzhov))
- 繁體中文 (Thanks to James Huang)
- Italian (Thank to [@Haldosax](https://github.com/Haldosax))
- Latvian (Thank to [@berserks03](https://github.com/berserks03))
- Українська (Thanks to [@MaxVolobuev](https://github.com/MaxVolobuev))

Feel free to create a pull request for adding more languages!

## How to build
```bash
$ mkdir scratch3-tello
$ cd scratch3-tello
$ wget https://raw.githubusercontent.com/kebhr/scratch3-tello/master/build.sh
$ chmod +x build.sh
$ ./build.sh
```

> **補足（フォークより）:**  
> Windows ユーザは `build.sh` ではなく、上部に記載した  
> **`build-scratch3-tello.ps1`** を使用することを推奨します。

## How to run
```bash
$ cd scratch-desktop
$ npm start
```

If you fail to load Tello extension, please run `relink.sh`.
