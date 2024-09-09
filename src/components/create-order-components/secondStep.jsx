"use client";
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
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/lib/hooks";
import { Separator } from "../ui/separator";

const SecondStep = ({ setCurrentStep, setStep2 }) => {
  const cart = useAppSelector((store) => store.order.cart);
  const cartArray = Object.values(cart);
  console.log("cart array : ", cartArray);
  const handleNext = () => {
    setStep2(true);
    setCurrentStep(3);
  };
  const handleBack = () => {
    setStep2(false);
    setCurrentStep(1);
  };
  return (
    <div className="flex flex-col gap-2">
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
            <CardContent key={index} className="space-y-2 flex flex-col gap-4">
              <div className="grid grid-cols-3 place-content-between ">
                <span className="grid grid-cols-4 place-items-center">
                  <img
                    src={item.product.product_img}
                    alt={item.product.name}
                    className="w-[64px] h-[64px] object-cover"
                  />
                  <Separator className="h-[64px]" orientation="vertical" />
                  <Label htmlFor="count">{item.count} Adet</Label>
                  <Separator className="h-[64px]" orientation="vertical" />
                </span>
                <span className="grid grid-cols-2 place-content-center place-items-center">
                  <Label htmlFor="name">{item.product.name}</Label>
                  <Separator className="h-[64px]" orientation="vertical" />
                </span>
                <span className="flex flex-row items-center">
                  <Label htmlFor="price">{item.product.price} ₺</Label>
                </span>
              </div>
            </CardContent>
          ))
        ) : (
          <p className="space-y-1.5 px-6 pb-4">Sepetinizde ürün yoktur.</p>
        )}
        <hr />
        <Label
          className="flex flex-row justify-end text-lg gap-2 p-6"
          htmlFor="total"
        >
          <p className="font-bold">Toplam: </p>
          <p className="text-red">
            {cartArray.reduce(
              (sum, item) => sum + item.product.price * item.count,
              0
            )}{" "}
            ₺
          </p>
        </Label>
      </Card>
      <span className="flex flex-row justify-between">
        <Button
          className="buttonStyle bg-yellow text-darkgray hover:bg-red hover:text-lightgray"
          onClick={handleBack}
        >
          GERİ
        </Button>
        <Button
          className="buttonStyle  bg-yellow text-darkgray hover:bg-red hover:text-lightgray"
          onClick={handleNext}
        >
          İLERLE
        </Button>
      </span>
    </div>
  );
};
export default SecondStep;
