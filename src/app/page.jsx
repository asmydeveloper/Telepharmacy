import Shell from './Shell';
import './styles.css';
import '@/styles/tokens.css';
import '@/styles/customer-ui.css';
import Runtime from '@/components/Runtime';
export const metadata = { title: "MITRAREE ปรึกษาเภสัชกร" };
export default function Page() { return <><Shell /><Runtime src="/runtime/customer.js?v=20261031-grid-1" /></>; }
