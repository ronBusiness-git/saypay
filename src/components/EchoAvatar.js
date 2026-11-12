import Image from "next/image";

export default function EchoAvatar({
  className = "",
  sizes = "40px",
  priority = false,
  alt = "",
}) {
  return (
    <Image
      src="/images/echo-avatar.jpg"
      alt={alt}
      width={160}
      height={160}
      sizes={sizes}
      priority={priority}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
