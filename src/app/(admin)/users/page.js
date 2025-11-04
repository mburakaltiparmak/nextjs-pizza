"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  fetchAllUsers,
  fetchPendingUsers,
  approveUser,
  rejectUser,
  updateUserRole,
} from "@/lib/store/actions/adminActions";
import { fetchStates, userStatus, userRoles } from "@/lib/store/constants";
import { useToast } from "@/hooks/use-toast";
import {
  UserCheck,
  UserX,
  User,
  Check,
  X,
  Shield,
  AlertTriangle,
  Users,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SecondaryLoading from "@/components/secondaryLoading";

const UsersPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Redux state
  const allUsers = useSelector((state) => state.admin.allUsers);
  const pendingUsers = useSelector((state) => state.admin.pendingUsers);
  const adminFetchState = useSelector((state) => state.admin.fetchState);
  const error = useSelector((state) => state.global.error);
  const success = useSelector((state) => state.global.success);
  const loading = useSelector((state) => state.global.loading);

  // Local state
  const [activeTab, setActiveTab] = useState("all-users");
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch users when component mounts
  useEffect(() => {
    if (initialLoad) {
      console.log("👥 Fetching users data...");
      dispatch(fetchAllUsers());
      dispatch(fetchPendingUsers());
      setInitialLoad(false);
    }
  }, [dispatch, initialLoad]);

  // Show toast for success/error messages
  /*
  useEffect(() => {
    if (success) {
      toast({
        title: "Başarılı",
        description: success,
        variant: "default",
      });
    }
  }, [success, toast]);

  */
  useEffect(() => {
    if (error) {
      toast({
        title: "Hata",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // ✅ DÜZELTME: Handle approve user - async/await ile result kontrolü
  const handleApproveUser = async (userId, userName) => {
    console.log(`✅ Approving user: ${userName} (${userId})`);
    
    const result = await dispatch(approveUser(userId));
    
    if (result?.success) {
      console.log(`✅ User approved successfully: ${userName}`);
      // Kullanıcı listelerini yenile
      await dispatch(fetchAllUsers());
      await dispatch(fetchPendingUsers());
    } else {
      console.error(`❌ Failed to approve user: ${userName}`, result?.error);
    }
  };

  // ✅ DÜZELTME: Handle reject user - async/await ile result kontrolü
  const handleRejectUser = async (userId, userName) => {
    console.log(`❌ Rejecting user: ${userName} (${userId})`);
    
    const result = await dispatch(rejectUser(userId));
    
    if (result?.success) {
      console.log(`✅ User rejected successfully: ${userName}`);
      // Kullanıcı listelerini yenile
      await dispatch(fetchAllUsers());
      await dispatch(fetchPendingUsers());
    } else {
      console.error(`❌ Failed to reject user: ${userName}`, result?.error);
    }
  };

  // ✅ DÜZELTME: Handle role change - async/await ile result kontrolü
  const handleRoleChange = async (userId, role) => {
    console.log(`🔄 Changing role for user ${userId} to ${role}`);
    
    const result = await dispatch(updateUserRole(userId, role));
    
    if (result?.success) {
      console.log(`✅ User role changed successfully`);
      setRoleDialogOpen(false);
      setSelectedUser(null);
      // Kullanıcı listelerini yenile
      await dispatch(fetchAllUsers());
    } else {
      console.error(`❌ Failed to change user role`, result?.error);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case userStatus.ACTIVE:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check size={12} className="mr-1" />
            Aktif
          </span>
        );
      case userStatus.PENDING:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle size={12} className="mr-1" />
            Onay Bekliyor
          </span>
        );
      case userStatus.LOCKED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red">
            <X size={12} className="mr-1" />
            Kilitli
          </span>
        );
      case userStatus.REJECTED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <X size={12} className="mr-1" />
            Reddedildi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status || "Bilinmiyor"}
          </span>
        );
    }
  };

  // Get role badge
  const getRoleBadge = (role) => {
    switch (role) {
      case userRoles.ADMIN:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Shield size={12} className="mr-1" />
            Admin
          </span>
        );
      case userRoles.PERSONAL:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <User size={12} className="mr-1" />
            Personel
          </span>
        );
      case userRoles.CUSTOMER:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <User size={12} className="mr-1" />
            Müşteri
          </span>
        );
      case userRoles.GUEST:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <User size={12} className="mr-1" />
            Misafir
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {role || "Bilinmiyor"}
          </span>
        );
    }
  };

  // Loading state
  if (
    adminFetchState === fetchStates.FETCHING &&
    (!allUsers || !allUsers.length)
  ) {
    return <SecondaryLoading size="fullPage" />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 font-Quattrocento_Sans">
              Kullanıcı Yönetimi
            </h1>
            <p className="text-sm text-gray-600 mt-1 font-Barlow">
              Tüm kullanıcıları görüntüleyebilir, onaylayabilir ve rollerini
              değiştirebilirsiniz.
            </p>
          </div>

          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all-users" className="font-Barlow">
                <Users size={16} className="mr-2" />
                Tüm Kullanıcılar
                {allUsers && allUsers.length > 0 && (
                  <span className="ml-2 bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                    {allUsers.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="pending-users" className="font-Barlow">
                <AlertTriangle size={16} className="mr-2" />
                Onay Bekleyenler
                {pendingUsers && pendingUsers.length > 0 && (
                  <span className="ml-2 bg-red text-white text-xs font-bold px-2 py-1 rounded-full">
                    {pendingUsers.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ALL USERS TAB */}
            <TabsContent value="all-users" className="space-y-4">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                          Kullanıcı
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                          Durum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                          Rol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                          Son Giriş
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allUsers && allUsers.length > 0 ? (
                        allUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <User className="h-6 w-6 text-gray-500" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 font-Barlow">
                                    {user.name} {user.surname}
                                  </div>
                                  <div className="text-sm text-gray-500 font-Barlow">
                                    {user.email}
                                  </div>
                                  <div className="text-xs text-gray-400 font-Barlow">
                                    @{user.username}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(user.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getRoleBadge(user.role)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-Barlow">
                              {user.lastLogin
                                ? new Date(user.lastLogin).toLocaleString("tr-TR")
                                : "Hiç giriş yapmadı"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                {user.status === userStatus.PENDING && (
                                  <>
                                    <button
                                      onClick={() => handleApproveUser(user.id, `${user.name} ${user.surname}`)}
                                      className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      disabled={loading}
                                      title="Kullanıcıyı Onayla"
                                    >
                                      <UserCheck size={18} />
                                    </button>
                                    <button
                                      onClick={() => handleRejectUser(user.id, `${user.name} ${user.surname}`)}
                                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      disabled={loading}
                                      title="Kullanıcıyı Reddet"
                                    >
                                      <UserX size={18} />
                                    </button>
                                  </>
                                )}
                                <AlertDialog
                                  open={roleDialogOpen && selectedUser?.id === user.id}
                                  onOpenChange={(open) => {
                                    setRoleDialogOpen(open);
                                    if (!open) setSelectedUser(null);
                                  }}
                                >
                                  <AlertDialogTrigger asChild>
                                    <button
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setSelectedRole(user.role);
                                        setRoleDialogOpen(true);
                                      }}
                                      className="text-blue-600 hover:text-blue-900 transition-colors"
                                      title="Rolü Değiştir"
                                    >
                                      <Shield size={18} />
                                    </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="sm:max-w-md">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Kullanıcı Rolünü Değiştir</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {user.name} {user.surname} kullanıcısının rolünü değiştir
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="py-4">
                                      <div className="mb-4">
                                        <p className="text-sm font-medium mb-2 font-Barlow">Mevcut Rol</p>
                                        {getRoleBadge(user.role)}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium mb-2 font-Barlow">Yeni Rol</p>
                                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Rol seçin" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value={userRoles.ADMIN}>Admin</SelectItem>
                                            <SelectItem value={userRoles.PERSONAL}>Personel</SelectItem>
                                            <SelectItem value={userRoles.CUSTOMER}>Müşteri</SelectItem>
                                            <SelectItem value={userRoles.GUEST}>Misafir</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>İptal</AlertDialogCancel>
                                      <AlertDialogAction
                                        disabled={loading || selectedRole === user.role}
                                        onClick={() => handleRoleChange(user.id, selectedRole)}
                                      >
                                        {loading ? "Değiştiriliyor..." : "Değiştir"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500 font-Barlow">
                            {adminFetchState === fetchStates.FAILED
                              ? "Kullanıcı verileri yüklenirken bir hata oluştu"
                              : "Henüz kullanıcı bulunmamaktadır"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* PENDING USERS TAB */}
            <TabsContent value="pending-users" className="space-y-4">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                          Kullanıcı
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                          İletişim
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                          Kayıt Tarihi
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingUsers && pendingUsers.length > 0 ? (
                        pendingUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                  <User className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 font-Barlow">
                                    {user.name} {user.surname}
                                  </div>
                                  <div className="text-xs text-gray-400 font-Barlow">
                                    @{user.username}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-Barlow">
                                {user.email}
                              </div>
                              <div className="text-sm text-gray-500 font-Barlow">
                                {user.phoneNumber || "Telefon yok"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-Barlow">
                              {user.createdAt
                                ? new Date(user.createdAt).toLocaleString("tr-TR")
                                : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-3">
                                <button
                                  onClick={() => handleApproveUser(user.id, `${user.name} ${user.surname}`)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  disabled={loading}
                                >
                                  <UserCheck size={16} className="mr-1" />
                                  Onayla
                                </button>
                                <button
                                  onClick={() => handleRejectUser(user.id, `${user.name} ${user.surname}`)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  disabled={loading}
                                >
                                  <UserX size={16} className="mr-1" />
                                  Reddet
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500 font-Barlow">
                            {adminFetchState === fetchStates.FAILED
                              ? "Kullanıcı verileri yüklenirken bir hata oluştu"
                              : "Onay bekleyen kullanıcı bulunmamaktadır"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

// Page props - Admin layout için
UsersPage.props = {
  title: "Kullanıcılar",
  activePage: "users",
  showAddButton: false,
};

export default UsersPage;