import { useState } from "react";
import { FaRegCopy } from "react-icons/fa6";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Copy failed", err);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <FaRegCopy
        size={18}
        className={`cursor-pointer hover:text-blue-600 ${
          copied ? "text-green-600" : "text-gray-500"
        }`}
        onClick={handleCopy}
      />
    </div>
  );
}