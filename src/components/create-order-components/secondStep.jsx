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

const secondStep = ({ setCurrentStep, setStep2 }) => {
  const cart = useAppSelector((store) => store.order.cart);
  const cartArray = Object.values(cart);
  console.log("cart array : ", cartArray);
  const handleNext = () => {
    setStep2(true);
    setCurrentStep(3);
  };
  return (
    <div>
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
            </CardContent>
          ))
        ) : (
          <p className="space-y-1.5 px-6 pb-4">Sepetinizde ürün yoktur.</p>
        )}
        <hr />
        <Label className="flex flex-row gap-2 p-6" htmlFor="total">
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
      <Button onClick={handleNext}>İLERLE</Button>
    </div>
  );
};
export default secondStep;
