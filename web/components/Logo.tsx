import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center group">
      <Image
        src="/image/logo-bilik-mapur.png"
        alt="Bilik Mapur"
        width={969}
        height={198}
        priority
        className="h-8 sm:h-9 w-auto"
      />
    </Link>
  );
}
