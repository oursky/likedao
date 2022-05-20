module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        "2xs": ".6875rem",
      },
      colors: {
        likecoin: {
          green: "#28646E",
          lightgreen: "#A5B6B9",
          grey: "#D8D8D8",
          "primary-bg": "#F8F7F4",
          gradient: {
            from: "#D7EFE7",
            to: "#EFE7B8",
          },
          "vote-color": {
            yes: "#6DCDBC",
            no: "#C72F2F",
          },
        },
      },
    },
  },
  plugins: [],
};
