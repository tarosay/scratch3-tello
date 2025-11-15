const dgram = require('dgram');

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
}

module.exports = TelloProcessor;
