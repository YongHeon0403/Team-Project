import BasicMenu from "../components/menus/BasicMenu";

// children 속성을 이용해서 컴포넌트 내부에 다른 컴포넌트를 적용할 수 있습니다.
const BasicLayout = ({ children }) => {
    return (
        <>
            <BasicMenu />

            <div className="container my-5">
                <div className="row">
                    <main className="col-md-8 col-lg-9 bg-info p-4">
                        {children} {/* 입력받은 컴포넌트가 여기서 적용된다. */}
                    </main>
                    <aside className="col-md-4 col-lg-3 bg-success p-4 d-flex align-items-center justify-content-center">
                        <h1 className="h2 h-md-1">Sidebar</h1>
                    </aside>
                </div>
            </div>
        </>
    );
};

export default BasicLayout;
