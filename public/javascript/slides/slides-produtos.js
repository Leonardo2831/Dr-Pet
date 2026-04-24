import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';

const productSwiper = new Swiper('.product-swiper', {
  direction: 'horizontal',
  loop: false,
  grabCursor: true,
  spaceBetween: 30,
  slidesPerView: 'auto',
  centeredSlides: false,
  slidesOffsetBefore: 0,
  slidesOffsetAfter: 0,
  navigation: {
    nextEl: '.loja-swiper-button-next',
    prevEl: '.loja-swiper-button-prev',
  },
  breakpoints: {
    480: {
      spaceBetween: 20,
    },
    768: {
      spaceBetween: 30,
    },
    1024: {
      spaceBetween: 40,
    },
  },
});
