// 排行榜管理器
class LeaderboardManager {
    constructor() {
        this.database = firebase.database();
        this.currentDifficulty = 'balanced';
        this.records = [];
        this.isOnline = true;
        
        // 启用离线持久化
        try {
            firebase.database().enablePersistence()
                .then(() => {
                    console.log('Offline persistence enabled');
                })
                .catch(err => {
                    console.warn('Persistence failed:', err);
                });
        } catch (e) {
            console.warn('Persistence not supported:', e);
        }
        
        // 监听网络状态
        this.setupConnectionMonitor();
    }
    
    // 监听网络连接状态
    setupConnectionMonitor() {
        const connectedRef = firebase.database().ref('.info/connected');
        connectedRef.on('value', snapshot => {
            this.isOnline = snapshot.val() === true;
            console.log('Connection status:', this.isOnline ? 'Online' : 'Offline');
            
            // 触发连接状态变化事件
            if (window.onConnectionStatusChange) {
                window.onConnectionStatusChange(this.isOnline);
            }
        });
    }
    
    // 提交成绩
    async submitScore(playerName, kills, survivalTime, difficulty) {
        const score = kills * 100 + survivalTime;
        const recordId = this.generateId();
        const timestamp = Date.now();
        
        const record = {
            playerName: playerName || 'Player',
            kills: kills,
            survivalTime: survivalTime,
            score: score,
            difficulty: difficulty,
            timestamp: timestamp,
            recordId: recordId
        };
        
        try {
            // 提交分数
            await this.database
                .ref(`leaderboard/${difficulty}/${recordId}`)
                .set(record);
            
            console.log('Score submitted successfully:', record);
            
            // 获取排名
            const rank = await this.calculateRank(difficulty, score, timestamp);
            
            return { 
                success: true, 
                record: record,
                rank: rank
            };
        } catch (error) {
            console.error('Error submitting score:', error);
            return { success: false, error: error };
        }
    }
    
    // 计算排名
    async calculateRank(difficulty, score, timestamp) {
        try {
            const snapshot = await this.database
                .ref(`leaderboard/${difficulty}`)
                .orderByChild('score')
                .once('value');
            
            let rank = 1;
            let found = false;
            
            snapshot.forEach(child => {
                const data = child.val();
                // 分数更高，或分数相同但时间更早的记录排在前面
                if (data.score > score || (data.score === score && data.timestamp < timestamp)) {
                    rank++;
                }
            });
            
            return rank;
        } catch (error) {
            console.error('Error calculating rank:', error);
            return -1;
        }
    }
    
    // 获取排行榜（一次性查询）
    async getLeaderboard(difficulty, limit = 20) {
        try {
            const snapshot = await this.database
                .ref(`leaderboard/${difficulty}`)
                .orderByChild('score')
                .limitToLast(limit)
                .once('value');
            
            const records = [];
            snapshot.forEach(child => {
                records.unshift(child.val());
            });
            
            this.records = records;
            console.log(`Loaded ${records.length} records for ${difficulty}`);
            return records;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }
    }
    
    // 实时监听排行榜更新
    listenToLeaderboard(difficulty, callback) {
        console.log('Starting to listen to', difficulty, 'leaderboard');
        
        this.database
            .ref(`leaderboard/${difficulty}`)
            .orderByChild('score')
            .limitToLast(20)
            .on('value', snapshot => {
                const records = [];
                snapshot.forEach(child => {
                    records.unshift(child.val());
                });
                
                this.records = records;
                console.log(`Leaderboard updated: ${records.length} records`);
                
                if (callback) {
                    callback(records);
                }
            });
    }
    
    // 停止监听
    stopListening(difficulty) {
        console.log('Stopping listener for', difficulty);
        this.database
            .ref(`leaderboard/${difficulty}`)
            .off();
    }
    
    // 生成唯一 ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // 获取玩家排名
    getPlayerRank(playerName, timestamp) {
        // 通过名称和时间戳查找玩家记录
        const index = this.records.findIndex(r => 
            r.playerName === playerName && 
            Math.abs(r.timestamp - timestamp) < 1000
        );
        return index >= 0 ? index + 1 : -1;
    }
    
    // 获取总记录数
    getTotalRecords() {
        return this.records.length;
    }
    
    // 格式化时间
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }
    
    // 格式化日期
    formatDate(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}天前`;
        if (hours > 0) return `${hours}小时前`;
        if (minutes > 0) return `${minutes}分钟前`;
        return '刚刚';
    }
}

// 创建全局实例
const leaderboard = new LeaderboardManager();

console.log('Leaderboard manager initialized');
