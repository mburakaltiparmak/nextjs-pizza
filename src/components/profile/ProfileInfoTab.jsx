"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { selectGlobalLoading } from "@/lib/store/selectors/appSelectors";
import { updateUserProfile } from "@/lib/store/actions/userActions";
import { profileSchema } from "@/lib/validations/profile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faEnvelope,
    faLock,
    faEdit,
    faSave,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Sub-component for Read-Only View
const ProfileReadView = ({ userProfile, userEmail, onPasswordChange, onEdit }) => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <div className="w-24 h-24 rounded-full bg-lightgray flex items-center justify-center text-red">
                    <FontAwesomeIcon icon={faUser} size="3x" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-darkgray font-Barlow">
                        {userProfile?.name} {userProfile?.surname}
                    </h3>
                    <p className="text-darkgray font-Barlow">
                        {userProfile?.email || userEmail}
                    </p>
                    <p className="text-sm text-gray mt-1 font-Barlow">
                        Üyelik Tarihi:{" "}
                        {userProfile?.createdAt
                            ? new Date(userProfile.createdAt).toLocaleDateString("tr-TR")
                            : "Belirtilmemiş"}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="flex items-center text-darkgray font-Barlow mb-1">
                            İsim
                        </Label>
                        <div className="flex items-center p-3 border border-gray/20 rounded-md bg-gray/5 text-darkgray font-Barlow">
                            <FontAwesomeIcon icon={faUser} className="text-gray mr-3" />
                            {userProfile?.name}
                        </div>
                    </div>
                    <div>
                         <Label className="flex items-center text-darkgray font-Barlow mb-1">
                            Soyisim
                        </Label>
                        <div className="flex items-center p-3 border border-gray/20 rounded-md bg-gray/5 text-darkgray font-Barlow">
                            <FontAwesomeIcon icon={faUser} className="text-gray mr-3" />
                            {userProfile?.surname}
                        </div>
                    </div>
                </div>

                <div>
                    <Label className="flex items-center text-darkgray font-Barlow mb-1">
                        E-posta
                    </Label>
                    <div className="flex items-center p-3 border border-gray/20 rounded-md bg-gray/5 text-darkgray font-Barlow">
                        <FontAwesomeIcon icon={faEnvelope} className="text-gray mr-3" />
                        {userProfile?.email || userEmail}
                    </div>
                </div>

                <div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onPasswordChange}
                        className="w-full md:w-auto mt-2 border-red text-red hover:bg-red hover:text-lightgray font-Barlow"
                    >
                        <FontAwesomeIcon icon={faLock} className="mr-2" />
                        Şifre Değiştir
                    </Button>
                </div>
            </div>
            
            <div className="flex justify-end pt-4">
                 <Button
                    onClick={onEdit}
                    className="bg-red text-lightgray hover:bg-yellow hover:text-red font-Barlow"
                >
                    <FontAwesomeIcon icon={faEdit} className="mr-2" />
                    Düzenle
                </Button>
            </div>
        </div>
    );
};

// Sub-component for Edit Form
const ProfileEditForm = ({ userProfile, userEmail, onCancel, onSuccess }) => {
    const dispatch = useDispatch();
    const loading = useSelector(selectGlobalLoading);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: userProfile?.name || "",
            surname: userProfile?.surname || "",
            email: userProfile?.email || userEmail || "",
        },
    });

    const onSubmit = async (data) => {
        const updatedUserData = {
            ...userProfile,
            name: data.name,
            surname: data.surname,
            email: data.email,
        };

        const result = await dispatch(updateUserProfile(updatedUserData));

        if (!result.error) {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
             <div className="flex flex-col md:flex-row items-center gap-4 mb-4 opacity-50">
                <div className="w-24 h-24 rounded-full bg-lightgray flex items-center justify-center text-gray-400">
                    <FontAwesomeIcon icon={faUser} size="3x" />
                </div>
                 <div>
                    <h3 className="text-xl font-semibold text-darkgray font-Barlow">
                        {userProfile?.name} {userProfile?.surname}
                    </h3>
                    <p className="text-gray font-Barlow">Profil Düzenleniyor</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label
                            htmlFor="name"
                            className="flex items-center text-darkgray font-Barlow mb-1"
                        >
                            <span>İsim</span>
                            {errors.name && (
                                <span className="text-red text-xs ml-2">
                                    {errors.name.message}
                                </span>
                            )}
                        </Label>
                        <div className="flex items-center relative">
                            <FontAwesomeIcon icon={faUser} className="text-gray absolute left-3" />
                            <Input
                                id="name"
                                {...register("name")}
                                className={`pl-10 ${errors.name ? "border-red" : "border-gray"
                                    } text-darkgray font-Barlow`}
                            />
                        </div>
                    </div>

                    <div>
                        <Label
                            htmlFor="surname"
                            className="flex items-center text-darkgray font-Barlow mb-1"
                        >
                            <span>Soyisim</span>
                            {errors.surname && (
                                <span className="text-red text-xs ml-2">
                                    {errors.surname.message}
                                </span>
                            )}
                        </Label>
                         <div className="flex items-center relative">
                            <FontAwesomeIcon icon={faUser} className="text-gray absolute left-3" />
                            <Input
                                id="surname"
                                {...register("surname")}
                                className={`pl-10 ${errors.surname ? "border-red" : "border-gray"
                                    } text-darkgray font-Barlow`}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <Label
                        htmlFor="email"
                        className="flex items-center text-darkgray font-Barlow mb-1"
                    >
                        <span>E-posta</span>
                        {errors.email && (
                            <span className="text-red text-xs ml-2">
                                {errors.email.message}
                            </span>
                        )}
                    </Label>
                    <div className="flex items-center relative">
                        <FontAwesomeIcon icon={faEnvelope} className="text-gray absolute left-3" />
                        <Input
                            id="email"
                            type="email"
                            {...register("email")}
                            className={`pl-10 ${errors.email ? "border-red" : "border-gray"
                                } text-darkgray font-Barlow`}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray/10">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
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
        </form>
    );
};

export const ProfileInfoTab = ({ userProfile, userEmail, onPasswordChange }) => {
    const [editMode, setEditMode] = useState(false);

    return (
        <Card className="border-gray">
            <CardHeader>
                <CardTitle className="text-darkgray font-Barlow">
                    Profil Bilgileri
                </CardTitle>
                <CardDescription className="text-gray font-Barlow">
                    Hesap bilgilerinizi buradan görüntüleyebilir ve güncelleyebilirsiniz.
                </CardDescription>
            </CardHeader>

            <CardContent>
                {editMode ? (
                    <ProfileEditForm 
                        userProfile={userProfile}
                        userEmail={userEmail}
                        onCancel={() => setEditMode(false)}
                        onSuccess={() => setEditMode(false)}
                    />
                ) : (
                    <ProfileReadView 
                        userProfile={userProfile}
                        userEmail={userEmail}
                        onPasswordChange={onPasswordChange}
                        onEdit={() => setEditMode(true)}
                    />
                )}
            </CardContent>
            {/* CardFooter removed as logic is moved inside sub-components */}
        </Card>
    );
};

