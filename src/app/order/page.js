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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { Input } from "@/components/ui/input";
import Image from "next/image";
import headImg from "../../../assets/adv-aseets/adv-form-banner.png";
import { items } from "../data";
import { useRouter } from "next/navigation";
import {
  setHamur,
  setBoyut,
  setMalzemeler,
  setSiparisNotu,
  addCart,
  setCustomPizza,
  setPrice,
  setCount,
} from "@/lib/store/actions/orderActions";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

// Updated Zod schema for form validation
const formSchema = z.object({
  boyut: z.enum(["S", "M", "L"], {
    message: "Pizza boyutu seçmelisiniz.",
  }),
  hamur: z.enum(["ince", "normal", "kalin"], {
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
  const { boyut, hamur, malzemeler, siparisNotu, customPizza } = useAppSelector(
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

  useEffect(() => {
    const selectedBoyut = form.getValues("boyut");
    const selectedHamur = form.getValues("hamur");
    const selectedItems = form.getValues("items");

    setMalzemeFiyat(selectedItems.length * 5);
    setBoyutFiyat(() => {
      switch (selectedBoyut) {
        case "S":
          return 20;
        case "M":
          return 30;
        case "L":
          return 40;
        default:
          return 0;
      }
    });
    setHamurFiyat(() => {
      switch (selectedHamur) {
        case "ince":
          return 20;
        case "normal":
          return 30;
        case "kalin":
          return 40;
        default:
          return 0;
      }
    });
  }, [form.watch("boyut"), form.watch("hamur"), form.watch("items")]);

  useEffect(() => {
    setToplam(malzemeFiyat + boyutFiyat + hamurFiyat);
  }, [malzemeFiyat, boyutFiyat, hamurFiyat]);

  const onSubmit = (data) => {
    dispatch(setBoyut(data.boyut));
    dispatch(setHamur(data.hamur));
    dispatch(setMalzemeler(data.items));
    dispatch(setSiparisNotu(0, data.siparisNotu));
    dispatch(setPrice(toplam * count));

    const newCustomPizza = {
      boyut: data.boyut,
      hamur: data.hamur,
      malzemeler: data.items,
      siparisNotu: data.siparisNotu,
      fiyat: toplam,
    };
    dispatch(setCustomPizza(newCustomPizza)); // Assuming 0 as the index for the first pizza
    dispatch(setCustomPizza(newCustomPizza));
    dispatch(addCart(customPizza));

    console.log("Form Data:", newCustomPizza);
    router.push("/payment");
  };
  return (
    <div className="flex flex-col items-center justify-between gap-8 mb-8">
      <span>
        <Image
          src={headImg.src}
          alt="Pizza"
          className="object-cover"
          width={400}
          height={100}
        />
      </span>
      <span className="flex flex-row items-center justify-center w-[80vh] px-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Anasayfa</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Seçenekler</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="text-red">
              <BreadcrumbPage>Sipariş Oluştur</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </span>
      <div className="flex flex-col justify-between py-4 gap-4 w-[80vh] font-Barlow">
        <h3 className="text-lg font-semibold">Ürün Adı</h3>
        <span className="flex flex-row justify-between items-center gap-4 ">
          <p className="text-lg font-semibold">85.50 ₺</p>
          <span className="flex flex-row justify-between items-center gap-16 text-gray">
            <p>4.9</p>
            <p>(564)</p>
          </span>
        </span>
        <p className="text-sm text-gray ">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed maximus
          consequat turpis quis imperdiet. Mauris feugiat tempor pulvinar.
          Pellentesque sed purus pretium, ultricies diam eget, laoreet odio.
          Pellentesque mattis elit et massa iaculis, nec tempor lectus accumsan.
          Mauris id metus velit. Nulla facilisi. Sed vel dui mattis est
          ullamcorper tempor non non tortor. In auctor mauris risus, et pulvinar
          neque sollicitudin sit amet. Pellentesque rutrum cursus dignissim.
          Integer euismod mauris sed metus rutrum iaculis. Nullam cursus massa
          ac augue tristique, sit amet malesuada nisi lacinia. Fusce varius nisl
          et risus commodo, varius interdum massa feugiat. Morbi ex lacus,
          venenatis a velit et, imperdiet volutpat odio.
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col items-center justify-between gap-8 w-[80vh]"
        >
          <div className="flex flex-row justify-between items-center  w-[80vh]">
            <FormField
              control={form.control}
              name="boyut"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-between w-full">
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
                        className="border border-lightgray rounded-full w-[40px] h-[40px] bg-lightgray text-gray text-sm font-semibold font-Barlow  hover:text-lightgray hover:bg-red data-[state=on]:bg-yellow"
                      >
                        S
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="M"
                        className="border border-lightgray rounded-full w-[40px] h-[40px] bg-lightgray text-gray text-sm font-semibold font-Barlow  hover:text-lightgray hover:bg-red data-[state=on]:bg-yellow"
                      >
                        M
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="L"
                        className="border border-lightgray rounded-full w-[40px] h-[40px] bg-lightgray text-gray text-sm font-semibold font-Barlow  hover:text-lightgray hover:bg-red data-[state=on]:bg-yellow"
                      >
                        L
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
                <FormItem className="w-full">
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
                        <SelectValue placeholder="-- Hamur Kalınlığı Seç --" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ince">İnce</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="kalin">Kalın</SelectItem>
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
              <FormItem className="flex flex-col justify-between gap-4 w-full">
                <FormLabel className="flex flex-row items-center">
                  <p className="text-darkgray "> Ekstra Malzemeler </p>{" "}
                  <p className="text-red">*</p>{" "}
                </FormLabel>
                <FormLabel className="text-xs text-gray">
                  En fazla 10 malzeme seçebilirsiniz. 5₺
                </FormLabel>
                <FormControl>
                  <div className="flex flex-row flex-wrap items-center justify-between gap-8">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-row justify-start items-center w-[100px] gap-2"
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

          <FormField
            control={form.control}
            name="siparisNotu"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Sipariş Notu</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Siparişine eklemek istediğin bir not var mı?"
                    className="border border-gray bg-lightgray h-[75px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-row justify-between gap-8 items-start w-full">
            <span className="flex flex-col items-start justify-between bg-lightgray border border-gray w-full gap-2 rounded-lg">
              <span className="flex flex-col justify-between items-stretch gap-4 p-8 w-full">
                <p className="font-semibold text-base">Sipariş Toplamı</p>
                <span className="flex flex-col justify-between items-stretch font-semibold gap-4 w-full">
                  <span className="flex flex-row justify-between items-center text-sm text-gray">
                    <p>Seçimler</p> <p>{malzemeFiyat} ₺</p>
                  </span>
                  <span className="flex flex-row justify-between items-center text-sm text-red">
                    <p>Toplam</p> <p>{toplam * count} ₺</p>
                  </span>
                </span>
              </span>
              <Button
                type="submit"
                className="w-full bg-yellow text-darkgray font-bold hover:bg-red hover:text-lightgray"
              >
                SİPARİŞ VER
              </Button>
            </span>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Page;
