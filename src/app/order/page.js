"use client";
import React, { useState } from "react";
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
} from "@/components/ui/select"
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
import { setBoyut, setHamur, setMalzemeler } from "@/lib/store/actions/orderActions";
import { useAppDispatch, useAppSelector, useAppStore } from "@/lib/hooks";

// Zod schema for form validation
const formSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
});


const Page = () => {
  const store = useAppStore();
  const dispatch = useAppDispatch();

  const { boyut, hamur, malzemeler, siparisNotu } = useAppSelector((state) => state.order);
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: ["pepperoni", "sosis", "misir", "ananas", "jalepeno"],
    },
  });

  const handleBoyut = (boyut) => {
    dispatch(setBoyut(boyut));
  };
  const handleHamur = (hamur) => {
    dispatch(setHamur(hamur));
  };
  const handleMalzemeler = (malzemeler) => {
    dispatch(setMalzemeler(malzemeler));
  };
  const handleSiparisNotu = (siparisNotu) => {
    dispatch(setSiparisNotu(malzemeler));
  }

  const onSubmit = (data) => {
    dispatch(setMalzemeler(data.items));
    console.log("Form Data:", { boyut, hamur, malzemeler: data.items, siparisNotu });
    router.push('/payment');
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
      <div className="flex flex-col items-stretch justify-between p-4 gap-4 w-[80vh] font-Barlow">
        <h3 className="text-lg font-semibold">Ürün Adı</h3>
        <span className="flex flex-row justify-between items-center gap-4">
          <p className="text-lg font-semibold">85.50 €</p>
          <span className="flex flex-row justify-between items-center gap-16 text-gray">
            <p>4.9</p>
            <p>(564)</p>
          </span>
        </span>
        <p className="text-sm text-gray">
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
      <div className="flex flex-row justify-between items-center px-4 gap-4 w-[80vh]">
        <span className="flex flex-col items-start">
          <span className="flex flex-row gap-1">
            <p className="text-sm font-semibold">Boyut Seç</p>
            <p className="text-red">*</p>
          </span>
          <ToggleGroup
            value={boyut}
            className=""
            type="single"
            onValueChange={(value) => handleBoyut(value)}
          >
            <ToggleGroupItem
              className="border border-darkgray rounded-xl w-[40px] h-[40px] bg-lightgray text-gray  hover:text-lightgray hover:bg-red data-[state=on]:bg-yellow"
              value="S"
            >
              S
            </ToggleGroupItem>
            <ToggleGroupItem
              className="border border-darkgray rounded-xl w-[40px] h-[40px] bg-lightgray text-gray hover:text-lightgray hover:bg-red data-[state=on]:bg-yellow"
              value="M"
            >
              M
            </ToggleGroupItem>
            <ToggleGroupItem
              className="border border-darkgray rounded-xl w-[40px] h-[40px] bg-lightgray text-gray hover:text-lightgray hover:bg-red data-[state=on]:bg-yellow"
              value="L"
            >
              L
            </ToggleGroupItem>
          </ToggleGroup>
        </span>
        <span className="flex flex-col items-start">
          <span className="flex flex-row gap-1">
            <p className="text-sm font-semibold">Hamur Seç</p>
            <p className="text-red">*</p>
          </span>
          <Select value={hamur} onValueChange={(value) => handleHamur(value)}>
  <SelectTrigger className="w-[200px] h-[40px]">
    <SelectValue placeholder="Lütfen Hamur Seçiniz" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Hamur</SelectLabel>
      <SelectItem value="ince">İnce</SelectItem>
      <SelectItem value="normal">Normal</SelectItem>
      <SelectItem value="kalin">Kalın</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
        </span>
      </div>
      <Form className="flex flex-col items-center justify-between gap-4" {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-center justify-between gap-4">
          <FormField
            control={form.control}
            name="items"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start justify-between gap-4 px-4 w-[80vh]">
                <FormLabel>Ekstra Malzemeler</FormLabel>
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
                            checked
                              ? field.onChange([...field.value, item.id])
                              : field.onChange(
                                  field.value.filter(
                                    (value) => value !== item.id
                                  )
                                );
                          }}
                        />
                        <span className="text-xs font-semibold">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col justify-center items-start gap-2 px-4 w-[80vh]">
            <Label className="text-base font-semibold" htmlFor="message">
              Sipariş Notu
            </Label>
            <Textarea
            value={siparisNotu}
            onChange={(e)=>handleSiparisNotu(e.target.value)}
              className="border border-gray bg-lightgray h-[75px]"
              placeholder="Siparişine eklemek istediğin bir not var mı?"
              id="message"
            />
          </div>
          <div className="flex flex-row justify-between gap-8 items-start px-4 w-[80vh]">
            <span className="flex flex-row justify-between items-center border border-gray rounded-lg bg-lightgray">
              <Button className="bg-lightgray text-darkgray hover:bg-yellow w-[45px] h-full">
                +
              </Button>
              <p className="py-1 px-2 ">1</p>
              <Button className="bg-lightgray text-darkgray hover:bg-yellow w-[45px] h-full">
                -
              </Button>
            </span>
            <span className="flex flex-col items-start justify-between bg-lightgray border border-gray w-full gap-2 rounded-lg">
              <span className="flex flex-col justify-between items-stretch gap-4 p-8 w-full">
                <p className="font-semibold text-base">Sipariş Toplamı</p>
                <span className="flex flex-col justify-between items-stretch font-semibold gap-4 w-full">
                  <span className="flex flex-row justify-between items-center text-sm text-gray">
                    <p>Seçimler</p> <p>25.00 TL</p>
                  </span>
                  <span className="flex flex-row justify-between items-center text-sm text-red">
                    <p>Toplam</p> <p>50.00 TL</p>
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
