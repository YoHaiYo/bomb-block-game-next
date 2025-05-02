import { useEffect } from "react";

// 한국시간 타임스탬프용 -> supabase 자체 sql 문으로 해결함
export function getKoreaTime() {
  const date = new Date();
  const kstOffset = 9 * 60 * 60 * 1000; // 9시간 (밀리초)
  const kstDate = new Date(date.getTime() + kstOffset);
  const year = kstDate.getUTCFullYear();
  const month = String(kstDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(kstDate.getUTCDate()).padStart(2, "0");
  const hours = String(kstDate.getUTCHours()).padStart(2, "0");
  const minutes = String(kstDate.getUTCMinutes()).padStart(2, "0");
  const seconds = String(kstDate.getUTCSeconds()).padStart(2, "0");
  const milliseconds = String(kstDate.getUTCMilliseconds()).padStart(3, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}+09:00`;
}

/* 
  <드롭다운 영역 밖 선택으로 닫기>
  사용법 : menuRef-드롭다운에 지정, exceptionRef-드롭다운 여는 버튼에 지정, setShowDropDown-드롭다운 닫음
  예시 : useOutsideClick([menuRef, exceptionRef], () => setShowDropDown(false));
 */
export function useOutsideClick(refs, closeCallback) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!refs.some((ref) => ref.current?.contains(event.target))) {
        closeCallback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [refs, closeCallback]);
}
/*
< 토스트 메시지 보여주기>
주의 : index page.js에 body 태그 아래에 해당 html 선언되어있음. 
예시 : <button onClick={() => {showToast("소설이 복사되었습니다.");}}>
*/
export function showToast(message) {
  const toast = document.getElementById("toast-message");

  toast.textContent = message; // 메시지 변경
  toast.classList.remove("hidden"); // 표시

  setTimeout(() => {
    toast.classList.add("hidden"); // 2초 후 숨김
  }, 1500);
}
/*
< 클립보드에 소설 공유용 URL 복사 >
예시 : <button onClick={() => {copyNovelURL(novelId);}}>
*/
export const copyNovelURL = (novelId) => {
  const baseURL = window.location.protocol + "//" + window.location.host;
  const textToCopy = `${baseURL}/user-novels/${novelId}`;
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      // console.log("클립보드에 소설 복사됨.");
    })
    .catch((err) => {
      console.error("복사 실패:", err);
    });
};
