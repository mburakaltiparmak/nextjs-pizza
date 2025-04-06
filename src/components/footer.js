import locationLogo from "../../assets/adv-aseets/icons/icon-1.png";
import mailLogo from "../../assets/adv-aseets/icons/icon-2.png";
import phoneLogo from "../../assets/adv-aseets/icons/icon-3.png";
import Image from "next/image";
import { footerInstaPhoto } from "@/app/data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookSquare,
  faInstagramSquare,
  faTwitterSquare,
} from "@fortawesome/free-brands-svg-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { faCopyright } from "@fortawesome/free-regular-svg-icons";

const InstagramPhoto = ({ img }) => (
  <Popover>
    <PopoverTrigger asChild>
      <div className="cursor-pointer">
        <Image
          alt="fast-food"
          src={img.src}
          width={96}
          height={96}
          className="object-cover w-24 h-24"
        />
      </div>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0">
      <Image
        alt="fast-food"
        src={img.src}
        width={192}
        height={192}
        className="object-cover w-48 h-48"
      />
    </PopoverContent>
  </Popover>
);

const IconWithText = ({ src, alt, text }) => (
  <span className="flex flex-row items-center gap-2 font-Barlow font-semibold text-xs">
    <Image 
      width={24} 
      height={24} 
      alt={alt} 
      src={src}
      className="w-6 h-6 object-contain"
      style={{ width: 'auto', height: 'auto' }}
    />
    <p>{text}</p>
  </span>
);

const Footer = () => {
  return (
    <footer className="flex flex-col items-center gap-4 py-2 bg-darkgray text-lightgray">
      <div className="flex flex-row justify-around max-md:flex-col max-md:items-center">
        <div className="flex flex-col items-start justify-start gap-8 max-lg:gap-2">
          <span className="flex flex-col font-Londrina_Solid text-3xl w-64 h-20">
            <h5>Teknolojik</h5>
            <h5>Yemekler</h5>
          </span>
          <span className="flex flex-col justify-between gap-8">
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
          </span>
        </div>
        
        <div className="flex flex-col items-start justify-start gap-8 max-lg:gap-2 font-Barlow">
          <span className="w-64 h-20 flex items-center">
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

        <div className="flex flex-col gap-8 text-lg font-bold font-Barlow max-lg:gap-2">
          <span className="w-64 h-20 flex items-center">
            <p className="text-xl font-bold">Instagram</p>
          </span>
          <span className="grid grid-cols-3 gap-1">
            {footerInstaPhoto.map((item, index) => (
              <InstagramPhoto key={index} img={item.img} />
            ))}
          </span>
        </div>
      </div>

      <hr className="w-full" />

      <div className="flex flex-row justify-around items-center gap-8 text-lightgray py-2 max-md:py-0 w-full">
        <span className="flex flex-col gap-2">
          <p className="flex flex-row items-center gap-1 text-xs">
            <FontAwesomeIcon className="w-3" icon={faCopyright} />
            2024 Teknolojik Yemekler
          </p>
          <a href="https://burakaltiparmak.site" className="text-xs underline">
            made by Burak Altıparmak
          </a>
        </span>
        <span className="flex flex-row items-center gap-2">
          <a href="https://twitter.com">
            <FontAwesomeIcon className="w-4 h-auto" icon={faTwitterSquare} />
          </a>
          <a href="https://facebook.com">
            <FontAwesomeIcon className="w-4 h-auto" icon={faFacebookSquare} />
          </a>
          <a href="https://instagram.com">
            <FontAwesomeIcon className="w-4 h-auto" icon={faInstagramSquare} />
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;