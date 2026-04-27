/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./public/**/*.{html,js}"
    ],
    corePlugins: {
        container: false,
    },
    theme: {
        screens: {
            'xs': '480px',
            'sm': '640px',
            'md': '830px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1600px',
        },
        colors: {
            transparent: 'transparent',
            current: 'currentColor',
            black: '#000000',
            white: '#fcfcfc',
            gray: {
                50: '#f5f5f5',
                100: '#e8ebe9',
                200: '#d4d9d6',
                300: '#c3c7c5',
                400: '#a8adaa',
                500: '#878c89',
                600: '#606662',
                700: '#454a47',
                800: '#2f3331',
                900: '#202422',
                950: '#121413',
            },
            green: {
                50: '#d9fbe7',
                100: '#2AF29B',
                200: '#24D88A',
                300: '#1FBE75',
                400: '#19995E',
                500: '#127447',
                600: '#0B5030',
                700: '#032B18',
                'light': '#D1EDDB'
            },
            'blue-link': '#1f59e0',
            'blue-light': '#D1D8ED',
            'blue-hover': '#0f3aa7',
            'red-alert': '#800020',
            'red-light': '#F0DDDE',
            orange: '#DF7E0F',
            'orange-light': '#EDDAC7',
            shadow: 'rgba(0, 0, 0, 0.25)',
            shadowItem: 'rgba(0, 0, 0, 0.5)',
        },
        keyframes: {
            'fade-top': {
                '0%': { 'transform': 'translateY(-20px)', 'opacity': 0 },
                '100%': { 'transform': 'translateY(0)', 'opacity': 1 }
            },
            'fade-left': {
                '0%': { 'transform': 'translateX(-20px)', 'opacity': 0 },
                '100%': { 'transform': 'translateX(0)', 'opacity': 1 }
            },
            'fade-right': {
                '0%': { 'transform': 'translateX(20px)', 'opacity': 0 },
                '100%': { 'transform': 'translateX(0)', 'opacity': 1 }
            },
            'fade-down': {
                '0%': { 'transform': 'translateY(20px)', 'opacity': 0 },
                '100%': { 'transform': 'translateX(0)', 'opacity': 1 }
            }
        },
        animation: {
            'fadeTop': 'fade-top 0.5s forwards',
            'fadeLeft': 'fade-left 0.5s forwards',
            'fadeRight': 'fade-right 0.5s forwards',
            'fadeDown': 'fade-down 0.5s forwards'
        },
        extend: {
            fontFamily: {
                sans: ['Montserrat', 'sans-serif'],
            },
        },
    },
    plugins: [],
}