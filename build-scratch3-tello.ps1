# build-scratch3-tello.ps1
# Created by tarosay (2025)
# Windows build helper script for this fork.
# Original project licenses apply; see LICENSE.

# エラーが出たら即停止
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Write-Host "=== Scratch3 Tello build script (Windows PowerShell) ==="

# 既存ディレクトリがあるときは止める（Linux の git clone エラー相当）
function Assert-DirNotExists([string]$name) {
    if (Test-Path $name) {
        throw "Directory '$name' already exists. Please remove it or run in a clean directory. ($name)"
    }
}

Assert-DirNotExists "scratch-vm"
Assert-DirNotExists "scratch-gui"
Assert-DirNotExists "scratch-desktop"
Assert-DirNotExists "scratch3-tello"

# --- clone ---

git clone --filter=blob:none https://github.com/scratchfoundation/scratch-vm.git -b 0.2.0-prerelease.20220222132735
git clone --filter=blob:none https://github.com/scratchfoundation/scratch-gui.git -b scratch-desktop-v3.29.0
git clone --filter=blob:none https://github.com/scratchfoundation/scratch-desktop.git -b v3.29.1

# --- scratch-vm ---

Push-Location scratch-vm
npm install
npm link
Pop-Location

# --- scratch-gui ---

Push-Location scratch-gui
npm install

# react-responsive の peer dependency を scratch-paint に合わせる (4.x)
npm uninstall react-responsive -ErrorAction SilentlyContinue
npm install react-responsive@4.1.0 --save-exact

npm link scratch-vm
npm link
Pop-Location

# --- scratch-desktop ---

Push-Location scratch-desktop
npm install

Push-Location node_modules

# 既存 scratch-gui を削除して、ルートの scratch-gui を symlink で差し替え
if (Test-Path "scratch-gui") {
    Remove-Item -Recurse -Force "scratch-gui"
}

# Windows 版 ln -s ../../scratch-gui scratch-gui
# node_modules\scratch-gui → ..\..\scratch-gui
New-Item -ItemType SymbolicLink -Path "scratch-gui" -Target "..\..\scratch-gui" | Out-Null

Pop-Location  # node_modules
Pop-Location  # scratch-desktop

# --- Tello 拡張の取り込み ---

git clone https://github.com/tarosay/scratch3-tello/

# Linux の `cp -r scratch3-tello/. ./` 相当
Copy-Item -Path ".\scratch3-tello\*" -Destination ".\" -Recurse -Force

Remove-Item -Recurse -Force ".\scratch3-tello"

# --- ビルド (Electron) ---

Push-Location scratch-desktop
npm run build
Pop-Location

Write-Host "=== Done. Built artifacts are in scratch-desktop\dist ==="
