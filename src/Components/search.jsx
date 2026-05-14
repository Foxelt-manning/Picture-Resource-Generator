import React, { useEffect, useState } from 'react'
import axios from "axios"
import ImageCard from './ImageCard';
import { saveSearch, searchExists, getSearch } from '../utils/cacheLogic';

const api = "https://ab-pinetrest.abrahamdw882.workers.dev/"

const SearchPinterest = () => {
    const [query, setQuery] = useState("");
    const [imageData, setImageData] = useState({ pinterest: [] });
    const [visiblityCount, setVisibilityCount] = useState(20);
    const [q, setQ] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchPinterest = async () => {
            if (!q) return;
            setLoading(true);
            try {
                // 1. Check Cache Logic
                if (searchExists(q, "pinterest")) {
                    const Cachedpinterest = getSearch(q, "pinterest")
                    setImageData({ pinterest: Cachedpinterest.images || [] });
                    setLoading(false);
                    return;
                }

                // 2. Fetch from Pinterest API
                const res = await axios.get(`${api}?query=${q}`)
                const newImages = res.data.data;

                // 3. Save to cache
                saveSearch(q, "pinterest", newImages);
                setImageData({ pinterest: newImages });
            } catch (error) {
                console.error("Error fetching images:", error);
            } finally {
                setLoading(false);
            }
        } 
        fetchPinterest()
    }, [q])

    const handleSearch = () => {
        if (!query.trim()) return;
        setImageData({ pinterest: [] });
        setQ(query);
        setVisibilityCount(20);
    }

    return (
        <div className="min-h-screen bg-[#111] text-white font-dm-sans">
            {/* Pinterest-style Sticky Header */}
            <header className="sticky top-0 z-50 bg-[#111]/90 backdrop-blur-md py-4 px-6 border-b border-white/10">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <div className="text-[#E60023] font-bold text-2xl px-2 cursor-pointer" onClick={() => window.location.reload()}>
                        Pictur
                    </div>
                    <div className="relative flex-1 group">
                        <input 
                            type="text" 
                            placeholder="Search for inspiration..." 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="w-full bg-[#333] hover:bg-[#444] transition-colors rounded-full py-3 px-12 outline-none focus:ring-2 focus:ring-white/20"
                        />
                        <span className="absolute left-4 top-3.5 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                    </div>
                </div>
            </header>

            <main className="wrapper pt-8">
                {/* Initial Welcome State */}
                {!q && !loading && (
                    <div className="text-center py-24">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                            Discover your next <br/> creative idea
                        </h1>
                        <p className="text-gray-400 text-xl">Search for anything to begin</p>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E60023]"></div>
                        <p className="mt-4 text-gray-500">Curating results...</p>
                    </div>
                )}
                
                {/* Masonry Waterfall Grid */}
                {!loading && imageData.pinterest.length > 0 && (
                    <section>
                        <div className="all-movies">
                            {/* Uses CSS columns for the waterfall effect defined in index.css */}
                            <ul className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
                                {imageData.pinterest.slice(0, visiblityCount).map((im, i) => (
                                    <li key={`pin-${i}`} className="mb-4 break-inside-avoid">
                                        <ImageCard data={im} query={q} />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {visiblityCount < imageData.pinterest.length && (
                            <div className="flex justify-center py-12">
                                <button 
                                    className="bg-white text-black rounded-full px-10 py-3 font-bold hover:scale-105 transition-transform active:scale-95 shadow-lg"
                                    onClick={() => setVisibilityCount(prev => prev + 20)}
                                >
                                    Explore more
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
