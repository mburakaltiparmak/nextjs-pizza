import Link from "next/link";
import Image from "next/image";
import React from "react";
import mvpBanner from "../../../assets/mvp-banner.png";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { homeCards, homeMenuBar, homeMenuLink } from "../data";

const fetchData = async () => {
  const response = await fetch(
    "https://66c0ce8bba6f27ca9a57a405.mockapi.io/api/products"
  );
  return response.json();
};

const Page = async () => {
  const productData = await fetchData();
  console.log("fetched data", productData[2].category_img);
  const mappedData = productData.flatMap((item) => {
    return item.products;
  });

  console.log("products", mappedData);

  return (
    <div className="flex flex-col justify-between items-center gap-2 text-lightgray">
      <div
        className="w-full"
        style={{
          backgroundImage: `url(${mvpBanner.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "90vh",
        }}
      >
        <div className="flex flex-col justify-start items-center gap-4 mt-4">
          <h1 className="font-Londrina_Solid text-3xl text-lightgray">
            Teknolojik Yemekler
          </h1>
          <span className="flex flex-col justify-between items-center gap-4 text-center">
            <h4 className="font-Satisfy text-yellow text-2xl">
              fırsatı kaçırma
            </h4>
            <h2 className="font-Barlow text-4xl tracking-tighter font-lightgray">
              KOD ACIKTIRIR, <br /> PİZZA DOYURUR
            </h2>

            <Link href="/order">
              <button className="buttonStyle bg-yellow text-darkgray hover:border-2 hover:border-lightgray">
                ACIKTIM
              </button>
            </Link>
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-row justify-center items-center gap-4">
          {productData.map((item, index) => {
            return (
              <span
                key={index}
                className="flex flex-row items-center gap-2 text-darkgray font-semibold text-xs px-4 py-1 border border-transparent rounded-full hover:cursor-pointer hover:text-lightgray hover:bg-darkgray"
              >
                <img src={item.category_img} alt={item.category_name} />
                <HoverCard>
                  <HoverCardTrigger>{item.category_name}</HoverCardTrigger>
                  <HoverCardContent>Used shadcnUI & next.js</HoverCardContent>
                </HoverCard>
              </span>
            );
          })}
        </div>
        <div className="flex flex-row justify-center gap-4 mt-4">
          <div
            className="flex flex-col justify-start items-start text-center text-lightgray p-2 rounded-md"
            style={{
              backgroundImage: `url(${homeCards[0].background.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "60vh",
              width: "100%",
            }}
          >
            <span className="m-4 flex flex-col items-start gap-4">
              <p className="text-5xl font-bold font-Quattrocento w-[50%] text-left ">
                {homeCards[0].text}
              </p>
              <button className="buttonStyle bg-lightgray text-red hover:bg-yellow hover:text-darkgray hover:border-lightgray hover:border-2">
                {homeCards[0].buttonText}
              </button>
            </span>
          </div>
          <span className="flex flex-col gap-4">
            <div
              className="flex flex-col justify-start items-start text-center text-lightgray p-2 rounded-md"
              style={{
                backgroundImage: `url(${homeCards[1].background.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100%",
                width: "75vh",
              }}
            >
              <span className="m-4 flex flex-col items-start gap-4">
                <p className="text-xl font-bold font-Barlow w-[75%] text-left ">
                  {homeCards[1].text}
                </p>
                <button className="buttonStyle bg-lightgray text-red hover:bg-yellow hover:text-darkgray hover:border-lightgray hover:border-2">
                  {homeCards[1].buttonText}
                </button>
              </span>
            </div>
            <div
              className="flex flex-col justify-start items-start text-center text-lightgray p-2 rounded-md"
              style={{
                backgroundImage: `url(${homeCards[2].background.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100%",
                width: "75vh",
              }}
            >
              <span className="m-4 flex flex-col items-start gap-4">
                <p className="text-xl text-darkgray font-bold font-Barlow w-[60%] text-left ">
                  {homeCards[2].text}
                </p>
                <button className="buttonStyle bg-lightgray text-red hover:bg-yellow hover:text-darkgray hover:border-red hover:border-2">
                  {homeCards[2].buttonText}
                </button>
              </span>
            </div>
          </span>
        </div>
        <div className="flex flex-col items-center gap-8 my-16">
          <span className="flex flex-col items-center gap-4">
            <h3 className="font-Satisfy font-normal text-3xl text-red">
              en çok paketlenen menüler
            </h3>
            <h4 className="text-darkgray font-semibold text-3xl font-Barlow">
              Acıktıran Kodlara Doyuran Lezzetler
            </h4>
          </span>
          <div className="flex flex-row justify-center items-center gap-4 mt-4">
            {productData.map((item, index) => {
              return (
                <span
                  key={index}
                  className="flex flex-row items-center gap-2 text-darkgray font-semibold text-sm px-4 py-1 border border-transparent rounded-full hover:cursor-pointer hover:text-lightgray hover:bg-darkgray"
                >
                  <img src={item.category_img} width={50} height={50} />
                  <HoverCard>
                    <HoverCardTrigger>{item.category_name}</HoverCardTrigger>
                  </HoverCard>
                </span>
              );
            })}
          </div>
          <div className="flex flex-row flex-wrap justify-between items-center gap-8 mx-24">
            {mappedData.map((item, index) => {
              return (
                <label
                  htmlFor={item.name}
                  className="flex flex-col justify-between items-center text-center font-Barlow text-darkgray border border-lightgray shadow-darkgray shadow-md  w-[300px] h-[400px] py-4"
                  key={index}
                >
                  <img
                    className="object-cover w-[150px] h-fit"
                    src={item.product_img}
                    alt={item.name}
                  />
                  <p className="font-bold text-xl">{item.name}</p>
                  <span className="flex flex-row justify-between gap-4 text-lg">
                    <p>{item.rating}</p>
                    <p>({item.stock})</p>
                    <p className="font-semibold">{item.price} ₺</p>
                  </span>
                  <button className="buttonStyle bg-lightgray text-red hover:bg-yellow hover:text-darkgray hover:border-red hover:border-2">
                    SİPARİŞ VER
                  </button>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
