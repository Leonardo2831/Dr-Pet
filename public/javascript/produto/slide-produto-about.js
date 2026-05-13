import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';

export default function slideProduto(){
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

  const productAboutThumbs = new Swiper('.product-about-thumbs', {
    spaceBetween: 30,
    slidesPerView: 'auto',
    freeMode: true,
    watchSlidesProgress: true,
    centerInsufficientSlides: true,
  });

  const productAboutGallery = new Swiper('.product-about-gallery', {
    spaceBetween: 10,
    loop: true,
    navigation: {
      nextEl: '.produto-about-swiper-button-next',
      prevEl: '.produto-about-swiper-button-prev',
    },
    thumbs: {
      swiper: productAboutThumbs,
    },
  });
}