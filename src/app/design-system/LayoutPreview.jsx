'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
const examples = [
  ['home','หน้าแรก · C201'], ['intake','แจ้งอาการ · C203'], ['history','ประวัติ · C403'],
  ['account','บัญชี · C501'], ['addressedit','ฟอร์มที่อยู่ · C515'],
  ['storeinfo','แผงข้อมูลร้าน · C212'], ['homeaddress','แผงเลือกที่อยู่ · C210'],
];
export default function LayoutPreview() {
  const [width,setWidth]=useState(393),[screen,setScreen]=useState('home'),[result,setResult]=useState(null);
  const frame=useRef(null);
  const inspect=useCallback(()=>{
    const doc=frame.current?.contentDocument, phone=doc?.querySelector('#phone');
    const current=doc?.querySelector('#stack>.scr:last-child');
    if(!phone||!current)return;
    const box=phone.getBoundingClientRect();
    const elements=[...current.querySelectorAll('.app-page,.hm-content>*,.hm-updates>*,.field,.row,.btn'),...doc.querySelectorAll('#sheet:not([hidden]) .sh-b>*,#sheet:not([hidden]) .sh-f>*')];
    const overflow=elements.filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.left<box.left-1||r.right>box.right+1)});
    const scrolling=current.querySelector('.app-page');
    const gutter=scrolling?getComputedStyle(scrolling).getPropertyValue('--page-gutter').trim():'';
    setResult({overflow:overflow.length,gutter});
  },[]);
  useEffect(()=>{setResult(null);const timer=setInterval(inspect,750);return()=>clearInterval(timer)},[width,screen,inspect]);
  return <section className="layout-preview" aria-labelledby="layoutPreviewTitle">
    <h2 id="layoutPreviewTitle">ตรวจเลย์เอาต์หน้าจอจริง</h2>
    <p>เลือกหน้าและขนาดจอ แล้วลองเลื่อนหรือกดใช้งานเพื่อตรวจแนวขอบและระยะห่าง</p>
    <div className="layout-preview-controls">
      <label>หน้าจอ<select value={screen} onChange={e=>setScreen(e.target.value)}>{examples.map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></label>
      <div role="group" aria-label="ความกว้างจอ" className="layout-widths">{[320,360,393,430].map(size=><button key={size} type="button" aria-pressed={width===size} onClick={()=>setWidth(size)}>{size} px</button>)}</div>
    </div>
    <p className="layout-preview-result" role="status">{result ? `${result.overflow ? 'พบส่วนล้นด้านข้าง '+result.overflow+' จุด' : 'ไม่พบเนื้อหาล้นด้านข้าง'} · ขอบหน้า ${result.gutter}` : 'กำลังโหลดหน้าจอ…'}</p>
    <div className="layout-preview-stage"><iframe ref={frame} key={`${screen}-${width}`} title={`ตัวอย่าง ${screen} ที่ ${width}px`} src={`/?bare=1&chrome=1&splash=0&screen=${screen}&state=normal`} width={width} height="740" onLoad={inspect}/></div>
  </section>;
}
