/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import headImg from "../../../assets/adv-aseets/adv-form-banner.png";
import { items } from "../data";
import { useRouter } from "next/navigation";
import { addCart, addToCart } from "@/lib/store/actions/orderActions";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faRankingStar } from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  createCustomPizza,
  createProduct,
} from "@/lib/store/actions/productActions";
import { useSelector } from "react-redux";

const formSchema = z.object({
  boyut: z.enum(["S", "M", "L"], {
    message: "Pizza boyutu seçmelisiniz.",
  }),
  hamur: z.enum(["Ince", "Standart", "Kalin"], {
    message: "Hamur tipini seçmelisiniz.",
  }),
  items: z
    .array(z.string())
    .refine((value) => value.length > 2 && value.length <= 10, {
      message: "En az 3, en fazla 10 malzeme seçmelisiniz.",
    }),
  siparisNotu: z
    .string()
    .max(200, "Sipariş notu 200 karakterden uzun olamaz.")
    .optional(),
});

const Page = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const token = useSelector((state) => state.user.token);

  const { boyut, hamur, malzemeler, siparisNotu } = useAppSelector(
    (state) => state.order
  );
  const [malzemeFiyat, setMalzemeFiyat] = useState(0);
  const [boyutFiyat, setBoyutFiyat] = useState(0);
  const [hamurFiyat, setHamurFiyat] = useState(0);
  const [toplam, setToplam] = useState(0);
  const [count, setLocalCount] = useState(1);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      boyut: boyut || "",
      hamur: hamur || "",
      items: malzemeler || [],
      siparisNotu: siparisNotu || "",
    },
  });

  const watchedBoyut = form.watch("boyut");
  const watchedHamur = form.watch("hamur");
  const watchedItems = form.watch("items");

  useEffect(() => {
    const selectedBoyut = form.getValues("boyut");
    const selectedHamur = form.getValues("hamur");
    const selectedItems = form.getValues("items");

    setMalzemeFiyat(selectedItems.length * 5);

    // Boyut fiyatını ayarla
    if (selectedBoyut === "S") {
      setBoyutFiyat(20);
    } else if (selectedBoyut === "M") {
      setBoyutFiyat(30);
    } else if (selectedBoyut === "L") {
      setBoyutFiyat(40);
    } else {
      setBoyutFiyat(0);
    }

    // Hamur fiyatını ayarla
    if (selectedHamur === "Ince") {
      setHamurFiyat(20);
    } else if (selectedHamur === "Standart") {
      setHamurFiyat(30);
    } else if (selectedHamur === "Kalin") {
      setHamurFiyat(40);
    } else {
      setHamurFiyat(0);
    }
  }, [form, watchedBoyut, watchedHamur, watchedItems]);

  useEffect(() => {
    setToplam(malzemeFiyat + boyutFiyat + hamurFiyat);
  }, [malzemeFiyat, boyutFiyat, hamurFiyat]);

  const createCustomPizzaCartItem = (data, toplam) => {
    //const customPizzaTemplateId = 9999;
    const customDetails = {
      isCustom: true,
      items: data.items,
      size: data.boyut,
      dough: data.hamur,
      orderNote: data.siparisNotu || "",
    };

    return {
      //id: customPizzaTemplateId, // Backend'de olmayan özel ID
      name: "Custom Pizza #" + Math.floor(Math.random() * 501 + 500),
      rating: 4.9,
      stock: 1,
      price: toplam,
      img: "https://res.cloudinary.com/dqjqkgpt3/image/upload/v1724010330/food-2_zwrtrh.png",
      categoryId: 1, // CUSTOM_BASE kategori ID'si
      description: JSON.stringify(customDetails),
      count: 1,
    };
  };

  const onSubmit = (data) => {
    // Custom pizza bilgilerini oluştur
    const total = hamurFiyat + malzemeFiyat + boyutFiyat;
    const customPizza = {
      name: "Custom Pizza #" + Math.floor(Math.random() * 501 + 500),
      price: total,
      img: "https://res.cloudinary.com/dqjqkgpt3/image/upload/v1724010330/food-2_zwrtrh.png",
      // Kategori bilgilerini göndermiyoruz
      description: JSON.stringify({
        isCustom: true,
        items: data.items,
        size: data.boyut,
        dough: data.hamur,
        orderNote: data.siparisNotu || ""
      }),
      count: 1
    };
  
    // Sepete ekle (backend'e hiç istek göndermeden)
    dispatch(addToCart(customPizza));
  
    // Bildirim göster
    toast({
      title: (
        <div className="flex flex-row gap-4 items-center py-4">
          <Image
            src={customPizza.img}
            alt={customPizza.name}
            width={48}
            height={48}
            className="object-cover"
          />
          <p>{customPizza.name} sepete başarıyla eklendi.</p>
        </div>
      ),
    });
  
    router.push("/");
  };
  return (
    <div>
      <Header />
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center gap-2 mb-8 font-Barlow w-1/3 max-md:w-full max-md:px-8">
          <span>
            <Image
              src={headImg.src}
              alt="Pizza"
              className="object-cover"
              width={320}
              height={100}
            />
          </span>
          <span className="flex flex-row items-center justify-center">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Anasayfa</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="text-red">
                  <BreadcrumbPage>Sipariş Oluştur</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </span>
          <div className="flex flex-col items-start justify-between  py-4 gap-4 font-Barlow">
            {/*düzelt */}
            <h3 className="text-lg font-semibold">Custom Pizza</h3>
            <span className="flex flex-row justify-between items-center gap-4 max-md:gap-2">
              <p className="text-lg font-semibold">
                {toplam ? `${toplam} ₺` : "Seçimlerine göre fiyat belirlenir."}
              </p>
              <span className="flex flex-row justify-between text-center items-center gap-16 max-md:gap-2 text-gray"></span>
            </span>
            <p className="text-sm text-gray ">
              Kendi pizzanı kendin tasarla! Boyutunu seç, hamur kalınlığını
              belirle, en sevdiğin malzemeleri ekle ve sadece sana özel bir
              lezzet yarat. Kodları biz yazar gibi, pizzanı da sen oluştur —
              seçimler senin, tarif özgür!
            </p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col items-center justify-between gap-8 w-full"
            >
              {/*düzelt */}
              <div className="flex flex-row justify-between items-center w-full">
                <FormField
                  control={form.control}
                  name="boyut"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-between w-full ">
                      <FormLabel className="flex flex-row items-center">
                        <p className="text-darkgray "> Boyut Seç </p>{" "}
                        <p className="text-red">*</p>{" "}
                      </FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          onValueChange={field.onChange}
                          value={field.value}
                          className="justify-start"
                        >
                          <ToggleGroupItem
                            value="S"
                            className="border border-lightgray rounded-full w-10 h-10 bg-lightgray text-gray text-sm font-semibold font-Barlow  hover:text-lightgray hover:bg-red data-[state=on]:bg-yellow"
                          >
                            {/*düzelt */}S
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="M"
                            className="border border-lightgray rounded-full w-10 h-10 bg-lightgray text-gray text-sm font-semibold font-Barlow  hover:text-lightgray hover:bg-red data-[state=on]:bg-yellow"
                          >
                            {/*düzelt */}M
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="L"
                            className="border border-lightgray rounded-full w-10 h-10 bg-lightgray text-gray text-sm font-semibold font-Barlow  hover:text-lightgray hover:bg-red data-[state=on]:bg-yellow"
                          >
                            {/*düzelt */}L
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage className="font-extrabold text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hamur"
                  render={({ field }) => (
                    <FormItem className="w-full ">
                      <FormLabel className="flex flex-row items-center">
                        <p className="text-darkgray "> Hamur Seç </p>{" "}
                        <p className="text-red">*</p>{" "}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Hamur Kalınlığı Seç" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Ince">İnce</SelectItem>
                          <SelectItem value="Standart">Standart</SelectItem>
                          <SelectItem value="Kalin">Kalın</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="font-extrabold text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="items"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-between gap-4 w-full max-md:items-center">
                    <FormLabel className="flex flex-row items-center ">
                      <p className="text-darkgray "> Ekstra Malzemeler </p>{" "}
                      <p className="text-red">*</p>{" "}
                    </FormLabel>
                    <FormLabel className="text-xs text-gray ">
                      En fazla 10 malzeme seçebilirsiniz. 5₺
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-3 gap-4 place-items-start max-md:w-full max-md:flex-1 max-md:flex-row max-md:flex-wrap max-md:gap-4 max-md:items-center max-md:justify-between ">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-row justify-start items-center  gap-2 "
                          >
                            <Checkbox
                              checked={field.value.includes(item.id)}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...field.value, item.id]
                                  : field.value.filter(
                                      (value) => value !== item.id
                                    );
                                field.onChange(updatedValue);
                              }}
                            />
                            <span className="text-xs font-semibold">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage className="font-extrabold text-xs" />
                  </FormItem>
                )}
              />

              <div className="flex flex-row justify-between gap-8 items-start w-full   max-md:flex-col max-md:items-center">
                <span className="flex flex-col items-start justify-between bg-lightgray border border-gray w-full gap-2 rounded-lg">
                  <span className="flex flex-col justify-between  items-stretch gap-4 p-4 w-full">
                    <p className="font-semibold text-lg">Sipariş Toplamı</p>
                    <span className="flex flex-col justify-between items-stretch font-semibold gap-4 w-full text-base">
                      <span className="flex flex-row justify-between items-center text-gray">
                        <p>Seçimler</p> <p>{malzemeFiyat} ₺</p>
                      </span>
                      <span className="flex flex-row justify-between items-center text-red">
                        <p>Toplam</p> <p>{toplam * count} ₺</p>
                      </span>
                    </span>
                  </span>
                  <Button
                    type="submit"
                    className="w-full bg-yellow text-darkgray font-bold hover:bg-red hover:text-lightgray"
                  >
                    SEPETE EKLE
                  </Button>
                </span>
              </div>
            </form>
          </Form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Page;
