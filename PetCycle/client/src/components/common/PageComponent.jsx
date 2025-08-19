import React from "react"; // React 컴포넌트를 사용하기 위해 import

/**
 * 페이지네이션 컴포넌트
 * @param {object} props - 컴포넌트 프롭스
 * @param {object} props.serverData - 서버로부터 받은 페이지네이션 관련 데이터 (예: { prev: true, prevPage: 9, pageNumList: [10, 11, 12], current: 10, next: true, nextPage: 11 })
 * @param {function} props.movePage - 페이지 이동을 처리하는 함수 (예: useCustomMove 훅의 moveToList 함수)
 */
const PageComponent = ({ serverData, movePage }) => {
  return (
    // 전체 컨테이너: 가로 중앙 정렬 및 상하 마진
    <div className="my-4 d-flex justify-content-center">
      {/* '이전' 버튼: serverData.prev가 true일 경우에만 렌더링 */}
      {serverData.prev ? (
        <div
          // Bootstrap 버튼 스타일 (링크처럼 보이지만 클릭 가능)
          // 텍스트 색상을 Primary (파란색 계열)로 설정
          className="btn btn-link fw-bold text-primary mx-2"
          onClick={() => movePage({ page: serverData.prevPage })} // 이전 페이지로 이동
        >
          Prev
        </div>
      ) : (
        <></> // prev가 false면 아무것도 렌더링하지 않음
      )}

      {/* 페이지 번호 목록: serverData.pageNumList 배열을 순회하며 렌더링 */}
      {serverData.pageNumList.map((pageNum) => (
        <div
          key={pageNum} // React 리스트 렌더링을 위한 고유 key
          className={`
            btn mx-1 
            ${serverData.current === pageNum ? 'btn-dark' : 'btn-primary'} // 현재 페이지면 진한 회색 (btn-dark), 아니면 파란색 (btn-primary)
            shadow // 그림자 효과
          `}
          onClick={() => movePage({ page: pageNum })} // 해당 페이지 번호로 이동
        >
          {pageNum}
        </div>
      ))}

      {/* '다음' 버튼: serverData.next가 true일 경우에만 렌더링 */}
      {serverData.next ? (
        <div
          // Bootstrap 버튼 스타일 (링크처럼 보이지만 클릭 가능)
          // 텍스트 색상을 Primary (파란색 계열)로 설정
          className="btn btn-link fw-bold text-primary mx-2"
          onClick={() => movePage({ page: serverData.nextPage })} // 다음 페이지로 이동
        >
          Next
        </div>
      ) : (
        <></> // next가 false면 아무것도 렌더링하지 않음
      )}
    </div>
  );
};

export default PageComponent;
