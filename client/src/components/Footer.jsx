import React from "react"
import { Link } from "react-router-dom"
import { FiZap } from "react-icons/fi"
import { FiGithub , FiLinkedin , FiInstagram } from "react-icons/fi"

function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 pt-12 font-['Plus_Jakarta_Sans']">
            <div className="max-w-5xl mx-auto px-8">
                <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr] gap-12 pb-10">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2.5 mb-3.5">
                            <div className="w-9 h-9 rounded-xl bg-indigo flex items-center justify-center">
                                <FiZap size={18}/>
                            </div>
                            <span className="font-['Bricolage_Grotesque'] text-[18px] font-extrabold text-gray-900 tracking-tight" >
                                BlogSite
                            </span>
                        </div>
                        <p className="text-[13.5px] text-gray-500 leading-relaxed max-w-[220px] mb-5" >
                            Read, write and share ideas with a community that cares about words.
                        </p>
                        <div className="flex gap-2">
                            {[
                                { icon: FiGithub , label: "GitHub" , link: "https://github.com/jaisondavid-m" },
                                { icon: FiLinkedin , label: "Linkedin" , link: "https://linkedin.com/in/jaison-david-m-a14072360" },
                                { icon: FiInstagram , label: "Instagram" , link: "https://www.instagram.com/jaison__2007" },
                            ].map(({ icon: Icon , label , link }) => (
                                <a
                                    key={label}
                                    href={link}
                                    aria-label={label}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-[34px] h-[34px] rounded-lg border border-gray-200 bg-white flex items-center
                                    justify-center text-gray-500 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50
                                    transition-all duration-150"
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>
                    
                    {/* Explore */}
                    <div>
                        <h4 className="text-[11.5px] font-bold tracking-widest uppercase text-gray-400 mb-3.5">
                            Explore
                        </h4>
                        {["Home","Trending","Topics","Writers"].map((item) => (
                            <Link
                                key={item}
                                to={`/${item.toLowerCase()}`}
                                className="block text-[13.5px] text-gray-700 hover:text-indigo-600 mb-2 transition-colors"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    {/* Account */}
                    <div>
                        <h4 className="text-[11.5px ]font-bold tracking-widest uppercase text-gray-400 mb-3.5" >
                            Account
                        </h4>
                        {[
                            { label: "Profile", path: "/profile" },
                            { label: "My Posts", path: "/my-posts" },
                            { label: "Bookmarks", path: "/bookmarks" },
                            { label: "Notifications", path: "/notifications" }
                        ].map(({ label, path }) => (
                            <Link
                                key={label}
                                to={path}
                                className="block text-[13.5px] text-gray-700 hover:text-indigo-600 mb-2 transition-colors"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="border-t border-gray-200 py-5 flex flex-col sm:flex-row items-center justify-between gap-2" >
                    <p className="text-[12.5px] text-gray-400" >
                       &copy; {new Date().getFullYear()} BlogSite. All rights reserved.
                    </p>
                    {/* <div className="flex gap-5" >

                    </div> */}
                </div>
            </div>
        </footer>
    )
}

export default Footer