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
                                The Blog Bench
                            </span>
                        </div>
                        
                    </div>
                </div>
                <div className="border-t border-gray-200 py-5 flex flex-col sm:flex-row items-center justify-between gap-2" >
                    <p className="text-[12.5px] text-gray-400" >
                       &copy; {new Date().getFullYear()} The Blog Bench. All rights reserved.
                    </p>
                    {/* <div className="flex gap-5" >

                    </div> */}
                </div>
            </div>
        </footer>
    )
}

export default Footer