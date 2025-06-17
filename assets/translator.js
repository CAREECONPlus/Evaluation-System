/**
 * translator.js - ハイブリッド翻訳システム
 * 辞書翻訳 + 無料API翻訳 + Firebaseキャッシュ
 */

class HybridTranslator {
    constructor() {
        this.currentLanguage = 'ja';
        this.translations = {};
        this.translationCache = new Map();
        this.apiQueue = [];
        this.isTranslating = false;
        this.requestCount = 0;
        this.dailyLimit = 800; // 無料APIの制限を考慮
        this.fallbackEnabled = true;
        
        // 利用可能な無料翻訳API
        this.apiServices = {
            mymemory: {
                url: 'https://api.mymemory.translated.net/get',
                limit: 1000, // 1日1000回
                params: (text, sourceLang, targetLang) => ({
                    q: text,
                    langpair: `${sourceLang}|${targetLang}`
                })
            },
            libretranslate: {
                url: 'https://libretranslate.com/translate',
                limit: 5000, // より多い制限
                params: (text, sourceLang, targetLang) => ({
                    q: text,
                    source: sourceLang,
                    target: targetLang,
                    format: 'text'
                })
            }
        };
        
        this.currentApiService = 'mymemory';
    }

    /**
     * 翻訳システム初期化
     */
    async init() {
        console.log('🌐 Initializing Hybrid Translator...');
        
        try {
            // 翻訳辞書を読み込み
            await this.loadTranslations();
            
            // 言語設定を復元
            this.restoreLanguageSettings();
            
            // キャッシュを復元
            await this.loadTranslationCache();
            
            console.log('✅ Translator initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Translator initialization failed:', error);
            return false;
        }
    }

    /**
     * 翻訳辞書読み込み
     */
    async loadTranslations() {
        try {
            const response = await fetch('./config/translations.json');
            this.translations = await response.json();
            console.log('📚 Translation dictionary loaded');
        } catch (error) {
            console.error('Failed to load translations:', error);
            // フォールバック: 基本的な翻訳のみ
            this.translations = this.getBasicTranslations();
        }
    }

    /**
     * 基本翻訳（フォールバック用）
     */
    getBasicTranslations() {
        return {
            ja: {
                system: { title: '建設業評価システム', loading: '読み込み中...' },
                auth: { login: 'ログイン', logout: 'ログアウト' }
            },
            vi: {
                system: { title: 'Hệ thống Đánh giá Ngành Xây dựng', loading: 'Đang tải...' },
                auth: { login: 'Đăng nhập', logout: 'Đăng xuất' }
            },
            en: {
                system: { title: 'Construction Evaluation System', loading: 'Loading...' },
                auth: { login: 'Login', logout: 'Logout' }
            }
        };
    }

    /**
     * 言語設定復元
     */
    restoreLanguageSettings() {
        const savedLanguage = localStorage.getItem('app_language');
        if (savedLanguage && this.translations[savedLanguage]) {
            this.currentLanguage = savedLanguage;
        }
    }

    /**
     * 翻訳キャッシュ読み込み
     */
    async loadTranslationCache() {
        try {
            // ローカルストレージから復元
            const localCache = localStorage.getItem('translation_cache');
            if (localCache) {
                const cacheEntries = JSON.parse(localCache);
                this.translationCache = new Map(cacheEntries);
            }

            // Firebaseからも読み込み（オンライン時）
            if (window.firebaseManager && window.firebaseManager.initialized) {
                await this.loadCacheFromFirebase();
            }
            
            console.log(`📦 Translation cache loaded: ${this.translationCache.size} entries`);
        } catch (error) {
            console.warn('Failed to load translation cache:', error);
        }
    }

    /**
     * Firebaseから翻訳キャッシュ読み込み
     */
    async loadCacheFromFirebase() {
        try {
            const cacheData = await window.dataService.getAll('translation_cache');
            cacheData.forEach(item => {
                const key = `${item.text}_${item.targetLang}`;
                this.translationCache.set(key, item.translation);
            });
        } catch (error) {
            console.warn('Failed to load cache from Firebase:', error);
        }
    }

    /**
     * メイン翻訳関数
     */
    async translate(keyOrText, fallbackText = null, targetLang = null) {
        const target = targetLang || this.currentLanguage;
        
        // 日本語の場合はそのまま返す
        if (target === 'ja') {
            return this.getDictionaryTranslation(keyOrText) || fallbackText || keyOrText;
        }

        // 1. 辞書翻訳を試行
        const dictionaryResult = this.getDictionaryTranslation(keyOrText, target);
        if (dictionaryResult) {
            return dictionaryResult;
        }

        // 2. キャッシュから検索
        const textToTranslate = fallbackText || keyOrText;
        const cacheKey = `${textToTranslate}_${target}`;
        if (this.translationCache.has(cacheKey)) {
            return this.translationCache.get(cacheKey);
        }

        // 3. API翻訳（制限内の場合のみ）
        if (this.canUseAPI()) {
            try {
                const apiResult = await this.translateWithAPI(textToTranslate, target);
                if (apiResult) {
                    // キャッシュに保存
                    this.cacheTranslation(textToTranslate, apiResult, target);
                    return apiResult;
                }
            } catch (error) {
                console.warn('API translation failed:', error);
            }
        }

        // 4. フォールバック
        return this.fallbackEnabled ? textToTranslate : keyOrText;
    }

    /**
     * 辞書翻訳取得
     */
    getDictionaryTranslation(key, targetLang = this.currentLanguage) {
        const langData = this.translations[targetLang];
        if (!langData) return null;

        // ネストされたキーの処理 (例: "system.title")
        const keys = key.split('.');
        let value = langData;
        
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) return null;
        }
        
        return value;
    }

    /**
     * API使用可能性チェック
     */
    canUseAPI() {
        return this.requestCount < this.dailyLimit && navigator.onLine;
    }

    /**
     * API翻訳実行
     */
    async translateWithAPI(text, targetLang) {
        if (!this.canUseAPI()) {
            throw new Error('API limit reached or offline');
        }

        const service = this.apiServices[this.currentApiService];
        this.requestCount++;

        try {
            const params = service.params(text, 'ja', targetLang);
            const url = new URL(service.url);
            
            // MyMemory APIの場合
            if (this.currentApiService === 'mymemory') {
                Object.keys(params).forEach(key => {
                    url.searchParams.append(key, params[key]);
                });
                
                const response = await fetch(url.toString());
                const data = await response.json();
                
                if (data.responseStatus === 200) {
                    return data.responseData.translatedText;
                }
            }
            
            // LibreTranslate APIの場合
            if (this.currentApiService === 'libretranslate') {
                const response = await fetch(service.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(params)
                });
                
                const data = await response.json();
                if (data.translatedText) {
                    return data.translatedText;
                }
            }
            
            throw new Error('API returned no translation');
            
        } catch (error) {
            console.error(`Translation API error (${this.currentApiService}):`, error);
            
            // 他のAPIサービスを試行
            await this.switchApiService();
            throw error;
        }
    }

    /**
     * APIサービス切り替え
     */
    async switchApiService() {
        const services = Object.keys(this.apiServices);
        const currentIndex = services.indexOf(this.currentApiService);
        const nextIndex = (currentIndex + 1) % services.length;
        
        this.currentApiService = services[nextIndex];
        console.log(`🔄 Switched to API service: ${this.currentApiService}`);
    }

    /**
     * 翻訳結果をキャッシュ
     */
    async cacheTranslation(text, translation, targetLang) {
        const cacheKey = `${text}_${targetLang}`;
        this.translationCache.set(cacheKey, translation);

        // ローカルストレージに保存
        this.saveToLocalStorage();

        // Firebaseに保存（オンライン時）
        if (window.firebaseManager && window.firebaseManager.initialized && navigator.onLine) {
            try {
                await window.dataService.create('translation_cache', {
                    text,
                    translation,
                    targetLang,
                    source: this.currentApiService
                });
            } catch (error) {
                console.warn('Failed to cache to Firebase:', error);
            }
        }
    }

    /**
     * ローカルストレージに保存
     */
    saveToLocalStorage() {
        try {
            const cacheEntries = Array.from(this.translationCache.entries());
            // 最新1000件のみ保持
            const limitedEntries = cacheEntries.slice(-1000);
            localStorage.setItem('translation_cache', JSON.stringify(limitedEntries));
        } catch (error) {
            console.warn('Failed to save cache to localStorage:', error);
        }
    }

    /**
     * 言語変更
     */
    async setLanguage(lang) {
        if (!this.translations[lang]) {
            console.warn(`Language '${lang}' not supported`);
            return false;
        }

        this.currentLanguage = lang;
        localStorage.setItem('app_language', lang);
        
        // ページの翻訳を更新
        await this.updatePageTranslations();
        
        console.log(`🌐 Language changed to: ${lang}`);
        return true;
    }

    /**
     * ページ翻訳更新
     */
    async updatePageTranslations() {
        // data-i18n属性の要素を翻訳
        const i18nElements = document.querySelectorAll('[data-i18n]');
        for (const element of i18nElements) {
            const key = element.getAttribute('data-i18n');
            try {
                const translated = await this.translate(key);
                element.textContent = translated;
            } catch (error) {
                console.warn(`Translation failed for key: ${key}`, error);
            }
        }

        // data-translate-dynamic属性の要素を翻訳（動的テキスト）
        const dynamicElements = document.querySelectorAll('[data-translate-dynamic]');
        for (const element of dynamicElements) {
            const originalText = element.getAttribute('data-original') || element.textContent;
            
            // 元のテキストを保存
            if (!element.getAttribute('data-original')) {
                element.setAttribute('data-original', originalText);
            }

            if (originalText.trim()) {
                try {
                    const translated = await this.translate(null, originalText);
                    element.textContent = translated;
                } catch (error) {
                    console.warn('Dynamic translation failed:', error);
                }
            }
        }

        // プレースホルダーも翻訳
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        for (const element of placeholderElements) {
            const key = element.getAttribute('data-i18n-placeholder');
            try {
                const translated = await this.translate(key);
                element.placeholder = translated;
            } catch (error) {
                console.warn(`Placeholder translation failed for key: ${key}`, error);
            }
        }
    }

    /**
     * バッチ翻訳（複数テキストを効率的に翻訳）
     */
    async batchTranslate(texts, targetLang = this.currentLanguage) {
        const results = {};
        const apiTexts = [];

        // まず辞書とキャッシュから確認
        for (const text of texts) {
            const dictionaryResult = this.getDictionaryTranslation(text, targetLang);
            if (dictionaryResult) {
                results[text] = dictionaryResult;
                continue;
            }

            const cacheKey = `${text}_${targetLang}`;
            if (this.translationCache.has(cacheKey)) {
                results[text] = this.translationCache.get(cacheKey);
                continue;
            }

            apiTexts.push(text);
        }

        // APIで残りを翻訳
        for (const text of apiTexts) {
            if (this.canUseAPI()) {
                try {
                    const translated = await this.translateWithAPI(text, targetLang);
                    results[text] = translated;
                    this.cacheTranslation(text, translated, targetLang);
                } catch (error) {
                    results[text] = text; // フォールバック
                }
            } else {
                results[text] = text; // フォールバック
            }
        }

        return results;
    }

    /**
     * 翻訳統計取得
     */
    getStats() {
        return {
            currentLanguage: this.currentLanguage,
            cacheSize: this.translationCache.size,
            requestCount: this.requestCount,
            dailyLimit: this.dailyLimit,
            remainingRequests: this.dailyLimit - this.requestCount,
            currentApiService: this.currentApiService,
            supportedLanguages: Object.keys(this.translations),
            dictionarySize: Object.keys(this.translations).reduce((acc, lang) => {
                acc[lang] = this.countNestedKeys(this.translations[lang]);
                return acc;
            }, {})
        };
    }

    /**
     * ネストされたオブジェクトのキー数をカウント
     */
    countNestedKeys(obj) {
        let count = 0;
        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                count += this.countNestedKeys(obj[key]);
            } else {
                count++;
            }
        }
        return count;
    }

    /**
     * キャッシュクリア
     */
    clearCache() {
        this.translationCache.clear();
        localStorage.removeItem('translation_cache');
        console.log('🗑️ Translation cache cleared');
    }

    /**
     * デバッグ情報
     */
    debug() {
        console.log('🌐 Translator Debug Info:', this.getStats());
        return this.getStats();
    }
}

/**
 * 簡易翻訳ヘルパー関数
 */
const i18n = {
    translator: null,
    
    async init() {
        this.translator = new HybridTranslator();
        await this.translator.init();
        return this.translator;
    },
    
    // 同期的な辞書翻訳（従来互換）
    t(key) {
        if (!this.translator) return key;
        return this.translator.getDictionaryTranslation(key) || key;
    },
    
    // 非同期翻訳（辞書 + API）
    async translate(keyOrText, fallback = null) {
        if (!this.translator) return keyOrText;
        return await this.translator.translate(keyOrText, fallback);
    },
    
    // 言語変更
    async setLanguage(lang) {
        if (!this.translator) return false;
        return await this.translator.setLanguage(lang);
    },
    
    // 現在の言語取得
    getCurrentLanguage() {
        return this.translator?.currentLanguage || 'ja';
    },
    
    // ページ翻訳更新
    async updatePage() {
        if (!this.translator) return;
        await this.translator.updatePageTranslations();
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.HybridTranslator = HybridTranslator;
    window.i18n = i18n;
    window.translator = null; // 後で初期化
}

// 自動初期化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        window.translator = await i18n.init();
        console.log('🌐 Translator auto-initialized');
    } catch (error) {
        console.error('⚠️ Translator auto-initialization failed:', error);
    }
});

console.log('🌐 translator.js loaded - Hybrid translation system ready');
