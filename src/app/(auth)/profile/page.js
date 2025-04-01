"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { 
  checkAuthStatus, 
  fetchUserProfile, 
  updateUserProfile, 
  changePassword 
} from "@/lib/store/actions/userActions";
import { setError, setLoading, setSuccess, clearMessages } from "@/lib/store/actions/globalActions";
import { fetchStates } from "@/lib/store/constants";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faLock, faEdit, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription,
  AlertDialogFooter 
} from "@/components/ui/alert-dialog";
import SecondaryLoading from "@/components/secondaryLoading";

const ProfilePage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  // Redux state
  const isLogin = useSelector((state) => state.user.isLogin);
  const userEmail = useSelector((state) => state.user.email);
  const userProfile = useSelector((state) => state.user.profile);
  const userFetchState = useSelector((state) => state.user.fetchState);
  const loading = useSelector((state) => state.global.loading);
  const error = useSelector((state) => state.global.error);
  const success = useSelector((state) => state.global.success);
  
  // Local state
  const [passwordAlertDialog, setPasswordAlertDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  // Kullanıcının giriş durumunu kontrol et
  useEffect(() => {
    const authCheck = async () => {
      const authStatus = dispatch(checkAuthStatus());
      
      if (!authStatus && !isLogin) {
        router.push("/login");
        return;
      } 
      
      // Profil bilgileri henüz yüklenmemişse
      if (userFetchState === fetchStates.NOT_FETCHED || !userProfile) {
        try {
          // Profil bilgilerini getir
          await dispatch(fetchUserProfile());
        } catch (error) {
          console.error("Profil bilgileri alınamadı:", error);
        }
      }
    };
    
    authCheck();
  }, [dispatch, isLogin, userFetchState, router, userProfile]);

  // Bileşen yüklendiğinde formData'yı mevcut kullanıcı verileriyle doldur
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        surname: userProfile.surname || "",
        email: userProfile.email || userEmail || "",
      });
    }
  }, [userProfile, userEmail]);

  // Toast mesajları için
  useEffect(() => {
    if (error) {
      toast({
        title: "Hata",
        description: error,
        variant: "destructive",
      });
      
      // Hata mesajını temizle
      setTimeout(() => {
        dispatch(clearMessages());
      }, 100);
    }
    
    if (success) {
      toast({
        title: "Başarılı",
        description: success,
      });
      
      // Başarı mesajını temizle
      setTimeout(() => {
        dispatch(clearMessages());
      }, 100);
    }
  }, [error, success, dispatch, toast]);

  // Form değişikliklerini işle
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // İlgili alanın hatasını temizle
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Şifre form değişikliklerini işle
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
    
    // İlgili alanın hatasını temizle
    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: "",
      });
    }
  };

  // Profil formu doğrulama
  const validateProfileForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "İsim gerekli";
    }
    
    if (!formData.surname.trim()) {
      errors.surname = "Soyisim gerekli";
    }
    
    if (!formData.email.trim()) {
      errors.email = "E-posta gerekli";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Geçerli bir e-posta adresi girin";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Şifre formu doğrulama
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = "Mevcut şifre gerekli";
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = "Yeni şifre gerekli";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Şifre en az 6 karakter olmalıdır";
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Şifre tekrarı gerekli";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Şifreler eşleşmiyor";
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Profil güncelleme
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    // Backend'e gönderilecek kullanıcı verilerini hazırla
    // Mevcut kullanıcı profili ile yeni form verilerini birleştir
    const updatedUserData = {
      ...userProfile, // Mevcut profil bilgilerini koru
      name: formData.name,
      surname: formData.surname,
      email: formData.email,
    };
    
    const result = await dispatch(updateUserProfile(updatedUserData));
    
    if (!result.error) {
      setEditMode(false);
    }
  };

  // Şifre güncelleme
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    const result = await dispatch(changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    }));
    
    if (!result.error) {
      // Şifre başarıyla değiştirildi
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
      setPasswordAlertDialog(false);
    }
  };

  // Yükleniyor durumu
  if (userFetchState === fetchStates.FETCHING || (userFetchState === fetchStates.NOT_FETCHED && isLogin)) {
    return <SecondaryLoading size="fullPage" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-darkgray font-Quattrocento_Sans mb-8">Hesabım</h1>
        
        <Tabs defaultValue="profile" className="w-full font-Barlow">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="profile" className="flex-1 text-darkgray">Profil Bilgilerim</TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 text-darkgray">Siparişlerim</TabsTrigger>
          </TabsList>
          
          {/* Profil Bilgileri Tab */}
          <TabsContent value="profile">
            <Card className="border-gray">
              <CardHeader>
                <CardTitle className="text-darkgray font-Quattrocento_Sans">Profil Bilgileri</CardTitle>
                <CardDescription className="text-gray font-Barlow">
                  Hesap bilgilerinizi buradan görüntüleyebilir ve güncelleyebilirsiniz.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleUpdateProfile}>
                  <div className="grid gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                      <div className="w-24 h-24 rounded-full bg-lightgray flex items-center justify-center text-red">
                        <FontAwesomeIcon icon={faUser} size="3x" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-darkgray font-Quattrocento_Sans">{userProfile?.name} {userProfile?.surname}</h3>
                        <p className="text-darkgray font-Barlow">{userProfile?.email || userEmail}</p>
                        <p className="text-sm text-gray mt-1 font-Barlow">
                          Üyelik Tarihi: {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="flex items-center text-darkgray font-Quattrocento_Sans">
                            <span>İsim</span>
                            {formErrors.name && <span className="text-red text-xs ml-2">{formErrors.name}</span>}
                          </Label>
                          <div className="flex items-center mt-1">
                            <FontAwesomeIcon icon={faUser} className="text-gray mr-2" />
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              disabled={!editMode}
                              className={`${formErrors.name ? "border-red" : "border-gray"} text-darkgray font-Barlow`}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="surname" className="flex items-center text-darkgray font-Quattrocento_Sans">
                            <span>Soyisim</span>
                            {formErrors.surname && <span className="text-red text-xs ml-2">{formErrors.surname}</span>}
                          </Label>
                          <div className="flex items-center mt-1">
                            <FontAwesomeIcon icon={faUser} className="text-gray mr-2" />
                            <Input
                              id="surname"
                              name="surname"
                              value={formData.surname}
                              onChange={handleInputChange}
                              disabled={!editMode}
                              className={`${formErrors.surname ? "border-red" : "border-gray"} text-darkgray font-Barlow`}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="email" className="flex items-center text-darkgray font-Quattrocento_Sans">
                          <span>E-posta</span>
                          {formErrors.email && <span className="text-red text-xs ml-2">{formErrors.email}</span>}
                        </Label>
                        <div className="flex items-center mt-1">
                          <FontAwesomeIcon icon={faEnvelope} className="text-gray mr-2" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className={`${formErrors.email ? "border-red" : "border-gray"} text-darkgray font-Barlow`}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setPasswordAlertDialog(true)}
                          className="w-full md:w-auto mt-2 border-red text-red hover:bg-red hover:text-lightgray font-Barlow"
                        >
                          <FontAwesomeIcon icon={faLock} className="mr-2" />
                          Şifre Değiştir
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {editMode && (
                    <div className="flex justify-end space-x-2 mt-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setEditMode(false);
                          // Form verilerini kullanıcı verilerine geri döndür
                          setFormData({
                            name: userProfile?.name || "",
                            surname: userProfile?.surname || "",
                            email: userProfile?.email || userEmail || "",
                          });
                          setFormErrors({});
                        }}
                        className="border-gray text-darkgray hover:bg-gray hover:text-lightgray font-Barlow"
                      >
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        İptal
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="bg-red text-lightgray hover:bg-yellow hover:text-red font-Barlow"
                      >
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        {loading ? "Kaydediliyor..." : "Kaydet"}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
              
              <CardFooter className={`flex ${editMode ? 'justify-between' : 'justify-end'} pt-0`}>
                {!editMode && (
                  <Button 
                    onClick={() => setEditMode(true)}
                    className="bg-red text-lightgray hover:bg-yellow hover:text-red font-Barlow"
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-2" />
                    Düzenle
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Siparişlerim Tab */}
          <TabsContent value="orders">
            <Card className="border-gray">
              <CardHeader>
                <CardTitle className="text-darkgray font-Quattrocento_Sans">Siparişlerim</CardTitle>
                <CardDescription className="text-gray font-Barlow">
                  Önceki siparişlerinizi burada görüntüleyebilirsiniz.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray font-Barlow">
                  <p>Henüz bir sipariş vermemişsiniz.</p>
                  <Button 
                    onClick={() => router.push("/")}
                    className="mt-4 bg-red text-lightgray hover:bg-yellow hover:text-red font-Barlow"
                  >
                    Alışverişe Başla
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Şifre Değiştirme AlertDialog */}
      <AlertDialog open={passwordAlertDialog} onOpenChange={setPasswordAlertDialog}>
        <AlertDialogContent className="font-Barlow border-gray">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-darkgray font-Quattrocento_Sans">Şifre Değiştir</AlertDialogTitle>
            <AlertDialogDescription className="text-gray">
              Güvenliğiniz için düzenli olarak şifrenizi değiştirmenizi öneririz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <form onSubmit={handleChangePassword}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="currentPassword" className="flex items-center text-darkgray font-Quattrocento_Sans">
                  <span>Mevcut Şifre</span>
                  {passwordErrors.currentPassword && (
                    <span className="text-red text-xs ml-2">{passwordErrors.currentPassword}</span>
                  )}
                </Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`${passwordErrors.currentPassword ? "border-red" : "border-gray"} text-darkgray`}
                />
              </div>
              
              <div>
                <Label htmlFor="newPassword" className="flex items-center text-darkgray font-Quattrocento_Sans">
                  <span>Yeni Şifre</span>
                  {passwordErrors.newPassword && (
                    <span className="text-red text-xs ml-2">{passwordErrors.newPassword}</span>
                  )}
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`${passwordErrors.newPassword ? "border-red" : "border-gray"} text-darkgray`}
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword" className="flex items-center text-darkgray font-Quattrocento_Sans">
                  <span>Yeni Şifre (Tekrar)</span>
                  {passwordErrors.confirmPassword && (
                    <span className="text-red text-xs ml-2">{passwordErrors.confirmPassword}</span>
                  )}
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`${passwordErrors.confirmPassword ? "border-red" : "border-gray"} text-darkgray`}
                />
              </div>
            </div>
            
            <AlertDialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setPasswordAlertDialog(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setPasswordErrors({});
                }}
                className="border-gray text-darkgray hover:bg-gray hover:text-lightgray"
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-red text-lightgray hover:bg-yellow hover:text-red"
              >
                {loading ? "İşleniyor..." : "Şifremi Değiştir"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfilePage;