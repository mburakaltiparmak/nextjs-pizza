/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import FirstStep from "@/components/create-order-components/firstStep";
import SecondStep from "@/components/create-order-components/secondStep";
import ThirdStep from "@/components/create-order-components/thirdStep";
import { useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";

const Page = () => {
  const { toast } = useToast();
  const router = useRouter();
  const cart = useAppSelector((store) => store.order.cart);
  if (cart.length <= 0) {
    toast({
      title: "Sepetiniz boş.",
      description: "Anasayfaya yönlendiriliyorsunuz.",
    });
    router.push("/");
  }

  const [currentStep, setCurrentStep] = useState(1);
  const [step1, setStep1] = useState(false);
  const [step2, setStep2] = useState(false);
  const [step3, setStep3] = useState(false);

  const steps = [
    {
      title: "Kişisel Bilgiler",
      icon: faUser,
      success: faCheck,
      disabled: !cart,
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
        <span className="grid grid-cols-3 place-content-between w-full max-w-[50vh] max-md:w-fit max-md:gap-2 gap-4 max-md:px-4 ">
          {steps.map((item, index) => (
            <Button
              disabled={item.disabled}
              key={index}
              className="flex flex-row gap-2 max-md:flex-col items-center bg-primary/90 border-2 border-transparent rounded-md text-lightgray py-8 hover:bg-lightgray hover:text-primary/90 hover:border-primary/90 disabled:bg-red disabled:text-lightgray disabled:border-transparent w-full"
            >
              <FontAwesomeIcon
                className="text-2xl max-md:text-xl"
                icon={item.icon}
              />
              <p>{item.title}</p>
            </Button>
          ))}
        </span>
        <span className="max-w-[50vh] max-md:w-fit max-md:px-4">
          {displaySteps()}
        </span>
      </div>
    </div>
  );
};

export default Page;
