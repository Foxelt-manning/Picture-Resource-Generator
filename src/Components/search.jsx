import React, { useEffect, useState } from 'react'
import axios from "axios"
import ImageCard from './ImageCard';
import { saveSearch,searchExists,getSearch } from '../utils/cacheLogic';

const api= "https://ab-pinetrest.abrahamdw882.workers.dev/"
const apiGoogle="https://ab-googleimg.abrahamdw882.workers.dev/"
const DribbleApi = axios.create({
    baseURL: "https://api.dribbble.com/v2",
    headers:{
        Authorization:"ZGuqfEzl3ngJKPOcrj42OTW9RRmvlEYqlEvMfkiE9nc"

    }
})


const SearchPinterest = () => {

    const [query,setQuery]=useState("");
    const [imageData,setImageData] = useState({
        pinterest:[], 
        google:[],
        dribble:[]
    });

    const [visiblityCount,setVisibilityCount]=useState(0);
    const [q,setQ]=useState("")
    const [loading,setLoading]=useState(false)

    useEffect(()=>{
        const fetchPinterest =async()=>{
            if(!q) return;
            setLoading(true);
            try {
                let pinterestImages =null;
                let googleImages = null;

                console.log('Searching for:', q);
                console.log('Pinterest exists:', searchExists(q, "pinterest"));
                console.log('Google exists:', searchExists(q, "google"));
                
                if (searchExists(q,"pinterest")){
                  const Cachedpinterest = getSearch(q,"pinterest")
                  console.log('Pinterest cache found:', Cachedpinterest);
                  pinterestImages = Cachedpinterest.images;
                }

                if (searchExists(q,"google")){
                    const Cachedgoogle = getSearch(q,"google")
                    console.log('Google cache found:', Cachedgoogle);
                    googleImages = Cachedgoogle.images;
                }
                
                // Show cached results even if only one source is cached
                if (pinterestImages || googleImages) {
                    setImageData({
                        pinterest: pinterestImages || [],
                        google: googleImages || [],
                    });
                    setVisibilityCount(20);
                    setLoading(false);
                    return;
                }

                const[pinterestRes,googleRes] = await Promise.all([
                    axios.get(`${api}?query=${q}`),
                    axios.get(`${apiGoogle}?query=${q}`)
                ])

                const newPinterestImages = pinterestRes.data.data;
                const newGoogleImages = googleRes.data.images;

                // Save to cache
                saveSearch(q, "pinterest", newPinterestImages);
                saveSearch(q, "google", newGoogleImages);

                setImageData({
                    pinterest: pinterestImages || newPinterestImages,
                    google: googleImages || newGoogleImages,
                });
            
               // console.log(dribbble.data)
                setVisibilityCount(20);
            } catch (error) {
                console.error("Error fetching images:", error);
            } finally {
                setLoading(false);
            }
        } 
        fetchPinterest()
    },[q])


    const handleClick =()=>{
        setImageData({
            pinterest:[],
            google:[],
            dribble:[]
        });
        setQ(query)
    }

    const downloadImage =async(url)=>{
        try{
            console.log(url);
            const res = await fetch(url);
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
    
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download =url.split('/').pop() || q
            document.body.appendChild(a);
            a.click;
    
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch(err){
            console.error("Download failed",err);
            
        }
        

        
    }

  return (
    <div className="min-h-screen bg-primary">
      {/* Search Section */}
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
                className="w-full border-white border-2 rounded-lg p-2 placeholder-grey-300 "
              />
            </div>
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="text-center mt-16 ">
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

        {/* Google Section */}
        {!loading && imageData.google.length > 0 && (
          <section className="mt-16">
            <h2 className="fancy-text text-4xl md:text-6xl mb-8">Google</h2>
            <div className="all-movies">
              <ul> 
                {imageData.google.slice(0, visiblityCount).map((im, i) => (
                     console.log("Google image:", im, "index:", i),
                    
                    <li key={`google-${i}`}>
                    <ImageCard data={im} />
                      
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Load More Button */}
        {!loading && visiblityCount < (imageData.pinterest.length + imageData.google.length) && (
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
        {!loading && q && imageData.pinterest.length === 0 && imageData.google.length === 0 && (
          <div className="text-center mt-16">
            <p className="text-gray-400 text-lg">No images found. Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPinterest