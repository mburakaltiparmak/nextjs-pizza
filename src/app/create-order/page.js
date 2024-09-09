/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "@/components/ui/button";
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

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FirstStep from "@/components/create-order-components/firstStep";
import SecondStep from "@/components/create-order-components/secondStep";
import ThirdStep from "@/components/create-order-components/thirdStep";

const schema = z.object({
  fullname: z.string().min(1, { message: "Required" }),
  address: z.string().min(1, { message: "Required" }),
  cardNumber: z.number().min(16, { message: "Required" }),
  nameOnCard: z.string().min(1, { message: "Required" }),
  expirationMonth: z.number().min(1, { message: "Required" }),
  expirationYear: z.number().min(4, { message: "Required" }),
  cvc: z.number().min(3, { message: "Required" }),
});

const Page = () => {
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [step1, setStep1] = useState(false);
  const [step2, setStep2] = useState(false);
  const [step3, setStep3] = useState(false);

  const steps = [
    {
      title: "Kişisel Bilgiler",
      icon: faUser,
      success: faCheck,
      disabled: "",
    },
    {
      title: "Sipariş Özeti",
      icon: faCartShopping,
      success: faCheck,
      disabled: !step1,
    },
    {
      title: "Ödeme",
      icon: faCashRegister,
      success: faCheck,
      disabled: !step1 || !step2,
    },
  ];

  // Koşullu render için uygun yapı
  const displaySteps = () => {
    switch (currentStep) {
      case 1:
        return (
          <FirstStep setCurrentStep={setCurrentStep} setStep1={setStep1} />
        );
      case 2:
        return (
          <SecondStep setCurrentStep={setCurrentStep} setStep2={setStep2} />
        );
      case 3:
        return (
          <ThirdStep setCurrentStep={setCurrentStep} setStep3={setStep3} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      <span>
        <Image
          src={headImg.src}
          alt="Pizza"
          className="object-cover"
          width={300}
          height={100}
        />
      </span>
      <div className="flex flex-col items-center gap-4 ">
        <span className="grid grid-cols-3  w-[100vh] gap-4 ">
          {steps.map((item, index) => (
            <Button
              disabled={item.disabled}
              key={index}
              className="flex flex-row gap-2 items-center bg-primary/90 border-2 border-transparent rounded-md text-lightgray py-8 hover:bg-lightgray hover:text-primary/90 hover:border-primary/90 disabled:bg-red disabled:text-lightgray disabled:border-transparent w-full"
            >
              <FontAwesomeIcon className="text-2xl" icon={item.icon} />
              <p>{item.title}</p>
            </Button>
          ))}
        </span>
        <span className="w-[100vh]">{displaySteps()}</span>
      </div>
    </div>
  );
};

export default Page;
