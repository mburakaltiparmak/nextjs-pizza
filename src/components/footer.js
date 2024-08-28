import locationLogo from "../../assets/adv-aseets/icons/icon-1.png";
import mailLogo from "../../assets/adv-aseets/icons/icon-2.png";
import phoneLogo from "../../assets/adv-aseets/icons/icon-3.png";
import Image from "next/image";
import { footerInstaPhoto } from "@/app/data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import { faCopyright } from "@fortawesome/free-regular-svg-icons";

const Footer = () => {

    return (
        <div className="flex flex-col justify-between gap-8 bg-darkgray text-lightgray py-12">
        <div className="flex flex-row justify-between text-left mx-24 ">
            <div className="flex flex-row justify-between  gap-8 ">   
            <span className="flex flex-col items-start justify-between gap-4">
                <span className="flex flex-col font-Londrina_Solid text-3xl">
                <h5>Teknolojik</h5>
                <h5>Yemekler</h5>
                </span>
                <span className="flex flex-row items-center gap-2 font-Barlow font-semibold text-xs">
                    <Image src={locationLogo}/> <p>341 Londonberry Road, İstanbul Türkiye</p>
                </span>
                <span className="flex flex-row items-center gap-2 font-Barlow font-semibold text-xs">
                <Image src={mailLogo}/> <p>aciktim@teknolojikyemekler.com</p>
                </span>
                <span className="flex flex-row items-center gap-2 font-Barlow font-semibold text-xs">
                <Image src={phoneLogo}/> <p>+90 216 123 45 67</p>
                </span>
            </span>
            <span className="flex flex-col justify-between gap-8">
                <p className="text-lg font-bold">Sıcacık Menüler</p>
                <span className="flex flex-col justify-between gap-4 font-Barlow text-sm font-normal">
                <p>Terminal Pizza</p>
                <p>5 Kişilik Hackathon Pizza</p>
                <p>useEffect Tavuklu Pizza</p>
                <p>Beyaz Console Frosty</p>
                <p>Testler Geçti Mutlu Burger</p>
                <p>Position Absolute Acı Burger</p>
                </span>
                
            </span>
            </div>
            <div className="flex flex-col items-stretch gap-8 text-lg font-bold font-Barlow w-[33%]">   
            <p>Instagram</p>
            <span className="flex flex-row flex-wrap items-center gap-1">
                {footerInstaPhoto.map((item,index)=>{
                    return (
                        <img key={index} src={item.img.src}
                        className="object-cover w-[96px] h-fit"
                        />
                    )
                })}
            
            </span>
            </div>  
            </div>
            <hr className=""/>
            <span className="flex flex-row justify-between mx-16 text-lightgray">
                <p className="flex flex-row items-center gap-1 text-xs"><FontAwesomeIcon className="object-cover w-[12px] h-fit" icon={faCopyright} />2024 Teknolojik Yemekler</p>
                <a href="https://twitter.com">
<FontAwesomeIcon className="object-cover w-[16px] h-fit" icon={faTwitter} />
                </a>
                
            </span>
             
            </div>
    )
}
export default Footer;