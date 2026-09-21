import { useEffect, useState } from "react";

// ============================================
// Types
// ============================================
export interface CookieEntry {
    loc_name: string;
    loc_value: any;
    loc_time: number;
    loc_created_date: string;
}

export interface SetCookieOptions {
    name: string;
    value: any;
    time?: number;
}

export interface DelCookieOptions {
    name: string;
}

export interface CookieListItem {
    name: string;
    value: any;
    time: number;
    created_at: Date;
    expires_at: Date;
}

// ============================================
// Constants
// ============================================
const STORAGE_KEY = "AllLocals";
const STORAGE_EVENT = "storage_update";
const SCHEMA_VERSION = 1;

// ============================================
// Helpers
// ============================================
const isEmpty = (val: unknown): boolean =>
    val === undefined || val === null || val === "";

const readStorage = (): CookieEntry[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];

        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) return parsed;

        if (parsed && typeof parsed === "object" && Array.isArray(parsed.data)) {
            return parsed.data;
        }

        return [];
    } catch (err) {
        console.warn("[ReactCookie] Failed to parse storage:", err);
        return [];
    }
};

const writeStorage = (cookies: CookieEntry[]): boolean => {
    try {
        const payload = {
            version: SCHEMA_VERSION,
            data: cookies,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        return true;
    } catch (err) {
        console.error("[ReactCookie] Failed to write storage:", err);

        try {
            const cleaned = cookies.filter((c) => {
                const expiry = new Date(c.loc_created_date);
                expiry.setSeconds(expiry.getSeconds() + c.loc_time);
                return new Date() < expiry;
            });
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ version: SCHEMA_VERSION, data: cleaned })
            );
            return true;
        } catch {
            return false;
        }
    }
};

const emitUpdate = (): void => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(STORAGE_EVENT));
    }
};

const isExpired = (cookie: CookieEntry): boolean => {
    const expiryDate = new Date(cookie.loc_created_date);
    expiryDate.setSeconds(expiryDate.getSeconds() + cookie.loc_time);
    return new Date() >= expiryDate;
};

// ============================================
// Core API
// ============================================
export const setCookie = (options: SetCookieOptions): void => {
    const { name, value, time = 60 } = options;

    if (isEmpty(name)) {
        console.error("[ReactCookie] 'name' is required.");
        return;
    }

    if (value === undefined || value === null) {
        console.error("[ReactCookie] 'value' is required.");
        return;
    }

    const allLocals = readStorage();
    const existingIndex = allLocals.findIndex((c) => c.loc_name === name);

    const newEntry: CookieEntry = {
        loc_name: name,
        loc_value: value,
        loc_time: time,
        loc_created_date: new Date().toISOString(),
    };

    if (existingIndex > -1) {
        allLocals[existingIndex] = newEntry;
    } else {
        allLocals.push(newEntry);
    }

    if (writeStorage(allLocals)) {
        emitUpdate();
    }
};

export const getCookie = <T = any>(name: string): T | null => {
    if (isEmpty(name)) return null;

    const allLocals = readStorage();
    const cookie = allLocals.find((c) => c.loc_name === name);

    if (!cookie) return null;

    if (isExpired(cookie)) {
        delCookie({ name });
        return null;
    }

    return cookie.loc_value as T;
};

export const delCookie = (options: DelCookieOptions): void => {
    if (isEmpty(options?.name)) return;

    const allLocals = readStorage();
    const filtered = allLocals.filter((c) => c.loc_name !== options.name);

    if (writeStorage(filtered)) {
        emitUpdate();
    }
};

export const listCookies = (): CookieListItem[] => {
    const allLocals = readStorage();
    const valid: CookieListItem[] = [];

    allLocals.forEach((c) => {
        if (!isExpired(c)) {
            const createdAt = new Date(c.loc_created_date);
            const expiresAt = new Date(createdAt);
            expiresAt.setSeconds(expiresAt.getSeconds() + c.loc_time);

            valid.push({
                name: c.loc_name,
                value: c.loc_value,
                time: c.loc_time,
                created_at: createdAt,
                expires_at: expiresAt,
            });
        }
    });

    return valid;
};

export const ClearCookies = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        emitUpdate();
    } catch (err) {
        console.warn("[ReactCookie] Failed to clear cookies:", err);
    }
};

export const purgeExpired = (): number => {
    const allLocals = readStorage();
    const cleaned = allLocals.filter((c) => !isExpired(c));
    const removed = allLocals.length - cleaned.length;

    if (removed > 0) {
        writeStorage(cleaned);
        emitUpdate();
    }

    return removed;
};

// ============================================
// React Hook
// ============================================
export const useSyncCookie = <T = any>(cookieName: string): T | null => {
    const [value, setValue] = useState<T | null>(() => {
        if (typeof window === "undefined") return null;
        return getCookie<T>(cookieName);
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        const updateState = () => {
            setValue(getCookie<T>(cookieName));
        };

        window.addEventListener("storage", updateState);
        window.addEventListener(STORAGE_EVENT, updateState);
        updateState();

        return () => {
            window.removeEventListener("storage", updateState);
            window.removeEventListener(STORAGE_EVENT, updateState);
        };
    }, [cookieName]);

    return value;
};

// ============================================
// Default Export
// ============================================
const ReactCookie = {
    setCookie,
    getCookie,
    delCookie,
    listCookies,
    ClearCookies,
    purgeExpired,
    useSyncCookie,
};

export default ReactCookie;
