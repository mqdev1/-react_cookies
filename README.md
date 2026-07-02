# 🍪 React-Cookies

مكتبة خفيفة وقوية لإدارة الكوكيز في تطبيقات React باستخدام `localStorage` مع دعم المزامنة التلقائية بين التبويبات.

## 📦 التثبيت

```bash
npm install react-cookies
# أو
yarn add react-cookies
```

## ✨ المميزات

- ✅ **مزامنة تلقائية** بين جميع تبويبات المتصفح
- ✅ **صلاحية زمنية** للبيانات (انتهاء تلقائي)
- ✅ **واجهة بسيطة** وسهلة الاستخدام
- ✅ **حجم صغير** ولا يحتوي على تبعيات خارجية
- ✅ **مكتوب بـ TypeScript** (دعم كامل للأنواع)
- ✅ **مثالي** لتخزين تفضيلات المستخدم، حالة الجلسة، والإعدادات

## 🚀 البدء السريع

### 1️⃣ إعداد الكوكيز

```javascript
import { setCookie, getCookie, ClearCookies } from 'react-cookies';

// حفظ كوكي
setCookie({
  name: 'username',
  value: 'أحمد',
  time: 3600 // ثانية (ساعة واحدة)
});

// قراءة كوكي
const user = getCookie('username');
console.log(user); // 'أحمد'

// مسح جميع الكوكيز
ClearCookies();
```

### 2️⃣ استخدام الـ Hook للمزامنة التلقائية

```javascript
import React from 'react';
import { useSyncCookie, setCookie } from 'react-cookies';

function UserProfile() {
  // المزامنة التلقائية مع التغييرات
  const username = useSyncCookie('username');

  const handleLogin = () => {
    setCookie({
      name: 'username',
      value: 'سارة',
      time: 7200 // ساعتين
    });
  };

  return (
    <div>
      <h1>مرحباً {username || 'زائر'}</h1>
      <button onClick={handleLogin}>تسجيل الدخول</button>
    </div>
  );
}
```

## 📚 الـ API كاملاً

### `setCookie({ name, value, time })`

يضيف أو يحدّث كوكي جديد.

| المعامل | النوع | إلزامي | الوصف |
|---------|------|--------|-------|
| `name` | `string` | ✅ نعم | اسم الكوكي |
| `value` | `any` | ✅ نعم | قيمة الكوكي (يمكن أن تكون كائن) |
| `time` | `number` | ❌ لا | مدة الصلاحية **بالثواني** (الافتراضي: 60) |

```javascript
setCookie({
  name: 'theme',
  value: 'dark',
  time: 86400 // يوم كامل
});
```

---

### `getCookie(name)`

يسترجع قيمة الكوكي إذا كان صالحاً، وإلا يعيد `null`.

```javascript
const token = getCookie('auth_token');
if (token) {
  // الكوكي موجود وصالح
}
```

---

### `delCookie({ name })`

يحذف كوكي محدد.

```javascript
delCookie({ name: 'session_id' });
```

---

### `listCookies()`

يسترجع قائمة بجميع الكوكيز الصالحة.

```javascript
const allCookies = listCookies();
console.log(allCookies);
/*
[
  { name: 'username', value: 'أحمد', time: 3600 },
  { name: 'theme', value: 'dark', time: 86400 }
]
*/
```

---

### `ClearCookies()`

يحذف **جميع** الكوكيز المخزنة.

```javascript
ClearCookies(); // مسح شامل
```

---

### `useSyncCookie(cookieName)`

**Hook** للمزامنة التلقائية مع تغييرات الكوكيز في أي تبويب.

```javascript
const value = useSyncCookie('username');
```

**كيف يعمل؟**
- ✅ يتحدّث تلقائياً عند تغيير الكوكي
- ✅ يستجيب للتغييرات من أي تبويب آخر
- ✅ يُنظف الاستماع تلقائياً عند فك تركيب المكون

## 💡 أمثلة عملية

### مثال 1: نظام المصادقة البسيط

```javascript
function AuthSystem() {
  const [user, setUser] = useState(null);
  const isLoggedIn = useSyncCookie('isLoggedIn');

  useEffect(() => {
    if (isLoggedIn === 'true') {
      const userData = getCookie('userData');
      setUser(JSON.parse(userData));
    }
  }, [isLoggedIn]);

  const login = (userInfo) => {
    setCookie({
      name: 'isLoggedIn',
      value: 'true',
      time: 3600
    });
    setCookie({
      name: 'userData',
      value: JSON.stringify(userInfo),
      time: 3600
    });
  };

  const logout = () => {
    delCookie({ name: 'isLoggedIn' });
    delCookie({ name: 'userData' });
    setUser(null);
  };

  // ... باقي الكود
}
```

### مثال 2: تفضيلات المستخدم

```javascript
function ThemeSwitcher() {
  const theme = useSyncCookie('theme');

  const changeTheme = (newTheme) => {
    setCookie({
      name: 'theme',
      value: newTheme,
      time: 2592000 // 30 يوماً
    });
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <button onClick={() => changeTheme('dark')}>
      الوضع الحالي: {theme || 'فاتح'}
    </button>
  );
}
```

## ⚙️ آلية العمل الداخلية

1. **التخزين**: جميع الكوكيز تُخزن في `localStorage` داخل مفتاح واحد `AllLocals`.
2. **الصلاحية**: يتم التحقق من انتهاء الصلاحية عند كل قراءة باستخدام `getCookie`.
3. **المزامنة**: تستخدم الأحداث المخصصة `storage_update` و `storage` للتحديث الفوري.

## 📊 مقارنة مع التخزين التقليدي

| الميزة | React-Cookies | Cookies | localStorage |
|--------|---------------|---------|--------------|
| صلاحية زمنية | ✅ | ✅ | ❌ |
| مزامنة بين التبويبات | ✅ | ✅ | ❌ |
| سعة التخزين | ~5MB | ~4KB | ~5MB |
| آمن للـ XSS | ✅ | ⚠️ | ✅ |

## 🤝 المساهمة

المكتبة مفتوحة المصدر! نرحب بمساهماتكم:

1. Fork المشروع
2. أنشئ فرعاً جديداً (`git checkout -b feature/amazing-feature`)
3. أضف تغييراتك (`git commit -m 'Add some amazing feature'`)
4. ادفع التغييرات (`git push origin feature/amazing-feature`)
5. افتح Pull Request

## 📝 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE).

---

**صنع بـ ❤️ بواسطة [mqdev1](https://github.com/mqdev1)**

---

### ⭐ دعم المشروع

إذا أعجبتك المكتبة، لا تنسى إعطائها نجمة ⭐ على GitHub!
