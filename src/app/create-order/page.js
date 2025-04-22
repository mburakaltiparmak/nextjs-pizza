"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useToast } from "@/hooks/use-toast";
import { Check, User, ShoppingCart, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/header.js";
import Footer from "@/components/footer.js";
import FirstStep from "@/components/create-order-components/firstStep.jsx";
import SecondStep from "@/components/create-order-components/secondStep.jsx";
import ThirdStep from "@/components/create-order-components/thirdStep.jsx";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt, faUserPlus, faUserEdit, faShoppingBag, faUserTie, faGoogle } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { AUTH_ERRORS } from "@/lib/authErrorMessages"; // güvenli hata mesajları için
import { Separator } from "@/components/ui/separator";
import { setUserRole } from "@/lib/store/actions/userActions";


const Page = () => {
  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.order.cart);
  const role = useAppSelector((state)=>state.user.role);
  const loading = useAppSelector((state)=>state.global.loading);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [step1, setStep1] = useState(false);
  const [step2, setStep2] = useState(false);
  const [step3, setStep3] = useState(false);
  const [email,setEmail]=useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMeState] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Boş sepet kontrolünü useEffect içinde yap
  useEffect(() => {
    if (cart.length <= 0) {
      toast({
        title: "Sepetiniz boş.",
        description: "Anasayfaya yönlendiriliyorsunuz.",
      });
      router.push("/");
    }
  }, [cart, router, toast]);

  // Define steps
  const steps = [
    { 
      id: 1, 
      title: "Kişisel Bilgiler", 
      icon: <User className="w-5 h-5" />,
      completed: step1,
      disabled: !cart || cart.length <= 0
    },
    { 
      id: 2, 
      title: "Sipariş Özeti", 
      icon: <ShoppingCart className="w-5 h-5" />,
      completed: step2,
      disabled: !step1
    },
    { 
      id: 3, 
      title: "Ödeme", 
      icon: <CreditCard className="w-5 h-5" />,
      completed: step3,
      disabled: !step1 || !step2
    }
  ];
  
  const totalSteps = steps.length;

  // Render current step component
  const displaySteps = () => {
    switch (currentStep) {
      case 1:
        return <FirstStep setCurrentStep={setCurrentStep} setStep1={setStep1} />;
      case 2:
        return <SecondStep setCurrentStep={setCurrentStep} setStep2={setStep2} />;
      case 3:
        return <ThirdStep setCurrentStep={setCurrentStep} setStep3={setStep3} />;
      default:
        return null;
    }
  };

  // Sepet boşsa ve yönlendirme bekleniyorsa yükleme göster
  if (cart.length <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  
    const handleInputChange = () => {
      if (errorMessage) {
        setErrorMessage("");
      }
    };
  
    const validateForm = () => {
      // Form doğrulama
      if (!email.trim()) {
        setErrorMessage("Email gereklidir");
        return false;
      }
      
      if (!password.trim()) {
        setErrorMessage("Şifre gereklidir");
        return false;
      }
      
      // Hata mesajını temizle
      setErrorMessage("");
      return true;
    };
  
    const handleLogin = async (e) => {
      e.preventDefault();
      
      // Form alanlarını doğrula
      if (!validateForm()) {
        return;
      }
  
      const formData = {
        username: email,
        password: password,
        rememberMe: rememberMe
      };
  
      try {
        const result = await dispatch(login(formData));
        
        if (result && result.error) {
          // Güvenli bir hata mesajı kullan
          setErrorMessage(AUTH_ERRORS.INVALID_CREDENTIALS);
        } else {
          toast({
            title: "Giriş başarılı!",
            description: "Hoş geldiniz.",
          });
          
          setLoginOpen(false);
          setEmail("");
          setPassword("");
          
          // rememberMe durumunu sıfırlama - kullanıcının tercihini koru
          // setRememberMeState(false);
        }
      } catch (err) {
        // Asla ham hataları gösterme, her zaman güvenli bir mesaj kullan
        console.error("Login error:", err);
        setErrorMessage(AUTH_ERRORS.LOGIN_FAILED);
      }
    };
  
    // Google ile giriş yapmak için
    const handleGoogleLogin = () => {
      // Google girişine başlamadan önce rememberMe tercihini localStorage'a kaydet
      localStorage.setItem("tempRememberMe", rememberMe ? "true" : "false");
      dispatch(initiateGoogleLogin());
      setLoginOpen(false);
    };
    // Misafir rolü sipariş yönetimi için
    const handleGuest = () => {
      dispatch(setUserRole("GUEST"));
    }
  
   

  return (
    <div className="min-h-screen">
      <Header />
      {role ? (
        <div className="container mx-auto max-w-3xl px-4 py-8">
        {/* Modern Stepper */}
        <div className="mb-8">
          <div className="relative">
            {/* Progress bar */}
            <div className="absolute bottom-10 left-2 h-1 bg-yellow w-full -translate-y-1/2" />
            <div 
              className="absolute bottom-10 left-2 h-1 bg-red transition-all duration-300 -translate-y-1/2" 
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
            
            {/* Steps */}
            <div className="relative flex justify-between font-Barlow">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div 
                    className={`flex items-center justify-center w-10 h-10 rounded-full z-10 transition-all ${
                      step.completed 
                        ? 'bg-red text-white' 
                        : step.id === currentStep 
                          ? 'bg-white border-2 border-red text-red' 
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}
                  >
                    {step.completed ? <Check className="w-5 h-5" /> : step.icon}
                  </div>
                  <span 
                    className={`mt-2 text-sm font-medium ${
                      step.id <= currentStep ? 'text-red' : 'text-black'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="mb-8">
          {displaySteps()}
        </div>
        
        {/* Navigation buttons are handled by individual step components */}
      </div>
      ) : (
      <div className="flex flex-col font-Barlow justify-center items-center py-4">
        <div className="flex flex-col gap-2 items-center border border-transparent px-16 py-8 rounded-lg z-50 bg-red shadow-black">
          <span>
          <h1 className="text-2xl font-semibold text-white">GİRİŞ YAP</h1>
          <Separator orientation="horizontal" />
          </span>
                <form className="mt-8 space-y-4 font-Barlow " onSubmit={handleLogin}>
                  <div className=" rounded-md shadow-sm">
                    <div>
                      <label htmlFor="email" className="sr-only">
                        Email
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="email"
                        required
                        disabled={loading}
                        className="relative block w-full rounded-t-md bg-yellow border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-black placeholder:text-black focus:z-10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
                        placeholder="Email adresiniz"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          handleInputChange();
                        }}
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="sr-only">
                        Şifre
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        disabled={loading}
                        className="relative block w-full bg-yellow rounded-b-md border-0 py-1.5 px-3 text-red ring-1 ring-inset ring-black placeholder:text-black focus:z-10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
                        placeholder="Şifreniz"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          handleInputChange();
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        disabled={loading}
                        className="h-4 w-4 rounded border-gray-300 text-red focus:ring-red"
                        checked={rememberMe}
                        onChange={(e) => setRememberMeState(e.target.checked)}
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm font-semibold text-white">
                        Beni Hatırla
                      </label>
                    </div>
                  </div>
                  <Separator orientation="horizontal" />
                  <div className="flex flex-col space-y-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`group relative flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red ring-1 ring-inset ring-black hover:z-10 hover:ring-2 ${
                        loading 
                          ? 'bg-red cursor-not-allowed' 
                          : 'bg-green-800 hover:bg-green-600'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <SecondaryLoading size="small" />
                          <span className="ml-2">Giriş Yapılıyor...</span>
                        </div>
                      ) : (
                        'Giriş Yap'
                      )}
                    </button>
                    
                    {/* Google ile giriş butonu */}
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="group relative flex w-full justify-center items-center rounded-md px-3 py-2 text-sm font-semibold bg-white text-red ring-1 ring-inset ring-black hover:z-10 hover:ring-2  hover:ring-black "
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
                    
                    <button
                      type="button"
                      onClick={() => {
                        setLoginOpen(false);
                        router.push("/signup");
                      }}
                      className="group relative flex w-full justify-center rounded-md  px-3 py-2 text-sm font-semibold text-darkred bg-yellow hover:bg-lightyellow ring-1 ring-inset ring-black hover:z-10 hover:ring-2"
                    >
                      <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                      Üye Ol
                    </button>
                    <button
                      type="button"
                      onClick={()=>handleGuest()}
                      className="group relative flex w-full justify-center px-3 py-2 text-sm font-semibold text-white hover:text-lightgray2 underline"
                    >
                      
                      Üye Olmadan Devam Et
                    </button>
                  </div>
                </form>
              </div>
        </div>
      )}
      
      
      <Footer />
    </div>
  );
};

export default Page;