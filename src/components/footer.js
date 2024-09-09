import locationLogo from "../../assets/adv-aseets/icons/icon-1.png";
import mailLogo from "../../assets/adv-aseets/icons/icon-2.png";
import phoneLogo from "../../assets/adv-aseets/icons/icon-3.png";
import Image from "next/image";
import { footerInstaPhoto } from "@/app/data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faFacebookSquare, faInstagram, faInstagramSquare, faTwitter, faTwitterSquare } from "@fortawesome/free-brands-svg-icons";
import { faCopyright } from "@fortawesome/free-regular-svg-icons";

const Footer = () => {

    return (
        <div className="flex flex-col justify-between items-center gap-4 bg-darkgray text-lightgray ">
        <div className="flex flex-row justify-between w-[150vh] py-8 ">
            <div className="flex flex-row justify-between gap-4 ">   
            <div className="flex flex-col items-start justify-start gap-8">
                <span className="flex flex-col font-Londrina_Solid text-3xl w-[256px] h-[80px] ">
                <h5>Teknolojik</h5>
                <h5>Yemekler</h5>
                </span>
                <span className="flex flex-col justify-between gap-8">
                <span className="flex flex-row items-center gap-2 font-Barlow font-semibold text-xs">
                    <Image width={24} height={24} alt="location" src={locationLogo} /> <p>341 Londonberry Road, İstanbul Türkiye</p>
                </span>
                <span className="flex flex-row items-center gap-2 font-Barlow font-semibold text-xs">
                <Image width={24} height={24} alt="mail" src={mailLogo}/> <p>aciktim@teknolojikyemekler.com</p>
                </span>
                <span className="flex flex-row items-center gap-2 font-Barlow font-semibold text-xs">
                <Image width={24} height={24} alt="phone" src={phoneLogo}/> <p>+90 216 123 45 67</p>
                </span>
                </span>
            </div>
            <div className="flex flex-col items-start justify-start gap-8">
                <span className="w-[256px] h-[80px] flex items-center ">
                <p className="text-xl font-bold">Sıcacık Menüler</p>
                </span>
                <span className="flex flex-col gap-4 font-Barlow text-sm font-normal">
                <p>Terminal Pizza</p>
                <p>5 Kişilik Hackathon Pizza</p>
                <p>useEffect Tavuklu Pizza</p>
                <p>Beyaz Console Frosty</p>
                <p>Testler Geçti Mutlu Burger</p>
                <p>Position Absolute Acı Burger</p>
                </span>
                
            </div>
            </div>
            <div className="flex flex-col gap-8 text-lg font-bold font-Barlow"> 
            <span className="w-[256px] h-[80px] flex items-center ">
            <p>Instagram</p>
                </span>  
            <span className="grid grid-cols-3 gap-1">
                {footerInstaPhoto.map((item,index)=>{
                    return (
                        <Image alt="fast-food" key={index} src={item.img.src} width={96} height={96}
                        className="object-cover"
                        />
                    )
                })}
            
            </span>
            </div>  
            </div>
            <hr className="w-full"/>
            <div className="flex flex-row justify-between items-center w-[150vh] text-lightgray py-2">
                <span className="flex flex-col gap-2">
                <p className="flex flex-row items-center gap-1 text-xs"><FontAwesomeIcon className="object-cover w-[12px] h-fit" icon={faCopyright} />2024 Teknolojik Yemekler</p>
                <p className="text-xs">made by Burak Altıparmak</p>
                </span>
                <span className="flex flex-row items-center gap-2">
                <a href="https://twitter.com">
<FontAwesomeIcon className="object-cover w-[16px] h-fit" icon={faTwitterSquare} />
                </a>
                <a href="https://facebook.com">
<FontAwesomeIcon className="object-cover w-[16px] h-fit" icon={faFacebookSquare} />
                </a>
                <a href="https://instagram.com">
<FontAwesomeIcon className="object-cover w-[16px] h-fit" icon={faInstagramSquare} />
                </a>
                </span>
            </div>
             
            </div>
    )
}
export default Footer;