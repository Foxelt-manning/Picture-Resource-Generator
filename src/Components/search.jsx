import React, { useEffect, useState } from 'react'
import axios from "axios"
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ImageCard from './ImageCard';
import Seo from './Seo';
import { saveSearch, searchExists, getSearch, getRecentSearches, saveInspirationLink, getInspirationLinks } from '../utils/cacheLogic';
import { SITE_NAME } from '../config/site';

const PINTEREST_API = "https://ab-pinetrest.abrahamdw882.workers.dev/"
const OPENVERSE_API = 'https://api.openverse.org/v1/images/'
const WIKIMEDIA_API = 'https://commons.wikimedia.org/w/api.php'
const GIPHY_API = 'https://api.giphy.com/v1'
const GIPHY_PUBLIC_KEY = 'dc6zaTOxFJmzC'

const SOURCE_CONFIG = {
    pinterest: { label: 'Pinterest', placeholder: 'Search Pinterest...' },
    openverse: { label: 'Openverse', placeholder: 'Search Openverse images...' },
    wikimedia: { label: 'Wikimedia', placeholder: 'Search Wikimedia Commons...' },
    gifs: { label: 'GIFs', placeholder: 'Search GIFs...' },
    stickers: { label: 'Stickers', placeholder: 'Search sticker packs...' }
}

const SEARCH_SOURCES = Object.keys(SOURCE_CONFIG)

const PLACEHOLDER = 'https://placehold.co/400x600/333/ffffff?text=No+Preview'
const FREE_IMAGE_RESOURCES = [
    { name: 'Pinterest Worker API', description: 'Community Pinterest-style search endpoint used in this app.', url: 'https://ab-pinetrest.abrahamdw882.workers.dev/' },
    { name: 'Openverse API', description: 'Openly licensed image search API with free usage.', url: 'https://api.openverse.org/v1/images/' },
    { name: 'Wikimedia Commons API', description: 'Media search from Wikimedia Commons free assets.', url: 'https://commons.wikimedia.org/w/api.php' },
    { name: 'Picsum', description: 'Random/fallback free placeholder images.', url: 'https://picsum.photos' }
]
const GIF_STICKER_RESOURCES = [
    { name: 'GIPHY GIF API', description: 'Free public beta key powered GIF search in-app.', url: 'https://developers.giphy.com/docs/api/endpoint#search' },
    { name: 'GIPHY Stickers API', description: 'Free sticker pack search endpoint integrated in-app.', url: 'https://developers.giphy.com/docs/api/endpoint#stickers-search' },
    { name: 'Open Sticker Collection', description: 'Free sticker resources for design exploration.', url: 'https://www.freepik.com/free-stickers' }
]
const suggestions = [
    'minimal wallpaper',
    'dark aesthetic',
    'home office setup',
    'travel photography',
    'fashion inspiration',
    'nature textures'
]

const featuredTerms = [
    'dark aesthetic',
    'minimal wallpaper',
    'fashion inspiration',
    'home office setup',
    'travel photography',
    'nature textures'
]

const normalizeImageUrl = (item) => {
    if (typeof item === 'string') return item
    return item?.image || item?.images || item?.url || item?.src || item?.preview || null
}

const createFallbackImages = (term, source, count = 30) => {
    const safeTerm = encodeURIComponent((term || 'inspiration').trim().toLowerCase())
    return Array.from({ length: count }, (_, index) => {
        const seed = `${source || 'fallback'}-${safeTerm}-${index + 1}`
        return {
            image: `https://picsum.photos/seed/${seed}/640/960`,
            sourceType: 'fallback'
        }
    })
}

const normalizeApiImages = (payload) => {
    if (Array.isArray(payload)) return payload.filter(Boolean)
    if (Array.isArray(payload?.data)) return payload.data.filter(Boolean)
    return []
}

const createInitialImageState = () => SEARCH_SOURCES.reduce((acc, key) => ({ ...acc, [key]: [] }), {})

const getSourceLabel = (source) => SOURCE_CONFIG[source]?.label || source

const fetchFromSource = async (query, source) => {
    if (source === 'pinterest') {
        const res = await axios.get(`${PINTEREST_API}?query=${encodeURIComponent(query)}`, { timeout: 12000 })
        return normalizeApiImages(res.data).map((item) => ({ ...item, sourceType: 'pinterest' }))
    }

    if (source === 'openverse') {
        const res = await axios.get(OPENVERSE_API, {
            timeout: 12000,
            params: {
                q: query,
                page_size: 30
            }
        })

        return (res.data?.results || [])
            .map((item) => ({
                image: item?.url,
                sourceType: 'openverse'
            }))
            .filter((item) => Boolean(item.image))
    }

    if (source === 'wikimedia') {
        const res = await axios.get(WIKIMEDIA_API, {
            timeout: 12000,
            params: {
                action: 'query',
                format: 'json',
                origin: '*',
                generator: 'search',
                gsrsearch: query,
                gsrnamespace: 6,
                gsrlimit: 30,
                prop: 'imageinfo',
                iiprop: 'url'
            }
        })

        const pages = res.data?.query?.pages || {}

        return Object.values(pages)
            .map((page) => ({
                image: page?.imageinfo?.[0]?.url,
                sourceType: 'wikimedia'
            }))
            .filter((item) => Boolean(item.image))
    }

    if (source === 'gifs' || source === 'stickers') {
        const endpoint = source === 'gifs' ? 'gifs/search' : 'stickers/search'
        const res = await axios.get(`${GIPHY_API}/${endpoint}`, {
            timeout: 12000,
            params: {
                api_key: GIPHY_PUBLIC_KEY,
                q: query,
                limit: 30,
                rating: 'pg'
            }
        })

        return (res.data?.data || [])
            .map((item) => ({
                image: item?.images?.fixed_width?.url || item?.images?.downsized?.url || item?.images?.original?.url,
                preview: item?.images?.fixed_width_still?.url,
                sourceType: source
            }))
            .filter((item) => Boolean(item.image))
    }

    return []
}

const SearchPinterest = () => {
    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState("pinterest");
    const [imageData, setImageData] = useState(createInitialImageState());
    const [visiblityCount, setVisibilityCount] = useState(20);
    const [q, setQ] = useState("")
    const [loading, setLoading] = useState(false)
    const [apiNotice, setApiNotice] = useState('')
    const [homeTab, setHomeTab] = useState('recent')
    const [homePreviews, setHomePreviews] = useState([])
    const [previewLoading, setPreviewLoading] = useState(false)
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const routeQuery = params.get('q') || '';
        const routeTab = params.get('tab') || 'pinterest';
        const validTab = SEARCH_SOURCES.includes(routeTab) ? routeTab : 'pinterest'

        setActiveTab(validTab);

        if (!routeQuery) {
            setQuery('');
            setQ('');
            setLoading(false);
            setApiNotice('');
            setVisibilityCount(20);
            return;
        }

        setQuery(routeQuery);
        setQ(routeQuery);
        setVisibilityCount(20);
    }, [location.search]);

    useEffect(() => {
        const fetchImages = async () => {
            if (!q) return;
            setLoading(true);
            try {
                if (searchExists(q, activeTab)) {
                    const cached = getSearch(q, activeTab);
                    setImageData(prev => ({ ...prev, [activeTab]: cached.images || [] }));
                    setApiNotice('');
                    setLoading(false);
                    return;
                }

                const newImages = await fetchFromSource(q, activeTab);
                if (!newImages.length) {
                    throw new Error('No images returned from API');
                }

                saveSearch(q, activeTab, newImages);
                setImageData(prev => ({ ...prev, [activeTab]: newImages }));
                setApiNotice('');
            } catch (error) {
                console.error("Error fetching:", error);
                const fallbackImages = createFallbackImages(q, activeTab);
                setImageData(prev => ({ ...prev, [activeTab]: fallbackImages }));
                setApiNotice(`Live ${getSourceLabel(activeTab)} results are temporarily unavailable. Showing free fallback images.`);
                saveSearch(q, activeTab, fallbackImages);
            } finally {
                setLoading(false);
            }
        }
        fetchImages()
    }, [q, activeTab])

    useEffect(() => {
        if (q) return;

        let active = true;

        const loadPreviewImages = async () => {
            setPreviewLoading(true);
            try {
                const previewData = await Promise.all(featuredTerms.map(async (term) => {
                    const cached = searchExists(term, activeTab) ? getSearch(term, activeTab) : null;
                    let images = cached?.images || [];

                    if (!images.length) {
                        try {
                            images = await fetchFromSource(term, activeTab)
                        } catch {
                            images = createFallbackImages(term, activeTab, 1);
                        }
                    }

                    const firstImage = normalizeImageUrl(images?.[0]);

                    if (firstImage) {
                        saveInspirationLink({ term, image: firstImage, source: activeTab });
                    }

                    return firstImage ? { term, image: firstImage } : null;
                }));

                if (active) {
                    setHomePreviews(previewData.filter(Boolean));
                }
            } catch (error) {
                console.error('Error loading home previews:', error);
            } finally {
                if (active) setPreviewLoading(false);
            }
        }

        loadPreviewImages();

        return () => {
            active = false;
        }
    }, [q, activeTab])

    const handleSearch = () => {
        if (!query.trim()) return;
        const nextQuery = query.trim();
        const params = new URLSearchParams();
        params.set('q', nextQuery);
        params.set('tab', activeTab);
        navigate({ pathname: '/', search: `?${params.toString()}` }, { replace: false });
        setQ(nextQuery);
        setVisibilityCount(20);
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab);

        if (!q) return;

        const params = new URLSearchParams();
        params.set('q', q);
        params.set('tab', tab);
        navigate({ pathname: '/', search: `?${params.toString()}` }, { replace: true });
    }

    const handleHome = () => {
        setQuery('');
        setQ('');
        setLoading(false);
        setVisibilityCount(20);
        setImageData(createInitialImageState());
        setHomeTab('recent');
        navigate('/', { replace: true });
    }

    const recentSearches = getRecentSearches();
    const inspirationLinks = getInspirationLinks();

    const runQuickSearch = (nextQuery, tab = activeTab) => {
        setQuery(nextQuery);
        setActiveTab(tab);
        const params = new URLSearchParams();
        params.set('q', nextQuery);
        params.set('tab', tab);
        navigate({ pathname: '/', search: `?${params.toString()}` }, { replace: false });
        setQ(nextQuery);
        setVisibilityCount(20);
    }

    const activeLabel = getSourceLabel(activeTab)

    return (
        <div className="min-h-screen bg-[#111] text-white font-dm-sans">
            <Seo
                title={q ? `${q} on ${activeLabel}` : `${SITE_NAME} visual search`}
                description={q ? `Explore ${q} inspiration from ${activeLabel}. Save results, revisit recent searches, and install the PWA.` : 'Search visual inspiration, save collections, and install the PWA for a faster experience.'}
            />
            <header className="sticky top-0 z-50 bg-[#111]/95 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[#E60023] font-bold text-2xl tracking-tighter cursor-pointer">
                            <button type="button" onClick={handleHome}>{SITE_NAME}</button>
                            <Link
                                to="/saved"
                                className="px-3 py-1 rounded-full text-sm font-bold text-gray-400 hover:text-white"
                            >
                                Saved
                            </Link>
                            <Link
                                to="/settings"
                                className="px-3 py-1 rounded-full text-sm font-bold text-gray-400 hover:text-white"
                            >
                                Settings
                            </Link>
                        </div>

                        <nav className="flex flex-wrap gap-1 bg-[#222] p-1 rounded-full w-fit max-w-full overflow-x-auto">
                            {SEARCH_SOURCES.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => handleTabChange(tab)}
                                    className={`px-4 sm:px-6 py-2 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap ${
                                        activeTab === tab
                                        ? 'bg-white text-black shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {getSourceLabel(tab)}
                                </button>
                            ))}
                        </nav>

                        <div className="relative flex-1 group min-w-0 w-full">
                            <input
                                type="text"
                                placeholder={SOURCE_CONFIG[activeTab]?.placeholder || `Search ${activeLabel}...`}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="w-full bg-[#333] hover:bg-[#444] transition-colors rounded-full py-3 px-12 outline-none focus:ring-2 focus:ring-white/20 text-sm sm:text-base"
                            />
                            <span className="absolute left-4 top-3.5 text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="wrapper pt-10 px-4">
                {!q && !loading && (
                    <div className="py-10 sm:py-14 px-2">
                        <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                            Get your next <br/> {activeLabel} idea
                        </h1>
                        </div>

                        <div className="mt-8 max-w-5xl mx-auto">
                            <div className="flex gap-2 p-1 bg-[#222] rounded-full w-fit mx-auto overflow-x-auto">
                                <button
                                    type="button"
                                    onClick={() => setHomeTab('recent')}
                                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${homeTab === 'recent' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Recent Searches
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setHomeTab('suggestions')}
                                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${homeTab === 'suggestions' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Suggestions
                                </button>
                            </div>

                            {homeTab === 'recent' ? (
                                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                                    {recentSearches.length > 0 ? recentSearches.map((item) => (
                                        <button
                                            key={`${item.source}-${item.query}-${item.timestamp}`}
                                            type="button"
                                            onClick={() => runQuickSearch(item.query, item.source || 'pinterest')}
                                            className="rounded-2xl border border-white/10 bg-[#171717] px-3 py-3 text-left hover:border-white/25 hover:bg-[#1d1d1d] transition-colors"
                                        >
                                            <div className="text-sm font-semibold text-white truncate">{item.query}</div>
                                            <div className="mt-1 text-xs text-gray-400 capitalize">{getSourceLabel(item.source || 'pinterest')}</div>
                                        </button>
                                    )) : (
                                        <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-[#171717] px-4 py-8 text-center text-sm text-gray-400">
                                            Recent searches will appear here after you search.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                                    {suggestions.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => runQuickSearch(item, activeTab)}
                                            className="rounded-2xl border border-white/10 bg-[#171717] px-3 py-3 text-left hover:border-white/25 hover:bg-[#1d1d1d] transition-colors"
                                        >
                                            <div className="text-sm font-semibold text-white truncate">{item}</div>
                                            <div className="mt-1 text-xs text-gray-400">Tap to search</div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm sm:text-base font-bold text-gray-300 uppercase tracking-[0.2em]">Featured searches</div>
                                    <div className="text-xs text-gray-500">Tap any card to search it</div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                    {(previewLoading || homePreviews.length === 0)
                                        ? featuredTerms.slice(0, 6).map((term) => (
                                            <div key={term} className="group overflow-hidden rounded-3xl border border-white/10 bg-[#171717]">
                                                <div className="aspect-[3/4] animate-pulse bg-[#222]" />
                                                <div className="p-3">
                                                    <div className="h-4 w-3/4 rounded-full bg-white/10" />
                                                </div>
                                            </div>
                                        ))
                                        : homePreviews.map(({ term, image }) => (
                                            <button
                                                key={term}
                                                type="button"
                                                onClick={() => runQuickSearch(term, activeTab)}
                                                className="group overflow-hidden rounded-3xl border border-white/10 bg-[#171717] text-left transition-transform hover:-translate-y-1 hover:border-white/20"
                                            >
                                                <div className="relative aspect-[3/4] overflow-hidden">
                                                    <img
                                                        src={image}
                                                        alt={term}
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        loading="lazy"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                                    <div className="absolute bottom-3 left-3 right-3">
                                                        <div className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-black shadow-lg">Preview</div>
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <div className="text-sm font-bold capitalize text-white">{term}</div>
                                                    <div className="mt-1 text-xs text-gray-400">Search and open the first result</div>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            </div>

                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm sm:text-base font-bold text-gray-300 uppercase tracking-[0.2em]">Saved inspiration links</div>
                                    <div className="text-xs text-gray-500">Stored locally in your browser</div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                    {inspirationLinks.length > 0 ? inspirationLinks.slice(0, 6).map(({ id, term, image }) => (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => runQuickSearch(term, activeTab)}
                                            className="group overflow-hidden rounded-3xl border border-white/10 bg-[#171717] text-left transition-transform hover:-translate-y-1 hover:border-white/20"
                                        >
                                            <div className="relative aspect-[3/4] overflow-hidden">
                                                <img
                                                    src={image}
                                                    alt={term}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    loading="lazy"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                                <div className="absolute bottom-3 left-3 right-3">
                                                    <div className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-black shadow-lg">Local</div>
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <div className="text-sm font-bold capitalize text-white">{term}</div>
                                                <div className="mt-1 text-xs text-gray-400">Saved to local storage</div>
                                            </div>
                                        </button>
                                    )) : (
                                        <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-[#171717] px-4 py-8 text-center text-sm text-gray-400">
                                            Inspiration links will appear here after previews load.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center py-16 sm:py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E60023]"></div>
                    </div>
                )}

                {!loading && imageData[activeTab]?.length > 0 && (
                    <section>
                        {apiNotice && (
                            <div className="max-w-7xl mx-auto mb-5 px-4">
                                <div className="rounded-lg border border-emerald-300/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                                    {apiNotice}
                                </div>
                            </div>
                        )}
                        <div className="all-movies">
                            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                                {imageData[activeTab].slice(0, visiblityCount).map((im, i) => (
                                    <li key={`${activeTab}-${i}`} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <ImageCard data={im} query={q} />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {visiblityCount < imageData[activeTab].length && (
                            <div className="flex justify-center py-12 sm:py-16">
                                <button
                                    className="bg-white text-black rounded-full px-8 sm:px-12 py-3 sm:py-4 font-bold hover:scale-105 transition-all shadow-xl active:scale-95"
                                    onClick={() => setVisibilityCount(prev => prev + 20)}
                                >
                                    More {activeLabel} results
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {!q && !loading && (
                    <>
                        <section className="max-w-7xl mx-auto px-2 pb-8">
                            <div className="mb-3 text-sm sm:text-base font-bold text-gray-300 uppercase tracking-[0.2em]">Free image APIs integrated</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                {FREE_IMAGE_RESOURCES.map((resource) => (
                                    <a
                                        key={resource.name}
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-2xl border border-white/10 bg-[#171717] p-4 transition-colors hover:border-white/25 hover:bg-[#1d1d1d]"
                                    >
                                        <div className="text-base font-bold text-white">{resource.name}</div>
                                        <div className="mt-2 text-sm text-gray-400">{resource.description}</div>
                                        <div className="mt-3 text-xs font-semibold text-[#E60023]">Visit resource ↗</div>
                                    </a>
                                ))}
                            </div>
                        </section>

                        <section className="max-w-7xl mx-auto px-2 pb-14">
                            <div className="mb-3 text-sm sm:text-base font-bold text-gray-300 uppercase tracking-[0.2em]">GIFs and sticker packs</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                                <button
                                    type="button"
                                    onClick={() => runQuickSearch('trending reaction', 'gifs')}
                                    className="rounded-2xl border border-white/10 bg-[#171717] p-4 text-left transition-colors hover:border-white/25 hover:bg-[#1d1d1d]"
                                >
                                    <div className="text-base font-bold text-white">Explore GIF search</div>
                                    <div className="mt-2 text-sm text-gray-400">Loads live free GIF API results inside this app.</div>
                                    <div className="mt-3 text-xs font-semibold text-[#E60023]">Open GIFs tab →</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => runQuickSearch('cute sticker pack', 'stickers')}
                                    className="rounded-2xl border border-white/10 bg-[#171717] p-4 text-left transition-colors hover:border-white/25 hover:bg-[#1d1d1d]"
                                >
                                    <div className="text-base font-bold text-white">Explore sticker packs</div>
                                    <div className="mt-2 text-sm text-gray-400">Search sticker endpoints and save packs locally.</div>
                                    <div className="mt-3 text-xs font-semibold text-[#E60023]">Open Stickers tab →</div>
                                </button>
                                <div className="rounded-2xl border border-white/10 bg-[#171717] p-4">
                                    <div className="text-base font-bold text-white">Free GIF/sticker resources</div>
                                    <div className="mt-2 space-y-2 text-sm text-gray-400">
                                        {GIF_STICKER_RESOURCES.map((resource) => (
                                            <a key={resource.name} href={resource.url} target="_blank" rel="noopener noreferrer" className="block hover:text-white">
                                                <span className="font-semibold text-gray-300">{resource.name}:</span> {resource.description}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    )
}

export default SearchPinterest
