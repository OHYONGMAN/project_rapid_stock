import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            colors: {
                primary: '#e60000',
                secondary: '#ff7308',
                'g-100': '#F8F9FA',
                'g-200': '#F4F4F6',
                'g-300': '#EEF0F2',
                'g-400': '#E0E3E6',
                'g-500': '#C2C6CA',
                'g-600': '#9FA3A7',
                'g-700': '#7B8184',
                'g-800': '#63666A',
                'g-900': '#4E5154',
                bk: '#252525',
            },
        },
    },
    plugins: [],
};
export default config;
