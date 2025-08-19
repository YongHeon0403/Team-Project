import { useState } from "react";
import { createSearchParams, useNavigate, useSearchParams } from "react-router-dom";

const getNum = (param, defaultValue) => {
    if(!param){
        return defaultValue
    }
    return parseInt(param)
}

/**
 * 페이지 이동 및 URL 쿼리 파라미터 관리를 위한 커스텀 훅
 */
const useCustomMove = () => {
    const navigate = useNavigate()
    const [refresh, setRefresh] = useState(); // 동일 페이지 클릭 시 서버 재호출을 위한 refresh 상태

    const [queryParams] = useSearchParams() // 현재 URL의 쿼리스트링을 이용

    // URL에서 page, size, ✨type, keyword✨ 파라미터 추출
    const page = getNum(queryParams.get('page'), 1)
    const size = getNum(queryParams.get('size'), 10)
    // ✨ type과 keyword 파라미터 추가 ✨
    const type = queryParams.get('type') || ''; // 기본값은 빈 문자열
    const keyword = queryParams.get('keyword') || ''; // 기본값은 빈 문자열

    // 기본 URL 쿼리 문자열 생성
    // ✨ type과 keyword도 포함 ✨
    const queryDefault = createSearchParams({page, size, type, keyword}).toString()

    /**
     * 목록 페이지로 이동하는 함수
     * @param {object} pageParam - 페이지, 사이즈, 타입, 키워드 등의 파라미터를 담은 객체
     */
    const moveToList = (pageParam) => {
        let queryStr = ""

        if(pageParam){
            const pageNum = getNum(pageParam.page, 1)
            const sizeNum = getNum(pageParam.size, 10)
            // ✨ pageParam에서 type과 keyword도 가져와서 사용 ✨
            const typeParam = pageParam.type || '';
            const keywordParam = pageParam.keyword || '';
            
            queryStr = createSearchParams({
                page : pageNum, 
                size : sizeNum,
                type : typeParam, // ✨ type 파라미터 추가 ✨
                keyword : keywordParam // ✨ keyword 파라미터 추가 ✨
            }).toString()
        }else {
            queryStr = queryDefault
        }

        // refresh 값을 변경하여 ListComponent에서 데이터를 새로 불러오도록 트리거
        setRefresh(!refresh)

        // List 페이지로 이동하면서 쿼리 스트링 값을 함께 넘겨준다.
        navigate({pathname : `../list`, search : queryStr}) 
    }

    /**
     * 게시글 수정 페이지로 이동하는 함수
     * @param {number} num - 게시글 ID
     */
    const moveToModify = (num) => {
        console.log(queryDefault)
        navigate({
            pathname : `../modify/${num}`, 
            search : queryDefault // 기존 쿼리 스트링 유지 (page, size, type, keyword)
        })
    }

    /**
     * 게시글 읽기 페이지로 이동하는 함수
     * @param {number} num - 게시글 ID
     */
    const moveToRead = (num) => {
        console.log(queryDefault)
        navigate({
            pathname : `../read/${num}`,
            search : queryDefault // 기존 쿼리 스트링 유지 (page, size, type, keyword)
        })
    }

    // ✨ type과 keyword를 반환 목록에 추가 ✨
    return { moveToList, moveToModify, moveToRead, page, size, refresh, type, keyword }
}

export default useCustomMove
