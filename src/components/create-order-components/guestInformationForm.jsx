"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const guestSchema = z.object({
  guestEmail: z.string().email({ message: "Geçerli bir e-posta adresi girin" }),
  guestPhone: z.string().min(10, { message: "Geçerli bir telefon numarası girin" })
});

const GuestInformationForm = ({ onSubmit, initialData = {}, submitText = "Devam Et" }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      guestEmail: initialData.guestEmail || "",
      guestPhone: initialData.guestPhone || ""
    }
  });

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="guestEmail">E-posta Adresi *</Label>
        <Controller
          name="guestEmail"
          control={control}
          render={({ field }) => (
            <Input
              id="guestEmail"
              type="email"
              placeholder="ornek@email.com"
              {...field}
              className={errors.guestEmail ? "border-red" : ""}
            />
          )}
        />
        {errors.guestEmail && (
          <p className="text-red text-sm mt-1">{errors.guestEmail.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="guestPhone">Telefon Numarası *</Label>
        <Controller
          name="guestPhone"
          control={control}
          render={({ field }) => (
            <Input
              id="guestPhone"
              placeholder="05XX XXX XX XX"
              {...field}
              className={errors.guestPhone ? "border-red" : ""}
            />
          )}
        />
        {errors.guestPhone && (
          <p className="text-red text-sm mt-1">{errors.guestPhone.message}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-yellow text-red font-semibold rounded-md hover:bg-red hover:text-yellow transition-colors"
        >
          {isSubmitting ? "İşleniyor..." : submitText}
        </button>
      </div>
    </form>
  );
};

export default GuestInformationForm;