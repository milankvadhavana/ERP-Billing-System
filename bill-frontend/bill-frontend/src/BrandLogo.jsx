import logoImage from "./assets/logo.jpeg";
import { colors } from "./theme";

/**
 * One logo component used on every page so alignment is always identical.
 * The logo file has a lot of empty cream space around the artwork, so the
 * image is cropped (object-fit: cover) inside a 2:1 box with the same cream
 * colour. This makes the logo fill the box and sit perfectly centred.
 */
export default function BrandLogo({ width = "100%", maxWidth, radius = 0, shadow = "none", style = {} }) {
  return (
    <div
      style={{
        width,
        maxWidth,
        aspectRatio: "2 / 1",
        background: colors.cream,
        borderRadius: radius,
        boxShadow: shadow,
        overflow: "hidden",
        ...style,
      }}
    >
      <img
        src={logoImage}
        alt="Shreeji Orange Decore - The World of Quality"
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 47%", display: "block" }}
      />
    </div>
  );
}
