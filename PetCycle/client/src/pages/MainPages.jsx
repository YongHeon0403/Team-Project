import BasicLayout from "../layouts/BasicLayout";
import React from 'react'; // React 컴포넌트이므로 React 임포트가 명시적으로 있는 것이 좋습니다.

const MainPage = () => {
    return (
        <BasicLayout>
            {/* Tailwind의 text-3xl을 Bootstrap의 fs-1 (font-size)로 변경합니다.
                Bootstrap은 1부터 6까지의 fs-(숫자) 클래스를 제공하며, 숫자가 작을수록 글씨가 큽니다.
                text-3xl은 비교적 큰 글씨이므로 fs-1이나 fs-2가 적합합니다. 여기서는 fs-1을 사용했습니다.
            */}
            <div className="fs-1"> Main Page </div>
        </BasicLayout>
    );
}
export default MainPage;
