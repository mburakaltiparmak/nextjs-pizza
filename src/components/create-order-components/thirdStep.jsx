"use client";
import React, { useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { createOrder, setPaymentData } from "@/lib/store/actions/orderActions";

const formSchema = z.object({
  cardNumber: z
    .string()
    .min(16, { message: "Kredi Kartı numarası 16 haneli olmalıdır." }),
  nameOnCard: z.string().min(1, { message: "İsminiz gereklidir." }),
  expirationMonth: z
    .string()
    .min(2, { message: "Son kullanma tarihi gereklidir." }),
  expirationYear: z
    .string()
    .min(2, { message: "Son kullanma tarihi gereklidir." }),
  cvc: z.string().min(3, { message: "CVC 3 haneli olmalıdır." }),
});

const ThirdStep = ({ setCurrentStep, setStep3 }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardNumber: "",
      nameOnCard: "",
      expirationMonth: "",
      expirationYear: "",
      cvc: "",
    },
  });

  const userData = useAppSelector((state) => state.order.userData);
  const cartData = useAppSelector((state) => state.order.cart);

  const createOrder = async (paymentData) => {
    const orderData = {
      userData,
      paymentData,
      cartData,
    };
    try {
      console.log("order data : ", orderData);
      toast({
        title: "Siparişiniz alınıyor...",
      });
      setStep3(true);
      router.push("/success");
    } catch (error) {
      toast({
        title: "Sipariş oluşturulurken bir hata oluştu.",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  const onSubmit = (data) => {
    dispatch(setPaymentData(data));
    console.log("payment data : ", data);
    createOrder(data);
  };

  const handleBack = () => {
    setCurrentStep(2);
    setStep3(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <Card className="flex flex-col bg-lightgray">
        <CardHeader>
          <CardTitle>Ödeme Bilgileri</CardTitle>
          <CardDescription>
            Siparişinizi tamamlamak için ödeme bilgilerinize ihtiyacımız var.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex flex-col gap-4">
          <div className="space-y-2 flex flex-col gap-4">
            <Controller
              name="cardNumber"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="card-number">Kart numarası</Label>
                  <Input {...field} placeholder="1234 1234 1234 1234" />
                  {errors.cardNumber && (
                    <span className="text-red-500">
                      {errors.cardNumber.message}
                    </span>
                  )}
                </div>
              )}
            />
            <Controller
              name="nameOnCard"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="card-name">Kart üzerindeki isim</Label>
                  <Input {...field} placeholder="John Doe" />
                  {errors.nameOnCard && (
                    <span className="text-red-500">
                      {errors.nameOnCard.message}
                    </span>
                  )}
                </div>
              )}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center gap-4 ">
            <div className="space-y-2 flex flex-col gap-2">
              <Label className="" htmlFor="expiration-date">
                Son Kullanma Tarihi
              </Label>
              <div className="flex gap-2 ">
                <Controller
                  name="expirationMonth"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="bg-white" aria-label="Month">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) =>
                          (i + 1).toString().padStart(2, "0")
                        ).map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Controller
                  name="expirationYear"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="bg-white" aria-label="Year">
                        <SelectValue placeholder="YY" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) =>
                          (i + 2024).toString().slice(2)
                        ).map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {(errors.expirationMonth || errors.expirationYear) && (
                <span className="text-red-500">
                  Son kullanma tarihi gereklidir.
                </span>
              )}
            </div>
            <Controller
              name="cvc"
              control={control}
              render={({ field }) => (
                <div className="space-y-2 flex flex-col gap-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input {...field} placeholder="123" />
                  {errors.cvc && (
                    <span className="text-red-500">{errors.cvc.message}</span>
                  )}
                </div>
              )}
            />
          </div>
        </CardContent>
      </Card>
      <span className="flex flex-row justify-between">
        <Button
          className="buttonStyle bg-yellow text-darkgray hover:bg-red hover:text-lightgray"
          onClick={handleBack}
        >
          GERİ
        </Button>
        <Button
          type="submit"
          className="buttonStyle bg-yellow text-darkgray hover:bg-red hover:text-lightgray"
        >
          SİPARİŞİ TAMAMLA
        </Button>
      </span>
    </form>
  );
};

export default ThirdStep;
