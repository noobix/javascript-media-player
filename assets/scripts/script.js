const cover = document.getElementById('cover');
const disc = document.getElementById('disc');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const progressContainer = document.getElementById('progress-container');
const progress = document.getElementById('progress');
const timer = document.getElementById('timer');
const duration = document.getElementById('duration');
const prev = document.getElementById('prev');
const play = document.getElementById('play');
const next = document.getElementById('next');
const songs = document.getElementById('files')
let songIndex = 0;

songs.onchange = function(e) {
  selectMusic(loadTrackInfo)
}

var filedata = []

function selectMusic(func) {
  const fileList = songs.files
  for (let i=0; i < fileList.length; i++) {
    let file = fileList.item(i)
    // var path = (window.URL || window.webkitURL).createObjectURL(file)
    // console.log(path)
    var reader = new FileReader();
    var track, composer, album, year
    reader.onload = function(e) {
      var dv = new jDataView(this.result);
      // "TAG" starts at byte -128 from EOF.
      if (dv.getString(3, dv.byteLength - 128) == 'TAG') {
        track = dv.getString(30, dv.tell());
        composer = dv.getString(30, dv.tell());
        album = dv.getString(30, dv.tell());
        year = dv.getString(4, dv.tell());
      } else {
        console.log('id3 metadata not found')
      }
      var path = (window.URL || window.webkitURL).createObjectURL(file)
      filedata[i] = {fileName: file.name, location: path, title: track, 
      artist: composer, album: album, year: year}
      func(i)
      console.log(filedata[i].location)
    };
    reader.readAsArrayBuffer(file);
    //console.log(file.name)
    //console.log(filedata)
  }
  //const arr = Array.from(fileList)
  // Load song initially
}
function loadTrackInfo(i) {
  if (i == songIndex) {
    loadSong(filedata[songIndex]);
  }
}

// Load the given song
function loadSong(song) {
  // cover.src = null;
  disc.src = song.location;
  title.textContent = song.title;
  artist.textContent = song.artist;
  // duration.textContent = null;
}

// Toggle play and pause
function playPauseMedia() {
  if (disc.paused) {
    disc.play();
  } else {
    disc.pause();
  }
}

// Update icon
function updatePlayPauseIcon() {
  if (disc.paused) {
    play.classList.remove('fa-pause');
    play.classList.add('fa-play');
  } else {
    play.classList.remove('fa-play');
    play.classList.add('fa-pause');
  }
}

// Update progress bar
function updateProgress() {
  progress.style.width = (disc.currentTime / disc.duration) * 100 + '%';

  let minutes = Math.floor(disc.currentTime / 60);
  let seconds = Math.floor(disc.currentTime % 60);
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  timer.textContent = `${minutes}:${seconds}`;
}

// Reset the progress
function resetProgress() {
  progress.style.width = 0 + '%';
  timer.textContent = '0:00';
}

// Go to previous song
function gotoPreviousSong() {
  if (songIndex === 0) {
    songIndex = file.length - 1;
  } else {
    songIndex = songIndex - 1;
  }

  const isDiscPlayingNow = !disc.paused;
  loadSong(filedata[songIndex]);
  resetProgress();
  if (isDiscPlayingNow) {
    playPauseMedia();
  }
}

// Go to next song
function gotoNextSong(playImmediately) {
  if (songIndex === filedata.length - 1) {
    songIndex = 0;
  } else {
    songIndex = songIndex + 1;
  }

  const isDiscPlayingNow = !disc.paused;
  loadSong(filedata[songIndex]);
  resetProgress();
  if (isDiscPlayingNow || playImmediately) {
    playPauseMedia();
  }
}

// Change song progress when clicked on progress bar
function setProgress(ev) {
  const totalWidth = this.clientWidth;
  const clickWidth = ev.offsetX;
  const clickWidthRatio = clickWidth / totalWidth;
  disc.currentTime = clickWidthRatio * disc.duration;
}

// Play/Pause when play button clicked
play.addEventListener('click', playPauseMedia);

// Various events on disc
disc.addEventListener('play', updatePlayPauseIcon);
disc.addEventListener('pause', updatePlayPauseIcon);
disc.addEventListener('timeupdate', updateProgress);
disc.addEventListener('ended', gotoNextSong.bind(null, true));

// Go to next song when next button clicked
prev.addEventListener('click', gotoPreviousSong);

// Go to previous song when previous button clicked
next.addEventListener('click', gotoNextSong.bind(null, false));

// Move to different place in the song
progressContainer.addEventListener('click', setProgress);
