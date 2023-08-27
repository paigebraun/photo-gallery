const minWidth = 75;
const maxWidth = 100;
const totalImages = 60;

const main = document.querySelector(".main");
const imageSection = document.querySelector(".image__section");
const range = document.querySelector(".range");

let currentPageWidth = main.clientWidth;
let currentValue = window.innerWidth <= 800 ? 0 : 7;

////////////

updateProgressBar(currentValue);

if (window.innerWidth <= 800) createImages(400, 800);
else createImages(400, 1920);

////////////

const imageElements = Array.from(document.querySelectorAll(".image"));
const imageUrls = imageElements.map((image) => image.src.split("/").reverse()[0]);
const images = Array.from(document.querySelectorAll(".image__container"));

const popup = document.querySelector(".popup");
const popupImage = document.querySelector(".popup__image");
const buttonClose = document.querySelector(".button__close-popup");
const imageCount = document.querySelector(".popup__current-count");

const popupArrow = document.querySelector(".popup__arrow");
const totalCount = document.querySelector(".popup__total-count");

let currentIndex;
let isPopupOpen = false;
let touchStartX = null;
let touchMoveX = null;

const mouseCoords = { x: 0, y: 0 };

////////////

window.addEventListener("unload", () => window.scrollTo(0, 0));
window.addEventListener("load", handlePageUpdates);
window.addEventListener("resize", handlePageUpdates);
window.addEventListener("mousemove", saveMouseCoords);

range.addEventListener("input", scaleImages);

images.forEach((image) => image.addEventListener("click", openPopup));

buttonClose.addEventListener("click", closePopup);
window.addEventListener("keydown", closePopup);
window.addEventListener("keydown", changeImages);
popup.addEventListener("click", changeImages);
popup.addEventListener("mousemove", moveArrow);

popup.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchMoveX = 0;
});

popup.addEventListener("touchmove", (e) => {
  touchMoveX = e.touches[0].clientX;
});

popup.addEventListener("touchend", swipeImage);

////////////
////////////
////////////
////////////

// LOAD IMAGES
function createImages(size, maxSize) {
  let count = 0;

  for (let i = 0; i < totalImages; i++) {
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("image__container");

    const image = new Image();
    image.classList.add("image");

    const index = i < 10 ? "0" + i : i;
    image.src = `./assets/images-${size}/${index}.jpg`;

    imageContainer.append(image);
    imageSection.append(imageContainer);

    // Image onload
    image.onload = () => {
      count++;

      addImageOrientation(image);

      loadBigImages(image, index, maxSize);
    };
  }
}

// LOAD MAX SIZE IMAGES
function loadBigImages(image, index, maxSize) {
  let interval = setInterval(() => {
      setTimeout(() => {
        image.src = `./assets/images-${maxSize}/${index}.jpg`;
        image.loading = "lazy";
      }, 2000);

      clearInterval(interval);
  }, 500);
}

// ADD ORIENTATION
function addImageOrientation(image) {
  const imageContainer = image.closest(".image__container");

  const width = image.clientWidth;
  const height = image.clientHeight;

  if (width > height) imageContainer.classList.add("landscape");
  else imageContainer.classList.add("portrait");

  imageContainer.classList.add("visible");
}

////////////
////////////
////////////
////////////

// RESIZE AND RELOAD
function handlePageUpdates() {
  currentPageWidth = main.clientWidth;

  updateImageWidth();
}

// SCALE IMAGES
function scaleImages() {
  currentValue = Number(this.value);

  updateProgressBar(currentValue);
  updateImageWidth();
}

// NEW IMAGE WIDTH
function updateImageWidth() {
  const newMinWidth = minWidth + ((currentPageWidth - minWidth) * Number(currentValue)) / 100;
  const newMaxWidth = maxWidth + ((currentPageWidth - maxWidth) * Number(currentValue)) / 100;

  images.forEach((image) => {
    if (image.classList.contains("portrait")) {
      image.style.width = newMinWidth + "px";
    }
    if (image.classList.contains("landscape")) {
      image.style.width = newMaxWidth + "px";
    }
  });
}

////////////
////////////
////////////
////////////

// RANGE INPUT
function updateProgressBar(value) {
  range.value = value;
  range.style.background = `linear-gradient(to right, var(--black) ${value}%, 
        var(--black) ${value}%, var(--light-grey) 0%, var(--light-grey) 100%)`;
}

////////////
////////////
////////////
////////////

// OPEN POPUP
function openPopup(e) {
  const targetContainer = e.target.closest(".image__container");
  const src = e.target.src.split("/").reverse()[0];

  popupImage.src = `./assets/images-1920/${src}`;
  currentIndex = imageUrls.findIndex((url) => url === src);

  removeImageOrientation();
  updateImageOrientation(targetContainer);
  updateCount(currentIndex);

  totalCount.innerHTML = totalImages > 100 ? totalImages : "0" + totalImages;

  popup.classList.add("popup--open");
  document.body.classList.add("scroll--canceled");
  setTimeout(() => (popup.style.opacity = 1), 100);

  isPopupOpen = true;
  showArrow();
}

// CLOSE POPUP
function closePopup(e) {
  if (e.target.classList.contains("button__close-popup") || e.key === "Escape") {
    popup.style.opacity = 0;

    setTimeout(() => {
      popupImage.src = "";
      removeImageOrientation();

      popup.classList.remove("popup--open");
      document.body.classList.remove("scroll--canceled");

      isPopupOpen = false;
    }, 100);
  } else return;
}

// CHANGE IMAGES
function changeImages(e) {
  if (e.type === "keydown") {
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
    else return;
  }

  if (e.type === "click" && isPopupOpen && window.innerWidth >= 1024) {
    const leftSide = e.clientX < currentPageWidth / 2;
    const rightSide = e.clientX >= currentPageWidth / 2;
    const linkOrButton = e.target.tagName === "A" || e.target.tagName === "BUTTON";

    if (leftSide && !linkOrButton) prevImage();
    if (rightSide && !linkOrButton) nextImage();
  }
}

// SWIPE IMAGE (MOBILE)
function swipeImage(e) {
  const linkOrButton = e.target.tagName === "A" || e.target.tagName === "BUTTON";

  const diff = Math.abs(touchStartX - touchMoveX);
  const validSwipe = touchMoveX !== 0 && diff >= 10;

  if (touchStartX > touchMoveX && !linkOrButton && validSwipe) nextImage();
  if (touchStartX < touchMoveX && !linkOrButton && validSwipe) prevImage();
  else return;
}

// NEXT IMAGE
function nextImage() {
  currentIndex += 1;

  if (currentIndex >= totalImages) currentIndex = 0;
  showImage(currentIndex);
}

// PREV IMAGE
function prevImage() {
  currentIndex -= 1;
  if (currentIndex < 0) currentIndex = totalImages - 1;
  showImage(currentIndex);
}

// SHOW IMAGE
function showImage(index) {
  const fileName = imageUrls[index];
  const imgElement = imageElements.find((img) => img.src.includes(fileName));
  const imgContainer = imgElement.closest(".image__container");

  popupImage.src = `./assets/images-1920/${fileName}`;


  removeImageOrientation();
  updateImageOrientation(imgContainer);
  
  updateCount(index);
}

// UPDATE IMAGE ORIENTATION
function updateImageOrientation(container) {
  if (container.classList.contains("landscape")) {
    popupImage.classList.add("popup--landscape");
  } else {
    popupImage.classList.add("popup--portrait");
  }
}

// REMOVE IMAGE ORIENTATION
function removeImageOrientation() {
  popupImage.classList.remove("popup--landscape");
  popupImage.classList.remove("popup--portrait");
}

// UPDATE COUNT
function updateCount(idx) {
  const newCount = String(idx + 1).padStart(3, "0");
  imageCount.innerHTML = newCount;
}

// SHOW ARROW
function showArrow() {
  if (window.innerWidth < 1024) return;

  popupArrow.style.left = mouseCoords.x + 20 + "px";
  popupArrow.style.top = mouseCoords.y + "px";

  popupArrow.style.opacity = 1;
}

// SHOW ARROW
function moveArrow(e) {
  if (window.innerWidth < 1024) return;

  popupArrow.style.left = e.clientX + 20 + "px";
  popupArrow.style.top = e.clientY + "px";

  if (e.clientX <= window.innerWidth / 2) {
    popupArrow.innerHTML = "PREV";
  } else {
    popupArrow.innerHTML = "NEXT";
  }

  if (e.clientY <= 40 || e.clientY > window.innerHeight - 60) {
    popupArrow.style.opacity = 0;
  }
}

// SAVE MOUSE COORDS
function saveMouseCoords(e) {
  mouseCoords.x = e.clientX;
  mouseCoords.y = e.clientY;
}
