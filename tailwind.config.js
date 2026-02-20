/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                aldi: {
                    navy: '#00205C',
                    blue: '#0063B2',
                    orange: '#FF6600',
                    success: '#1A8754',
                    warning: '#E8A317',
                    danger: '#D63B30',
                    bg: '#F7F8FA',
                    surface: '#FFFFFF',
                    text: {
                        primary: '#1A1D23',
                        secondary: '#5F6B7A',
                    },
                    border: '#E2E6EC',
                    hover: '#EBF0F7'
                }
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }
        },
    },
    plugins: [],
}
