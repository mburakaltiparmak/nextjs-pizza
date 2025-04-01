"use client";

import Navbar from "@/components/admin/navbar";
import Sidebar from "@/components/admin/sidebar";
import {
  ErrorMessage,
  LoadingSpinner,
  NotificationManager,
} from "@/components/admin/notify";
import { useState, useEffect } from "react";
import Loading from "../loading";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { userRoles } from "@/lib/store/constants"; // userRoles sabitini import ediyoruz

// Client-side Admin Layout bileşeni
const AdminLayoutClient = ({ children }) => {
  // Client-side mount kontrolü
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isLogin, role, status } = useSelector(state => state.user);
  
  useEffect(() => {
    // Kullanıcı giriş yapmamışsa
    if (!isLogin) {
      router.push('/login');
      return;
    }
    
    // Kullanıcı rolü ADMIN veya PERSONAL değilse
    const allowedRoles = [userRoles.ADMIN, userRoles.PERSONAL];
    if (!allowedRoles.includes(role)) {
      // Yetkisiz erişim, ana sayfaya yönlendir
      router.push('/');
      return;
    }
  }, [isLogin, role, router]);
  
  // Giriş yapmamışsa veya rol ADMIN ya da PERSONAL değilse yükleme göster
  if (!isLogin || ![userRoles.ADMIN, userRoles.PERSONAL].includes(role)) {
    return <Loading />;
  }
  
  // URL yolundan aktif sayfayı belirle
  const getActivePageFromPath = (path) => {
    if (path.includes("/dashboard")) return "dashboard";
    if (path.includes("/category")) return "category";
    if (path.includes("/product")) return "product";
    if (path.includes("/orders")) return "orders";
    if (path.includes("/users")) return "users";
    return "dashboard"; // varsayılan
  };

  const activePage = getActivePageFromPath(pathname);

  useEffect(() => {
    setIsMounted(true);

    // Global bir işleyici oluşturarak butondan modal açma işlemini yapalım
    if (typeof window !== "undefined") {
      window.openAdminModal = () => {
        // Sayfaya özel modal açma işlevlerini kontrol edelim
        const pageComponent = document.getElementById("admin-page-component");
        if (pageComponent && pageComponent.openModal) {
          pageComponent.openModal();
        } else {
          console.log("Modal açma fonksiyonu bulunamadı");
        }
      };
    }
  }, []);

  // Client-side mount tamamlanana kadar boş bir div göster
  if (!isMounted) {
    return <div className="flex h-screen bg-lightgray"></div>;
  }

  // Sayfa özelliklerini almak için children'ı kontrol edelim
  let pageProps = {};
  if (children?.props?.pageProps) {
    pageProps = children.props.pageProps;
  } else if (children?.type?.props) {
    pageProps = children.type.props;
  }

  // Sayfa başlığını belirle
  const pageTitle = pageProps.title || "Admin Panel";
  
  // URL'ye ve sayfa başlığına göre buton gösterilip gösterilmeyeceğini belirle
  const showAddButton = 
    pathname.includes("/category") || 
    pathname.includes("/product") || 
    pageTitle === "Kategoriler" || 
    pageTitle === "Ürünler" || 
    pageProps.showAddButton === true;

  console.log("Current pathname:", pathname);
  console.log("showAddButton:", showAddButton);

  return (
    <div className="flex h-screen font-Quattrocento_Sans bg-lightgray">
      {/* Sidebar - URL'den tespit ettiğimiz aktif sayfayı geçiyoruz */}
      <Sidebar activePage={activePage} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar - Başlık ve düğme özelliklerini props'tan alıyoruz */}
        <Navbar
          title={pageTitle}
          showAddButton={showAddButton}
          addButtonText={pageProps.addButtonText || "Yeni Ekle"}
          onAddButtonClick={() => {
            if (window.openAdminModal) {
              window.openAdminModal();
            }
          }}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Bildirimler */}
          {pageProps.notifications && pageProps.notifications.length > 0 && (
            <NotificationManager
              notifications={pageProps.notifications}
              onClose={pageProps.onNotificationClose}
            />
          )}

          {pageProps.loading ? (
            <Loading />
          ) : pageProps.error ? (
            <ErrorMessage error={pageProps.error} />
          ) : (
            <div id="admin-page-component">{children}</div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLayoutClient;