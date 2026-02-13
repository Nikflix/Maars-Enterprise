/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'media', // or 'class'
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--bg-primary)',
                foreground: 'var(--text-primary)',
                primary: {
                    DEFAULT: 'var(--text-primary)',
                    foreground: 'var(--bg-primary)',
                },
                secondary: {
                    DEFAULT: 'var(--bg-secondary)',
                    foreground: 'var(--text-secondary)',
                },
                accent: {
                    DEFAULT: 'var(--accent-primary)',
                    foreground: '#ffffff',
                },
                'accent-primary': 'var(--accent-primary)',
                'accent-secondary': 'var(--accent-secondary)',
                muted: {
                    DEFAULT: 'var(--bg-tertiary)',
                    foreground: 'var(--text-secondary)',
                },
                border: 'var(--border-subtle)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Merriweather', 'serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
