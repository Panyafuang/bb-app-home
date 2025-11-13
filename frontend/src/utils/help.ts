/** (Helper) แปลงค่าตัวเลขอย่างปลอดภัย */
export function parseNumber(v: any): number | null {
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
};