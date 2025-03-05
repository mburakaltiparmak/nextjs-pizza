export const metadata = {
  title: "Login - Teknolojik Yemekler",
  description: "Login",
};

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red">
      {children}
    </div>
  );
}