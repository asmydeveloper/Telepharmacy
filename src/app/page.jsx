import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Shell from './Shell';
import './styles.css';
import '@/styles/figma-tokens.css';
import '@/styles/tokens.css';
import '@/styles/customer-ui.css';
import '@/styles/layout.css';
import '@/styles/home.css';
import '@/styles/components.css';
import '@/styles/intake.css';
import '@/styles/history.css';
import '@/styles/adr.css';
import '@/styles/registration.css';
import '@/styles/preview-device.css';
import Runtime from '@/components/Runtime';
export const metadata = { title: "MITRAREE ปรึกษาเภสัชกร" };
export default function Page() {
  const version = createHash('sha256').update(readFileSync(join(process.cwd(), 'public/runtime/customer.js'))).digest('hex').slice(0,12);
  return <><Shell /><Runtime src={`/runtime/customer.js?v=${version}`} /></>;
}
