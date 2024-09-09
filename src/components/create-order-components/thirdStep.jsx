"use client";
import React, { useState } from "react";
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
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
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
  });
  const [formData, setFormData] = useState({
    cardNumber: "",
    nameOnCard: "",
    expirationMonth: "",
    expirationYear: "",
    cvc: "",
  });

  const onSubmit = (data) => {
    setFormData(data);
    console.log("Payment data:", data);
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully.",
      variant: "success",
    });
    setStep3(true);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="flex flex-col bg-lightgray">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>
              We need some information to process your payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col gap-4">
            <div className="space-y-2 flex flex-col gap-4">
              <span className="flex flex-col gap-2">
                <Label htmlFor="card-number">Card number</Label>
                <Input
                  {...register("cardNumber")}
                  type="text"
                  className="form-control"
                  name="cardNumber"
                  placeholder="1234 1234 1234 1234"
                  value={formData.cardNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, cardNumber: e.target.value })
                  }
                />
                {errors?.cardNumber?.message && (
                  <p className="text-red">{errors.cardNumber.message}</p>
                )}
              </span>
              <span className="flex flex-col gap-2">
                <Label htmlFor="card-name">Name on card</Label>
                <Input
                  {...register("nameOnCard")}
                  type="text"
                  className="form-control"
                  name="nameOnCard"
                  placeholder="John Doe"
                  value={formData.nameOnCard}
                  onChange={(e) =>
                    setFormData({ ...formData, nameOnCard: e.target.value })
                  }
                />
                {errors?.nameOnCard?.message && (
                  <p className="text-red">{errors.nameOnCard.message}</p>
                )}
              </span>
            </div>
            <div className="grid grid-cols-2 place-content-center gap-4 ">
              <div className="space-y-2 flex flex-col gap-2  ">
                <Label className="" htmlFor="expiration-date">
                  Expiration Date
                </Label>
                <div className="flex gap-2 ">
                  <Select id="expiration-month">
                    <SelectTrigger className="bg-white" aria-label="Month">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) =>
                        (i + 1).toString().padStart(2, "0")
                      ).map((month) => (
                        <SelectItem
                          key={month}
                          value={month}
                          onSelect={(value) =>
                            setFormData({ ...formData, expirationMonth: value })
                          }
                        >
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Separator orientation="vertical" />
                  <Select id="expiration-year">
                    <SelectTrigger className="bg-white" aria-label="Year">
                      <SelectValue placeholder="YY" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) =>
                        (i + 2024).toString().slice(2)
                      ).map((year) => (
                        <SelectItem
                          key={year}
                          value={year}
                          onSelect={(value) =>
                            setFormData({ ...formData, expirationYear: value })
                          }
                        >
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2 flex flex-col gap-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  {...register("cvc")}
                  id="cvc"
                  type="text"
                  placeholder="123"
                  maxLength={3}
                  value={formData.cvc}
                  onChange={(e) =>
                    setFormData({ ...formData, cvc: e.target.value })
                  }
                />
                {errors?.cvc?.message && (
                  <p className="text-red">{errors.cvc.message}</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="buttonStyle bg-yellow text-darkgray hover:bg-red hover:text-lightgray"
            >
              PAY
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default ThirdStep;
