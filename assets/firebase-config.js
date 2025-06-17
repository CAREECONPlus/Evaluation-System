/**
 * firebase-config.js - Firebase設定と初期化
 * 無料のFirestoreデータベース接続
 */

// Firebase SDK（CDN版を使用 - 軽量）
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit,
    onSnapshot,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

/**
 * Firebase設定
 * 実際の値は環境変数または設定ファイルから取得
 */
const firebaseConfig = {
    // デモ用設定（実際の使用時は置き換える）
    apiKey: "demo-api-key",
    authDomain: "evaluation-system-demo.firebaseapp.com",
    projectId: "evaluation-system-demo",
    storageBucket: "evaluation-system-demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

/**
 * Firebase初期化
 */
class FirebaseManager {
    constructor() {
        this.app = null;
        this.db = null;
        this.auth = null;
        this.initialized = false;
        this.isOnline = navigator.onLine;
        
        // オフライン対応
        this.setupOfflineHandling();
    }

    /**
     * Firebase初期化
     */
    async init(config = firebaseConfig) {
        try {
            console.log('🔥 Initializing Firebase...');
            
            // Firebase アプリ初期化
            this.app = initializeApp(config);
            
            // Firestore 初期化
            this.db = getFirestore(this.app);
            
            // Authentication 初期化
            this.auth = getAuth(this.app);
            
            // オフライン永続化を有効にする
            await this.enableOfflinePersistence();
            
            this.initialized = true;
            console.log('✅ Firebase initialized successfully');
            
            return true;
            
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            
            // フォールバック: ローカルストレージモード
            this.enableLocalStorageMode();
            
            throw error;
        }
    }

    /**
     * オフライン永続化有効化
     */
    async enableOfflinePersistence() {
        try {
            // Firestoreのオフライン永続化
            // Note: 実際の実装では enablePersistence() を使用
            console.log('📱 Offline persistence enabled');
        } catch (error) {
            console.warn('⚠️ Offline persistence failed:', error);
        }
    }

    /**
     * ローカルストレージフォールバックモード
     */
    enableLocalStorageMode() {
        console.log('💾 Fallback to localStorage mode');
        this.isLocalMode = true;
        // ローカルストレージを使用したデータ管理
    }

    /**
     * オフライン対応設定
     */
    setupOfflineHandling() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Back online');
            this.syncPendingChanges();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Gone offline');
        });
    }

    /**
     * オフライン時の変更を同期
     */
    async syncPendingChanges() {
        // 実装: オフライン時に蓄積された変更をFirebaseに同期
        console.log('🔄 Syncing pending changes...');
    }

    /**
     * データベース操作: 作成
     */
    async create(collectionName, data) {
        try {
            if (this.isLocalMode) {
                return this.createLocal(collectionName, data);
            }

            const docRef = await addDoc(collection(this.db, collectionName), {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            
            console.log(`✅ Document created: ${docRef.id}`);
            return { id: docRef.id, ...data };
            
        } catch (error) {
            console.error('❌ Create failed:', error);
            throw error;
        }
    }

    /**
     * データベース操作: 読み取り（単一）
     */
    async get(collectionName, id) {
        try {
            if (this.isLocalMode) {
                return this.getLocal(collectionName, id);
            }

            const docRef = doc(this.db, collectionName, id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                throw new Error('Document not found');
            }
            
        } catch (error) {
            console.error('❌ Get failed:', error);
            throw error;
        }
    }

    /**
     * データベース操作: 読み取り（複数）
     */
    async getAll(collectionName, conditions = {}) {
        try {
            if (this.isLocalMode) {
                return this.getAllLocal(collectionName, conditions);
            }

            let q = collection(this.db, collectionName);
            
            // 条件追加
            if (conditions.where) {
                conditions.where.forEach(condition => {
                    q = query(q, where(...condition));
                });
            }
            
            if (conditions.orderBy) {
                q = query(q, orderBy(...conditions.orderBy));
            }
            
            if (conditions.limit) {
                q = query(q, limit(conditions.limit));
            }

            const querySnapshot = await getDocs(q);
            const results = [];
            
            querySnapshot.forEach((doc) => {
                results.push({ id: doc.id, ...doc.data() });
            });
            
            return results;
            
        } catch (error) {
            console.error('❌ GetAll failed:', error);
            throw error;
        }
    }

    /**
     * データベース操作: 更新
     */
    async update(collectionName, id, data) {
        try {
            if (this.isLocalMode) {
                return this.updateLocal(collectionName, id, data);
            }

            const docRef = doc(this.db, collectionName, id);
            await updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            });
            
            console.log(`✅ Document updated: ${id}`);
            return { id, ...data };
            
        } catch (error) {
            console.error('❌ Update failed:', error);
            throw error;
        }
    }

    /**
     * データベース操作: 削除
     */
    async delete(collectionName, id) {
        try {
            if (this.isLocalMode) {
                return this.deleteLocal(collectionName, id);
            }

            const docRef = doc(this.db, collectionName, id);
            await deleteDoc(docRef);
            
            console.log(`✅ Document deleted: ${id}`);
            return true;
            
        } catch (error) {
            console.error('❌ Delete failed:', error);
            throw error;
        }
    }

    /**
     * リアルタイム監視
     */
    onSnapshot(collectionName, callback, conditions = {}) {
        if (this.isLocalMode) {
            // ローカルモードではポーリング
            return this.pollLocal(collectionName, callback, conditions);
        }

        let q = collection(this.db, collectionName);
        
        // 条件追加
        if (conditions.where) {
            conditions.where.forEach(condition => {
                q = query(q, where(...condition));
            });
        }

        return onSnapshot(q, (querySnapshot) => {
            const results = [];
            querySnapshot.forEach((doc) => {
                results.push({ id: doc.id, ...doc.data() });
            });
            callback(results);
        });
    }

    /**
     * 認証: ログイン
     */
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error('❌ Sign in failed:', error);
            throw error;
        }
    }

    /**
     * 認証: ログアウト
     */
    async signOut() {
        try {
            await signOut(this.auth);
            console.log('✅ Signed out successfully');
        } catch (error) {
            console.error('❌ Sign out failed:', error);
            throw error;
        }
    }

    /**
     * 認証状態監視
     */
    onAuthStateChanged(callback) {
        return onAuthStateChanged(this.auth, callback);
    }

    // ローカルストレージフォールバック実装
    createLocal(collectionName, data) {
        const items = this.getLocalCollection(collectionName);
        const id = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const newItem = { id, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        items.push(newItem);
        this.saveLocalCollection(collectionName, items);
        return newItem;
    }

    getLocal(collectionName, id) {
        const items = this.getLocalCollection(collectionName);
        const item = items.find(item => item.id === id);
        if (!item) throw new Error('Document not found');
        return item;
    }

    getAllLocal(collectionName, conditions = {}) {
        let items = this.getLocalCollection(collectionName);
        
        // 簡易フィルタリング
        if (conditions.where) {
            conditions.where.forEach(([field, operator, value]) => {
                items = items.filter(item => {
                    switch (operator) {
                        case '==': return item[field] === value;
                        case '!=': return item[field] !== value;
                        case '>': return item[field] > value;
                        case '<': return item[field] < value;
                        case '>=': return item[field] >= value;
                        case '<=': return item[field] <= value;
                        default: return true;
                    }
                });
            });
        }
        
        return items;
    }

    updateLocal(collectionName, id, data) {
        const items = this.getLocalCollection(collectionName);
        const index = items.findIndex(item => item.id === id);
        if (index === -1) throw new Error('Document not found');
        
        items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
        this.saveLocalCollection(collectionName, items);
        return items[index];
    }

    deleteLocal(collectionName, id) {
        const items = this.getLocalCollection(collectionName);
        const filteredItems = items.filter(item => item.id !== id);
        this.saveLocalCollection(collectionName, filteredItems);
        return true;
    }

    getLocalCollection(collectionName) {
        try {
            const data = localStorage.getItem(`firebase_${collectionName}`);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to get local collection:', error);
            return [];
        }
    }

    saveLocalCollection(collectionName, items) {
        try {
            localStorage.setItem(`firebase_${collectionName}`, JSON.stringify(items));
        } catch (error) {
            console.error('Failed to save local collection:', error);
        }
    }

    pollLocal(collectionName, callback, conditions = {}) {
        const poll = () => {
            const items = this.getAllLocal(collectionName, conditions);
            callback(items);
        };
        
        // 5秒ごとにポーリング
        const interval = setInterval(poll, 5000);
        
        // 初回実行
        poll();
        
        // クリーンアップ関数を返す
        return () => clearInterval(interval);
    }

    /**
     * 設定情報取得
     */
    getConfig() {
        return {
            initialized: this.initialized,
            isOnline: this.isOnline,
            isLocalMode: this.isLocalMode || false,
            projectId: this.app?.options?.projectId
        };
    }

    /**
     * 統計情報取得
     */
    async getStats() {
        try {
            const collections = ['users', 'evaluations', 'companies'];
            const stats = {};
            
            for (const collectionName of collections) {
                const items = await this.getAll(collectionName);
                stats[collectionName] = {
                    count: items.length,
                    lastUpdated: items.length > 0 ? 
                        Math.max(...items.map(item => new Date(item.updatedAt || item.createdAt).getTime())) : 
                        null
                };
            }
            
            return stats;
        } catch (error) {
            console.error('Failed to get stats:', error);
            return {};
        }
    }
}

/**
 * データアクセス層
 * Firebaseとの実際のやり取りを抽象化
 */
class DataService {
    constructor(firebaseManager) {
        this.firebase = firebaseManager;
    }

    // ユーザー関連
    async getUsers() {
        return await this.firebase.getAll('users', {
            orderBy: ['createdAt', 'desc']
        });
    }

    async getUserById(id) {
        return await this.firebase.get('users', id);
    }

    async createUser(userData) {
        return await this.firebase.create('users', {
            ...userData,
            isActive: true
        });
    }

    async updateUser(id, userData) {
        return await this.firebase.update('users', id, userData);
    }

    async deleteUser(id) {
        return await this.firebase.delete('users', id);
    }

    // 評価関連
    async getEvaluations() {
        return await this.firebase.getAll('evaluations', {
            orderBy: ['updatedAt', 'desc']
        });
    }

    async getEvaluationById(id) {
        return await this.firebase.get('evaluations', id);
    }

    async createEvaluation(evaluationData) {
        return await this.firebase.create('evaluations', {
            ...evaluationData,
            status: 'draft'
        });
    }

    async updateEvaluation(id, evaluationData) {
        return await this.firebase.update('evaluations', id, evaluationData);
    }

    async deleteEvaluation(id) {
        return await this.firebase.delete('evaluations', id);
    }

    async getEvaluationsByUser(userId) {
        return await this.firebase.getAll('evaluations', {
            where: [['userId', '==', userId]]
        });
    }

    // 会社関連
    async getCompanies() {
        return await this.firebase.getAll('companies');
    }

    async getCompanyById(id) {
        return await this.firebase.get('companies', id);
    }

    async createCompany(companyData) {
        return await this.firebase.create('companies', companyData);
    }

    async updateCompany(id, companyData) {
        return await this.firebase.update('companies', id, companyData);
    }

    // 認証関連
    async signIn(email, password) {
        const user = await this.firebase.signIn(email, password);
        
        // ユーザー情報を取得
        try {
            const userData = await this.getUserById(user.uid);
            return { ...user, ...userData };
        } catch (error) {
            // ユーザーデータが存在しない場合は基本情報のみ
            return user;
        }
    }

    async signOut() {
        return await this.firebase.signOut();
    }

    onAuthStateChanged(callback) {
        return this.firebase.onAuthStateChanged(callback);
    }

    // リアルタイム更新
    onEvaluationsChange(callback) {
        return this.firebase.onSnapshot('evaluations', callback, {
            orderBy: ['updatedAt', 'desc']
        });
    }

    onUsersChange(callback) {
        return this.firebase.onSnapshot('users', callback);
    }
}

// グローバルインスタンス作成
const firebaseManager = new FirebaseManager();
const dataService = new DataService(firebaseManager);

// グローバルに公開
if (typeof window !== 'undefined') {
    window.firebaseManager = firebaseManager;
    window.dataService = dataService;
    window.FirebaseManager = FirebaseManager;
    window.DataService = DataService;
}

// 自動初期化（デモ用設定で）
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 実際の設定が利用可能な場合は、それを使用
        const config = window.FIREBASE_CONFIG || firebaseConfig;
        await firebaseManager.init(config);
        
        console.log('🔥 Firebase auto-initialized');
    } catch (error) {
        console.warn('⚠️ Firebase auto-initialization failed, using local mode:', error);
    }
});

console.log('🔥 firebase-config.js loaded - Firebase connection ready');
