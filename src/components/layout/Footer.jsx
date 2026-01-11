"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFacebookSquare,
    faInstagramSquare,
    faTwitterSquare,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
    return (
        <footer className="bg-[#1a1a1a] text-white py-6 border-t-4 border-red font-Barlow text-sm">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">

                {/* Brand & Copyright */}
                <div className="flex items-center gap-3">
                    <span className="font-Londrina_Solid text-2xl text-yellow tracking-wide">
                        Teknolojik Yemekler
                    </span>
                    <span className="text-gray-500">© 2024</span>
                </div>

                {/* Social Icons */}
                <div className="flex gap-5">
                    <a href="https://twitter.com" className="text-gray-400 hover:text-yellow transition-colors hover:scale-110">
                        <FontAwesomeIcon icon={faTwitterSquare} className="w-5 h-5" />
                    </a>
                    <a href="https://facebook.com" className="text-gray-400 hover:text-yellow transition-colors hover:scale-110">
                        <FontAwesomeIcon icon={faFacebookSquare} className="w-5 h-5" />
                    </a>
                    <a href="https://instagram.com" className="text-gray-400 hover:text-yellow transition-colors hover:scale-110">
                        <FontAwesomeIcon icon={faInstagramSquare} className="w-5 h-5" />
                    </a>
                </div>

                {/* Developer Credit */}
                <a
                    href="https://burakaltiparmak.site"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-yellow transition-colors"
                >
                    Developed by Burak Altıparmak
                </a>

            </div>
        </footer>
    );
};

export default Footer;
