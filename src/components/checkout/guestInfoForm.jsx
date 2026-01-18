"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  setGuestName,
  setGuestSurname,
  setGuestEmail,
  setGuestPhone
} from "@/lib/store/actions/guestActions";

import { guestInfoSchema } from "@/lib/validations/order";
import { selectGuestData } from "@/lib/store/selectors/guestSelectors";

// Schema imported from central validation file


const GuestInfoForm = () => {
  const dispatch = useAppDispatch();

  // Get guest data from redux store
  const guestData = useAppSelector(selectGuestData);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(guestInfoSchema),
    defaultValues: {
      name: guestData.name || "",
      surname: guestData.surname || "",
      email: guestData.email || "",
      phoneNumber: guestData.phoneNumber || ""
    }
  });

  // Watch all fields for changes
  const name = watch("name");
  const surname = watch("surname");
  const email = watch("email");
  const phoneNumber = watch("phoneNumber");



  // Remove the auto-dispatch on typing to avoid constant updates
  // We'll handle it in the form submission instead

  // State for showing success message
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handle form submission
  const onSubmit = (data) => {
    // Dispatch all guest data to Redux store
    dispatch(setGuestName(data.name));
    dispatch(setGuestSurname(data.surname));
    dispatch(setGuestEmail(data.email));
    dispatch(setGuestPhone(data.phoneNumber));

    // Show success message
    setIsSubmitted(true);

    // Hide success message after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
      <h3 className="text-lg font-medium text-gray-800">Misafir Bilgileri</h3>
      <p className="text-sm text-darkgray mb-4">
        Siparişinizi oluşturmak için lütfen aşağıdaki bilgileri doldurun.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-darkgray mb-1">
            İsim
          </label>
          <input
            {...register("name")}
            id="name"
            placeholder="İsminiz"
            className="w-full px-3 py-2 border border-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red focus:border-red"
          />
          {errors?.name?.message && (
            <p className="mt-1 text-sm text-red">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="surname" className="block text-sm font-medium text-darkgray mb-1">
            Soyisim
          </label>
          <input
            {...register("surname")}
            id="surname"
            placeholder="Soyisminiz"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red focus:border-red"
          />
          {errors?.surname?.message && (
            <p className="mt-1 text-sm text-red">{errors.surname.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-darkgray mb-1">
            E-posta Adresi
          </label>
          <input
            {...register("email")}
            id="email"
            type="email"
            placeholder="E-posta adresiniz"
            className="w-full px-3 py-2 border border-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red focus:border-red"
          />
          {errors?.email?.message && (
            <p className="mt-1 text-sm text-red">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-darkgray mb-1">
            Telefon Numarası
          </label>
          <input
            {...register("phoneNumber")}
            id="phoneNumber"
            placeholder="05XX XXX XX XX"
            className="w-full px-3 py-2 border border-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red focus:border-red"
          />
          {errors?.phoneNumber?.message && (
            <p className="mt-1 text-sm text-red">{errors.phoneNumber.message}</p>
          )}
        </div>
      </div>

      {/* Başarı mesajı */}
      {isSubmitted && (
        <div className="p-3 bg-green-50 text-green-800 rounded-md border border-green-200">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Bilgileriniz başarıyla kaydedildi!</span>
          </div>
        </div>
      )}

      {/* Kaydet butonu */}
      <div className="mt-4">
        <button
          type="submit"
          className="w-full py-2 bg-yellow text-red font-semibold rounded-md hover:bg-red hover:text-yellow transition-colors"
        >
          Bilgileri Kaydet
        </button>
      </div>
    </form>
  );
};

export default GuestInfoForm;