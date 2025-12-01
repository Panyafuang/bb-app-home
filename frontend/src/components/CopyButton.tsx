import { useState } from "react";
import { FaRegCopy } from "react-icons/fa6";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      // ใช้ Clipboard API ถ้ามี (HTTPS หรือ localhost)
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback สำหรับ HTTP หรือ browser รุ่นเก่า
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        document.execCommand("copy"); // fallback copy
        document.body.removeChild(textarea);
      }

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
