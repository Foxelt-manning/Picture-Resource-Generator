import React, { useEffect, useState } from 'react';
import axios from "axios";
import ImageCard from './ImageCard';
import { saveSearch, searchExists, getSearch } from '../utils/cacheLogic';

const api = "https://ab-pinetrest.abrahamdw882.workers.dev/";

// Removed Google API URL as it is no longer in use

const SearchPinterest = () => {
    const [query, setQuery] = useState("");
    const [imageData, setImageData] = useState({
        pinterest: [],
        dribble: [] // Kept as placeholder for future use
    });

    const [visiblityCount, setVisibilityCount] = useState(0);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchImages = async () => {
            if (!q) return;
            setLoading(true);
            try {
                console.log('Searching for:', q);

                // 1. Check Cache for Pinterest only
                if (searchExists(q, "pinterest")) {
                    const cachedPinterest = getSearch(q, "pinterest");
                    console.log('Pinterest cache found:', cachedPinterest);
                    
                    setImageData({
                        pinterest: cachedPinterest.images || [],
                        dribble: []
                    });
                    setVisibilityCount(20);
                    setLoading(false);
                    return;
                }

                // 2. Fetch from API if not in cache
                const response = await axios.get(`${api}?query=${q}`);
                const newPinterestImages = response.data.data;

                // 3. Save to cache
                saveSearch(q, "pinterest", newPinterestImages);

                setImageData({
                    pinterest: newPinterestImages,
                    dribble: []
                });
            
                setVisibilityCount(20);
            } catch (error) {
                console.error("Error fetching images:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, [q]);

    const handleClick = () => {
        setImageData({
            pinterest: [],
            dribble: []
        });
        setQ(query);
    };

    // Note: downloadImage function remains the same as it is independent of the Google API

    return (
        <div className="min-h-screen bg-primary">
            <div className="wrapper">
                <header>
                    <div className="search">
                        <div>
                            <input 
                                type="text" 
                                placeholder="What kind of image do you want?" 
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleClick()}
                                className="w-full border-white border-2 rounded-lg p-2 placeholder-grey-300"
                            />
                        </div>
                    </div>
                </header>

                {/* Loading State */}
                {loading && (
                    <div className="text-center mt-16">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-400 text-lg mt-4">Loading images...</p>
                    </div>
                )}

                {/* Initial State */}
                {!q && !loading && (
                    <div className="text-center mt-16">
                        <p className="text-gray-400 text-lg">Search for images to get started</p>
                    </div>
                )}
                
                {/* Pinterest Section */}
                {!loading && imageData.pinterest.length > 0 && (
                    <section className="mt-16">
                        <h2 className="fancy-text text-4xl md:text-6xl mb-8">Pinterest</h2>
                        <div className="all-movies">
                            <ul>
                                {imageData.pinterest.slice(0, visiblityCount).map((im, i) => (
                                    <li key={`pinterest-${i}`}>
                                        <ImageCard data={im} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                )}

                {/* Removed Google Section to prevent crashes */}

                {/* Load More Button */}
                {!loading && visiblityCount < imageData.pinterest.length && (
                    <div className="flex justify-center mt-12">
                        <button 
                            className="bg-blue-600 hover:bg-blue-800 text-white rounded-lg transition-all duration-300 px-8 py-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                            onClick={() => setVisibilityCount(prev => prev + 20)}
                        >
                            Load More
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && q && imageData.pinterest.length === 0 && (
                    <div className="text-center mt-16">
                        <p className="text-gray-400 text-lg">No images found. Try a different search term.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPinterest;
