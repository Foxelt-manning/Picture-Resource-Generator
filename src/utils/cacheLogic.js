export const saveSearch = (query, source, images) => {
    const key = `search_${source}_${query}`;
    const data = {
        query,
        source,
        images,
        timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(data));

    const recentKey = 'recent_searches';
    const recentRaw = localStorage.getItem(recentKey);
    const recentList = recentRaw ? JSON.parse(recentRaw) : [];
    const filtered = recentList.filter(item => !(item.query === query && item.source === source));
    filtered.unshift({ query, source, timestamp: Date.now() });
    localStorage.setItem(recentKey, JSON.stringify(filtered));
}

export const getSearch = (query, source) => {
    const key = `search_${source}_${query}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

export const searchExists = (query, source, maxAge = 24 * 60 * 60 * 1000) => {
    const search = getSearch(query, source);
    if (!search) return false;
    return Date.now() -search.timestamp < maxAge;
}

export const clearSearch = (maxAge = 7 *24 * 60 * 60 * 1000) =>{
    const keyToDelete =[]
    for (let i = 0; i <localStorage.length; i++){
        const key = localStorage.key(i);

        if (key.startsWith('search_')){
            const data = JSON.parse(localStorage.getItem(key));
            if (Date.now() - data.timestamp > maxAge){
                keyToDelete.push(key);
            }
        }

    }
    keyToDelete.forEach(key => localStorage.removeItem(key));
}

export const getRecentSearches = () => {
    try {
        const raw = localStorage.getItem('recent_searches');
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch (error) {
        console.warn('getRecentSearches: invalid recent search data', error);
        localStorage.removeItem('recent_searches');
        return [];
    }
}

// Saved collections (persisted array of { id, url, query, source, timestamp })
const SAVED_KEY = 'saved_collection';

const normalizeUrl = (u) => {
    if (!u) return null;
    if (typeof u === 'string') return u;
    if (typeof u === 'object') {
        if (u.url) return u.url;
        if (u.image) return u.image;
        if (u.src) return u.src;
        if (Array.isArray(u.images) && u.images.length) return u.images[0];
    }
    return null;
}

export const getCollections = () => {
    try {
        const raw = localStorage.getItem(SAVED_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.warn('getCollections: corrupted saved data', e);
        localStorage.removeItem(SAVED_KEY);
        return [];
    }
}

export const saveToCollection = (urlOrObj, query = '', source = '') => {
    const url = normalizeUrl(urlOrObj);
    if (!url) return null;
    const list = getCollections();
    // avoid duplicates by url
    if (list.find(i => i.url === url)) return null;
    const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, url, query, source, timestamp: Date.now() };
    list.unshift(item);
    localStorage.setItem(SAVED_KEY, JSON.stringify(list));
    return item;
}

export const removeFromCollection = (idOrUrl) => {
    const list = getCollections();
    const url = normalizeUrl(idOrUrl);
    const filtered = list.filter(i => i.id !== idOrUrl && i.url !== url);
    localStorage.setItem(SAVED_KEY, JSON.stringify(filtered));
    return filtered;
}

export const isSaved = (urlOrObj) => {
    const url = normalizeUrl(urlOrObj);
    if (!url) return false;
    const list = getCollections();
    return list.some(i => i.url === url);
}

const COLLECTION_SETTINGS_KEY = 'collection_settings';

const DEFAULT_COLLECTION_SETTINGS = {
    value: '',
    unit: ''
};

const UNIT_TO_MS = {
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000
};

export const getCollectionSettings = () => {
    try {
        const raw = localStorage.getItem(COLLECTION_SETTINGS_KEY);
        if (!raw) return DEFAULT_COLLECTION_SETTINGS;

        const parsed = JSON.parse(raw);
        return {
            value: parsed?.value ?? DEFAULT_COLLECTION_SETTINGS.value,
            unit: parsed?.unit ?? DEFAULT_COLLECTION_SETTINGS.unit
        };
    } catch (error) {
        console.warn('getCollectionSettings: invalid settings data', error);
        return DEFAULT_COLLECTION_SETTINGS;
    }
}

export const setCollectionSettings = (settings) => {
    const nextSettings = {
        value: settings?.value ?? DEFAULT_COLLECTION_SETTINGS.value,
        unit: settings?.unit ?? DEFAULT_COLLECTION_SETTINGS.unit
    };
    localStorage.setItem(COLLECTION_SETTINGS_KEY, JSON.stringify(nextSettings));
    return nextSettings;
}

export const getCollectionRetentionMs = (settings = getCollectionSettings()) => {
    const value = Number(settings?.value);
    const unit = settings?.unit;

    if (!Number.isFinite(value) || value <= 0 || !unit || !UNIT_TO_MS[unit]) return null;
    return value * (UNIT_TO_MS[unit] || UNIT_TO_MS.days);
}

export const pruneCollections = (maxAgeMs) => {
    const age = Number(maxAgeMs);
    if (!Number.isFinite(age) || age <= 0) return getCollections();

    const list = getCollections();
    const cutoff = Date.now() - age;
    const filtered = list.filter(item => Number(item?.timestamp) >= cutoff);
    localStorage.setItem(SAVED_KEY, JSON.stringify(filtered));
    return filtered;
}
