// AdminLayoutClient.jsx
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
import { userRoles } from "@/lib/store/constants";

const AdminLayoutClient = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isLogin, role, status } = useSelector((state) => state.user);

  // URL yolundan aktif sayfayı belirle
  const getActivePageFromPath = (path) => {
    if (path.includes("/dashboard")) return "dashboard";
    if (path.includes("/category")) return "category";
    if (path.includes("/product")) return "product";
    if (path.includes("/orders-admin")) return "orders-admin";
    if (path.includes("/users")) return "users";
    return "dashboard"; // varsayılan
  };

  // Aktif sayfayı burada belirleyelim
  const activePage = getActivePageFromPath(pathname);

  // Mobil cihaz kontrolü
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // İlk kontrol
    checkMobile();

    // Resize olayını dinle
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auth kontrolü ve diğer useEffect'ler aynı...
  useEffect(() => {
    // Client-side mount olduğunu işaretle
    setIsMounted(true);

    // Kullanıcı giriş yapmamışsa
    if (!isLogin) {
      router.push("/login");
      return;
    }

    // Kullanıcı rolü ADMIN veya PERSONAL değilse
    const allowedRoles = [userRoles.ADMIN, userRoles.PERSONAL];
    if (!allowedRoles.includes(role)) {
      // Yetkisiz erişim, ana sayfaya yönlendir
      router.push("/");
      return;
    }

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

    // Temizleme işlevi
    return () => {
      if (typeof window !== "undefined" && window.openAdminModal) {
        window.openAdminModal = undefined;
      }
    };
  }, [isLogin, role, router]);

  // Diğer kontroller...
  if (
    !isMounted ||
    !isLogin ||
    ![userRoles.ADMIN, userRoles.PERSONAL].includes(role)
  ) {
    return <Loading />;
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

  return (
    <div className="flex flex-col md:flex-row h-screen font-Quattrocento_Sans bg-lightgray">
      {/* Sidebar - artık activePage tanımlı olduğundan hata vermeyecek */}
      <Sidebar activePage={activePage} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Navbar - isMobile durumunu iletiyoruz */}
        <Navbar
          title={pageTitle}
          showAddButton={showAddButton}
          addButtonText={pageProps.addButtonText || "Yeni Ekle"}
          onAddButtonClick={() => {
            if (typeof window !== "undefined" && window.openAdminModal) {
              window.openAdminModal();
            }
          }}
          isMobile={isMobile}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 md:p-6">
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
            <div id="admin-page-component" className="mt-4 md:mt-0">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLayoutClient;
