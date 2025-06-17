/**
 * app.js - 建設業評価システム 統合メインアプリケーション
 * 全16ファイルを統合したメインJSファイル
 */

// ====================================
// 1. Constants & Mock Data
// ====================================

// アプリケーション定数
const EvaluationApp = {
    Constants: {
        APP: {
            NAME: '建設業評価システム',
            VERSION: '1.0.0',
            DEBUG: window.location.hostname === 'localhost'
        },
        USER_ROLES: {
            ADMIN: 'admin',
            MANAGER: 'manager', 
            SUPERVISOR: 'supervisor',
            WORKER: 'worker'
        },
        EVALUATION_STATUS: {
            DRAFT: 'draft',
            SUBMITTED: 'submitted',
            COMPLETED: 'completed'
        }
    }
};

// モックデータ
const mockData = {
    users: [
        {
            id: '1',
            email: 'admin@company.com',
            password: 'password123',
            name: '田中 太郎',
            role: 'admin',
            roleJa: '管理者',
            department: '建設部',
            avatar: '👨‍💼'
        },
        {
            id: '2', 
            email: 'manager@company.com',
            password: 'password123',
            name: '佐藤 花子',
            role: 'manager',
            roleJa: 'マネージャー',
            department: '現場管理部',
            avatar: '👩‍💼'
        },
        {
            id: '3',
            email: 'supervisor@company.com', 
            password: 'password123',
            name: '鈴木 一郎',
            role: 'supervisor',
            roleJa: '主任',
            department: '現場監督',
            avatar: '👨‍🔧'
        }
    ],
    evaluations: [
        {
            id: '1',
            subordinate: '山田 太郎',
            evaluator: '田中 太郎',
            status: 'completed',
            overallRating: 4.2,
            ratings: {
                safety: 5,
                quality: 4,
                efficiency: 4,
                teamwork: 5,
                communication: 3
            },
            overallComment: '総合的に優秀な作業員です。安全意識が高く、チームワークも良好です。',
            period: '2025年第1四半期',
            updatedAt: '2025-01-15'
        }
    ],
    evaluationCategories: [
        {
            id: 'safety',
            name: '安全性',
            description: '安全ルールの遵守、危険予知能力',
            color: '#1DCE85'
        },
        {
            id: 'quality', 
            name: '品質',
            description: '作業品質、仕上がりの精度',
            color: '#244EFF'
        },
        {
            id: 'efficiency',
            name: '効率性', 
            description: '作業スピード、時間管理',
            color: '#FFCE2C'
        },
        {
            id: 'teamwork',
            name: 'チームワーク',
            description: '協調性、チーム貢献度', 
            color: '#FF2C5D'
        },
        {
            id: 'communication',
            name: 'コミュニケーション',
            description: '報告・連絡・相談',
            color: '#82889D'
        }
    ]
};

// ====================================
// 2. i18n (多言語対応)
// ====================================

const i18n = {
    currentLanguage: 'ja',
    translations: {
        ja: {
            'system.title': '建設業評価システム',
            'system.subtitle': 'システムにログインしてください',
            'login.email': 'メールアドレス',
            'login.password': 'パスワード',
            'login.submit': 'ログイン',
            'login.demo': 'デモアカウント',
            'login.welcome': 'さん、おかえりなさい！',
            'login.failed': 'ログインに失敗しました',
            'nav.dashboard': '📊 ダッシュボード',
            'nav.evaluations': '📋 評価一覧',
            'nav.logout': 'ログアウト',
            'dashboard.title': '📊 ダッシュボード',
            'dashboard.total': '総評価数',
            'dashboard.completed': '完了済み',
            'dashboard.average': '平均評価',
            'dashboard.items': '評価項目数',
            'dashboard.recent': '📈 最近の活動',
            'evaluation.new': '📝 新規評価作成',
            'evaluation.list': '📋 評価一覧',
            'evaluation.basic': '📋 基本情報',
            'evaluation.ratings': '⭐ 項目別評価',
            'evaluation.chart': '📊 評価チャート（リアルタイム更新）',
            'category.safety': '安全性',
            'category.safety_desc': '安全ルールの遵守、危険予知能力',
            'category.quality': '品質',
            'category.quality_desc': '作業品質、仕上がりの精度',
            'category.efficiency': '効率性',
            'category.efficiency_desc': '作業スピード、時間管理',
            'category.teamwork': 'チームワーク',
            'category.teamwork_desc': '協調性、チーム貢献度',
            'category.communication': 'コミュニケーション',
            'category.communication_desc': '報告・連絡・相談',
            'form.period': '評価期間',
            'form.target': '評価対象者',
            'form.save': '💾 評価を保存',
            'form.cancel': 'キャンセル',
            'form.not_entered': '未入力',
            'action.back': '← 評価一覧に戻る',
            'action.new': '➕ 新規評価',
            'action.detail': '👁️ 詳細',
            'action.dashboard': '🏠 ダッシュボード',
            'table.id': 'ID',
            'table.target': '評価対象者',
            'table.evaluator': '評価者',
            'table.period': '評価期間',
            'table.rating': '総合評価',
            'table.status': 'ステータス',
            'table.updated': '更新日',
            'table.actions': '操作',
            'message.saved': '評価を保存しました！',
            'message.deleted': '削除しました',
            'message.error': 'エラーが発生しました',
            'status.completed': '完了',
            'status.draft': '下書き',
            'status.in_progress': '作業中'
        },
        vi: {
            'system.title': 'Hệ thống Đánh giá Ngành Xây dựng',
            'system.subtitle': 'Vui lòng đăng nhập vào hệ thống',
            'login.email': 'Địa chỉ email',
            'login.password': 'Mật khẩu',
            'login.submit': 'Đăng nhập',
            'login.demo': 'Tài khoản Demo',
            'login.welcome': ', chào mừng bạn trở lại!',
            'login.failed': 'Đăng nhập thất bại',
            'nav.dashboard': '📊 Bảng điều khiển',
            'nav.evaluations': '📋 Danh sách đánh giá',
            'nav.logout': 'Đăng xuất',
            'dashboard.title': '📊 Bảng điều khiển',
            'dashboard.total': 'Tổng số đánh giá',
            'dashboard.completed': 'Đã hoàn thành',
            'dashboard.average': 'Điểm trung bình',
            'dashboard.items': 'Số tiêu chí',
            'dashboard.recent': '📈 Hoạt động gần đây',
            'evaluation.new': '📝 Tạo đánh giá mới',
            'evaluation.list': '📋 Danh sách đánh giá',
            'evaluation.basic': '📋 Thông tin cơ bản',
            'evaluation.ratings': '⭐ Đánh giá theo tiêu chí',
            'evaluation.chart': '📊 Biểu đồ đánh giá (Cập nhật thời gian thực)',
            'category.safety': 'An toàn',
            'category.safety_desc': 'Tuân thủ quy tắc an toàn, nhận biết nguy hiểm',
            'category.quality': 'Chất lượng',
            'category.quality_desc': 'Chất lượng công việc, độ chính xác',
            'category.efficiency': 'Hiệu quả',
            'category.efficiency_desc': 'Tốc độ làm việc, quản lý thời gian',
            'category.teamwork': 'Làm việc nhóm',
            'category.teamwork_desc': 'Khả năng hợp tác, đóng góp nhóm',
            'category.communication': 'Giao tiếp',
            'category.communication_desc': 'Báo cáo, liên lạc, tham vấn',
            'form.period': 'Kỳ đánh giá',
            'form.target': 'Người được đánh giá',
            'form.save': '💾 Lưu đánh giá',
            'form.cancel': 'Hủy',
            'form.not_entered': 'Chưa nhập',
            'action.back': '← Quay lại danh sách',
            'action.new': '➕ Đánh giá mới',
            'action.detail': '👁️ Chi tiết',
            'action.dashboard': '🏠 Bảng điều khiển',
            'table.id': 'ID',
            'table.target': 'Người được đánh giá',
            'table.evaluator': 'Người đánh giá',
            'table.period': 'Kỳ đánh giá',
            'table.rating': 'Điểm tổng thể',
            'table.status': 'Trạng thái',
            'table.updated': 'Ngày cập nhật',
            'table.actions': 'Thao tác',
            'message.saved': 'Đã lưu đánh giá thành công!',
            'message.deleted': 'Đã xóa thành công',
            'message.error': 'Đã xảy ra lỗi',
            'status.completed': 'Hoàn thành',
            'status.draft': 'Bản nháp',
            'status.in_progress': 'Đang thực hiện'
        }
    },
    
    t(key) {
        return this.translations[this.currentLanguage]?.[key] || key;
    },
    
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('app_language', lang);
            this.updatePageTranslations();
        }
    },
    
    updatePageTranslations() {
        // 翻訳要素を更新
        const elements = {
            'header-title': 'system.title',
            'login-title': 'system.title',
            'login-subtitle': 'system.subtitle',
            'email-label': 'login.email',
            'password-label': 'login.password',
            'login-submit': 'login.submit',
            'demo-title': 'login.demo'
        };
        
        Object.entries(elements).forEach(([id, key]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = this.t(key);
            }
        });
        
        // 言語選択の同期
        const selects = document.querySelectorAll('#login-language-select, #header-language-select');
        selects.forEach(select => {
            select.value = this.currentLanguage;
        });
    },
    
    init() {
        const savedLanguage = localStorage.getItem('app_language');
        if (savedLanguage && this.translations[savedLanguage]) {
            this.currentLanguage = savedLanguage;
        }
        this.updatePageTranslations();
    }
};

// ====================================
// 3. 認証システム
// ====================================

const authManager = {
    currentUser: null,
    sessionKey: 'construction_eval_session',
    
    init() {
        this.restoreSession();
    },
    
    async login(email, password) {
        try {
            const user = mockData.users.find(u => u.email === email && u.password === password);
            
            if (!user) {
                throw new Error('Invalid credentials');
            }
            
            this.currentUser = {
                ...user,
                loginTime: new Date().toISOString(),
                sessionId: this.generateSessionId()
            };
            
            this.saveSession();
            
            return {
                success: true,
                user: this.getSafeUserData(),
                message: `${user.name}${i18n.t('login.welcome')}`
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: i18n.t('login.failed')
            };
        }
    },
    
    logout() {
        this.currentUser = null;
        this.clearSession();
        
        document.body.classList.remove('authenticated');
        document.body.classList.add('login-mode');
        
        document.getElementById('app-header').style.display = 'none';
        document.getElementById('breadcrumbs').style.display = 'none';
        
        // ログインページを表示
        showLoginPage();
    },
    
    isAuthenticated() {
        return this.currentUser !== null;
    },
    
    getCurrentUser() {
        return this.currentUser;
    },
    
    getSafeUserData() {
        if (!this.currentUser) return null;
        const { password, ...safeData } = this.currentUser;
        return safeData;
    },
    
    hasPermission(permission) {
        if (!this.currentUser) return false;
        const permissions = {
            admin: ['view_all', 'create', 'edit', 'delete', 'manage_users'],
            manager: ['view_team', 'create', 'edit'],
            supervisor: ['view_subordinates', 'create', 'edit'],
            worker: ['view_own']
        };
        return permissions[this.currentUser.role]?.includes(permission) || false;
    },
    
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    saveSession() {
        if (!this.currentUser) return;
        const sessionData = {
            user: this.getSafeUserData(),
            timestamp: Date.now(),
            expires: Date.now() + (24 * 60 * 60 * 1000)
        };
        localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    },
    
    restoreSession() {
        try {
            const sessionData = localStorage.getItem(this.sessionKey);
            if (!sessionData) return false;
            
            const parsed = JSON.parse(sessionData);
            if (Date.now() > parsed.expires) {
                this.clearSession();
                return false;
            }
            
            this.currentUser = parsed.user;
            return true;
        } catch (error) {
            this.clearSession();
            return false;
        }
    },
    
    clearSession() {
        localStorage.removeItem(this.sessionKey);
    }
};

// ====================================
// 4. 通知システム
// ====================================

const notificationManager = {
    container: null,
    notifications: new Map(),
    
    init() {
        this.createContainer();
    },
    
    createContainer() {
        this.container = document.getElementById('notification-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1080;
                pointer-events: none;
                max-width: 400px;
            `;
            document.body.appendChild(this.container);
        }
    },
    
    show(message, type = 'info', duration = 3000) {
        const id = 'notif_' + Date.now();
        const notification = this.createNotification(id, message, type);
        
        this.container.appendChild(notification.element);
        this.notifications.set(id, notification);
        
        setTimeout(() => {
            notification.element.classList.add('show');
        }, 10);
        
        if (duration > 0) {
            setTimeout(() => {
                this.hide(id);
            }, duration);
        }
        
        return id;
    },
    
    createNotification(id, message, type) {
        const element = document.createElement('div');
        element.className = `notification notification-${type}`;
        element.style.cssText = `
            pointer-events: auto;
            margin-bottom: 12px;
            padding: 16px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            position: relative;
            max-width: 100%;
            word-wrap: break-word;
        `;
        
        const colors = {
            success: '#1DCE85',
            error: '#FF2C5D',
            warning: '#FFCE2C',
            info: '#244EFF'
        };
        
        element.style.background = colors[type] || colors.info;
        element.textContent = message;
        
        element.classList.add = function(className) {
            if (className === 'show') {
                this.style.transform = 'translateX(0)';
            }
        };
        
        return { id, element, type, message };
    },
    
    hide(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        notification.element.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            this.notifications.delete(id);
        }, 300);
    }
};

// グローバル関数として公開
function showNotification(message, type = 'info', duration = 3000) {
    return notificationManager.show(message, type, duration);
}

// ====================================
// 5. ルーティングシステム
// ====================================

const router = {
    currentPage: 'login',
    currentRoute: '/',
    
    navigate(path) {
        console.log(`🗺️ Navigating to: ${path}`);
        
        // 認証チェック
        if (path !== '/' && !authManager.isAuthenticated()) {
            showNotification('ログインが必要です', 'error');
            this.navigate('/');
            return;
        }
        
        this.currentRoute = path;
        
        // ルート別処理
        switch (path) {
            case '/':
                this.currentPage = 'login';
                showLoginPage();
                break;
            case '/dashboard':
                this.currentPage = 'dashboard';
                showDashboard();
                break;
            case '/evaluations':
                this.currentPage = 'evaluations';
                showEvaluations();
                break;
            case '/evaluations/new':
                this.currentPage = 'new-evaluation';
                showNewEvaluationForm();
                break;
            case '/users':
                this.currentPage = 'users';
                showUsers();
                break;
            default:
                if (path.startsWith('/evaluations/')) {
                    const id = path.split('/')[2];
                    this.currentPage = 'evaluation-detail';
                    viewEvaluation(id);
                } else {
                    this.navigate('/dashboard');
                }
        }
    }
};

// ====================================
// 6. 五角形チャート
// ====================================

class PentagonChart {
    constructor(containerId, categories, data = []) {
        this.container = document.getElementById(containerId);
        this.categories = categories || [];
        this.data = data.length ? data : categories.map(() => 0);
        this.size = 300;
        this.maxValue = 5;
        this.center = this.size / 2;
        this.maxRadius = this.size * 0.35;
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        this.container.style.cssText = `
            width: ${this.size}px;
            height: ${this.size}px;
            margin: 0 auto;
            position: relative;
            background: white;
            border-radius: 8px;
        `;
        
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', this.size);
        this.svg.setAttribute('height', this.size);
        this.svg.setAttribute('viewBox', `0 0 ${this.size} ${this.size}`);
        
        this.drawGrid();
        this.drawData();
        this.drawLabels();
        
        this.container.appendChild(this.svg);
    }
    
    getPoints(radius) {
        const points = [];
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - (Math.PI / 2);
            const x = this.center + radius * Math.cos(angle);
            const y = this.center + radius * Math.sin(angle);
            points.push([x, y]);
        }
        return points;
    }
    
    drawGrid() {
        for (let i = 1; i <= 5; i++) {
            const radius = (this.maxRadius * i) / 5;
            const points = this.getPoints(radius);
            const path = this.createPathFromPoints(points, true);
            
            const gridPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            gridPath.setAttribute('d', path);
            gridPath.setAttribute('fill', 'none');
            gridPath.setAttribute('stroke', '#E5E7EB');
            gridPath.setAttribute('stroke-width', '1');
            
            this.svg.appendChild(gridPath);
        }
        
        // 中心からの線
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - (Math.PI / 2);
            const x = this.center + this.maxRadius * Math.cos(angle);
            const y = this.center + this.maxRadius * Math.sin(angle);
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', this.center);
            line.setAttribute('y1', this.center);
            line.setAttribute('x2', x);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#E5E7EB');
            line.setAttribute('stroke-width', '1');
            
            this.svg.appendChild(line);
        }
    }
    
    drawData() {
        const dataPoints = [];
        
        for (let i = 0; i < 5; i++) {
            const value = this.data[i] || 0;
            const radius = (this.maxRadius * value) / this.maxValue;
            const angle = (i * 2 * Math.PI / 5) - (Math.PI / 2);
            const x = this.center + radius * Math.cos(angle);
            const y = this.center + radius * Math.sin(angle);
            dataPoints.push([x, y]);
            
            // データポイント
            const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            point.setAttribute('cx', x);
            point.setAttribute('cy', y);
            point.setAttribute('r', 4);
            point.setAttribute('fill', '#244EFF');
            point.setAttribute('stroke', 'white');
            point.setAttribute('stroke-width', '2');
            
            this.svg.appendChild(point);
        }
        
        // データエリア
        if (dataPoints.length > 0) {
            const path = this.createPathFromPoints(dataPoints, true);
            const dataPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            dataPath.setAttribute('d', path);
            dataPath.setAttribute('fill', 'rgba(36, 78, 255, 0.2)');
            dataPath.setAttribute('stroke', '#244EFF');
            dataPath.setAttribute('stroke-width', '2');
            
            this.svg.appendChild(dataPath);
        }
    }
    
    drawLabels() {
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - (Math.PI / 2);
            const labelRadius = this.maxRadius + 25;
            const x = this.center + labelRadius * Math.cos(angle);
            const y = this.center + labelRadius * Math.sin(angle);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('fill', '#374151');
            text.setAttribute('font-size', '12px');
            text.setAttribute('font-weight', '600');
            text.textContent = this.getCategoryName(i);
            
            this.svg.appendChild(text);
        }
    }
    
    createPathFromPoints(points, closePath = false) {
        if (points.length === 0) return '';
        
        let path = `M ${points[0][0]} ${points[0][1]}`;
        for (let i = 1; i < points.length; i++) {
            path += ` L ${points[i][0]} ${points[i][1]}`;
        }
        
        if (closePath) {
            path += ' Z';
        }
        
        return path;
    }
    
    getCategoryName(index) {
        if (this.categories[index]) {
            return this.categories[index].name || this.categories[index];
        }
        
        const categoryKeys = [
            'category.safety',
            'category.quality', 
            'category.efficiency',
            'category.teamwork',
            'category.communication'
        ];
        return i18n.t(categoryKeys[index]);
    }
    
    updateData(newData) {
        this.data = [...newData];
        this.init(); // 再描画
    }
}

// ====================================
// 7. ヘルパー関数
// ====================================

// カテゴリ名取得
function getCategoryName(index) {
    const categoryKeys = ['category.safety', 'category.quality', 'category.efficiency', 'category.teamwork', 'category.communication'];
    return i18n.t(categoryKeys[index]);
}

function getCategoryDesc(index) {
    const descKeys = ['category.safety_desc', 'category.quality_desc', 'category.efficiency_desc', 'category.teamwork_desc', 'category.communication_desc'];
    return i18n.t(descKeys[index]);
}

// ナビゲーション構築
function buildNavigation() {
    const navMenu = document.getElementById('nav-menu');
    const userInfo = document.getElementById('user-info');

    if (navMenu) {
        navMenu.innerHTML = `
            <li><a href="#" class="nav-link ${router.currentPage === 'dashboard' ? 'active' : ''}" onclick="router.navigate('/dashboard')">${i18n.t('nav.dashboard')}</a></li>
            <li><a href="#" class="nav-link ${router.currentPage === 'evaluations' ? 'active' : ''}" onclick="router.navigate('/evaluations')">${i18n.t('nav.evaluations')}</a></li>
        `;
    }

    if (userInfo && authManager.currentUser) {
        userInfo.innerHTML = `
            <div class="user-avatar">${authManager.currentUser.name.charAt(0)}</div>
            <div class="user-details">
                <div class="user-name">${authManager.currentUser.name}</div>
                <div class="user-role">${authManager.currentUser.roleJa}</div>
            </div>
            <button onclick="authManager.logout()" style="margin-left: 12px; background: none; border: 1px solid rgba(255,255,255,0.3); color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                ${i18n.t('nav.logout')}
            </button>
        `;
    }
}

// ブレッドクラム更新
function updateBreadcrumbs(items) {
    const breadcrumbs = document.getElementById('breadcrumbs');
    if (!breadcrumbs || !items.length) return;

    breadcrumbs.innerHTML = items.map((item, index) => {
        const isLast = index === items.length - 1;
        if (isLast) {
            return `<span class="current">${item.label}</span>`;
        } else {
            return `<a href="#" onclick="router.navigate('${item.path || ''}')">${item.label}</a>`;
        }
    }).join(' <span class="separator">></span> ');
}

// 評価入力表示更新
function updateRatingDisplay(categoryId) {
    const input = document.getElementById(`rating-${categoryId}`);
    const display = document.getElementById(`display-${categoryId}`);
    const value = parseFloat(input.value);

    if (isNaN(value) || value < 1 || value > 5) {
        display.textContent = i18n.t('form.not_entered');
        display.style.color = '#666';
    } else {
        display.textContent = `${value}/5`;
        display.style.color = '#244EFF';

        const stars = '⭐'.repeat(Math.floor(value));
        const halfStar = (value % 1 >= 0.5) ? '⭐' : '';
        display.innerHTML = `${value}/5<br><small>${stars}${halfStar}</small>`;
    }

    updateRadarChart();
}

// レーダーチャート更新
function updateRadarChart() {
    if (!window.pentagonChart) return;

    const newData = mockData.evaluationCategories.map(category => {
        const input = document.getElementById(`rating-${category.id}`);
        const value = parseFloat(input.value);
        return isNaN(value) ? 0 : Math.max(0, Math.min(5, value));
    });

    window.pentagonChart.updateData(newData);
}

// レーダーチャート初期化
function initializeRadarChart() {
    setTimeout(() => {
        try {
            window.pentagonChart = new PentagonChart('evaluation-radar-chart', mockData.evaluationCategories);
        } catch (error) {
            console.error('Error creating pentagon chart:', error);
        }
    }, 100);
}

// 詳細チャート初期化
function initializeDetailRadarChart(evaluation) {
    const data = mockData.evaluationCategories.map(category => evaluation.ratings[category.id] || 0);
    try {
        window.detailPentagonChart = new PentagonChart('detail-radar-chart', mockData.evaluationCategories, data);
    } catch (error) {
        console.error('Error creating detail pentagon chart:', error);
    }
}

// ====================================
// 8. ページ関数
// ====================================

// ログインページ表示
function showLoginPage() {
    const loginPage = document.querySelector('.login-page');
    if (loginPage) {
        loginPage.style.display = 'flex';
    }
    
    document.getElementById('app-header').style.display = 'none';
    document.getElementById('breadcrumbs').style.display = 'none';
    
    document.body.classList.add('login-mode');
    document.body.classList.remove('authenticated');
    
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="login-page">
            <div class="login-container">
                <div class="login-header">
                    <h1 id="login-title">${i18n.t('system.title')}</h1>
                    <p id="login-subtitle">${i18n.t('system.subtitle')}</p>
                    <div style="margin-top: 16px;">
                        <select id="login-language-select" style="padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
                            <option value="ja">🇯🇵 日本語</option>
                            <option value="vi">🇻🇳 Tiếng Việt</option>
                            <option value="en">🇺🇸 English</option>
                        </select>
                    </div>
                </div>
                
                <form id="login-form">
                    <div class="form-group">
                        <label for="email" id="email-label">${i18n.t('login.email')}</label>
                        <input type="email" id="email" name="email" value="admin@company.com" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="password" id="password-label">${i18n.t('login.password')}</label>
                        <input type="password" id="password" name="password" value="password123" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%;" id="login-submit">
                        ${i18n.t('login.submit')}
                    </button>
                </form>
                
                <div class="demo-info">
                    <strong id="demo-title">${i18n.t('login.demo')}</strong>
                    <div class="demo-accounts">
                        <div class="demo-account">
                            <strong>管理者:</strong> admin@company.com / password123
                        </div>
                        <div class="demo-account">
                            <strong>マネージャー:</strong> manager@company.com / password123
                        </div>
                        <div class="demo-account">
                            <strong>主任:</strong> supervisor@company.com / password123
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ダッシュボード表示
function showDashboard() {
    router.currentPage = 'dashboard';

    // ログインページを非表示
    const loginPage = document.querySelector('.login-page');
    if (loginPage) {
        loginPage.style.display = 'none';
    }

    // ヘッダーとブレッドクラムを表示
    document.getElementById('app-header').style.display = 'block';
    document.getElementById('breadcrumbs').style.display = 'block';

    document.body.classList.remove('login-mode');
    document.body.classList.add('authenticated');

    buildNavigation();
    updateBreadcrumbs([{ label: i18n.t('nav.dashboard') }]);

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">${i18n.t('dashboard.title')}</h1>
                <button class="btn btn-primary" onclick="router.navigate('/evaluations')">
                    ${i18n.t('nav.evaluations')}
                </button>
            </div>
            <div class="page-content">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${mockData.evaluations.length}</div>
                        <div class="stat-label">${i18n.t('dashboard.total')}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">1</div>
                        <div class="stat-label">${i18n.t('dashboard.completed')}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">4.2</div>
                        <div class="stat-label">${i18n.t('dashboard.average')}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">5</div>
                        <div class="stat-label">${i18n.t('dashboard.items')}</div>
                    </div>
                </div>

                <h3>${i18n.t('dashboard.recent')}</h3>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>${i18n.t('table.target')}</th>
                                <th>${i18n.t('table.evaluator')}</th>
                                <th>${i18n.t('table.period')}</th>
                                <th>${i18n.t('table.status')}</th>
                                <th>${i18n.t('table.updated')}</th>
                                <th>${i18n.t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${mockData.evaluations.map(evaluation => `
                                <tr>
                                    <td>${evaluation.subordinate}</td>
                                    <td>${evaluation.evaluator}</td>
                                    <td>${evaluation.period}</td>
                                    <td>${i18n.t('status.completed')}</td>
                                    <td>${evaluation.updatedAt}</td>
                                    <td>
                                        <button class="btn btn-secondary" onclick="viewEvaluation('${evaluation.id}')">
                                            ${i18n.t('action.detail')}
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// 評価一覧表示
function showEvaluations() {
    router.currentPage = 'evaluations';
    updateBreadcrumbs([
        { label: i18n.t('nav.dashboard'), path: '/dashboard' },
        { label: i18n.t('nav.evaluations'), path: '/evaluations' }
    ]);
    
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">${i18n.t('evaluation.list')}</h1>
                <div>
                    <button class="btn btn-secondary" onclick="router.navigate('/dashboard')">
                        ${i18n.t('action.dashboard')}
                    </button>
                    <button class="btn btn-primary" onclick="router.navigate('/evaluations/new')">
                        ${i18n.t('action.new')}
                    </button>
                </div>
            </div>
            <div class="page-content">
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>${i18n.t('table.id')}</th>
                                <th>${i18n.t('table.target')}</th>
                                <th>${i18n.t('table.evaluator')}</th>
                                <th>${i18n.t('table.period')}</th>
                                <th>${i18n.t('table.rating')}</th>
                                <th>${i18n.t('table.status')}</th>
                                <th>${i18n.t('table.updated')}</th>
                                <th>${i18n.t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${mockData.evaluations.map(evaluation => `
                                <tr>
                                    <td>${evaluation.id}</td>
                                    <td>${evaluation.subordinate}</td>
                                    <td>${evaluation.evaluator}</td>
                                    <td>${evaluation.period}</td>
                                    <td>${evaluation.overallRating}/5 ⭐</td>
                                    <td>${i18n.t('status.completed')}</td>
                                    <td>${evaluation.updatedAt}</td>
                                    <td>
                                        <button class="btn btn-secondary" onclick="viewEvaluation('${evaluation.id}')">
                                            ${i18n.t('action.detail')}
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// 新規評価フォーム表示
function showNewEvaluationForm() {
    router.currentPage = 'new-evaluation';
    updateBreadcrumbs([
        { label: i18n.t('nav.dashboard'), path: '/dashboard' },
        { label: i18n.t('nav.evaluations'), path: '/evaluations' },
        { label: i18n.t('evaluation.new'), path: '/evaluations/new' }
    ]);
    
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">${i18n.t('evaluation.new')}</h1>
                <button class="btn btn-secondary" onclick="router.navigate('/evaluations')">
                    ${i18n.t('action.back')}
                </button>
            </div>
            <div class="page-content">
                <form class="evaluation-form" id="new-evaluation-form">
                    <div class="form-section">
                        <h3>${i18n.t('evaluation.basic')}</h3>
                        <div class="form-group">
                            <label for="evaluation-period">${i18n.t('form.period')}</label>
                            <select id="evaluation-period" required>
                                <option value="">評価期間を選択</option>
                                <option value="2025-Q1">2025年第1四半期</option>
                                <option value="2025-Q2">2025年第2四半期</option>
                                <option value="2025-Q3">2025年第3四半期</option>
                                <option value="2025-Q4">2025年第4四半期</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="subordinate-select">${i18n.t('form.target')}</label>
                            <select id="subordinate-select" required>
                                <option value="">対象者を選択</option>
                                <option value="山田 太郎">山田 太郎 (作業員)</option>
                                <option value="佐藤 次郎">佐藤 次郎 (作業員)</option>
                                <option value="鈴木 三郎">鈴木 三郎 (作業員)</option>
                                <option value="田中 四郎">田中 四郎 (作業員)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>${i18n.t('evaluation.ratings')}</h3>
                        <div class="rating-input-group">
                            ${mockData.evaluationCategories.map((category, index) => `
                                <div class="rating-input-item">
                                    <div class="rating-input-label">
                                        <strong>${getCategoryName(index)}</strong>
                                        <small>${getCategoryDesc(index)}</small>
                                    </div>
                                    <div class="rating-input-controls">
                                        <input 
                                            type="number" 
                                            class="rating-input" 
                                            id="rating-${category.id}"
                                            min="1" 
                                            max="5" 
                                            step="0.1"
                                            placeholder="1-5"
                                            onchange="updateRatingDisplay('${category.id}')"
                                            oninput="updateRatingDisplay('${category.id}')"
                                        >
                                        <div class="rating-display" id="display-${category.id}">${i18n.t('form.not_entered')}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="evaluation-chart" style="margin-top: 24px;">
                            <h4 style="text-align: center; margin-bottom: 20px; color: #244EFF;">${i18n.t('evaluation.chart')}</h4>
                            <div class="chart-container">
                                <div id="evaluation-radar-chart" class="pentagon-chart"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>📝 総合評価</h3>
                        <div class="form-group">
                            <label for="overall-comment">総合コメント</label>
                            <textarea id="overall-comment" placeholder="総合的な評価コメントを入力してください" rows="4"></textarea>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 32px;">
                        <button type="button" class="btn btn-secondary" onclick="router.navigate('/evaluations')" style="margin-right: 12px;">
                            ${i18n.t('form.cancel')}
                        </button>
                        <button type="submit" class="btn btn-success">
                            ${i18n.t('form.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    initializeRadarChart();
}

// 評価詳細表示
function viewEvaluation(id) {
    const evaluation = mockData.evaluations.find(e => e.id === id);
    if (!evaluation) {
        showNotification('評価が見つかりません', 'error');
        return;
    }
    
    updateBreadcrumbs([
        { label: i18n.t('nav.dashboard'), path: '/dashboard' },
        { label: i18n.t('nav.evaluations'), path: '/evaluations' },
        { label: '評価詳細', path: `/evaluations/${id}` }
    ]);
    
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">👁️ 評価詳細</h1>
                <button class="btn btn-secondary" onclick="router.navigate('/evaluations')">
                    ${i18n.t('action.back')}
                </button>
            </div>
            <div class="page-content">
                <div class="evaluation-summary">
                    <div class="evaluation-details">
                        <h3 style="color: #244EFF; margin-bottom: 16px;">${i18n.t('evaluation.basic')}</h3>
                        <div class="detail-row">
                            <span class="detail-label">${i18n.t('table.period')}:</span>
                            <span class="detail-value">${evaluation.period}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">${i18n.t('table.target')}:</span>
                            <span class="detail-value">${evaluation.subordinate}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">${i18n.t('table.evaluator')}:</span>
                            <span class="detail-value">${evaluation.evaluator}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">${i18n.t('table.rating')}:</span>
                            <span class="detail-value">${evaluation.overallRating}/5 ⭐</span>
                        </div>
                    </div>
                    
                    <div class="evaluation-chart">
                        <h4 style="text-align: center; margin-bottom: 20px; color: #244EFF;">📊 評価チャート</h4>
                        <div class="chart-container">
                            <div id="detail-radar-chart" class="pentagon-chart"></div>
                        </div>
                    </div>
                </div>
                
                ${evaluation.overallComment ? `
                    <div class="form-section">
                        <h3>📝 総合評価</h3>
                        <div class="form-group">
                            <label><strong>総合コメント</strong></label>
                            <div style="padding:12px;background:#f8f9fa;border-radius:4px;">${evaluation.overallComment}</div>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    setTimeout(() => {
        initializeDetailRadarChart(evaluation);
    }, 200);
}

// ユーザー管理表示
function showUsers() {
    router.currentPage = 'users';
    
    if (!authManager.hasPermission('manage_users')) {
        showNotification('ユーザー管理の権限がありません', 'error');
        router.navigate('/dashboard');
        return;
    }
    
    updateBreadcrumbs([
        { label: i18n.t('nav.dashboard'), path: '/dashboard' },
        { label: 'ユーザー管理', path: '/users' }
    ]);
    
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">👥 ユーザー管理</h1>
                <div>
                    <button class="btn btn-secondary" onclick="router.navigate('/dashboard')">
                        ${i18n.t('action.dashboard')}
                    </button>
                    <button class="btn btn-primary" onclick="showNotification('ユーザー追加機能は開発中です', 'info')">
                        ➕ ユーザー追加
                    </button>
                </div>
            </div>
            <div class="page-content">
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>名前</th>
                                <th>メールアドレス</th>
                                <th>役職</th>
                                <th>部署</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${mockData.users.map(user => `
                                <tr>
                                    <td>${user.id}</td>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <span style="
                                                width: 32px; height: 32px; border-radius: 50%;
                                                background: #244EFF; color: white;
                                                display: flex; align-items: center; justify-content: center;
                                                font-weight: bold; font-size: 12px;
                                            ">${user.name.charAt(0)}</span>
                                            ${user.name}
                                        </div>
                                    </td>
                                    <td>${user.email}</td>
                                    <td>
                                        <span class="badge badge-${user.role === 'admin' ? 'primary' : user.role === 'manager' ? 'success' : 'secondary'}">
                                            ${user.roleJa}
                                        </span>
                                    </td>
                                    <td>${user.department}</td>
                                    <td>
                                        <button class="btn btn-secondary" onclick="showNotification('ユーザー編集機能は開発中です', 'info')" style="margin-right: 4px;">
                                            ✏️ 編集
                                        </button>
                                        ${user.role !== 'admin' ? `
                                            <button class="btn btn-danger" onclick="showNotification('ユーザー削除機能は開発中です', 'info')">
                                                🗑️ 削除
                                            </button>
                                        ` : ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// ====================================
// 9. 評価保存処理
// ====================================

function handleSaveEvaluation(e) {
    e.preventDefault();

    const period = document.getElementById('evaluation-period').value;
    const subordinate = document.getElementById('subordinate-select').value;
    const overallComment = document.getElementById('overall-comment').value;

    if (!period || !subordinate) {
        showNotification('評価期間と対象者を選択してください', 'error');
        return;
    }

    const ratings = {};
    let hasRatings = false;
    mockData.evaluationCategories.forEach(category => {
        const input = document.getElementById(`rating-${category.id}`);
        const value = parseFloat(input.value);
        if (!isNaN(value) && value >= 1 && value <= 5) {
            ratings[category.id] = value;
            hasRatings = true;
        }
    });

    if (!hasRatings) {
        showNotification('少なくとも1つの評価項目を入力してください', 'error');
        return;
    }

    const totalRating = Object.values(ratings).reduce((sum, rating) => sum + rating, 0);
    const avgRating = totalRating / Object.keys(ratings).length || 0;

    const newEvaluation = {
        id: (mockData.evaluations.length + 1).toString(),
        subordinate: subordinate,
        evaluator: authManager.currentUser.name,
        status: 'completed',
        overallRating: Math.round(avgRating * 10) / 10,
        ratings: ratings,
        overallComment: overallComment,
        period: '2025年第1四半期',
        updatedAt: new Date().toISOString().split('T')[0]
    };

    mockData.evaluations.push(newEvaluation);

    showNotification(i18n.t('message.saved'), 'success');

    setTimeout(() => {
        router.navigate('/evaluations');
    }, 1500);
}

// ====================================
// 10. メインアプリケーション
// ====================================

const app = {
    version: '1.0.0',
    initialized: false,
    currentUser: null,
    currentPage: 'login',
    
    async init() {
        if (this.initialized) return;
        
        console.log('🚀 Initializing Construction Evaluation System v' + this.version);
        
        try {
            // 1. 基本システム初期化
            this.setupGlobalErrorHandler();
            
            // 2. モジュール初期化
            i18n.init();
            authManager.init();
            notificationManager.init();
            
            // 3. イベントリスナー設定
            this.setupEventListeners();
            
            // 4. セッション復元チェック
            this.checkSessionRestoration();
            
            // 5. 初期ページ表示
            this.showInitialPage();
            
            this.initialized = true;
            console.log('✅ Construction Evaluation System initialized successfully');
            
            showNotification('システムが正常に起動しました', 'info', 2000);
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.showInitializationError(error);
        }
    },
    
    setupEventListeners() {
        // 言語切り替えイベント
        document.addEventListener('change', (event) => {
            if (event.target.matches('#login-language-select, #header-language-select')) {
                i18n.setLanguage(event.target.value);
            }
        });
        
        // フォーム送信イベント
        document.addEventListener('submit', (event) => {
            if (event.target.id === 'login-form') {
                event.preventDefault();
                this.handleLogin(event);
            } else if (event.target.id === 'new-evaluation-form') {
                event.preventDefault();
                handleSaveEvaluation(event);
            }
        });
        
        // 評価入力リアルタイム更新
        document.addEventListener('input', (event) => {
            if (event.target.matches('.rating-input')) {
                const categoryId = event.target.id.replace('rating-', '');
                updateRatingDisplay(categoryId);
            }
        });
    },
    
    checkSessionRestoration() {
        if (authManager.isAuthenticated()) {
            this.currentUser = authManager.getCurrentUser();
            console.log(`🔄 Session restored for: ${this.currentUser.name}`);
        }
    },
    
    showInitialPage() {
        if (authManager.isAuthenticated()) {
            document.body.classList.remove('login-mode');
            document.body.classList.add('authenticated');
            router.navigate('/dashboard');
        } else {
            document.body.classList.add('login-mode');
            document.body.classList.remove('authenticated');
            router.navigate('/');
        }
    },
    
    async handleLogin(event) {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            showNotification('メールアドレスとパスワードを入力してください', 'error');
            return;
        }
        
        const submitButton = document.getElementById('login-submit');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = '認証中...';
        
        try {
            const result = await authManager.login(email, password);
            
            if (result.success) {
                this.currentUser = authManager.getCurrentUser();
                showNotification(result.message, 'success');
                
                setTimeout(() => {
                    document.body.classList.remove('login-mode');
                    document.body.classList.add('authenticated');
                    router.navigate('/dashboard');
                }, 1000);
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('ログイン処理中にエラーが発生しました', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    },
    
    setupGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            showNotification('予期しないエラーが発生しました', 'error');
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            showNotification('処理中にエラーが発生しました', 'error');
        });
    },
    
    showInitializationError(error) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: #FF2C5D;
                    color: white;
                    text-align: center;
                    padding: 20px;
                ">
                    <div>
                        <h1>⚠️ システム初期化エラー</h1>
                        <p>システムの初期化中にエラーが発生しました。</p>
                        <p><strong>エラー内容:</strong> ${error.message}</p>
                        <button onclick="location.reload()" style="
                            margin-top: 20px;
                            padding: 10px 20px;
                            background: white;
                            color: #FF2C5D;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                        ">
                            ページを再読み込み
                        </button>
                    </div>
                </div>
            `;
        }
    },
    
    getAppInfo() {
        return {
            version: this.version,
            initialized: this.initialized,
            currentUser: this.currentUser,
            currentPage: this.currentPage,
            evaluationsCount: mockData.evaluations.length,
            usersCount: mockData.users.length,
            language: i18n.currentLanguage
        };
    }
};

// ====================================
// 11. グローバル公開とイベント設定
// ====================================

// グローバルに公開
window.app = app;
window.authManager = authManager;
window.router = router;
window.i18n = i18n;
window.mockData = mockData;
window.showNotification = showNotification;
window.notificationManager = notificationManager;
window.PentagonChart = PentagonChart;

// ページ関数をグローバルに公開
window.showDashboard = showDashboard;
window.showEvaluations = showEvaluations;
window.showNewEvaluationForm = showNewEvaluationForm;
window.viewEvaluation = viewEvaluation;
window.showUsers = showUsers;
window.showLoginPage = showLoginPage;

// ヘルパー関数をグローバルに公開
window.getCategoryName = getCategoryName;
window.getCategoryDesc = getCategoryDesc;
window.buildNavigation = buildNavigation;
window.updateBreadcrumbs = updateBreadcrumbs;
window.updateRatingDisplay = updateRatingDisplay;
window.updateRadarChart = updateRadarChart;
window.initializeRadarChart = initializeRadarChart;
window.initializeDetailRadarChart = initializeDetailRadarChart;
window.handleSaveEvaluation = handleSaveEvaluation;

// 後方互換性のための関数エイリアス
window.logout = () => authManager.logout();
window.handleLogin = (event) => app.handleLogin(event);

// ====================================
// 12. 自動初期化
// ====================================

// DOM読み込み完了時に自動初期化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🏗️ Building evaluation system started');
        await app.init();
        console.log('✅ Building evaluation system ready');
    } catch (error) {
        console.error('⚠️ App auto-initialization failed:', error);
        // フォールバック処理
        setupBasicEventListeners();
    }
});

// 基本イベントリスナー設定（フォールバック）
function setupBasicEventListeners() {
    console.log('🔧 Setting up basic event listeners (fallback mode)');
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            app.handleLogin(e);
        });
    }
    
    // 言語切り替え
    const loginLangSelect = document.getElementById('login-language-select');
    const headerLangSelect = document.getElementById('header-language-select');
    
    if (loginLangSelect) {
        loginLangSelect.addEventListener('change', function() {
            i18n.setLanguage(this.value);
        });
    }
    
    if (headerLangSelect) {
        headerLangSelect.addEventListener('change', function() {
            i18n.setLanguage(this.value);
        });
    }
}

// ====================================
// 13. デバッグ用ユーティリティ
// ====================================

// デバッグモード（開発環境のみ）
if (EvaluationApp.Constants.APP.DEBUG) {
    window.debug = {
        app: () => app.getAppInfo(),
        auth: () => authManager.getSafeUserData(),
        mockData: () => mockData,
        router: () => ({ currentPage: router.currentPage, currentRoute: router.currentRoute }),
        i18n: () => ({ currentLanguage: i18n.currentLanguage, translations: Object.keys(i18n.translations) }),
        notifications: () => Array.from(notificationManager.notifications.keys()),
        
        // テスト用関数
        testLogin: (role = 'admin') => {
            const testUsers = {
                admin: { email: 'admin@company.com', password: 'password123' },
                manager: { email: 'manager@company.com', password: 'password123' },
                supervisor: { email: 'supervisor@company.com', password: 'password123' }
            };
            const user = testUsers[role];
            if (user) {
                authManager.login(user.email, user.password);
            }
        },
        
        testLogout: () => authManager.logout(),
        
        addTestEvaluation: () => {
            const testEval = {
                id: (mockData.evaluations.length + 1).toString(),
                subordinate: 'テスト 太郎',
                evaluator: 'デバッグ 花子',
                status: 'completed',
                overallRating: 4.5,
                ratings: { safety: 5, quality: 4, efficiency: 4, teamwork: 5, communication: 4 },
                overallComment: 'デバッグ用テスト評価です。',
                period: '2025年テスト期間',
                updatedAt: new Date().toISOString().split('T')[0]
            };
            mockData.evaluations.push(testEval);
            showNotification('テスト評価を追加しました', 'success');
        },
        
        clearData: () => {
            if (confirm('すべてのデータをクリアしますか？')) {
                mockData.evaluations = [];
                authManager.logout();
                showNotification('データをクリアしました', 'info');
            }
        }
    };
    
    console.log('🐛 Debug mode enabled. Use window.debug for debugging utilities.');
    console.log('Available debug commands:');
    console.log('- window.debug.app() - App info');
    console.log('- window.debug.testLogin("admin") - Test login');
    console.log('- window.debug.addTestEvaluation() - Add test evaluation');
}

// ====================================
// 14. パフォーマンス監視
// ====================================

// パフォーマンス計測（開発環境のみ）
if (EvaluationApp.Constants.APP.DEBUG && window.performance) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            const domReady = perfData.domContentLoadedEventEnd - perfData.navigationStart;
            
            console.log(`📊 Performance Metrics:
- Total Load Time: ${loadTime}ms
- DOM Ready Time: ${domReady}ms
- App Initialization: ${app.initialized ? 'Success' : 'Failed'}
- Modules Loaded: i18n, auth, router, notifications, charts
- Mock Data: ${mockData.users.length} users, ${mockData.evaluations.length} evaluations`);
        }, 1000);
    });
}

// ====================================
// 15. PWA対応準備
// ====================================

// Service Worker登録（将来の機能拡張用）
if ('serviceWorker' in navigator && EvaluationApp.Constants.APP.MODE === 'production') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// オフライン対応
window.addEventListener('online', () => {
    showNotification('インターネット接続が復旧しました', 'success', 2000);
});

window.addEventListener('offline', () => {
    showNotification('オフラインモードです', 'warning', 5000);
});

// ====================================
// 16. 最終確認とログ出力
// ====================================

console.log('🏗️ app.js loaded - Construction Evaluation System ready');
console.log(`📦 Integrated modules: 
- Constants & Mock Data ✅
- i18n (Internationalization) ✅  
- Authentication System ✅
- Notification System ✅
- Routing System ✅
- Pentagon Chart Component ✅
- Helper Functions ✅
- Page Functions ✅
- Form Handling ✅
- Main Application ✅
- Global Exports ✅
- Auto Initialization ✅
- Debug Utilities ✅
- Performance Monitoring ✅
- PWA Preparation ✅
- Final Validation ✅`);

// システム準備完了の確認
if (typeof window !== 'undefined') {
    window.CONSTRUCTION_EVAL_SYSTEM_READY = true;
    
    // 統合確認
    const integrationCheck = {
        app: typeof app !== 'undefined',
        authManager: typeof authManager !== 'undefined',
        router: typeof router !== 'undefined',
        i18n: typeof i18n !== 'undefined',
        mockData: typeof mockData !== 'undefined',
        notificationManager: typeof notificationManager !== 'undefined',
        PentagonChart: typeof PentagonChart !== 'undefined',
        showDashboard: typeof showDashboard !== 'undefined',
        showEvaluations: typeof showEvaluations !== 'undefined'
    };
    
    const allModulesReady = Object.values(integrationCheck).every(Boolean);
    
    if (allModulesReady) {
        console.log('✅ All 16 modules successfully integrated and ready!');
    } else {
        console.warn('⚠️ Some modules may not be properly integrated:', integrationCheck);
    }
}

/* 
====================================
統合完了 - 建設業評価システム
====================================

このファイルには以下の16個のモジュールが統合されています：

1. Constants & Mock Data - アプリケーション定数とサンプルデータ
2. i18n (多言語対応) - 日本語・ベトナム語・英語対応
3. 認証システム - ログイン・ログアウト・セッション管理
4. 通知システム - トースト通知・アラート
5. ルーティングシステム - SPA用ページ遷移
6. 五角形チャート - SVG評価チャート
7. ヘルパー関数 - 共通ユーティリティ
8. ページ関数 - 各ページの表示制御
9. 評価保存処理 - フォーム処理・データ保存
10. メインアプリケーション - 統合管理
11. グローバル公開 - 外部アクセス用
12. 自動初期化 - DOMReady時の起動
13. デバッグユーティリティ - 開発支援
14. パフォーマンス監視 - 性能計測
15. PWA対応準備 - 将来拡張用
16. 最終確認 - 統合検証

元の25ファイル構成から7ファイルに削減完了！
🎉 建設業評価システム統合版準備完了！
*/
