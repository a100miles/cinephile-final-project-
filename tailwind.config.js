/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["'Google Sans Flex'", "ui-sans-serif", "system-ui"],
                serif: ["Lora", "ui-serif", "Georgia"]
            }
        }
    },
    plugins: []
};
