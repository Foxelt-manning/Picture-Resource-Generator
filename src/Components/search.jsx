import React, { useEffect, useState } from 'react';
import axios from "axios";
import ImageCard from './ImageCard';
import { saveSearch, searchExists, getSearch } from '../utils/cacheLogic';

const api = "https://ab-pinetrest.abrahamdw882.workers.dev/";

const SearchPinterest = () => {
    const [query, setQuery] = useState("");
    const [imageData, setImageData] = useState({ pinterest: [] });
    const [visiblityCount, setVisibilityCount] = useState(20);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchImages = async () => {
            if (!q) return;
            setLoading(true);
            try {
                // Check Cache
                if (searchExists(q, "pinterest")) {
                    const cached = getSearch(q, "pinterest");
                    setImageData({ pinterest: cached.images || [] });
                    setLoading(false);
                    return;
                }

                const res = await axios.get(`${api}?query=${q}`);
                const newImages = res.data.data;
                saveSearch(q, "pinterest", newImages);
                setImageData({ pinterest: newImages });
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, [q]);

    const handleSearch = () => {
        if (!query.trim()) return;
        setQ(query);
        setVisibilityCount(20);
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white font-dm-sans">
            {/* Sticky Header with Pinterest-like Search */}
            <header className="sticky top-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-white/10 px-4 py-4">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <div className="text-[#E60023] font-bold text-2xl tracking-tighter">Pictur</div>
                    <div className="relative flex-1 group">
                        <input 
                            type="text" 
                            placeholder="Search for inspiration..." 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="w-full bg-[#262626] hover:bg-[#333333] transition-colors rounded-full py-3 px-6 pl-12 outline-none focus:ring-2 focus:ring-white/20 text-base"
                        />
                        <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </header>

            <main className="wrapper">
                {/* Hero Title */}
                {!q && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                            Discover your next <br /> visual idea
                        </h1>
                        <p className="text-gray-400 text-xl max-w-lg">Find Pinterest-sourced inspiration for your creative projects.</p>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E60023]"></div>
                    </div>
                )}

                {/* Results Section */}
                {!loading && imageData.pinterest.length > 0 && (
                    <section className="mt-8">
                        <div className="all-movies"> {/* Uses your index.css masonry classes */}
                            <ul>
                                {imageData.pinterest.slice(0, visiblityCount).map((im, i) => (
                                    <li key={`pin-${i}`} className="mb-4">
                                        <ImageCard data={im} query={q} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        {visiblityCount < imageData.pinterest.length && (
                            <div className="flex justify-center mt-12 pb-10">
                                <button 
                                    onClick={() => setVisibilityCount(prev => prev + 20)}
                                    className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Load More
                                </button>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

export default SearchPinterest;
