export const theming = {
    light: {
        id: 'light',
        background: '#fefefe',
        backgroundSecondary: '#f8f9fa',
        text: '#212529',
        muted: '#e9ecef',
        elevation: {
            boxShadow: "0px 0px 4px 0px rgba(0,0,0,0.2)",
            borderRadius: 8,
        },
        lowering: {
            boxShadow: "inset 0px 0px 3px 0px rgba(0,0,0,0.2)",
            borderRadius: 8,
        },
        primary: '#17a2b8',
        secondary: '#6f42c1',
        shadowColor: '#000'
    },
    dark: {
        id: 'dark',
        background: '#212529',
        backgroundSecondary: '#343a40',
        text: '#f8f9fa',
        muted: '#868e96',
        elevation: {
            boxShadow: "0px 0px 4px 0px rgba(255,255,255,0.2)",
            borderRadius: 8,
        },
        lowering: {
            boxShadow: "inset 0px 0px 3px 0px rgba(255,255,255,0.2)",
            borderRadius: 8,
        },
        primary: '#17a2b8',
        secondary: '#6f42c1',
        shadowColor: '#fff'
    }
}