// client/src/pages/user/ProfileEditPage.jsx
import React from "react";
import BasicMenu from "../../components/menus/BasicMenu";
import ProfileEditComponent from "../../components/user/ProfileEditComponent";

export default function ProfileEditPage() {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex flex-col">
      <BasicMenu />
      <div className="flex flex-grow justify-center items-start p-6 overflow-auto">
        <ProfileEditComponent />
      </div>
    </div>
  );
}
