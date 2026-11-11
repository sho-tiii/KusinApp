import React from "react";
import ForgotPassword from "../auth/ForgotPassword";

export default function AdminForgotPassword(props) {
  return <ForgotPassword {...props} isAdminPortal={true} />;
}
