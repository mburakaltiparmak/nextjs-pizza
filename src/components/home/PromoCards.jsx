"use client";

import { useRouter } from "next/navigation";
import { PROMO_CARDS } from "@/lib/constants/homeData";

export default function PromoCards() {
  const router = useRouter();

  const handleCardClick = (productId) => {
    router.push(`/products/${productId}`);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-row justify-center gap-4 mt-4 max-md:flex-col max-md:items-center max-md:mt-0 max-md:gap-2 w-full">
        <div
          className="flex flex-col justify-start items-start text-center text-lightgray p-2 rounded-md max-md:p-0 w-full max-md:w-80 bg-cover bg-center cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            backgroundImage: `url(${PROMO_CARDS[0].backgroundImage.src})`,
          }}
          onClick={() => handleCardClick(PROMO_CARDS[0].productId)}
        >
          <span className="m-4 flex flex-col items-start gap-4">
            <p
              className={`${PROMO_CARDS[0].textSize} font-bold font-Quattrocento ${PROMO_CARDS[0].textWidth} text-left`}
            >
              {PROMO_CARDS[0].text}
            </p>
            <button className="btn-primary">
              {PROMO_CARDS[0].buttonText}
            </button>
          </span>
        </div>

        <div className="flex flex-col gap-4 max-md:gap-2 max-md:items-center">
          <div
            className="flex flex-col justify-start items-start text-center text-lightgray p-2 rounded-md max-md:p-0 bg-cover bg-center h-full w-80 cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              backgroundImage: `url(${PROMO_CARDS[1].backgroundImage.src})`,
            }}
            onClick={() => handleCardClick(PROMO_CARDS[1].productId)}
          >
            <span className="m-4 flex flex-col items-start gap-4">
              <p
                className={`${PROMO_CARDS[1].textSize} font-bold font-Barlow ${PROMO_CARDS[1].textWidth} text-left`}
              >
                {PROMO_CARDS[1].text}
              </p>
              <button className="btn-third">
                {PROMO_CARDS[1].buttonText}
              </button>
            </span>
          </div>

          <div
            className="flex flex-col justify-start items-start text-center text-lightgray p-2 rounded-md max-md:p-0 bg-cover bg-center h-full w-80 cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              backgroundImage: `url(${PROMO_CARDS[2].backgroundImage.src})`,
            }}
            onClick={() => handleCardClick(PROMO_CARDS[2].productId)}
          >
            <span className="m-4 flex flex-col items-start gap-4">
              <p
                className={`${PROMO_CARDS[2].textSize} text-darkgray font-bold font-Barlow ${PROMO_CARDS[2].textWidth} text-left`}
              >
                {PROMO_CARDS[2].text}
              </p>
              <button className="btn-fourth">
                {PROMO_CARDS[2].buttonText}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}