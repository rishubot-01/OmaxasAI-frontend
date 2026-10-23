import { useEffect, useState } from "react";

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function Avatar({
  src = "",
  name = "User",
  alt,
  size = 40,
  className = "",
  style = {},
  onClick,
  title,
}) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const dimension =
    typeof size === "number" ? `${size}px` : size;

  const showImage = Boolean(src) && !imageFailed;

  const avatarStyle = {
    width: dimension,
    height: dimension,
    minWidth: dimension,
    borderRadius: "50%",
    overflow: "hidden",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    background: "#27272a",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 600,
    userSelect: "none",
    verticalAlign: "middle",
    cursor: onClick ? "pointer" : "default",
    ...style,
  };

  return (
    <span
      className={`avatar ${className}`.trim()}
      style={avatarStyle}
      title={title || name}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (
          onClick &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          onClick(event);
        }
      }}
      aria-label={alt || name}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name}
          width="100%"
          height="100%"
          loading="lazy"
          onError={() => setImageFailed(true)}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "inherit",
          }}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  );
}