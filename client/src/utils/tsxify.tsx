import React from "react";

export const tsxify = (o: any, theme: any, parent?: string) => {
  return (
    <div key={parent} style={{ marginLeft: 4 }}>
      {Object.keys(o).map((key: string) =>
        typeof o[key] === "string" ||
        typeof o[key] === "number" ||
        typeof o[key] === "boolean" ? (
          <p key={"leaf" + parent + key} style={{ color: theme.text }}>
            {titleCase(key)}: {o[key] + ""}
          </p>
        ) : (
          <div key={"key" + parent + key}>
            <p style={{ color: theme.text, marginTop: 4 }}>{titleCase(key)}:</p>
            {tsxify(o[key], theme, key)}
          </div>
        )
      )}
    </div>
  );
};

export const titleCase = (txt: string) => {
  return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
};
