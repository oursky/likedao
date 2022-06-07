module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        "2xs": ".6875rem",
      },
      maxWidth: {
        "2lg": "32.5rem",
      },
      colors: {
        likecoin: {
          green: "#28646E",
          black: "#222222",
          darkgrey: "#666666",
          lightgreen: "#A5B6B9",
          darkgreen: "#1A4951",
          grey: "#D8D8D8",
          darkgrey: "#666666",
          lightgrey: "#E8E8E8",
          "primary-bg": "#F8F7F4",
          black: "#222222",
          gradient: {
            from: "#D7EFE7",
            to: "#EFE7B8",
          },
          "vote-color": {
            yes: "#6DCDBC",
            no: "#C72F2F",
          },
          yellow: "#FFD951",
        },
      },
    },
  },
  plugins: [],
};
