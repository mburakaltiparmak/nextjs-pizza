"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { initiateGoogleLogin, registerUser } from "@/lib/store/actions/userActions";
import Link from "next/link";
import SecondaryLoading from "@/components/secondaryLoading";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { useToast } from "@/hooks/use-toast"; // Import the toast hook

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
  const { toast } = useToast(); // Initialize the toast hook

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
      toast({
        title: "Uyarı",
        description: "Şu anda sadece Gmail uzantılı e-posta adreslerini kabul edebiliyoruz.",
        type: "warning",
        duration: 5000,
      });
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
      toast({
        title: "Uyarı",
        description: "Şu anda sadece Gmail uzantılı e-posta adreslerini kabul edebiliyoruz.",
        type: "warning",
        duration: 5000,
      });
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
      toast({
        title: "Hata",
        description: "Şu anda sadece Gmail uzantılı e-posta adreslerini kabul edebiliyoruz.",
        type: "error",
        duration: 5000,
      });
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

        const errorMessage = errorMap[result.error] || errorMap.default;
        setLocalError(errorMessage);
        toast({
          title: "Hata",
          description: errorMessage,
          type: "error",
          duration: 5000,
        });
      } else {
        toast({
          title: "Başarılı",
          description: "Kayıt işlemi başarıyla tamamlandı!",
          type: "success",
          duration: 3000,
        });
        router.push("/signup/success");
      }
    } catch (error) {
      console.error("Kayıt sırasında beklenmeyen bir hata oluştu:", error);
      const errorMessage = "Kayıt işlemi sırasında beklenmeyen bir hata oluştu";
      setLocalError(errorMessage);
      toast({
        title: "Hata",
        description: errorMessage,
        type: "error",
        duration: 5000,
      });
    }
  };
  const handleGoogleLogin = () => {
      // Google girişine başlamadan önce rememberMe tercihini localStorage'a kaydet
      localStorage.setItem("rememberMe",true);
      dispatch(initiateGoogleLogin());
    };

  return (
    <div className="flex flex-col gap-4 bg-red min-h-screen">
      <Header />
      {/* ToastContainer position="top-right" is now handled by the toast hook */}
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
            <div className="space-y-4">
  {/* Kaydol Buttonu */}
  <button
    type="submit"
    className={`w-full flex justify-center items-center py-3 px-4 rounded-md text-sm font-semibold transition-all duration-200 ${
      !isFormValid || loading
        ? "bg-red bg-opacity-50 text-white cursor-not-allowed"
        : "bg-green-700 text-white hover:bg-green-600 hover:shadow-md"
    }`}
    disabled={!isFormValid || loading}
  >
    {loading ? (
      <div className="flex items-center justify-center">
        <SecondaryLoading size="small" />
        <span className="ml-2">İşleniyor...</span>
      </div>
    ) : (
      "Kaydol"
    )}
  </button>

  {/* Google ile Giriş Yap Buttonu */}
  <button
    type="button"
    onClick={handleGoogleLogin}
    disabled={loading}
    className={`w-full flex justify-center items-center py-3 px-4 rounded-md text-sm font-semibold transition-all duration-200 bg-white text-darkgray border border-gray hover:bg-red hover:text-white hover:border-white hover:shadow-md ${
      loading ? "opacity-50 cursor-not-allowed" : ""
    }`}
  >
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
      <path fill="none" d="M1 1h22v22H1z" />
    </svg>
    Google ile Giriş Yap
  </button>
</div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}