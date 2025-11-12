/**
 * routes/index.tsx
 * หน้า index ใช้ redirect ไปยัง /golds เสมอ
 */
import { Navigate } from "react-router-dom";
export default function IndexRoute(){ return <Navigate to="/golds" replace />; }