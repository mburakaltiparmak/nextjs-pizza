"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFacebookSquare,
    faInstagramSquare,
    faTwitterSquare,
} from "@fortawesome/free-brands-svg-icons";
import { faCopyright } from "@fortawesome/free-regular-svg-icons";

// Adjusting imports for new location
import locationLogo from "@/assets/adv-aseets/icons/icon-1.png";
import mailLogo from "@/assets/adv-aseets/icons/icon-2.png";
import phoneLogo from "@/assets/adv-aseets/icons/icon-3.png";
import { footerInstaPhoto } from "@/app/data";
import InstagramGallery from "@/components/ui/instagramGallery";

const IconWithText = ({ src, alt, text }) => (
    <div className="flex items-center gap-4">
        <div className="bg-red rounded-full p-2 flex items-center justify-center min-w-10 min-h-10">
            <Image
                width={20}
                height="auto"
                alt={alt}
                src={src}
                className="object-contain"
            />
        </div>
        <p className="font-Barlow text-sm">{text}</p>
    </div>
);

// Fotoğraflar için açıklama içeren gelişmiş veri yapısı
const instaPhotosWithDescriptions = footerInstaPhoto.map((item, index) => {
    const descriptions = [
        "Terminal Pizza - JavaScript komutlarıyla hazırlanan özel tarifimiz.",
        "Pizza Kolajı - Kod satırları gibi bir araya gelen lezzet dilimleri.",
        "SideEffect Patates Tabağı - Her daldırmada ayrı bir fonksiyon: ketçap ve mayonez.",
        "Abbey Road Burger Edition - Yaya geçidinde yürüyen burger komponentleri.",
        "ChilledProps Ice Tea - Serinletici iki prop, yaz günlerine refresh atıyor.",
        "DoubleStack Burger - İkili modülde, maksimum performans ve lezzet.",
        "CSS Grid Makarna - Kusursuz düzende, mükemmel lezzet.",
        "React Hook Fish - useState ile durumu değişen balık tabağı.",
        "Git Commit Tatlısı - Değişikliklerinizi tatlıya bağlayın.",
    ];

    return {
        img: item.img,
        description: descriptions[index % descriptions.length],
    };
});

const Footer = () => {
    return (
        <footer className="bg-darkgray text-lightgray font-Barlow">
            <div className="mx-auto p-8">
                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Company Info Column */}
                    <div>
                        <h3 className="font-Londrina_Solid text-3xl mb-6 text-yellow">
                            Teknolojik
                            <br />
                            Yemekler
                        </h3>

                        <div className="space-y-4 mb-6">
                            <IconWithText
                                src={locationLogo}
                                alt="location"
                                text="341 Londonberry Road, İstanbul Türkiye"
                            />
                            <IconWithText
                                src={mailLogo}
                                alt="mail"
                                text="aciktim@teknolojikyemekler.com"
                            />
                            <IconWithText
                                src={phoneLogo}
                                alt="phone"
                                text="+90 216 123 45 67"
                            />
                        </div>

                        <div className="flex space-x-3">
                            <a
                                href="https://twitter.com"
                                className="text-lightgray hover:text-yellow transition-colors"
                            >
                                <FontAwesomeIcon icon={faTwitterSquare} className="w-6 h-6" />
                            </a>
                            <a
                                href="https://facebook.com"
                                className="text-lightgray hover:text-yellow transition-colors"
                            >
                                <FontAwesomeIcon icon={faFacebookSquare} className="w-6 h-6" />
                            </a>
                            <a
                                href="https://instagram.com"
                                className="text-lightgray hover:text-yellow transition-colors"
                            >
                                <FontAwesomeIcon icon={faInstagramSquare} className="w-6 h-6" />
                            </a>
                        </div>
                    </div>

                    {/* Menu Column */}
                    <div>
                        <h3 className="font-Barlow font-bold text-yellow text-xl mb-6 pb-2 border-b border-red">
                            Sıcacık Menüler
                        </h3>

                        <ul className="space-y-3 font-Barlow">
                            <li className="hover:text-yellow transition-colors">
                                <Link href="/products/39">NY Pizza</Link>
                            </li>
                            <li className="hover:text-yellow transition-colors">
                                <Link href="/products/31">Cheesy Pizza</Link>
                            </li>
                            <li className="hover:text-yellow transition-colors">
                                <Link href="/products/32">Spicy Pizza</Link>
                            </li>
                            <li className="hover:text-yellow transition-colors">
                                <Link href="/products/33">Classic Burger</Link>
                            </li>
                            <li className="hover:text-yellow transition-colors">
                                <Link href="/products/26">Bacon Burger</Link>
                            </li>
                            <li className="hover:text-yellow transition-colors">
                                <Link href="/products/30">Double Cheeseburger</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Instagram Column */}
                    <div>
                        <h3 className="font-Barlow font-bold text-yellow text-xl mb-6 pb-2 border-b border-red">
                            Instagram
                        </h3>

                        {/* Yeni Instagram Galerisi Bileşeni */}
                        <InstagramGallery photos={instaPhotosWithDescriptions} />
                    </div>
                </div>

                {/* Divider */}
                <hr className="my-8 border-gray" />

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center text-sm">
                    <div className="mb-4 md:mb-0 flex items-center">
                        <FontAwesomeIcon icon={faCopyright} className="w-3 h-3 mr-2" />
                        <span>2024 Teknolojik Yemekler. Tüm hakları saklıdır.</span>
                    </div>

                    <div className="flex items-center space-x-6 max-md:justify-center max-md:space-x-0 max-md:text-xs max-md:gap-2">
                        <Link href="#" className="hover:text-yellow transition-colors">
                            Gizlilik Politikası
                        </Link>
                        <Link href="#" className="hover:text-yellow transition-colors">
                            Kullanım Koşulları
                        </Link>
                        <a
                            href="https://burakaltiparmak.site"
                            className="text-yellow hover:underline"
                        >
                            made by Burak Altıparmak
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
