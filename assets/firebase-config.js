/**
 * firebase-config.js - Firebase設定と初期化
 * ES5形式でCDN版Firebase SDKに対応
 */

// Firebase設定（実際のプロジェクト設定）
const firebaseConfig = {
    apiKey: "AIzaSyBkw7SMiztrj3lpdaiq2knt66CbwDmRa5A",
    authDomain: "evaluation-system-743ef.firebaseapp.com",
    projectId: "evaluation-system-743ef",
    storageBucket: "evaluation-system-743ef.firebasestorage.app",
    messagingSenderId: "149829437847",
    appId: "1:149829437847:web:b4c6f53b6bac0da23b1cd2"
};

// Firebase Manager クラス
class FirebaseManager {
    constructor() {
        this.app = null;
        this.db = null;
        this.auth = null;
        this.isInitialized = false;
        this.isOnline = true;
        
        console.log('🔥 Firebase Manager created');
    }

    // Firebase初期化
    async init() {
        try {
            // Firebase SDKが読み込まれているかチェック
            if (typeof firebase === 'undefined') {
                console.warn('🔥 Firebase SDK not loaded, running in offline mode');
                return this.initOfflineMode();
            }

            // Firebase初期化
            this.app = firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore();
            this.auth = firebase.auth();

            // オフライン対応
            if (this.db) {
                this.db.enableNetwork().catch(() => {
                    console.warn('🔥 Firebase offline mode enabled');
                    this.isOnline = false;
                });
            }

            this.isInitialized = true;
            console.log('🔥 Firebase initialized successfully');

            // 認証状態の監視
            this.setupAuthListener();

            return true;

        } catch (error) {
            console.warn('🔥 Firebase initialization failed:', error);
            return this.initOfflineMode();
        }
    }

    // オフラインモード初期化
    initOfflineMode() {
        console.log('📴 Running in offline mode');
        this.isOnline = false;
        this.isInitialized = true;
        
        // オフライン用のモックオブジェクト
        this.db = {
            collection: () => ({
                add: () => Promise.resolve({ id: 'offline-' + Date.now() }),
                get: () => Promise.resolve({ docs: [] }),
                doc: () => ({
                    set: () => Promise.resolve(),
                    get: () => Promise.resolve({ exists: false }),
                    update: () => Promise.resolve(),
                    delete: () => Promise.resolve()
                })
            })
        };

        return true;
    }

    // 認証状態監視
    setupAuthListener() {
        if (!this.auth) return;

        this.auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('🔥 User signed in:', user.email);
                this.handleUserSignIn(user);
            } else {
                console.log('🔥 User signed out');
                this.handleUserSignOut();
            }
        });
    }

    // ユーザーサインイン処理
    handleUserSignIn(user) {
        // ユーザー情報をローカルストレージに保存
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email,
            lastLogin: new Date().toISOString()
        };
        
        localStorage.setItem('firebase_user', JSON.stringify(userData));
        
        // アプリケーションに通知
        window.dispatchEvent(new CustomEvent('firebaseUserSignedIn', {
            detail: userData
        }));
    }

    // ユーザーサインアウト処理
    handleUserSignOut() {
        localStorage.removeItem('firebase_user');
        
        window.dispatchEvent(new CustomEvent('firebaseUserSignedOut'));
    }

    // データ追加
    async addData(collection, data) {
        try {
            if (!this.isOnline || !this.db) {
                return this.addDataOffline(collection, data);
            }

            const docRef = await this.db.collection(collection).add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('🔥 Document added with ID:', docRef.id);
            return { id: docRef.id, ...data };

        } catch (error) {
            console.warn('🔥 Add data failed, using offline fallback:', error);
            return this.addDataOffline(collection, data);
        }
    }

    // オフラインデータ追加
    addDataOffline(collection, data) {
        const id = 'offline-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const item = {
            id,
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            _offline: true
        };

        // ローカルストレージに保存
        const key = `firebase_offline_${collection}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(item);
        localStorage.setItem(key, JSON.stringify(existing));

        console.log('📴 Data saved offline:', id);
        return item;
    }

    // データ取得
    async getData(collection, limit = 50) {
        try {
            if (!this.isOnline || !this.db) {
                return this.getDataOffline(collection);
            }

            const snapshot = await this.db.collection(collection)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            const docs = [];
            snapshot.forEach(doc => {
                docs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            console.log(`🔥 Retrieved ${docs.length} documents from ${collection}`);
            return docs;

        } catch (error) {
            console.warn('🔥 Get data failed, using offline fallback:', error);
            return this.getDataOffline(collection);
        }
    }

    // オフラインデータ取得
    getDataOffline(collection) {
        const key = `firebase_offline_${collection}`;
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        
        console.log(`📴 Retrieved ${data.length} offline documents from ${collection}`);
        return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // データ更新
    async updateData(collection, id, data) {
        try {
            if (!this.isOnline || !this.db) {
                return this.updateDataOffline(collection, id, data);
            }

            await this.db.collection(collection).doc(id).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('🔥 Document updated:', id);
            return true;

        } catch (error) {
            console.warn('🔥 Update data failed, using offline fallback:', error);
            return this.updateDataOffline(collection, id, data);
        }
    }

    // オフラインデータ更新
    updateDataOffline(collection, id, data) {
        const key = `firebase_offline_${collection}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        
        const index = existing.findIndex(item => item.id === id);
        if (index !== -1) {
            existing[index] = {
                ...existing[index],
                ...data,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(key, JSON.stringify(existing));
            console.log('📴 Data updated offline:', id);
            return true;
        }
        
        return false;
    }

    // データ削除
    async deleteData(collection, id) {
        try {
            if (!this.isOnline || !this.db) {
                return this.deleteDataOffline(collection, id);
            }

            await this.db.collection(collection).doc(id).delete();
            console.log('🔥 Document deleted:', id);
            return true;

        } catch (error) {
            console.warn('🔥 Delete data failed, using offline fallback:', error);
            return this.deleteDataOffline(collection, id);
        }
    }

    // オフラインデータ削除
    deleteDataOffline(collection, id) {
        const key = `firebase_offline_${collection}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        
        const filtered = existing.filter(item => item.id !== id);
        localStorage.setItem(key, JSON.stringify(filtered));
        
        console.log('📴 Data deleted offline:', id);
        return true;
    }

    // オンライン状態チェック
    isOnline() {
        return this.isOnline && navigator.onLine;
    }

    // 初期化状態チェック
    isReady() {
        return this.isInitialized;
    }

    // オフラインデータをFirebaseに同期
    async syncOfflineData() {
        if (!this.isOnline || !this.db) {
            console.log('📴 Cannot sync - Firebase not available');
            return false;
        }

        console.log('🔄 Starting offline data sync...');

        try {
            // 評価データの同期
            await this.syncCollection('evaluations');
            
            // ユーザーデータの同期
            await this.syncCollection('users');
            
            console.log('✅ Offline data sync completed');
            return true;

        } catch (error) {
            console.error('❌ Offline data sync failed:', error);
            return false;
        }
    }

    // コレクション同期
    async syncCollection(collectionName) {
        const key = `firebase_offline_${collectionName}`;
        const offlineData = JSON.parse(localStorage.getItem(key) || '[]');
        
        for (const item of offlineData) {
            if (item._offline) {
                try {
                    // オフラインフラグを削除
                    const { _offline, id, ...data } = item;
                    
                    // Firebaseに追加
                    await this.addData(collectionName, data);
                    
                    console.log(`🔄 Synced offline item: ${id}`);
                } catch (error) {
                    console.warn(`⚠️ Failed to sync item ${item.id}:`, error);
                }
            }
        }
        
        // 同期済みのオフラインデータをクリア
        const onlineData = offlineData.filter(item => !item._offline);
        localStorage.setItem(key, JSON.stringify(onlineData));
    }
}

// グローバルFirebaseManagerインスタンス
window.FirebaseManager = new FirebaseManager();

// ネットワーク状態監視
window.addEventListener('online', () => {
    console.log('🌐 Network: Online');
    if (window.FirebaseManager) {
        window.FirebaseManager.isOnline = true;
        // オフラインデータを同期
        window.FirebaseManager.syncOfflineData();
    }
});

window.addEventListener('offline', () => {
    console.log('📴 Network: Offline');
    if (window.FirebaseManager) {
        window.FirebaseManager.isOnline = false;
    }
});

console.log('🔥 Firebase configuration loaded');
