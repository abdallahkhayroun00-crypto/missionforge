import {chromium} from '@playwright/test';
import {existsSync} from 'node:fs';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
try {
 const page=await browser.newPage();
 await page.goto(new URL('docs/presentation.html',process.env.PREVIEW_URL||'http://127.0.0.1:8765/').href);
 await page.evaluate(()=>document.fonts.ready);
 // PDFs must link to the public project, never the development server.
 await page.evaluate(()=>{const base=document.createElement('base');base.href='https://abdallahkhayroun00-crypto.github.io/missionforge/docs/';document.head.prepend(base);});
 await page.pdf({path:'docs/presentation.pdf',preferCSSPageSize:true,printBackground:true});
 console.log('Exported docs/presentation.pdf with public project links.');
} finally {await browser.close();}
