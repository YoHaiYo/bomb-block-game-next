// 게임 최고 점수 관련 유틸리티 함수들

export const loadBestScore = () => {
  const saved = localStorage.getItem("bombBlockBestScore");
  return saved ? parseInt(saved) : 0;
};

export const saveBestScore = (score, currentBest) => {
  if (score > currentBest) {
    localStorage.setItem("bombBlockBestScore", score.toString());
    return score;
  }
  return currentBest;
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};
