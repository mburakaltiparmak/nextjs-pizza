"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserProfile } from "@/lib/store/actions/userActions";
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

export const ProfileInfoTab = ({ userProfile, userEmail, onPasswordChange }) => {
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.global.loading);

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        email: "",
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name || "",
                surname: userProfile.surname || "",
                email: userProfile.email || userEmail || "",
            });
        }
    }, [userProfile, userEmail]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: "",
            });
        }
    };

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

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if (!validateProfileForm()) {
            return;
        }

        const updatedUserData = {
            ...userProfile,
            name: formData.name,
            surname: formData.surname,
            email: formData.email,
        };

        const result = await dispatch(updateUserProfile(updatedUserData));

        if (!result.error) {
            setEditMode(false);
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setFormData({
            name: userProfile?.name || "",
            surname: userProfile?.surname || "",
            email: userProfile?.email || userEmail || "",
        });
        setFormErrors({});
    };

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
                <form onSubmit={handleUpdateProfile}>
                    <div className="grid gap-6">
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
                                        ? new Date(userProfile.createdAt).toLocaleDateString(
                                            "tr-TR"
                                        )
                                        : "Belirtilmemiş"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label
                                        htmlFor="name"
                                        className="flex items-center text-darkgray font-Barlow"
                                    >
                                        <span>İsim</span>
                                        {formErrors.name && (
                                            <span className="text-red text-xs ml-2">
                                                {formErrors.name}
                                            </span>
                                        )}
                                    </Label>
                                    <div className="flex items-center mt-1">
                                        <FontAwesomeIcon icon={faUser} className="text-gray mr-2" />
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                            className={`${formErrors.name ? "border-red" : "border-gray"
                                                } text-darkgray font-Barlow`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        htmlFor="surname"
                                        className="flex items-center text-darkgray font-Barlow"
                                    >
                                        <span>Soyisim</span>
                                        {formErrors.surname && (
                                            <span className="text-red text-xs ml-2">
                                                {formErrors.surname}
                                            </span>
                                        )}
                                    </Label>
                                    <div className="flex items-center mt-1">
                                        <FontAwesomeIcon icon={faUser} className="text-gray mr-2" />
                                        <Input
                                            id="surname"
                                            name="surname"
                                            value={formData.surname}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                            className={`${formErrors.surname ? "border-red" : "border-gray"
                                                } text-darkgray font-Barlow`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label
                                    htmlFor="email"
                                    className="flex items-center text-darkgray font-Barlow"
                                >
                                    <span>E-posta</span>
                                    {formErrors.email && (
                                        <span className="text-red text-xs ml-2">
                                            {formErrors.email}
                                        </span>
                                    )}
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
                                        className={`${formErrors.email ? "border-red" : "border-gray"
                                            } text-darkgray font-Barlow`}
                                    />
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
                    </div>

                    {editMode && (
                        <div className="flex justify-end space-x-2 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
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

            <CardFooter
                className={`flex ${editMode ? "justify-between" : "justify-end"} pt-0`}
            >
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
    );
};
