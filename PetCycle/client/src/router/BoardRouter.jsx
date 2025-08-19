import { lazy, Suspense } from "react"
import { Navigate } from "react-router-dom"

const Loading = <div>Loading</div>
const BoardList = lazy(()=>import("../pages/board/ListPage"))

const BoardRouter = () => {
  return[
    {path: "list",
      element: <Suspense fallback={Loading}><BoardList/></Suspense>
    },
    {
      path:"",
      element: <Navigate replace to="/list"/>
    },
  ]
}

export default BoardRouter;