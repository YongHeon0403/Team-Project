import BasicLayout from "../layouts/BasicLayout";
import React from "react";

const MainPage = () => {
  return (
    <BasicLayout>
      {/* Tailwind text-3xl로 변경 */}
      <div className="text-3xl"> Main Page </div>
    </BasicLayout>
  );
};
export default MainPage;
