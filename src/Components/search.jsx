import React, { useEffect, useState } from 'react'
import axios from "axios"
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ImageCard from './ImageCard';
import Seo from './Seo';
import { saveSearch, searchExists, getSearch, getRecentSearches, saveInspirationLink, getInspirationLinks } from '../utils/cacheLogic';
import { SITE_NAME } from '../config/site';

const api = "https://ab-pinetrest.abrahamdw882.workers.dev/"

const SearchPinterest = () => {
    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState("pinterest"); // 'pinterest' or 'dribble'
    const [imageData, setImageData] = useState({ 
        pinterest: [],
        dribble: [] 
    });
    const [visiblityCount, setVisibilityCount] = useState(20);
    const [q, setQ] = useState("")
    const [loading, setLoading] = useState(false)
    const [homeTab, setHomeTab] = useState('recent')
    const [homePreviews, setHomePreviews] = useState([])
    const [previewLoading, setPreviewLoading] = useState(false)
    const location = useLocation();
    const navigate = useNavigate();

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

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const routeQuery = params.get('q') || '';
        const routeTab = params.get('tab') || 'pinterest';

        setActiveTab(routeTab);

        if (!routeQuery) {
            setQuery('');
            setQ('');
            setLoading(false);
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
                // Check Cache first
                if (searchExists(q, activeTab)) {
                    const cached = getSearch(q, activeTab);
                    setImageData(prev => ({ ...prev, [activeTab]: cached.images || [] }));
                    setLoading(false);
                    return;
                }

                // Fetch logic (Using Pinterest API as primary)
                const res = await axios.get(`${api}?query=${q}`)
                const newImages = res.data.data;

                saveSearch(q, activeTab, newImages);
                setImageData(prev => ({ ...prev, [activeTab]: newImages }));
            } catch (error) {
                console.error("Error fetching:", error);
            } finally {
                setLoading(false);
            }
        } 
        fetchImages()
    }, [q, activeTab]) // Refetch if query or tab changes

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
                        const res = await axios.get(`${api}?query=${encodeURIComponent(term)}`);
                        images = res.data?.data || [];
                    }

                    const firstImage = images?.[0]?.image || images?.[0]?.images || images?.[0]?.url || images?.[0]?.src || images?.[0] || null;

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
        setImageData({ pinterest: [], dribble: [] });
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

    return (
        <div className="min-h-screen bg-[#111] text-white font-dm-sans">
            <Seo
                title={q ? `${q} on ${activeTab}` : `${SITE_NAME} visual search`}
                description={q ? `Explore ${q} inspiration from ${activeTab}. Save results, revisit recent searches, and install the PWA.` : 'Search visual inspiration, save collections, and install the PWA for a faster experience.'}
            />
            {/* Header with Search & Tabs */}
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
                        
                        {/* Tab Switcher */}
                        <nav className="flex flex-wrap gap-1 bg-[#222] p-1 rounded-full w-fit max-w-full overflow-x-auto">
                            {['pinterest', 'dribble'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => handleTabChange(tab)}
                                    className={`px-4 sm:px-6 py-2 rounded-full text-sm font-bold capitalize transition-all ${
                                        activeTab === tab 
                                        ? 'bg-white text-black shadow-lg' 
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>

                        {/* Search Bar */}
                        <div className="relative flex-1 group min-w-0 w-full">
                            <input 
                                type="text" 
                                placeholder={`Search ${activeTab}...`} 
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
                {/* Welcome State */}
                {!q && !loading && (
                    <div className="py-10 sm:py-14 px-2">
                        <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                            Get your next <br/> {activeTab} idea
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
                                            <div className="mt-1 text-xs text-gray-400 capitalize">{item.source || 'pinterest'}</div>
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

                {/* Waterfall Grid */}
                {!loading && imageData[activeTab]?.length > 0 && (
                    <section>
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
                                    More {activeTab} results
                                </button>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    )
}

export default SearchPinterest
