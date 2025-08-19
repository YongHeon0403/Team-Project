import { useSearchParams } from "react-router-dom";
import BoardListComponent from "../../components/board/BoardListComponent";
import BasicMenu from "../../components/menus/BasicMenu";

const ListPage = () => {
  // useSearchParams(): localhost:8080/list?page=1&size=10 와 같이 쿼리스트링을 사용할 수 있습니다.
  const [queryParams] = useSearchParams();

  // URL에서 'page' 파라미터를 가져오거나 기본값 1을 사용합니다.
  const page = queryParams.get("page") ? parseInt(queryParams.get("page")) : 1;
  // URL에서 'size' 파라미터를 가져오거나 기본값 10을 사용합니다.
  const size = queryParams.get("size") ? parseInt(queryParams.get("size")) : 10;

  return (
    // 전체 컨테이너: 화면 전체를 채우고 Flexbox를 사용하여 내용을 정렬합니다.
    // position-fixed top-0 start-0 w-100 h-100: 화면에 고정, 왼쪽 상단에서 시작, 너비/높이 100%
    // d-flex flex-column: Flexbox를 세로 방향으로 설정
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column">
      {/* 상단 메뉴 컴포넌트 */}
      <BasicMenu />

      {/* 메인 컨텐츠 영역: 메뉴를 제외한 나머지 공간을 채우고 스크롤 가능하며, 내부 콘텐츠를 가로 가운데 정렬합니다. */}
      {/* flex-grow-1: 남은 공간을 모두 채움, bg-white: 배경색 흰색, overflow-auto: 내용이 길어질 경우 스크롤바 자동 생성 */}
      {/* d-flex justify-content-center align-items-start: 내부 콘텐츠를 가로 가운데 정렬하고, 세로 상단에 배치 */}
      <div className="flex-grow-1 bg-white overflow-auto d-flex justify-content-center align-items-start">
        {/* 실제 가운데 정렬될 콘텐츠 컨테이너 */}
        {/* p-4: 내부 패딩, w-100: 너비 100%, maxWidth: '1000px': 넓은 화면에서 콘텐츠가 너무 넓어지는 것을 방지 (원하는 최대 너비로 조절 가능) */}
        <div className="p-4 w-100" style={{ maxWidth: '1000px' }}>
          {/* 페이지 제목: Bootstrap 텍스트 크기 및 굵기 적용 */}
          {/* fs-3: 폰트 사이즈 (h3 태그와 유사), fw-bold: 굵은 글씨체, mb-3: 하단 마진 */}
          <div className="fs-3 fw-bold mb-3">
            전체 게시판 목록 {page} --- {size}{" "}
          </div>

          {/* 게시판 목록 컴포넌트 렌더링 */}
          <BoardListComponent />
        </div>
      </div>
    </div>
  );
};

export default ListPage;
