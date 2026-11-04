/* Shared consultation reference adapter for the local prototype.
   Production must receive the immutable, globally unique caseCode from the case service. */
(function(root){
  const fixtureIds = ["TC-260412-0012", "TC-260412-0021", "TC-260630-0043", "TC-260818-0058", "TC-260818-0060", "TC-260905-0069", "TC-260914-0031", "TC-260922-0074", "TC-261002-0087", "TC-261015-0077", "TC-261016-0058", "TC-261017-0063", "TC-261017-0091", "TC-261017-0102", "TC-261017-0121", "TC-261017-0148", "TC-261017-0151", "TC-261018-0098", "TC-261018-0101", "TC-261018-0112", "TC-261018-0119", "TC-261018-0126", "TC-261018-0131", "TC-261018-0138", "TC-261018-0140", "TC-261018-0142", "TC-261018-0143", "TC-261018-0144", "TC-261018-0145", "TC-261028-0098", "TC-261028-0102", "preview-follow-1", "preview-follow-2", "preview-follow-3"];
  const format = value => {
    if (!Number.isSafeInteger(value) || value < 1) throw new RangeError('Invalid consultation sequence');
    return 'MR' + String(value).padStart(3,'0');
  };
  function createRegistry(storage) {
    const key='mitraree.consultation-references.v1';
    let state={next:fixtureIds.length+1,codes:Object.fromEntries(fixtureIds.map((id,i)=>[id,format(i+1)]))};
    const read=()=>{try{const saved=JSON.parse(storage?.getItem(key)||'null');if(saved?.codes){for(const [id,code] of Object.entries(saved.codes)){if(/^MR[0-9]{3,}$/.test(code))state.codes[id]=code;}state.next=Math.max(state.next,Number(saved.next)||1,...Object.values(state.codes).map(code=>Number(code.slice(2))+1));}}catch{}};
    const save=()=>{try{storage?.setItem(key,JSON.stringify(state));}catch{}};
    const codeFor=record=>{
      const id=typeof record==='string'?record:record?.id;
      if (!id) return '';
      read();
      const supplied=typeof record==='object'?record.caseCode:'';
      if (/^MR[0-9]{3,}$/.test(supplied||id)) {
        const code=supplied||id;
        state.codes[id]=code;state.next=Math.max(state.next,Number(code.slice(2))+1);save();return code;
      }
      if (!state.codes[id]) {state.codes[id]=format(state.next++);save();}
      return state.codes[id];
    };
    read();return {format,codeFor};
  }
  const description=record=>String(record?.note ?? record?.intakeNote ?? record?._case?.note ?? '').trim();
  let storage;try{if(typeof window==='object')storage=root.localStorage;}catch{}
  const api={...createRegistry(storage),createRegistry,description};
  root.MitrareeConsultations=api;
  if(typeof module==='object' && module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
