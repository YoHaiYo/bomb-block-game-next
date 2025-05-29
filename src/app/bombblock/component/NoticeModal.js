import { useState } from "react";

export default function NoticeModal({ show, onClose }) {
  const [doNotShow, setDoNotShow] = useState(false);
  const handleClose = () => {
    if (doNotShow) {
      localStorage.setItem(`blockgg_notice_1`, "true"); // 공지 업데이트할때마다 숫자 추가. page.jsx도 있음.
    }
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md text-gray-800 text-sm font-mono">
        <h2 className="text-lg font-bold mb-2">📢 Update Notice (250529)</h2>
        <p className="mb-4">
          {`Special Bomb Blocks like 💣Tank, ✈️Bomber, and ☢️Nuke now appear during gameplay. Destroy these blocks to collect powerful weapons and turn the tide of the game!
we're actively tuning the balance and would love to hear your feedback.
Enjoy the game and let us know what you think!
`}
        </p>
        <hr />
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="dontShowAgain"
            checked={doNotShow}
            onChange={(e) => setDoNotShow(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="dontShowAgain">{`Don't show this again`}</label>
        </div>
        <div className="text-right">
          <button
            onClick={handleClose}
            className="px-4 py-1 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
