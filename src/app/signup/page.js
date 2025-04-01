"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/store/actions/userActions";
import Link from "next/link";

const SignupPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Redux state
  const loading = useSelector((state) => state.global.loading);
  const error = useSelector((state) => state.global.error);
  const success = useSelector((state) => state.global.success);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  
  // Form validation state
  const [formErrors, setFormErrors] = useState({});
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Ad alanı zorunludur";
    }
    
    if (!formData.surname.trim()) {
      errors.surname = "Soyad alanı zorunludur";
    }
    
    if (!formData.email.trim()) {
      errors.email = "E-posta alanı zorunludur";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Geçerli bir e-posta adresi giriniz";
    }
    
    if (!formData.username.trim()) {
      errors.username = "Kullanıcı adı zorunludur";
    } else if (formData.username.length < 4) {
      errors.username = "Kullanıcı adı en az 4 karakter olmalıdır";
    }
    
    if (!formData.password) {
      errors.password = "Şifre alanı zorunludur";
    } else if (formData.password.length < 6) {
      errors.password = "Şifre en az 6 karakter olmalıdır";
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Şifreler eşleşmiyor";
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Telefon numarası zorunludur";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Prepare registration data - Backend'in beklediği alan adlarıyla
      const userData = {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      };
      
      try {
        // İstek gönderilmeden önce veriyi konsola yazdır (Debug)
        console.log("Gönderilecek kayıt verisi:", userData);
        
        // Dispatch register action
        const result = await dispatch(registerUser(userData));
        
        if (!result.error) {
          // Kayıt başarılı, login sayfasına yönlendir
          
        }
      } catch (err) {
        console.error("Kayıt işlemi sırasında hata:", err);
      }
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-red py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4 bg-lightgray p-10 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-darkgray font-Londrina_Solid">
            Yeni Hesap Oluştur
          </h2>
          <p className="mt-2 text-center text-sm text-darkgray font-Barlow ">
            Zaten bir hesabınız var mı?{" "}
            <Link
              href="/login"
              className="font-semibold leading-4 text-yellow hover:text-red"
            >
              Giriş Yap
            </Link>
          </p>
        </div>
        
        {error && (
          <div
            className="bg-red border border-red text-lightgray px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {success && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 rounded-md shadow-sm -space-y-px">
            <div className="grid grid-cols-2 gap-4">
              {/* Ad */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-darkgray font-Barlow"
                >
                  Ad
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                    formErrors.name ? "border-red" : "border-gray"
                  } placeholder-gray-500 text-darkgray focus:outline-none focus:ring-red focus:border-red focus:z-10 sm:text-sm font-Barlow`}
                  placeholder="Adınız"
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red font-Barlow">
                    {formErrors.name}
                  </p>
                )}
              </div>
              
              {/* Soyad */}
              <div>
                <label
                  htmlFor="surname"
                  className="block text-sm font-medium text-darkgray font-Barlow"
                >
                  Soyad
                </label>
                <input
                  id="surname"
                  name="surname"
                  type="text"
                  value={formData.surname}
                  onChange={handleChange}
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                    formErrors.surname ? "border-red" : "border-gray-300"
                  } placeholder-gray-500 text-darkgray focus:outline-none focus:ring-red focus:border-red focus:z-10 sm:text-sm font-Barlow`}
                  placeholder="Soyadınız"
                />
                {formErrors.surname && (
                  <p className="mt-1 text-xs text-red font-Barlow">
                    {formErrors.surname}
                  </p>
                )}
              </div>
            </div>
            
            {/* E-posta */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-darkgray font-Barlow"
              >
                E-posta Adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  formErrors.email ? "border-red" : "border-gray-300"
                } placeholder-gray-500 text-darkgray focus:outline-none focus:ring-red focus:border-red focus:z-10 sm:text-sm font-Barlow`}
                placeholder="E-posta adresiniz"
              />
              {formErrors.email && (
                <p className="mt-1 text-xs text-red font-Barlow">
                  {formErrors.email}
                </p>
              )}
            </div>
            
            {/* Kullanıcı Adı */}
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-darkgray font-Barlow"
              >
                Kullanıcı Adı
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  formErrors.username ? "border-red" : "border-gray-300"
                } placeholder-gray-500 text-darkgray focus:outline-none focus:ring-red focus:border-red focus:z-10 sm:text-sm font-Barlow`}
                placeholder="Kullanıcı adınız"
              />
              {formErrors.username && (
                <p className="mt-1 text-xs text-red font-Barlow">
                  {formErrors.username}
                </p>
              )}
            </div>
            
            {/* Telefon Numarası */}
            <div className="mb-4">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-darkgray font-Barlow"
              >
                Telefon Numarası
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  formErrors.phoneNumber ? "border-red" : "border-gray-300"
                } placeholder-gray-500 text-darkgray focus:outline-none focus:ring-red focus:border-red focus:z-10 sm:text-sm font-Barlow`}
                placeholder="Telefon numaranız"
              />
              {formErrors.phoneNumber && (
                <p className="mt-1 text-xs text-red font-Barlow">
                  {formErrors.phoneNumber}
                </p>
              )}
            </div>
            
            {/* Şifre */}
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-darkgray font-Barlow"
              >
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  formErrors.password ? "border-red" : "border-gray-300"
                } placeholder-gray-500 text-darkgray focus:outline-none focus:ring-red focus:border-red focus:z-10 sm:text-sm font-Barlow`}
                placeholder="Şifreniz"
              />
              {formErrors.password && (
                <p className="mt-1 text-xs text-red font-Barlow">
                  {formErrors.password}
                </p>
              )}
            </div>
            
            {/* Şifre Onayı */}
            <div className="mb-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-darkgray font-Barlow"
              >
                Şifre Onayı
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  formErrors.confirmPassword ? "border-red" : "border-gray-300"
                } placeholder-gray-500 text-darkgray focus:outline-none focus:ring-red focus:border-red focus:z-10 sm:text-sm font-Barlow`}
                placeholder="Şifrenizi tekrar girin"
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red font-Barlow">
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-lightgray bg-red hover:bg-yellow hover:text-red focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red font-Barlow ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;