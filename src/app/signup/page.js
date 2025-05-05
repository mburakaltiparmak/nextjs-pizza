"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { registerUser } from "@/lib/store/actions/userActions";
import Link from "next/link";
import SecondaryLoading from "@/components/secondaryLoading";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useToast } from "@/lib/hooks/useToast"; // Özel toast hook'unu import ediyoruz

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [localError, setLocalError] = useState("");
  const [touched, setTouched] = useState({
    name: false,
    surname: false,
    email: false,
    phoneNumber: false,
    password: false,
    confirmPassword: false,
  });
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { warning, error } = useToast(); // Özel toast hook'unu kullanıyoruz

  const loading = useAppSelector((state) => state.global.loading);
  const isSuccess = useAppSelector((state) => state.global.success);

  // Validate each field
  const fieldValidations = useMemo(() => {
    const { name, surname, email, phoneNumber, password, confirmPassword } =
      formData;

    // Email kontrol - sadece gmail.com kabul ediliyor
    const isGmailAddress = email.endsWith("@gmail.com");
    const isValidEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    return {
      name: name.trim() !== "",
      surname: surname.trim() !== "",
      email: isValidEmailFormat && isGmailAddress, // Sadece gmail.com kabul ediliyor
      phoneNumber: /^\d{1,11}$/.test(phoneNumber), // sadece sayılar ve en fazla 11 hane
      password: password.length >= 6,
      confirmPassword: password === confirmPassword && password.length >= 6,
    };
  }, [formData]);

  // Check if the entire form is valid
  const isFormValid = useMemo(() => {
    return Object.values(fieldValidations).every((validation) => validation);
  }, [fieldValidations]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Mark the field as touched
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Email alanı değiştirildiğinde ve gmail.com ile bitmiyorsa uyarı göster
    if (
      name === "email" &&
      value.includes("@") &&
      !value.endsWith("@gmail.com") &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      warning(
        "Şu anda sadece Gmail uzantılı e-posta adreslerini kabul edebiliyoruz.",
        {
          duration: 5000,
        }
      );
    }

    // Clear any previous error
    if (localError) {
      setLocalError("");
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Email alanından çıkıldığında ve gmail.com ile bitmiyorsa uyarı göster
    if (
      name === "email" &&
      value.includes("@") &&
      !value.endsWith("@gmail.com") &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      warning(
        "Şu anda sadece Gmail uzantılı e-posta adreslerini kabul edebiliyoruz.",
        {
          duration: 5000,
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation before submission
    const isValid = Object.entries(fieldValidations).every(
      ([field, isValid]) => {
        if (!isValid) {
          setTouched((prev) => ({
            ...prev,
            [field]: true,
          }));
        }
        return isValid;
      }
    );

    if (!isValid) {
      return;
    }

    // Email Gmail kontrolü
    if (!formData.email.endsWith("@gmail.com")) {
      error(
        "Şu anda sadece Gmail uzantılı e-posta adreslerini kabul edebiliyoruz.",
        {
          duration: 5000,
        }
      );
      return;
    }

    // Şifre tekrarını formdan çıkar
    const { confirmPassword, ...registerData } = formData;

    try {
      // Kayıt işlemini gerçekleştir
      const result = await dispatch(registerUser(registerData));

      // Eğer sonuç bir hata içeriyorsa
      if (result && result.error) {
        // Özel hata mesajları
        const errorMap = {
          "Bu email zaten kullanılıyor":
            "Bu e-posta adresi zaten kayıtlı. Farklı bir e-posta adresi kullanın veya giriş yapın.",
          default: "Kayıt işlemi sırasında bir hata oluştu",
        };

        setLocalError(errorMap[result.error] || errorMap.default);
      } else {
        router.push("/signup/success");
      }
    } catch (error) {
      console.error("Kayıt sırasında beklenmeyen bir hata oluştu:", error);
      setLocalError("Kayıt işlemi sırasında beklenmeyen bir hata oluştu");
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-red min-h-screen">
      <Header />
      <ToastContainer position="top-right" />
      <div className="flex flex-col items-center font-Barlow p-4 max-md:px-8">
        <div className="bg-yellow shadow-md rounded-lg max-w-md mx-auto p-8 max-md:p-4 w-full ">
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-red ">
            Hesap Oluştur
          </h2>
          <p className="mt-2 text-center text-sm text-gray-800 font-Quattrocento_Sans">
            Zaten üye misiniz?{" "}
            <Link
              href="/login"
              className="font-semibold text-red hover:text-red-700"
            >
              Giriş yapın
            </Link>
          </p>

          {localError && (
            <div className="bg-red p-3 rounded-md mt-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-white text-sm">{localError}</p>
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  İsim
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="given-name"
                  required
                  placeholder="John"
                  className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none sm:text-sm ${
                    touched.name && !fieldValidations.name
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-red focus:ring-red"
                  }`}
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                />
                {touched.name && !fieldValidations.name && (
                  <p className="text-red-500 text-xs mt-1">İsim zorunludur</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="surname"
                  className="block text-sm font-medium text-gray-700"
                >
                  Soyisim
                </label>
                <input
                  id="surname"
                  name="surname"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Doe"
                  required
                  className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none sm:text-sm ${
                    touched.surname && !fieldValidations.surname
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-red focus:ring-red"
                  }`}
                  value={formData.surname}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                />
                {touched.surname && !fieldValidations.surname && (
                  <p className="text-red-500 text-xs mt-1">
                    Soyisim zorunludur
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                E-posta Adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="example@gmail.com"
                required
                className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none sm:text-sm ${
                  touched.email && !fieldValidations.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-red focus:ring-red"
                }`}
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
              />
              {touched.email && !fieldValidations.email && (
                <p className="text-red-500 text-xs mt-1">
                  Geçerli bir Gmail adresi girin
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Telefon Numarası
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                placeholder="05*********"
                required
                className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none sm:text-sm ${
                  touched.phoneNumber && !fieldValidations.phoneNumber
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-red focus:ring-red"
                }`}
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
              />
              {touched.phoneNumber && !fieldValidations.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">
                  Geçerli bir telefon numarası giriniz.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="En az 8 karakter olacak şekilde şifrenizi giriniz."
                autoComplete="new-password"
                required
                className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none sm:text-sm ${
                  touched.password && !fieldValidations.password
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-red focus:ring-red"
                }`}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
              />
              {touched.password && !fieldValidations.password && (
                <p className="text-red-500 text-xs mt-1">
                  Şifre en az 8 karakter olmalıdır
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Şifre Tekrar
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Şifrenizi tekrar giriniz."
                className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none sm:text-sm ${
                  touched.confirmPassword && !fieldValidations.confirmPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-red focus:ring-red"
                }`}
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
              />
              {touched.confirmPassword && !fieldValidations.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Şifreler eşleşmiyor</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  !isFormValid || loading
                    ? "bg-red cursor-not-allowed hover:ring-2 hover:ring-offset-2 hover:ring-red"
                    : "bg-green-800 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red"
                }`}
                disabled={!isFormValid || loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <SecondaryLoading size="small" />
                    <span className="ml-2">İşleniyor...</span>
                  </div>
                ) : (
                  "Kaydol"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
