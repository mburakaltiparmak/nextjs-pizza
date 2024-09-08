/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppSelector } from "@/lib/hooks";
import Image from "next/image";
import headImg from "../../../assets/adv-aseets/adv-form-banner.png";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { useState } from "react";
import {
  faCartShopping,
  faCashRegister,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/hooks/use-toast";
//import { steps } from "../data";
import { useForm } from "react-hook-form";
const Page = () => {
  const { toast } = useToast();
  const cart = useAppSelector((store) => store.order.cart);
  const cartArray = Object.values(cart);
  console.log("cart array : ", cartArray);

  const [currentStep, setCurrentStep] = useState(1);
  const [step1, setStep1] = useState(false);
  const step2 = true;
  const [step3, setStep3] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const fullname = watch("fullname");
  const address = watch("address");
  const isStep1Valid = fullname && address;
  const steps = [
    {
      title: "Kişisel Bilgiler",
      value: "user",
      icon: faUser,
      success: faCheck,
      disabled: "",
      select: false,
    },
    {
      title: "Sipariş Özeti",
      value: "summary",
      icon: faCartShopping,
      success: faCheck,
      disabled: !step1,
      select: false,
    },
    {
      title: "Ödeme",
      value: "payment",
      icon: faCashRegister,
      success: faCheck,
      disabled: !step1,
      select: true,
    },
  ];

  const handleUserData = (name, address) => {
    if (name && address) {
      const userdata = {
        name: name,
        address: address,
      };
      console.log("user data", userdata);
      setStep1(true);
      setCurrentStep(3);
      toast({
        title: "Ödeme yapmadan önce Sipariş Özetini kontrol edin.",
      });
    } else {
      setStep1(false);
      setCurrentStep(1);
      toast({
        title: "Lütfen formu doldurun.",
        type: error,
      });
    }
  };

  const onSubmit = (data) => {
    console.log("Final data:", data);
  };

  return (
    <div className="flex flex-col items-center gap-2 mb-8">
      <span>
        <Image
          src={headImg.src}
          alt="Pizza"
          className="object-cover"
          width={300}
          height={100}
        />
      </span>
      <Tabs className="flex flex-col gap-2 " defaultValue="user">
        <TabsList className="grid w-[100vh] grid-cols-3 bg-lightgray gap-2 place-content-center py-8">
          {steps.map((item, index) => (
            <TabsTrigger
              disabled={item.disabled}
              aria-selected={item.select}
              key={index}
              value={item.value}
              className="flex flex-row items-center gap-2 py-4 bg-darkgray transition duration-300 ease-in-out text-lightgray border border-transparent hover:py-6 data-[state=active]:border-darkgray data-[state=active]:bg-lightgray data-[state=active]:text-darkgray"
            >
              <FontAwesomeIcon className="text-xl" icon={item.icon} />
              <p>{item.title}</p>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent className="w-[100vh] max-h-[60vh] " value="user">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="flex flex-col bg-lightgray">
              <CardHeader>
                <CardTitle>Kişisel Bilgiler</CardTitle>
                <CardDescription>
                  Siparişinizi güvenli bir şekilde size ulaştırabilmemiz için
                  bazı bilgilere ihtiyacımız var.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="fullname">İsim & Soyisim</Label>
                  <Input
                    {...register("fullname", { required: true })}
                    id="fullname"
                    placeholder="Lütfen isminizi girin."
                  />
                  {errors.fullname && (
                    <p className="text-red-500">İsim gerekli</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="address">Adres</Label>
                  <Input
                    {...register("address", { required: true })}
                    id="address"
                    placeholder="Lütfen adresinizi girin."
                  />
                  {errors.address && (
                    <p className="text-red-500">Adres gerekli</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="button"
                  disabled={!isStep1Valid}
                  onClick={() => handleUserData(fullname, address)}
                  className="buttonStyle bg-yellow text-darkgray hover:bg-red hover:text-lightgray"
                >
                  KAYDET
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent className="w-[100vh]" value="summary">
          <Card className="bg-lightgray">
            <CardHeader>
              <CardTitle>Sipariş Özeti</CardTitle>
              <CardDescription>
                Sipariş özetiniz ektedir. Ödeme yapmak için devam edin.
              </CardDescription>
              <hr />
            </CardHeader>
            {cartArray.length > 0 ? (
              cartArray.map((item, index) => (
                <CardContent
                  key={index}
                  className="space-y-2 flex flex-col gap-4"
                >
                  <div className="space-y-1 flex flex-row justify-start gap-4 items-center">
                    <img
                      src={item.product.product_img}
                      alt={item.product.name}
                      className="w-[64px] object-cover"
                    />
                    <Label htmlFor="count">{item.count} Adet</Label>
                    <Label htmlFor="name">{item.product.name}</Label>
                    <Label htmlFor="price">{item.product.price} ₺</Label>
                  </div>
                  <Label htmlFor="total">
                    Toplam:{" "}
                    {cartArray.reduce(
                      (sum, item) => sum + item.product.price * item.count,
                      0
                    )}{" "}
                    ₺
                  </Label>
                  <hr />
                </CardContent>
              ))
            ) : (
              <p className="space-y-1.5 px-6 pb-4">Sepetinizde ürün yoktur.</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent className="w-[100vh] max-h-[60vh]" value="payment">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="flex flex-col bg-lightgray">
              <CardHeader>
                <CardTitle>Ödeme Bilgileri</CardTitle>
                <CardDescription>
                  Ödeme işleminizi yapabilmemiz için bazı bilgilere ihtiyacımız
                  var.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card number</Label>
                  <Input
                    id="card-number"
                    type="text"
                    pattern="d{4}-\d{4}-\d{4}-\d{4}"
                    placeholder="0000 0000 0000 0000"
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      value = value.replace(/(\d{4})(?=\d)/g, "$1-");
                      e.target.value = value;
                    }}
                    {...register("cardNumber", {
                      required: true,
                      pattern: /^\d{4}-\d{4}-\d{4}-\d{4}$/,
                    })}
                    maxLength={19}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiration-month">Expiration</Label>
                    <div className="flex gap-2">
                      <Select id="expiration-month">
                        <SelectTrigger aria-label="Month">
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (month) => (
                              <SelectItem
                                key={month}
                                value={month.toString().padStart(2, "0")}
                              >
                                {month}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <Separator orientation="vertical" />
                      <Select id="expiration-year">
                        <SelectTrigger aria-label="Year">
                          <SelectValue placeholder="YY" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => i + 2024).map(
                            (year) => (
                              <SelectItem
                                key={year}
                                value={year.toString().slice(2)}
                              >
                                {year}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">
                      <TooltipProvider>
                        CVC
                        <Tooltip>
                          The 3-digit security code on the back of your card.
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input id="cvc" type="text" maxLength={3} required />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="buttonStyle bg-yellow text-darkgray hover:bg-red hover:text-lightgray"
                >
                  ÖDEME YAP
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default Page;
