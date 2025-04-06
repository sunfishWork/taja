let wordList = [];
let activeWords = [];
let score = 0;
let fallSpeed = 1;
let spawnSpeed = 4000;
let dropInterval;
let spawnInterval;
let gameRunning = false;

const gameArea = document.getElementById('game-area');
const input = document.getElementById('input');
const scoreDisplay = document.getElementById('score');
const message = document.getElementById('message');
let gunSound;
let resultSound;

try {
  resultSound = new Audio("/static/sound/erhu-sample-67145.mp3");
  resultSound.load();
} catch (e) {
  console.error("결과 사운드 로드 실패:", e);
}

try {
  gunSound = new Audio("/static/sound/cinematic-gun-163702.mp3");
  gunSound.load();  // 명시적 로딩
} catch (e) {
  console.error("오디오 파일 로드 실패:", e);
}

function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (!file) {
    alert("txt 파일을 선택하세요.");
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  fetch('/upload', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        wordList = data.words;
        startGame();
      } else {
        alert("파일 업로드 실패: " + data.error);
      }
    });
}

function spawnWord() {
  const text = wordList[Math.floor(Math.random() * wordList.length)];
  const wordEl = document.createElement('div');
  wordEl.className = 'falling-word';
  wordEl.textContent = text;

  // 화면에 추가 전에 가시성 없는 영역에 임시 위치 (또는 가상 div로 측정해도 됨)
  wordEl.style.position = 'absolute';
  wordEl.style.visibility = 'hidden';
  wordEl.style.left = `0px`;
  wordEl.style.top = `0px`;
  gameArea.appendChild(wordEl);

  const wordWidth = wordEl.offsetWidth;
  const maxX = gameArea.clientWidth - wordWidth;
  const x = Math.max(0, Math.random() * maxX);
  const y = 0;

  // 실제 위치 적용
  wordEl.style.left = `${x}px`;
  wordEl.style.top = `${y}px`;
  wordEl.style.visibility = 'visible';

  // activeWords에 등록
  activeWords.push({
    text: text,
    x: x,
    y: y,
    el: wordEl
  });
}

function moveWords() {
  activeWords.forEach((word, index) => {
    word.y += fallSpeed;
    word.el.style.top = `${word.y}px`;

    if (word.y > gameArea.clientHeight - 30) {
      endGame();
    }
  });
}

function checkInput() {
  const typed = input.value.trim();
  for (let i = 0; i < activeWords.length; i++) {
    if (typed === activeWords[i].text) {
      input.value = '';

      if (gunSound) {
        gunSound.currentTime = 0;
        gunSound.play().catch(err => console.warn("재생 오류:", err));
      }

      const wordWidth = activeWords[i].el.offsetWidth;
      const wordHeight = activeWords[i].el.offsetHeight;
      const starX = activeWords[i].x + wordWidth / 2;
      const starY = activeWords[i].y + wordHeight / 2;
      spawnStar(starX, starY);

      gameArea.removeChild(activeWords[i].el);
      activeWords.splice(i, 1);
      score++;
      // console.log(score)
      // scoreDisplay.textContent = `점수: ${score}`;
      input.value = '';
      adjustDifficulty();
      break;
    }
  }
}

function adjustDifficulty() {
  if (!gameRunning) return;

  if (score > 40) {
    fallSpeed = 1.8;
    spawnSpeed = 4000;
  } else if (score > 30) {
    fallSpeed = 1.6;
    spawnSpeed = 4500;
  } else if (score > 20) {
    fallSpeed = 1.4;
    spawnSpeed = 5000;
  } else if (score > 10) {
    fallSpeed = 1.2;
    spawnSpeed = 5500;
  }

  clearInterval(spawnInterval);
  spawnInterval = setInterval(spawnWord, spawnSpeed);
  console.log(score, fallSpeed, spawnSpeed)
}

function startGame() {
  activeWords = [];
  score = 0;
  fallSpeed = 1;
  spawnSpeed = 6000;
  gameRunning = true;
  input.disabled = false;
  input.value = '';
  message.textContent = '';
  // scoreDisplay.textContent = '점수: 0';
  const instruction = document.getElementById('game-instruction');

  // 설명 표시
  instruction.style.display = 'block';


  // 기존 단어 요소만 제거 (defence-line은 놔둠)
  document.querySelectorAll('.falling-word').forEach(el => el.remove());

  // 2초 후 설명 사라지고 게임 시작
  setTimeout(() => {
    instruction.style.display = 'none';
    dropInterval = setInterval(moveWords, 50);
    spawnInterval = setInterval(spawnWord, spawnSpeed);
  }, 10000);

  // dropInterval = setInterval(moveWords, 50);
  // spawnInterval = setInterval(spawnWord, spawnSpeed);
}

function endGame() {
  clearInterval(dropInterval);
  clearInterval(spawnInterval);
  input.disabled = true;
  gameRunning = false;

  // 기존 메시지는 숨기고 팝업 사용
  message.textContent = '';

  if (resultSound) {
    resultSound.currentTime = 0;
    resultSound.play().catch(err => console.warn("결과음 재생 오류:", err));
  }

  // 점수 팝업 띄우기
  document.getElementById('final-score').textContent = `최종 OPI: ${score} %`;
  document.getElementById('popup').style.display = 'flex';

  activeWords.forEach(word => {
    if (word.el && word.el.parentNode) {
      word.el.remove();
    }
  });
  activeWords = [];
}

input.addEventListener('input', checkInput);

function spawnStar(x, y) {
  const star = document.createElement('div');
  star.classList.add('star');
  star.textContent = '★';
  star.style.left = `${x}px`;
  star.style.top = `${y}px`;
  gameArea.appendChild(star);

  setTimeout(() => {
    star.remove();
  }, 1200);
}

function closePopup() {
  document.getElementById('popup').style.display = 'none';

  // 🎵 사운드 멈춤 추가
  if (resultSound) {
    resultSound.pause();
    resultSound.currentTime = 0; // 처음으로 되감기
  }
}

input.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    checkInput();
  }
});