import { useState } from "react";

export default function CommonModal({
  isOpen,
  setIsOpen,
  type = 1,
  title = "알림",
  message,
  cancelText = "취소",
  confirmText = "확인",
  confirmCallback = () => {}, // 안써도 경고안뜨게 디폴트값을 빈 함수 쓰기.
  addHtml,
}) {
  // const [isOpen, setIsOpen] = useState(true); // 외부에서 컨트롤해야됨.
  return (
    <>
      {isOpen && (
        <div
          className="relative z-50"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          {/* 배경 DIM 처리 */}
          <div
            className="fixed inset-0 bg-gray-500/75 transition-opacity"
            aria-hidden="true"
          ></div>

          <div
            onClick={() => {
              setIsOpen(false);
            }}
            className="fixed inset-0 z-50 w-screen overflow-y-auto flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
          >
            {/* 모달 내용 */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
            >
              {/* 헤더 + 내용 */}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:size-10">
                    {/* <i className="text-blue-600 text-lg fa-solid fa-triangle-exclamation"></i> */}
                    <svg
                      className="size-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg font-semibold text-gray-900"
                      id="modal-title"
                    >
                      {title}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{message}</p>
                      {addHtml}
                    </div>
                  </div>
                </div>
              </div>
              {/* 버튼 영역 */}
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                {/* type1일때 확인 버튼 */}
                {type === 1 && (
                  <>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        confirmCallback();
                      }}
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    >
                      {confirmText}
                    </button>
                  </>
                )}
                {/* type2일때 확인,취소 버튼 */}
                {type === 2 && (
                  <>
                    <button
                      onClick={() => {
                        confirmCallback();
                      }}
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    >
                      {confirmText}
                    </button>

                    <button
                      onClick={() => {
                        setIsOpen(false);
                      }}
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    >
                      {cancelText}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
