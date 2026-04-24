import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';

const productAboutThumbs = new Swiper('.product-about-thumbs', {
  spaceBetween: 20,
  slidesPerView: 3,
  freeMode: true,
  watchSlidesProgress: true,
});

const productAboutGallery = new Swiper('.product-about-gallery', {
  spaceBetween: 10,
  navigation: {
    nextEl: '.produto-about-swiper-button-next',
    prevEl: '.produto-about-swiper-button-prev',
  },
  thumbs: {
    swiper: productAboutThumbs,
  },
});
