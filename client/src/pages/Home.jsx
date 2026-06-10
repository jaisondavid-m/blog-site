import React , { useState , useCallback } from "react"
import BlogPost from "../components/BlogPost.jsx"
import ToastStack from "../components/ToastStack.jsx"
import { DUMMY_POST } from "../data/DummyData.js"
import { FiZap } from "react-icons/fi"

function Home() {

    const posts = DUMMY_POST

    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type) => {
        const id = Date.now()
        setToasts(p => [...p, { id, message, type }])
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)),4000)
    },[])

    const removeToast = useCallback((id) => {
        setToasts(p => p.filter(t => t.id !== id))
    },[])

    const handleShare = () => {
        addToast("Link copied to clipboard", "success")
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap');
                @keyframes toastIn {
                    from {
                        opacity:0;
                        transform:translateX(20px);
                    }
                    to {
                        opacity:1;
                        transform:translateX(0)
                    }
                }
                ::placeholder {
                    color: #9ca3af
                }
            `}</style>
            <ToastStack toasts={toasts} remove={removeToast} />
            <div className="min-h-screen bg-gray-50 font-['Plus_Jakarta_Sans']" >
                <div className="max-w-2xl mx-auto px-5 lg:px-8 py-10" >

                    {/* Page header */}
                    <div className="mb-8" >
                        <div className="flex items-center gap-2 mb-1" >
                            <FiZap size={18} className="text-indigo-500" />
                            <h1 className="font-['Bricolage_Grotesque'] text-2xl font-extrabold text-gray-900 trakcing-tight" >
                                Latest posts
                            </h1>
                        </div>
                        <p className="text-sm text-gray-400 font-medium" >
                            Stories from the community
                        </p>
                    </div>

                    {/* Feed */}
                    <div className="flex flex-col gap-5" >
                        {posts.map(post => (
                            <BlogPost
                                key={post.id}
                                post={post}
                                onShare={handleShare}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home