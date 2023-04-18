export enum Theme {
  light = "light",
  dark = "dark",
}

export const theming = {
  light: {
    id: "light",
    background: "#efeeee",
    backgroundSecondary: "#f8f9fa",
    text: "#212529",
    muted: "#adb5bd",
    elevation: {
      boxShadow: "-6px -6px 16px 0px rgba(255,255,255,0.5), 6px 6px 16px 0px rgba(209, 205, 199,0.5)",
      borderRadius: 8,
    },
    lowering: {
      boxShadow: "inset -3px -3px 8px 0px rgba(255,255,255,0.5), inset 3px 3px 8px 0px rgba(209, 205, 199,0.5)",
      borderRadius: 8,
    },
    button: {
      boxShadow: "inset -2px -2px 4px 0px rgba(209, 205, 199,0.5), inset 2px 2px 4px 0px rgba(255,255,255,0.5)",
      borderRadius: 8,
    },
    primary: "#17a2b8",
    secondary: "#ad82fa",
    danger: "#dc3545",
    shadowColor: "#000",
    borderPrimary: {
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "#17a2b8",
      borderRadius: "8px",
    },
    mapbox: {
      style: "mapbox://styles/mapbox/streets-v12",
    },
  },
  dark: {
    id: "dark",
    background: "#212529",
    backgroundSecondary: "#343a40",
    text: "#f8f9fa",
    muted: "#868e96",
    elevation: {
      boxShadow: "-4px -4px 8px 0px rgba(0, 0, 0,0.2), 4px 4px 8px 0px rgba(60, 60, 60,0.2)",
      borderRadius: 8,
    },
    lowering: {
      boxShadow: "inset -2px -2px 4px 0px rgba(0, 0, 0,0.2), inset 2px 2px 4px 0px rgba(60, 60, 60,0.2)",
      borderRadius: 8,
    },
    button: {
      boxShadow: "inset -2px -2px 4px 0px rgba(60, 60, 60,0.2), inset 2px 2px 4px 0px rgba(0, 0, 0,0.2)",
      borderRadius: 8,
    },
    primary: "#17a2b8",
    secondary: "#bf9dfc",
    danger: "#a32e26",
    shadowColor: "#fff",
    borderPrimary: {
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "#17a2b8",
      borderRadius: "8px",
    },
    mapbox: {
      style: "mapbox://styles/mapbox/dark-v11",
    },
  },
};
