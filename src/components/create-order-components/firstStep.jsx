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
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { createOrder, setUserData } from "@/lib/store/actions/orderActions";

const schema = z.object({
  fullname: z.string().min(1, { message: "Required" }),
  address: z.string().min(1, { message: "Required" }),
});

const FirstStep = ({ setCurrentStep, setStep1 }) => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const fullname = watch("fullname");
  const address = watch("address");
  const isStep1Valid = fullname && address;

  const onSubmit = (data) => {
    dispatch(setUserData(data));
    console.log("user data:", data);
    setStep1(true);
    setCurrentStep(2);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <Card className="flex flex-col bg-lightgray">
          <CardHeader>
            <CardTitle>Kişisel Bilgiler</CardTitle>
            <CardDescription>
              Siparişinizi güvenli bir şekilde size ulaştırabilmemiz için bazı
              bilgilere ihtiyacımız var.
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
              {errors?.fullname?.message && (
                <p className="text-red">{errors.fullname.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="address">Adres</Label>
              <Input
                {...register("address", { required: true })}
                id="address"
                placeholder="Lütfen adresinizi girin."
              />
              {errors?.address?.message && (
                <p className="text-red">{errors.address.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <span className="flex flex-row justify-end">
          <Button
            type="submit"
            disabled={!isStep1Valid}
            className="buttonStyle bg-yellow text-darkgray hover:bg-red hover:text-lightgray"
          >
            İLERLE
          </Button>
        </span>
      </form>
    </div>
  );
};

export default FirstStep;
