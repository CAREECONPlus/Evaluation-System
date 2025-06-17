// ====================================
// 2. 統合翻訳システム (Hybrid Translation)
// ====================================

// 統合翻訳システム（辞書翻訳 + API翻訳 + キャッシュ）
class HybridTranslator {
    constructor() {
        this.currentLanguage = 'ja';
        this.translations = {};
        this.translationCache = new Map();
        this.apiQueue = [];
        this.isTranslating = false;
        this.fallbackTranslations = {
            ja: {
                'system.title': '建設業評価システム',
                'system.subtitle': 'システムにログインしてください',
                'system.loading': '読み込み中...',
                'system.saving': '保存中...',
                'system.error': 'エラーが発生しました',
                'system.success': '操作が完了しました',
                'login.email': 'メールアドレス',
                'login.password': 'パスワード',
                'login.submit': 'ログイン',
                'login.demo': 'デモアカウント',
                'login.welcome': 'さん、おかえりなさい！',
                'login.failed': 'ログインに失敗しました',
                'nav.dashboard': '📊 ダッシュボード',
                'nav.evaluations': '📝 評価管理',
                'nav.users': '👥 ユーザー管理',
                'nav.logout': '🚪 ログアウト',
                'dashboard.title': 'ダッシュボード',
                'evaluation.create': '新規評価作成',
                'evaluation.list': '評価一覧',
                'evaluation.edit': '評価編集',
                'user.create': '新規ユーザー作成',
                'user.list': 'ユーザー一覧'
            },
            vi: {
                'system.title': 'Hệ thống đánh giá xây dựng',
                'system.subtitle': 'Vui lòng đăng nhập vào hệ thống',
                'system.loading': 'Đang tải...',
                'system.saving': 'Đang lưu...',
                'system.error': 'Đã xảy ra lỗi',
                'system.success': 'Hoàn thành thao tác',
                'login.email': 'Địa chỉ email',
                'login.password': 'Mật khẩu',
                'login.submit': 'Đăng nhập',
                'login.demo': 'Tài khoản demo',
                'login.welcome': ', chào mừng trở lại!',
                'login.failed': 'Đăng nhập thất bại',
                'nav.dashboard': '📊 Bảng điều khiển',
                'nav.evaluations': '📝 Quản lý đánh giá',
                'nav.users': '👥 Quản lý người dùng',
                'nav.logout': '🚪 Đăng xuất',
                'dashboard.title': 'Bảng điều khiển',
                'evaluation.create': 'Tạo đánh giá mới',
                'evaluation.list': 'Danh sách đánh giá',
                'evaluation.edit': 'Chỉnh sửa đánh giá',
                'user.create': 'Tạo người dùng mới',
                'user.list': 'Danh sách người dùng'
            },
            en: {
                'system.title': 'Construction Evaluation System',
                'system.subtitle': 'Please login to the system',
                'system.loading': 'Loading...',
                'system.saving': 'Saving...',
                'system.error': 'An error occurred',
                'system.success': 'Operation completed',
                'login.email': 'Email Address',
                'login.password': 'Password',
                'login.submit': 'Login',
                'login.demo': 'Demo Account',
                'login.welcome': ', welcome back!',
                'login.failed': 'Login failed',
                'nav.dashboard': '📊 Dashboard',
                'nav.evaluations': '📝 Evaluation Management',
                'nav.users': '👥 User Management',
                'nav.logout': '🚪 Logout',
                'dashboard.title': 'Dashboard',
                'evaluation.create': 'Create New Evaluation',
                'evaluation.list': 'Evaluation List',
                'evaluation.edit': 'Edit Evaluation',
                'user.create': 'Create New User',
                'user.list': 'User List'
            }
        };
        
        this.init();
    }

    async init() {
        try {
            // 保存されている言語設定を読み込み
            const savedLanguage = localStorage.getItem('eval_language') || 'ja';
            
            // 翻訳辞書を読み込み
            await this.loadTranslations();
            
            // 言語設定
            this.setLanguage(savedLanguage);
            
            console.log('🌐 Translation system initialized');
        } catch (error) {
            console.warn('Translation system init failed:', error);
            // フォールバック：内蔵辞書を使用
            this.translations = this.fallbackTranslations;
        }
    }

    async loadTranslations() {
        try {
            const response = await fetch('./config/translations.json');
            if (response.ok) {
                const data = await response.json();
                this.translations = data;
                console.log('📚 External translations loaded');
            } else {
                throw new Error(`Failed to load translations.json: ${response.status}`);
            }
        } catch (error) {
            console.warn('Using fallback translations:', error);
            this.translations = this.fallbackTranslations;
        }
    }

    // 翻訳テキスト取得（メインメソッド）
    t(key, params = {}) {
        const translation = this.getTranslation(key);
        return this.interpolate(translation, params);
    }

    getTranslation(key) {
        // 現在の言語の辞書をチェック
        const currentDict = this.translations[this.currentLanguage];
        if (currentDict && this.hasNestedProperty(currentDict, key)) {
            return this.getNestedProperty(currentDict, key);
        }

        // フォールバック：日本語
        const fallbackDict = this.translations.ja;
        if (fallbackDict && this.hasNestedProperty(fallbackDict, key)) {
            console.warn(`Translation missing for ${key} in ${this.currentLanguage}, using Japanese fallback`);
            return this.getNestedProperty(fallbackDict, key);
        }

        // 最終フォールバック：キー自体
        console.warn(`Translation missing for ${key}`);
        return key;
    }

    // ネストされたオブジェクトのプロパティ取得
    hasNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current.hasOwnProperty(key) ? current[key] : null;
        }, obj) !== null;
    }

    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] ? current[key] : null;
        }, obj);
    }

    // パラメータ補間
    interpolate(text, params) {
        if (typeof text !== 'string') return text;
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    // 言語切り替え
    setLanguage(language) {
        if (!this.translations[language]) {
            console.warn(`Language ${language} not supported, using Japanese`);
            language = 'ja';
        }

        this.currentLanguage = language;
        localStorage.setItem('eval_language', language);

        // DOM更新
        this.updateDOM();

        // 言語選択UIの更新
        this.updateLanguageSelectors();

        // イベント発火
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLanguage }
        }));

        console.log(`🌐 Language changed to: ${language}`);
    }

    // DOM内のテキストを更新
    updateDOM() {
        // data-i18n属性を持つ要素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        // data-i18n-placeholder属性を持つ要素
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        // data-i18n-title属性を持つ要素
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        // 特定のIDを持つ要素の更新
        this.updateSpecificElements();
    }

    updateSpecificElements() {
        const elementMappings = {
            'login-title': 'system.title',
            'login-subtitle': 'system.subtitle',
            'email-label': 'login.email',
            'password-label': 'login.password',
            'login-submit': 'login.submit',
            'demo-title': 'login.demo',
            'header-title': 'system.title'
        };

        Object.entries(elementMappings).forEach(([elementId, translationKey]) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = this.t(translationKey);
            }
        });
    }

    // 言語選択UIの更新
    updateLanguageSelectors() {
        const selectors = ['login-language-select', 'header-language-select'];
        selectors.forEach(selectorId => {
            const selector = document.getElementById(selectorId);
            if (selector) {
                selector.value = this.currentLanguage;
            }
        });
    }

    // 動的翻訳（API使用）
    async translateDynamic(text, targetLanguage = null) {
        const target = targetLanguage || this.currentLanguage;
        
        // 元の言語と同じ場合はそのまま返す
        if (target === 'ja') return text;

        // キャッシュチェック
        const cacheKey = `${text}_${target}`;
        if (this.translationCache.has(cacheKey)) {
            return this.translationCache.get(cacheKey);
        }

        // 翻訳キューに追加
        return new Promise((resolve) => {
            this.apiQueue.push({
                text,
                target,
                resolve,
                cacheKey
            });

            this.processTranslationQueue();
        });
    }

    // 翻訳キュー処理
    async processTranslationQueue() {
        if (this.isTranslating || this.apiQueue.length === 0) return;

        this.isTranslating = true;

        try {
            const batch = this.apiQueue.splice(0, 5); // 5件ずつバッチ処理

            for (const item of batch) {
                try {
                    const translatedText = await this.callTranslationAPI(item.text, item.target);
                    this.translationCache.set(item.cacheKey, translatedText);
                    item.resolve(translatedText);
                } catch (error) {
                    console.warn('Translation API failed:', error);
                    item.resolve(item.text); // フォールバック
                }
            }
        } finally {
            this.isTranslating = false;

            // キューに残りがあれば再実行
            if (this.apiQueue.length > 0) {
                setTimeout(() => this.processTranslationQueue(), 100);
            }
        }
    }

    // 翻訳API呼び出し（無料のLibreTranslate等を想定）
    async callTranslationAPI(text, target) {
        // デモ実装：実際のAPIエンドポイントに変更してください
        const apiUrl = 'https://libretranslate.de/translate';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: 'ja',
                target: target === 'vi' ? 'vi' : 'en',
                format: 'text'
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const result = await response.json();
        return result.translatedText || text;
    }

    // 現在の言語を取得
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // サポートされている言語一覧を取得
    getSupportedLanguages() {
        return Object.keys(this.translations);
    }
}
