import React, { useEffect, useState } from 'react'
import axios from "axios"
import ImageCard from './ImageCard';
import { saveSearch, searchExists, getSearch } from '../utils/cacheLogic';

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

    const handleSearch = () => {
        if (!query.trim()) return;
        setQ(query);
        setVisibilityCount(20);
    }

    return (
        <div className="min-h-screen bg-[#111] text-white font-dm-sans">
            {/* Header with Search & Tabs */}
            <header className="sticky top-0 z-50 bg-[#111]/95 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                    <div className="flex items-center gap-6">
                        <div className="text-[#E60023] font-bold text-2xl tracking-tighter cursor-pointer" onClick={() => window.location.reload()}>
                            Pictur
                        </div>
                        
                        {/* Tab Switcher */}
                        <nav className="flex gap-1 bg-[#222] p-1 rounded-full">
                            {['pinterest', 'dribble'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-2 rounded-full text-sm font-bold capitalize transition-all ${
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
                        <div className="relative flex-1 group">
                            <input 
                                type="text" 
                                placeholder={`Search ${activeTab}...`} 
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="w-full bg-[#333] hover:bg-[#444] transition-colors rounded-full py-3 px-12 outline-none focus:ring-2 focus:ring-white/20"
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
                    <div className="text-center py-32">
                        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                            Get your next <br/> {activeTab} idea
                        </h1>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E60023]"></div>
                    </div>
                )}
                
                {/* Waterfall Grid */}
                {!loading && imageData[activeTab]?.length > 0 && (
                    <section>
                        <div className="all-movies">
                            <ul className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
                                {imageData[activeTab].slice(0, visiblityCount).map((im, i) => (
                                    <li key={`${activeTab}-${i}`} className="mb-4 break-inside-avoid animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <ImageCard data={im} query={q} />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {visiblityCount < imageData[activeTab].length && (
                            <div className="flex justify-center py-16">
                                <button 
                                    className="bg-white text-black rounded-full px-12 py-4 font-bold hover:scale-105 transition-all shadow-xl active:scale-95"
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
