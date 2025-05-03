"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { homeCards } from "./data";
import Categories from "@/components/categories/categories";
import GoToMenu from "@/components/goToMenu";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import Loading from "./loading";
import { toast } from "react-toastify";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { fetchCategoryById } from "@/lib/store/actions/categoryActions";
import { fetchProducts } from "@/lib/store/actions/productActions";
import { fetchCategories } from "@/lib/store/actions/categoryActions";
import { checkAuthStatus } from "@/lib/store/actions/userActions";

const Page = () => {
  const dispatch = useAppDispatch();

  // Redux state
  const selectedCategory = useAppSelector(
    (store) => store.product.selectedCategory
  );
  const globalLoading = useAppSelector((store) => store.global.loading);
  const products = useAppSelector((store) => store.product.products);
  const categories = useAppSelector((store) => store.category.categories);

  // Local state
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [maxRetries] = useState(3); // Yeniden deneme sayısı
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Sadece bir kez çalışmasını sağlayalım
    if (!initialized) {
      const initialize = async () => {
        setInitializing(true);

        try {
          // Önce kimlik durumunu kontrol et (timeout ile)
          await Promise.race([
            dispatch(checkAuthStatus()),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Auth check timed out")), 5000)
            ),
          ]).catch((error) => {
            console.warn("Kimlik doğrulama hatası, devam ediliyor:", error);
            // Auth hatası olsa bile devam et - kritik değil
          });

          // Sonra ürün/kategori verilerini getir
          try {
            if (selectedCategory) {
              await dispatch(fetchCategoryById(selectedCategory));
            } else {
              // Hem kategori hem ürün verilerini al
              await Promise.all([
                dispatch(fetchCategories()),
                dispatch(fetchProducts()),
              ]);
            }

            setInitialized(true);
          } catch (dataError) {
            console.error("Veri yüklenirken hata:", dataError);

            // Network hatası durumunda yeniden deneme
            if (
              dataError.message === "Network Error" &&
              retryCount < maxRetries
            ) {
              setRetryCount((prev) => prev + 1);
              console.log(
                `Veri yüklenirken hata, yeniden deneniyor (${
                  retryCount + 1
                }/${maxRetries})`
              );

              // 1 saniye bekle ve yeniden dene
              setTimeout(() => {
                setInitialized(false); // Yeniden başlatmak için
              }, 1000);
            } else {
              // Yeniden deneme sınırına ulaşıldı veya farklı bir hata
              toast.error(
                "Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
              );
              setInitialized(true); // İşaretleme yapıyoruz ki sonsuz döngüye girmesin
            }
          }
        } catch (error) {
          console.error("Uygulama başlatma hatası:", error);
          toast.error("Uygulama başlatılırken bir hata oluştu.");
          setInitialized(true); // İşaretleme yapıyoruz ki sonsuz döngüye girmesin
        } finally {
          setInitializing(false);
        }
      };

      initialize();
    }
  }, [dispatch, selectedCategory, initialized, retryCount, maxRetries]);

  const buttonNotifyHandler = () => {
    toast.info("You can customize this button!");
  };

  // Başlatma sürecinde loading göster
  if (initializing || globalLoading) {
    return <Loading />;
  }

  // Veriler mevcut değilse uyarı göster ama sayfayı yine de render et
  const hasProductData = Array.isArray(products) && products.length > 0;
  const hasCategoryData = Array.isArray(categories) && categories.length > 0;

  if (!hasProductData || !hasCategoryData) {
    // Yalnızca bir kez uyarı göster
    useEffect(() => {
      toast.warning(
        "Bazı veriler yüklenemedi. Sayfayı yenileyebilir veya devam edebilirsiniz."
      );
    }, []);
  }

  return (
    <div>
      <Header />
      <div className="flex flex-col justify-between items-center gap-2 text-lightgray">
        <div className="bg-[url('../../assets/mvp-banner.png')] bg-cover bg-center h-screen w-full max-md:h-[50vh]">
          <div className="flex flex-col justify-start items-center gap-4 mt-4">
            <span className="flex flex-col justify-between items-center gap-4 text-center">
              <h4 className="font-Satisfy text-yellow text-2xl">
                fırsatı kaçırma
              </h4>
              <h2 className="font-Barlow text-4xl tracking-tighter text-lightgray">
                KOD ACIKTIRIR, <br /> PİZZA DOYURUR
              </h2>

              <Link href="/order">
                <button className="btn-primary">ACIKTIM</button>
              </Link>
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-row justify-center gap-4 mt-4 max-md:flex-col max-md:items-center max-md:mt-0 max-md:gap-2 w-full">
            <div
              className="flex flex-col justify-start items-start text-center text-lightgray p-2 rounded-md max-md:p-0 w-full max-md:w-[40vh] bg-cover bg-center"
              style={{
                backgroundImage: `url(${homeCards[0].background.src})`,
              }}
            >
              <span className="m-4 flex flex-col items-start gap-4">
                <p className="text-5xl font-bold font-Quattrocento w-[50%] text-left">
                  {homeCards[0].text}
                </p>
                <button onClick={buttonNotifyHandler} className="btn-primary">
                  {homeCards[0].buttonText}
                </button>
              </span>
            </div>
            <span className="flex flex-col gap-4 max-md:gap-2 max-md:items-center">
              <div
                className="flex flex-col justify-start items-start text-center text-lightgray p-2 rounded-md max-md:p-0 bg-cover bg-center h-full w-[40vh] max-md:w-[40vh]"
                style={{
                  backgroundImage: `url(${homeCards[1].background.src})`,
                }}
              >
                <span className="m-4 flex flex-col items-start gap-4">
                  <p className="text-xl font-bold font-Barlow w-[75%] text-left">
                    {homeCards[1].text}
                  </p>
                  <button onClick={buttonNotifyHandler} className="btn-third">
                    {homeCards[1].buttonText}
                  </button>
                </span>
              </div>
              <div
                className="flex flex-col justify-start items-start text-center text-lightgray p-2 rounded-md max-md:p-0 bg-cover bg-center h-full w-[40vh] max-md:w-[40vh]"
                style={{
                  backgroundImage: `url(${homeCards[2].background.src})`,
                }}
              >
                <span className="m-4 flex flex-col items-start gap-4">
                  <p className="text-xl text-darkgray font-bold font-Barlow w-[60%] text-left">
                    {homeCards[2].text}
                  </p>
                  <button onClick={buttonNotifyHandler} className="btn-fourth">
                    {homeCards[2].buttonText}
                  </button>
                </span>
              </div>
            </span>
          </div>
          <div className="flex flex-col items-center gap-8 my-16 max-md:my-0 max-md:px-8">
            <span className="flex flex-col items-center gap-4 max-md:text-center">
              <h3 className="font-Satisfy font-normal text-3xl text-red">
                en çok paketlenen menüler
              </h3>
              <h4 className="text-darkgray font-semibold text-4xl font-Barlow">
                Acıktıran Kodlara Doyuran Lezzetler
              </h4>
            </span>

            <Categories />
          </div>
        </div>
        <GoToMenu />
      </div>
      <Footer />
    </div>
  );
};

export default Page;
