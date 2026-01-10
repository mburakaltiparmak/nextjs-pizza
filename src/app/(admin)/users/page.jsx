import UsersClient from "./UsersClient";

export const metadata = {
    title: "Kullanıcılar",
    description: "Kullanıcıları ve rollerini yönetin.",
};

export default function UsersPage() {
    return <UsersClient />;
}
