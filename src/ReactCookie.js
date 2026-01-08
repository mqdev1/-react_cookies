import { useState, useEffect } from 'react';

/**
 * ReactCookie.js 
 * مكتبة لإدارة الكوكيز عبر LocalStorage مع دعم المزامنة التلقائية
 */

// التحقق من القيم الفارغة
const isEmpty = (val) => [undefined, null, ""].indexOf(val) > -1;

// --- الوظائف الأساسية ---

export const setCookie = (props) => {
  const { name, value, time = 60 } = props;

  if (isEmpty(name) || isEmpty(value)) {
    console.error("ReactCookie: 'name' and 'value' are required.");
    return;
  }

  const allLocals = JSON.parse(localStorage.getItem("AllLocals") || "[]");
  const cookieIndex = allLocals.findIndex(c => c.loc_name === name);

  const newEntry = {
    loc_name: name,
    loc_value: value,
    loc_time: time,
    loc_created_date: new Date().toISOString(),
  };

  if (cookieIndex > -1) {
    allLocals[cookieIndex] = newEntry;
  } else {
    allLocals.push(newEntry);
  }

  localStorage.setItem("AllLocals", JSON.stringify(allLocals));
  
  // إطلاق حدث يدوي لتنبيه التبويب الحالي بالتغيير
  window.dispatchEvent(new Event("storage_update"));
};

export const getCookie = (name) => {
  if (isEmpty(name)) return null;

  const allLocals = JSON.parse(localStorage.getItem("AllLocals") || "[]");
  const cookie = allLocals.find(c => c.loc_name === name);

  if (cookie) {
    const expiryDate = new Date(cookie.loc_created_date);
    expiryDate.setSeconds(expiryDate.getSeconds() + parseInt(cookie.loc_time));

    // إذا كان الوقت الحالي أصغر من وقت الانتهاء، الكوكي صالحة
    if (new Date() < expiryDate) {
      return cookie.loc_value;
    } else {
      delCookie({ name }); // حذف تلقائي إذا انتهت الصلاحية
      return null;
    }
  }
  return null;
};

export const delCookie = (props) => {
  if (isEmpty(props.name)) return;

  const allLocals = JSON.parse(localStorage.getItem("AllLocals") || "[]");
  const filtered = allLocals.filter(c => c.loc_name !== props.name);
  
  localStorage.setItem("AllLocals", JSON.stringify(filtered));
  window.dispatchEvent(new Event("storage_update"));
};

export const listCookies = () => {
  const allLocals = JSON.parse(localStorage.getItem("AllLocals") || "[]");
  const validCookies = [];

  allLocals.forEach(c => {
    const val = getCookie(c.loc_name);
    if (val) {
      validCookies.push({
        name: c.loc_name,
        value: c.loc_value,
        time: c.loc_time
      });
    }
  });
  return validCookies;
};

export const ClearCookies = () => {
  localStorage.setItem("AllLocals", JSON.stringify([]));
  window.dispatchEvent(new Event("storage_update"));
};

// --- React Hook للمزامنة التلقائية ---

export const useSyncCookie = (cookieName) => {
  const [value, setValue] = useState(() => getCookie(cookieName));

  useEffect(() => {
    const updateState = () => {
      setValue(getCookie(cookieName));
    };

    // الاستماع لتغييرات التبويبات الأخرى
    window.addEventListener("storage", updateState);
    // الاستماع لتغييرات التبويب الحالي
    window.addEventListener("storage_update", updateState);

    return () => {
      window.removeEventListener("storage", updateState);
      window.removeEventListener("storage_update", updateState);
    };
  }, [cookieName]);

  return value;
};
