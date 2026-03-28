/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{html,js}"
    ],
    theme: {
        screens: {
            'xs': '480px',
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1600px',
        },
        extend: {
            fontFamily: {
                sans: ['Montserrat', 'sans-serif'],
            },
            colors: {
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
                },
                'blue-link': '#1f59e0',
                'blue-visa': '#104ad0',
                'red-alert': '#800020',
                orange: '#DF7E0F',
                shadow: 'rgba(0, 0, 0, 0.25)',
                shadowItem: 'rgba(0, 0, 0, 0.5)',
            }
        },
    },
    plugins: [],
}