"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import Link from "next/link";
import React, { useEffect } from "react";
const Page = () => {
  /*
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.order.userData);
  const paymentData = useAppSelector((state) => state.order.paymentData);
  const cartData = useAppSelector((state) => state.order.cart);

  useEffect(() => {
    console.log("userData", userData);
    console.log("paymentData", paymentData);
    console.log("cartData", cartData);
    createOrder();
  }, [userData, paymentData, cartData]);
  const createOrder = () => {
    
    const user = Object.values(userData);
    const payment = Object.values(paymentData);
    const cart = Object.values(cartData);
    
    const orderData = {
      userData,
      paymentData,
      cartData,
    };
    console.log("order data : ", orderData);
  };
  */

  return <div>Success Order</div>;
};
export default Page;
