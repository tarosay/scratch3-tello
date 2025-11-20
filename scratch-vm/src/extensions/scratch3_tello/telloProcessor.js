// Modified by tarosay (2025)
// Original licenses apply; see LICENSE file.
const dgram = require('dgram');
const cp = require("child_process");

class TelloProcessor {
    initialize() {
        this.queue = [];
        this.data = {};
        this.executing = false;
        this.executingCommand = null;
        this.flying = false;

        this.client = dgram.createSocket('udp4');
        this.server = dgram.createSocket('udp4');

        // コマンド送信用ソケット
        this.client.bind(40001, '0.0.0.0', () => {
            this.send('command'); // SDK モード突入
        });

        // コマンド応答処理
        this.client.on('message', (message) => {
            clearTimeout(this.commandTimeout); // 応答があればタイムアウト解除
            const readableMessage = message.toString();

            if (readableMessage === 'ok') {
                this.executing = false;

                if (this.executingCommand === 'takeoff') this.flying = true;
                if (this.executingCommand === 'land') this.flying = false;

                this.queue.shift();
                this.inquire();
            } else if (readableMessage.includes('error')) {
                this.executing = false;
                this.flying = false;

                this.queue.shift();
                this.inquire();
            }
        });

        // ドローンステータス受信
        this.server.on('message', (message) => {
            const readableMessage = message.toString();
            this.data = {};
            for (const e of readableMessage.slice(0, -1).split(';')) {
                const [key, value] = e.split(':');
                if (key && value) {
                    this.data[key] = value;
                }
            }
        });

        this.server.bind(8890, '0.0.0.0');

        // エラー検知で再接続
        this.client.on('error', (err) => {
            console.error('Client error:', err);
            this.handleReconnect();
        });
        this.server.on('error', (err) => {
            console.error('Server error:', err);
            this.handleReconnect();
        });
    }

    request(cmd) {
        if (!this.flying && cmd === 'takeoff') {
            this.queue.push('command');
        }
        this.queue.push(cmd);
        this.inquire();
    }

    state() {
        return this.data;
    }

    inquire() {
        if (!this.executing && this.queue.length > 0) {
            this.send(this.queue[0]);
        }
    }

    send(cmd) {
        const msg = Buffer.from(cmd);

        // 地上時に許可されないコマンドはスキップ
        if (!this.flying && cmd !== 'command' && cmd !== 'mon' && cmd !== 'mdirection 2' && cmd !== 'takeoff') {
            this.queue.shift();
            this.inquire();
            return;
        }

        this.executing = true;
        this.executingCommand = cmd;

        this.client.send(msg, 0, msg.length, 8889, '192.168.10.1', (err) => {
            if (err) {
                console.error('Send error:', err);
                this.handleReconnect(cmd);
            } else {
                this.startCommandTimeout(cmd);
            }
        });
    }

    startCommandTimeout(cmd) {
        clearTimeout(this.commandTimeout);
        this.commandTimeout = setTimeout(() => {
            console.log(`No response for "${cmd}", reconnecting...`);
            this.handleReconnect(cmd);
        }, 2000); // 2秒応答なしで再接続
    }

    handleReconnect(cmd) {
        this.reconnect();
        if (cmd) {
            this.queue.unshift(cmd); // 元のコマンドを再度先頭に戻す
        }
        this.inquire();
    }

    reconnect() {
        try {
            if (this.client) this.client.close();
            if (this.server) this.server.close();
        } catch (e) {
            console.error('Error closing sockets:', e);
        }
        this.resetQueue();
        this.initialize(); // 再初期化して command を送る
    }

    resetQueue() {
        this.queue = [];
        this.flying = false;
        this.executing = false;
        this.executingCommand = null;
    }

    selectDroneBySsid(ssid) {
        console.log('selectDroneBySsid called with:', ssid);

        try {
            const info = this.getWiFiInfo();
            console.log('wifi info:', info);

            // すでに接続済みなら何もしないで成功扱いで return true
            if (info.connected && info.ssid === ssid) {
                console.warn('Already connected to target SSID. No action.');
                return true;
            }

            // まずは周囲にその SSID が見えているかチェック
            const visible = this.isSsidVisible(ssid);
            console.log(visible);
            if (!visible) {
                console.warn(`SSID "${ssid}" is not visible. Cannot connect.`);
                return false; // ここで「接続できない」と判断
            }

            // 見えているので接続を試みる
            console.log(`Now, connecting to SSID: ${ssid}`);

            const ok = this.connectToWifi(ssid);

            if (!ok) {
                console.warn(`Failed to connect to "${ssid}" within timeout.`);
                return false;
            }
            console.log(`Success, connected to ${ssid}.`);
            return true;

        } catch (err) {
            console.error('selectDroneBySsid error:', err);
            return false;
        }
    }

    connectToWifi(ssid) {
        try {
            // 1. 接続開始
            const connectCmd = `netsh wlan connect name="${ssid}" ssid="${ssid}"`;
            cp.execSync(connectCmd, { encoding: 'utf8', timeout: 5000 });

            // 2. 接続完了を待つ（最大 6 秒）
            const maxWaitMs = 6000;
            //const intervalMs = 500;
            const deadline = Date.now() + maxWaitMs;

            while (Date.now() < deadline) {
                try {
                    const info = this.getWiFiInfo();

                    if (info.connected && info.ssid === ssid) {
                        return true;
                    }
                } catch (e) {
                    // show interfaces が失敗することはまれ
                }

                // 500ms待つ
                const oneSec = Date.now() + 500;
                while (Date.now() < oneSec) {
                    Math.imul(0, 0);
                }
            }
            console.warn('timeout');
            return false;

        } catch (e) {
            // connect コマンド自体の失敗
            console.error(e);
            return false;
        }
    }

    isSsidVisible(ssid) {
        try {
            const stdout = cp.execSync(
                'netsh wlan show networks mode=bssid',
                { encoding: 'utf8', timeout: 2000 }
            );

            // SSID n : xxxx をすべて取得
            const ssidLines = stdout.match(/SSID\s+\d+\s*:\s*(.+)/g) || [];
            const ssids = ssidLines.map(line =>
                line.replace(/SSID\s+\d+\s*:\s*/, '').trim()
            );
            //console.log(ssids);
            // 引数の SSID が含まれているか判定
            const visible = ssids.includes(ssid);
            return visible;

        } catch (e) {
            return false;
        }
    }

    getWiFiInfo() {
        try {
            const stdout = cp.execSync(
                'netsh wlan show interfaces',
                { encoding: 'utf8', timeout: 2000 }
            );

            //console.log(stdout);
            // 正常時パース
            const ssidMatch = stdout.match(/SSID\s*:\s*(.+)/);
            const ssid = ssidMatch ? ssidMatch[1].trim() : null;
            const connected =
                /State\s*:\s*connected/i.test(stdout) ||
                /状態\s*:\s*接続/.test(stdout) ||
                !!ssid;

            return { connected, ssid };
        } catch (e) {
            // e.stderr や e.stdout などで詳細確認可能
            return { connected: false, error: e };
        }
    }
}

module.exports = TelloProcessor;
