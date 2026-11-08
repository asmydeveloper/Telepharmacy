import { runtimeVersion } from '@/lib/runtime-version.mjs';
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
import '@/styles/registration.css';
import '@/styles/preview-device.css';
import '@/styles/address-map.css';
import Runtime from '@/components/Runtime';
export const metadata = { title: 'MITRAREE ปรึกษาเภสัชกร' };
export default function Page() {
  const version = runtimeVersion();
  return (
    <>
      <Shell />
      <Runtime
        prelude={[`/runtime/address-map.js?v=${version}`, `/runtime/customer-fixtures.js?v=${version}`]}
        src={`/runtime/customer.js?v=${version}`}
      />
    </>
  );
}
