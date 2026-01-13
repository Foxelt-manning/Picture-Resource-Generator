export const saveSearch = (query, source, images) => {
    const key = `search_${source}_${query}`;
    const data = {
        query,
        source,
        images,
        timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(data));
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
