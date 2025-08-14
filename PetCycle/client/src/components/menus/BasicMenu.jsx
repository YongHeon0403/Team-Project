import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const BasicMenu = () => {
    const loginState = useSelector(state => state.LoginSlice);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container-fluid">
                {/* 왼쪽 메뉴 */}
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                        <Link className="nav-link fs-4 fw-bold" to="/">Main</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link fs-4 fw-bold" to="/about">About</Link>
                    </li>
                    {loginState.email && (
                        <>
                            <li className="nav-item">
                                <Link className="nav-link fs-4 fw-bold" to="/todo/">Todo</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link fs-4 fw-bold" to="/products/">Products</Link>
                            </li>
                        </>
                    )}
                </ul>

                {/* 오른쪽 로그인/로그아웃 버튼 */}
                <div className="d-flex">
                    {!loginState.email ? (
                        <Link className="btn btn-warning fw-medium" to="user/login">
                            Login
                        </Link>
                    ) : (
                        <Link className="btn btn-warning fw-medium" to="user/logout">
                            Logout
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default BasicMenu;
