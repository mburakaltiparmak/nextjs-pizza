"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import mvpBanner from "../../assets/mvp-banner.png";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { homeCards, homeMenuBar, homeMenuLink } from "./data";
import { resolve } from "styled-jsx/css";
import Products from "@/components/products/products";
import Categories from "@/components/categories/categories";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import GoToMenu from "@/components/goToMenu";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchProducts,
  fetchProductsById,
} from "@/lib/store/actions/productActions";
import Loading from "./loading";

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const Page = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const selectedCategory = useAppSelector(
    (store) => store.product.selectedCategory
  );
  const fetchState = useAppSelector((store) => store.product.fetchState);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (selectedCategory) {
        await dispatch(fetchProductsById(selectedCategory));
      } else {
        await dispatch(fetchProducts());
      }
      setIsLoading(false);
    };

    fetchData();
  }, [dispatch, selectedCategory]);

  if (isLoading || fetchState === "FETCHING") {
    return <Loading />;
  }
  return (
    <div className="flex flex-col justify-between items-center gap-2 text-lightgray">
      <div
        className="w-full"
        style={{
          backgroundImage: `url(${mvpBanner.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100vh",
        }}
      >
        <div className="flex flex-col justify-start items-center gap-4 mt-4">
          <span className="flex flex-col justify-between items-center gap-4 text-center">
            <h4 className="font-Satisfy text-yellow text-2xl">
              fırsatı kaçırma
            </h4>
            <h2 className="font-Barlow text-4xl tracking-tighter text-lightgray">
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
        <div className="flex flex-row justify-center gap-4 mt-4 w-[150vh]">
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
        <div className="flex flex-col items-center gap-8 my-16 ">
          <span className="flex flex-col items-center gap-4">
            <h3 className="font-Satisfy font-normal text-3xl text-red">
              en çok paketlenen menüler
            </h3>
            <h4 className="text-darkgray font-semibold text-3xl font-Barlow">
              Acıktıran Kodlara Doyuran Lezzetler
            </h4>
          </span>

          <Categories />
        </div>
      </div>
      <GoToMenu />
    </div>
  );
};

export default Page;
