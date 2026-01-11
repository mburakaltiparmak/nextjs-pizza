"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "@/lib/store/actions/userActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const PasswordChangeDialog = ({ open, onOpenChange }) => {
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.global.loading);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordErrors, setPasswordErrors] = useState({});

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value,
        });

        if (passwordErrors[name]) {
            setPasswordErrors({
                ...passwordErrors,
                [name]: "",
            });
        }
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validatePasswordForm()) {
            return;
        }

        const result = await dispatch(
            changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            })
        );

        if (!result.error) {
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setPasswordErrors({});
            onOpenChange(false);
        }
    };

    const handleCancel = () => {
        onOpenChange(false);
        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
        setPasswordErrors({});
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <form onSubmit={handleSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-darkgray font-Barlow flex items-center gap-2">
                            <FontAwesomeIcon icon={faLock} className="text-red" />
                            Şifre Değiştir
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray font-Barlow">
                            Hesap güvenliğiniz için mevcut şifrenizi girin ve yeni şifrenizi belirleyin.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 my-6">
                        <div>
                            <Label
                                htmlFor="currentPassword"
                                className="flex items-center text-darkgray font-Barlow"
                            >
                                <span>Mevcut Şifre</span>
                                {passwordErrors.currentPassword && (
                                    <span className="text-red text-xs ml-2">
                                        {passwordErrors.currentPassword}
                                    </span>
                                )}
                            </Label>
                            <Input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className={`${passwordErrors.currentPassword ? "border-red" : "border-gray"
                                    } text-darkgray`}
                            />
                        </div>

                        <div>
                            <Label
                                htmlFor="newPassword"
                                className="flex items-center text-darkgray font-Barlow"
                            >
                                <span>Yeni Şifre</span>
                                {passwordErrors.newPassword && (
                                    <span className="text-red text-xs ml-2">
                                        {passwordErrors.newPassword}
                                    </span>
                                )}
                            </Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className={`${passwordErrors.newPassword ? "border-red" : "border-gray"
                                    } text-darkgray`}
                            />
                        </div>

                        <div>
                            <Label
                                htmlFor="confirmPassword"
                                className="flex items-center text-darkgray font-Barlow"
                            >
                                <span>Yeni Şifre (Tekrar)</span>
                                {passwordErrors.confirmPassword && (
                                    <span className="text-red text-xs ml-2">
                                        {passwordErrors.confirmPassword}
                                    </span>
                                )}
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className={`${passwordErrors.confirmPassword ? "border-red" : "border-gray"
                                    } text-darkgray`}
                            />
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
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
    );
};
