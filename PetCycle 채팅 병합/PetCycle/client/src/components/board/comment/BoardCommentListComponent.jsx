// src/components/board/comment/BoardCommentListComponent.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  getCommentsPage,
  getCommentsCount,
  addComment,
  modifyComment,
  removeComment,
} from "../../../api/board/CommentApi";
import { getCookie } from "../../../util/CookieUtil";

// 날짜 포맷
const fmt = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd} ${hh}:${mi}`;
};

const DEFAULT_PAGE_SIZE = 10;

const BoardCommentListComponent = ({
  postId,
  pageSize = DEFAULT_PAGE_SIZE,
  className = "",
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL 쿼리 → 내부 상태(0-base page)
  const cpageQS = Number(searchParams.get("cpage") || 1); // 1-base
  const csizeQS = Number(searchParams.get("csize") || pageSize);
  const [page, setPage] = useState(Math.max(0, cpageQS - 1)); // 0-base
  const [size, setSize] = useState(csizeQS > 0 ? csizeQS : pageSize);

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]); // parentComments
  const [total, setTotal] = useState(0);
  const [meta, setMeta] = useState({ totalPages: 0, size });

  // 새 댓글 입력
  const [newContent, setNewContent] = useState("");
  const [posting, setPosting] = useState(false);

  // ✏️ 인라인 수정 상태
  const [editingId, setEditingId] = useState(null); // 현재 수정 중인 commentId
  const [editingContent, setEditingContent] = useState("");

  // 내 userId (쿠키에 user가 있다고 가정)
  const [myUserId, setMyUserId] = useState(null);

  // ✅ 부모별 “답글 섹션” 토글 + 해당 섹션의 입력값
  // openReplies[commentId] === true 면, 그 부모의 “답글 입력창 + 대댓글 목록”을 보임
  const [openReplies, setOpenReplies] = useState({});
  const [replyOpenId, setReplyOpenId] = useState(null); // 현재 입력창이 열려있는 부모 ID
  const [replyContent, setReplyContent] = useState("");

  // 스크롤 포커스용
  const topRef = useRef(null);

  useEffect(() => {
    const userCookie = getCookie("user");
    if (userCookie) {
      try {
        const parsed =
          typeof userCookie === "string" ? JSON.parse(userCookie) : userCookie;
        if (parsed?.userId) setMyUserId(parsed.userId);
      } catch {
        // 무시
      }
    }
  }, []);

  // postId 바뀌면 댓글 1페이지로 초기화 + URL 동기화
  useEffect(() => {
    setPage(0);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("cpage", "1");
        next.set("csize", String(size));
        return next;
      },
      { replace: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // 댓글목록 + 총개수 로딩
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const [pageRes, count] = await Promise.all([
        getCommentsPage(postId, page, size),
        getCommentsCount(postId),
      ]);

      setList(pageRes?.parentComments ?? []);
      setMeta({
        totalPages: pageRes?.totalPages ?? 0,
        size: pageRes?.size ?? size,
      });
      setTotal(count ?? 0);
    } catch (e) {
      console.error("댓글 불러오기 실패:", e);
    } finally {
      setLoading(false);
    }
  }, [postId, page, size]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const canPrev = useMemo(() => page > 0, [page]);
  const canNext = useMemo(
    () => page + 1 < (meta.totalPages || 0),
    [page, meta.totalPages]
  );

  // 페이지 이동: 내부 상태 + URL(cpage/csize) 동기화
  const goPage = (nextPage0) => {
    const bounded = Math.max(0, nextPage0);
    setPage(bounded);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("cpage", String(bounded + 1));
      next.set("csize", String(size));
      return next;
    });
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 새 댓글 등록 → 1페이지 이동 + 즉시 재조회
  const submitNewComment = async () => {
    const content = newContent.trim();
    if (!content) return;

    try {
      setPosting(true);
      await addComment({ postId, content });
      setNewContent("");
      setPage(0);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("cpage", "1");
        next.set("csize", String(size));
        return next;
      });
      await fetchComments();
    } catch (e) {
      console.error("댓글 등록 실패:", e);
      alert("로그인이 필요합니다.");
    } finally {
      setPosting(false);
    }
  };

  // 대댓글 등록 → 현재 페이지 그대로 재조회
  const submitReply = async (parentId) => {
    const content = replyContent.trim();
    if (!content) return;

    try {
      setPosting(true);
      await addComment({ postId, content, parentId });
      setReplyContent("");
      setReplyOpenId(null);
      await fetchComments();
    } catch (e) {
      console.error("대댓글 등록 실패:", e);
      alert("대댓글 등록에 실패했어요 ㅠㅠ");
    } finally {
      setPosting(false);
    }
  };

  // ✅ 단일 토글 버튼: “답글 달기/보기(N)” ↔ “답글 숨기기”
  //    열면: 입력창 + 대댓글 목록 같이 표시
  //    닫으면: 입력창도 함께 닫고 입력값 초기화
  const toggleReplySection = (commentId) => {
    setOpenReplies((prev) => {
      const nextOpen = !prev[commentId];
      const next = { ...prev, [commentId]: nextOpen };
      if (nextOpen) {
        setReplyOpenId(commentId); // 열면 입력창도 같이 열림
      } else if (replyOpenId === commentId) {
        setReplyOpenId(null); // 닫히면 입력창 닫기
        setReplyContent("");
      }
      return next;
    });
  };

  // ✏️ 수정 시작/취소/저장
  const startEdit = (comment) => {
    setEditingId(comment.commentId);
    setEditingContent(comment.content || "");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent("");
  };
  const saveEdit = async () => {
    const content = editingContent.trim();
    if (!editingId || !content) return;
    try {
      setPosting(true);
      await modifyComment(editingId, content);
      setEditingId(null);
      setEditingContent("");
      await fetchComments();
    } catch (e) {
      console.error("댓글 수정 실패:", e);
      alert("댓글 수정 실패");
    } finally {
      setPosting(false);
    }
  };

  // 🗑️ 삭제
  const doDelete = async (commentId) => {
    if (!window.confirm("댓글을 삭제할까요?")) return;
    try {
      setPosting(true);
      await removeComment(commentId);
      await fetchComments();
    } catch (e) {
      console.error("댓글 삭제 실패:", e);
      alert("댓글 삭제 실패");
    } finally {
      setPosting(false);
    }
  };

  // 공통 렌더: 한 개 댓글(부모/자식)
  const renderOne = (c, isChild = false) => {
    const isMine =
      myUserId && c.userId && Number(myUserId) === Number(c.userId);
    const isEditing = editingId === c.commentId;

    return (
      <div className={`${isChild ? "" : ""}`}>
        <div className="flex items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium text-gray-700">
                {c.nickname ?? "익명"}
              </span>
              <span>•</span>
              <span>{fmt(c.createdAt)}</span>
            </div>

            {/* 내용 or 수정 폼 */}
            {!isEditing ? (
              <div className="mt-1 whitespace-pre-wrap text-gray-800">
                {c.content}
              </div>
            ) : (
              <div className="mt-2">
                <textarea
                  className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={3}
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={posting || !editingContent.trim()}
                    onClick={saveEdit}
                    className={`px-3 py-1 rounded text-white ${
                      posting || !editingContent.trim()
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500"
                    }`}
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* 액션들 */}
            <div className="mt-2 flex gap-3 text-sm">
              {!isChild && (
                <button
                  type="button"
                  onClick={() => toggleReplySection(c.commentId)}
                  className="text-blue-600 hover:underline"
                >
                  {openReplies[c.commentId]
                    ? "답글 숨기기"
                    : `답글 달기/보기${
                        Array.isArray(c.children) && c.children.length
                          ? ` (${c.children.length})`
                          : ""
                      }`}
                </button>
              )}

              {/* 내 댓글일 때만 수정/삭제 */}
              {isMine && !isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="text-gray-600 hover:underline"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => doDelete(c.commentId)}
                    className="text-red-600 hover:underline"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>

            {/* (부모) 토글된 섹션: ✅ 입력창 + 대댓글 목록 같이 표시 */}
            {!isChild && openReplies[c.commentId] && (
              <div className="mt-3 pl-4 border-l border-gray-200">
                {/* 답글 입력창 */}
                <div className="mb-3">
                  <textarea
                    className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows={2}
                    placeholder="대댓글을 입력하세요"
                    value={replyOpenId === c.commentId ? replyContent : ""}
                    onChange={(e) => {
                      // 열린 부모와 입력창 부모가 다르면 포커스 옮기면서 초기화
                      if (replyOpenId !== c.commentId) {
                        setReplyOpenId(c.commentId);
                        setReplyContent(e.target.value);
                      } else {
                        setReplyContent(e.target.value);
                      }
                    }}
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyContent("");
                        setReplyOpenId(null);
                      }}
                      className="px-4 py-2 rounded border border-gray-200 hover:bg-gray-50"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      disabled={
                        posting ||
                        !replyContent.trim() ||
                        replyOpenId !== c.commentId
                      }
                      onClick={() => submitReply(c.commentId)}
                      className={`px-4 py-2 rounded text-white ${
                        posting ||
                        !replyContent.trim() ||
                        replyOpenId !== c.commentId
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-500"
                      }`}
                    >
                      등록
                    </button>
                  </div>
                </div>

                {/* 대댓글 목록 */}
                {Array.isArray(c.children) && c.children.length > 0 && (
                  <ul className="space-y-3">
                    {c.children.map((ch) => (
                      <li key={ch.commentId} className="flex items-start">
                        <div className="flex-1">{renderOne(ch, true)}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className={` ${className}`}>
      <div ref={topRef} />

      {/* 헤더 + 총개수 */}
      <div className="flex items-end justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">댓글</h3>
        <span className="text-sm text-gray-500">총 {total}개</span>
      </div>

      {/* 새 댓글 입력 박스 */}
      <div className="mb-4 border border-gray-200 rounded-md p-3 bg-white">
        <textarea
          className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={3}
          placeholder="댓글을 입력하세요"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            disabled={posting || !newContent.trim()}
            onClick={submitNewComment}
            className={`px-4 py-2 rounded text-white ${
              posting || !newContent.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            등록
          </button>
        </div>
      </div>

      {/* 목록 (구분선으로 분리) */}
      {loading ? (
        <div className="py-6 text-gray-400 text-center">불러오는 중…</div>
      ) : list.length === 0 ? (
        <div className="py-6 text-gray-500 text-center">
          첫 댓글을 남겨보세요 ✍️
        </div>
      ) : (
        <ul className="bg-white border border-gray-200 rounded-md divide-y divide-gray-200">
          {list.map((c) => (
            <li key={c.commentId} className="p-3">
              {renderOne(c, false)}
            </li>
          ))}
        </ul>
      )}

      {/* 페이징 */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => goPage(page - 1)}
          className={`px-3 py-1 rounded border border-gray-200 ${
            canPrev ? "hover:bg-gray-50" : "opacity-40 cursor-not-allowed"
          }`}
        >
          이전
        </button>
        <span className="text-sm text-gray-600">
          {meta.totalPages === 0 ? 0 : page + 1} / {meta.totalPages}
        </span>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => goPage(page + 1)}
          className={`px-3 py-1 rounded border border-gray-200 ${
            canNext ? "hover:bg-gray-50" : "opacity-40 cursor-not-allowed"
          }`}
        >
          다음
        </button>
      </div>
    </section>
  );
};

export default BoardCommentListComponent;
