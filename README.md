# 🍪 React-Cookies

<div align="center">

مكتبة خفيفة وقوية لإدارة الكوكيز في تطبيقات React باستخدام `localStorage` مع دعم المزامنة التلقائية بين التبويبات.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://react.dev/)
[![npm](https://img.shields.io/badge/npm-v1.0.0-red.svg)](https://www.npmjs.com/)

</div>

---

## 🎯 لماذا React-Cookies؟

تخزين التفضيلات في `localStorage` مباشرة عملية فوضوية:

```javascript
// ❌ بدون React-Cookies
localStorage.setItem("theme", "dark");
const theme = localStorage.getItem("theme"); // string فقط
// لا expiry، لا sync، لا types
```

**مع React-Cookies:**

```javascript
// ✅ مع React-Cookies
setCookie({ name: "theme", value: "dark", time: 86400 });
const theme = getCookie("theme"); // أي نوع
// expiry تلقائي + مزامنة بين التبويبات + TypeScript
```

---

## ✨ المميزات

| الميزة | التفاصيل |
|--------|---------|
| 🔄 **مزامنة تلقائية** | بين جميع تبويبات المتصفح |
| ⏱️ **صلاحية زمنية** | انتهاء تلقائي بعد مدة محددة |
| 🎯 **واجهة بسيطة** | 6 دوال فقط |
| 📦 **حجم صغير** | ~1KB مضغوط |
| 💪 **TypeScript كامل** | دعم كامل للأنواع |
| 🛡️ **آمن من الأخطاء** | معالجة quota + JSON معطوب |
| 🎨 **React Hook** | `useSyncCookie` للمزامنة السلسة |
| 🧹 **تنظيف تلقائي** | حذف الكوكيز المنتهية |

---

## 📦 التثبيت

```bash
npm install @mqdev1/react-cookies
# أو
yarn add @mqdev1/react-cookies
# أو
pnpm add @mqdev1/react-cookies
```

**ملاحظة:** المكتبة موجودة حالياً كملف داخل `src/lib/`. لأخذها من GitHub:

```bash
npm install mqdev1/-react_cookies
```

---

## 🚀 البدء السريع

### 1️⃣ حفظ وقراءة كوكي

```typescript
import { setCookie, getCookie, ClearCookies } from "react-cookies";

// ✅ حفظ كوكي (ساعة واحدة)
setCookie({
    name: "username",
    value: "أحمد",
    time: 3600,
});

// ✅ قراءة كوكي
const user = getCookie<string>("username");
console.log(user); // 'أحمد'

// ✅ مسح جميع الكوكيز
ClearCookies();
```

### 2️⃣ استخدام Hook للمزامنة

```tsx
import { useSyncCookie, setCookie } from "react-cookies";

function UserProfile() {
    // 🔄 مزامنة تلقائية مع التغييرات من أي تبويب
    const username = useSyncCookie<string>("username");

    const handleLogin = () => {
        setCookie({
            name: "username",
            value: "سارة",
            time: 7200, // ساعتين
        });
    };

    return (
        <div>
            <h1>مرحباً {username || "زائر"}</h1>
            <button onClick={handleLogin}>تسجيل الدخول</button>
        </div>
    );
}
```

---

## 📚 API كامل

### `setCookie(options)`

حفظ أو تحديث كوكي.

```typescript
interface SetCookieOptions {
    name: string;
    value: any;
    time?: number; // بالثواني (افتراضي: 60)
}

setCookie({
    name: "theme",
    value: "dark",
    time: 86400, // يوم
});
```

---

### `getCookie<T>(name)`

قراءة كوكي مع دعم الـ Generic Types.

```typescript
// ✅ قراءة string
const name = getCookie<string>("username");

// ✅ قراءة object
interface UserPrefs {
    theme: string;
    fontSize: number;
}
const prefs = getCookie<UserPrefs>("prefs");
console.log(prefs?.theme); // "dark"

// ✅ مع قيمة افتراضية
const theme = getCookie<string>("theme") ?? "light";
```

---

### `delCookie({ name })`

حذف كوكي محدد.

```typescript
delCookie({ name: "session_id" });
```

---

### `listCookies()`

قائمة بجميع الكوكيز الصالحة.

```typescript
const all = listCookies();
all.forEach((c) => {
    console.log(`${c.name} → ${c.value}`);
    console.log(`expires at: ${c.expires_at}`);
});
```

**Return Type:**

```typescript
interface CookieListItem {
    name: string;
    value: any;
    time: number;
    created_at: Date;
    expires_at: Date;
}
```

---

### `ClearCookies()`

حذف **جميع** الكوكيز.

```typescript
ClearCookies();
```

---

### `purgeExpired()`

تنظيف يدوي للكوكيز المنتهية.

```typescript
const removed = purgeExpired();
console.log(`تم حذف ${removed} كوكي منتهي`);
```

---

### `useSyncCookie<T>(cookieName)`

Hook للمزامنة التلقائية.

```typescript
const value = useSyncCookie<number>("counter");
```

**كيف يعمل؟**

- ✅ يتحدّث عند تغيير الكوكي
- ✅ يستجيب للتغييرات من أي تبويب
- ✅ ينظف المستمعين تلقائياً
- ✅ SSR-safe (`typeof window` checks)

---

## 💡 أمثلة عملية

### 🎨 مثال 1: تبديل الثيم

```tsx
function ThemeSwitcher() {
    const theme = useSyncCookie<"light" | "dark">("theme");

    const changeTheme = (newTheme: "light" | "dark") => {
        setCookie({
            name: "theme",
            value: newTheme,
            time: 60 * 60 * 24 * 30, // 30 يوم
        });
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    return (
        <button onClick={() => changeTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "☀️" : "🌙"}
        </button>
    );
}
```

### 🔐 مثال 2: نظام مصادقة بسيط

```tsx
function AuthSystem() {
    const [user, setUser] = useState<User | null>(null);
    const isLoggedIn = useSyncCookie<string>("isLoggedIn");

    useEffect(() => {
        if (isLoggedIn === "true") {
            const userData = getCookie<User>("userData");
            setUser(userData);
        }
    }, [isLoggedIn]);

    const login = (userInfo: User) => {
        setCookie({
            name: "isLoggedIn",
            value: "true",
            time: 3600,
        });
        setCookie({
            name: "userData",
            value: userInfo,
            time: 3600,
        });
    };

    const logout = () => {
        delCookie({ name: "isLoggedIn" });
        delCookie({ name: "userData" });
        setUser(null);
    };
}
```

### 🌍 مثال 3: تفضيلات اللغة

```tsx
function LanguageSwitcher() {
    const language = useSyncCookie<"ar" | "en">("language");

    const changeLanguage = (lang: "ar" | "en") => {
        setCookie({
            name: "language",
            value: lang,
            time: 60 * 60 * 24 * 365, // سنة
        });
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    };

    return (
        <div>
            <button onClick={() => changeLanguage("ar")}>العربية</button>
            <button onClick={() => changeLanguage("en")}>English</button>
        </div>
    );
}
```

---

## ⚙️ آلية العمل الداخلية

### 1️⃣ التخزين

جميع الكوكيز تُخزّن في `localStorage` تحت مفتاح واحد `AllLocals`:

```json
{
  "version": 1,
  "data": [
    {
      "loc_name": "theme",
      "loc_value": "dark",
      "loc_time": 86400,
      "loc_created_date": "2026-01-15T10:30:00.000Z"
    }
  ]
}
```

**لماذا مفتاح واحد؟**

- ✅ أداء أفضل (قراءة/كتابة واحدة)
- ✅ لا تعارض مع مفاتيح أخرى
- ✅ سهولة النسخ الاحتياطي

### 2️⃣ الصلاحية

يتم التحقق عند كل قراءة:

```typescript
const isExpired = (cookie: CookieEntry): boolean => {
    const expiryDate = new Date(cookie.loc_created_date);
    expiryDate.setSeconds(expiryDate.getSeconds() + cookie.loc_time);
    return new Date() >= expiryDate;
};
```

### 3️⃣ المزامنة

يستخدم حدثين:

| الحدث | الغرض |
|-------|-------|
| `storage` | تغييرات من تبويبات أخرى |
| `storage_update` | تغييرات من التبويب الحالي |

---

## 📊 مقارنة

| الميزة | React-Cookies | Cookies | localStorage | sessionStorage |
|--------|---------------|---------|--------------|----------------|
| صلاحية زمنية | ✅ | ✅ | ❌ | ✅ |
| مزامنة بين التبويبات | ✅ | ✅ | ❌ | ❌ |
| سعة التخزين | ~5MB | ~4KB | ~5MB | ~5MB |
| TypeScript Types | ✅ | ⚠️ | ❌ | ❌ |
| React Hook | ✅ | ❌ | ❌ | ❌ |
| تنظيف تلقائي | ✅ | ✅ | ❌ | ✅ |
| API بسيط | ✅ | ❌ | ✅ | ✅ |

---

## ⚠️ ملاحظات أمنية

### 🔓 البيانات غير مشفّرة بشكل افتراضي

المكتبة تخزّن البيانات **كنص عادي** في `localStorage`. هذا مناسب لـ:

- ✅ تفضيلات UI (Dark Mode, Language)
- ✅ حالات غير حساسة
- ✅ Session tokens (مع تشفير إضافي)

**❌ لا تستخدمها لـ:**

- كلمات المرور
- بطاقات الائتمان
- معلومات شخصية حساسة

### 🛡️ كيف تشفّر بنفسك؟

```typescript
import CryptoJS from "crypto-js";

const KEY = import.meta.env.VITE_ENCRYPTION_KEY;

// ✅ حفظ مشفّر
const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(userData),
    KEY
).toString();

setCookie({
    name: "user",
    value: encrypted,
    time: 3600,
});

// ✅ قراءة وفك تشفير
const ciphertext = getCookie<string>("user");
if (ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, KEY);
    const userData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}
```

**⚠️ تنبيه:** التشفير من جهة العميل **ليس آمنًا 100%** — المفتاح موجود في المتصفح. للبيانات الحساسة، استخدم **Backend** (Supabase Vault أو API).

---

## 🛠️ التطوير

```bash
# استنساخ
git clone https://github.com/mqdev1/-react_cookies.git

# تثبيت
npm install

# تشغيل Dev Server
npm run dev

# بناء
npm run build
```

---

## 📝 Changelog

### v1.0.0 (2026-01-15)

- ✨ إطلاق النسخة الأولى
- 📝 6 دوال أساسية
- 🎨 React Hook للمزامنة
- 💪 TypeScript كامل
- 🛡️ معالجة الأخطاء

---

## 🤝 المساهمة

نرحب بمساهماتكم! اتبع هذي الخطوات:

1. Fork المشروع
2. أنشئ فرعاً جديداً:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. أضف تغييراتك:
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
4. ادفع:
   ```bash
   git push origin feature/amazing-feature
   ```
5. افتح Pull Request

### 📋 معايير الكود

- ✅ TypeScript strict mode
- ✅ تعليقات بالعربية والإنجليزية
- ✅ اختبارات (قريباً)
- ✅ Conventional Commits

---

## 📄 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE).

---

<div align="center">

**صنع بـ ❤️ بواسطة [mqdev1](https://github.com/mqdev1)**

⭐ إذا أعجبتك المكتبة، لا تنسَ إعطاءها نجمة!

[🐛 الإبلاغ عن مشكلة](https://github.com/mqdev1/-react_cookies/issues) •
[💡 اقتراح ميزة](https://github.com/mqdev1/-react_cookies/issues) •
[📖 التوثيق](https://github.com/mqdev1/-react_cookies)

</div>
