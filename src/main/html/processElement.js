/* 
 * Copyright (c) 2016, Pierre-Anthony Lemieux <pal@sandflow.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import { reportError } from '../error/reportError.js';
import { byName } from '../styles/byName.js';
import { RegionPBuffer } from './RegionPBuffer.js';
import { STYLING_MAP_DEFS } from './STYLING_MAP_DEFS.js';
import { applyFillLineGap } from './applyFillLineGap.js';
import { applyLinePadding } from './applyLinePadding.js';
import { applyMultiRowAlign } from './applyMultiRowAlign.js';
import { applyRubyPosition } from './applyRubyPosition.js';
import { applyRubyReserve } from './applyRubyReserve.js';
import { applyTextEmphasis } from './applyTextEmphasis.js';
import { applyTextEmphasisOutside } from './applyTextEmphasisOutside.js';
import { constructLineList } from './constructLineList.js';
import { mergeSpans } from './mergeSpans.js';
import { rect2edges } from './rect2edges.js';

export function processElement(context, dom_parent, isd_element, isd_parent) {

  let e;

  if (isd_element.kind === 'region') {

    e = document.createElement('div');
    e.style.position = 'absolute';

  } else if (isd_element.kind === 'body') {

    e = document.createElement('div');

  } else if (isd_element.kind === 'div') {

    e = document.createElement('div');

  } else if (isd_element.kind === 'image') {

    e = document.createElement('img');

    if (context.imgResolver !== null && isd_element.src !== null) {

      const uri = context.imgResolver(isd_element.src, e);

      if (uri)
        e.src = uri;

      e.height = context.regionH;
      e.width = context.regionW;

    }

  } else if (isd_element.kind === 'p') {

    e = document.createElement('p');

  } else if (isd_element.kind === 'span') {

    if (isd_element.styleAttrs[byName.ruby.qname] === 'container') {

      e = document.createElement('ruby');

      context.ruby = true;

    } else if (isd_element.styleAttrs[byName.ruby.qname] === 'base') {

      e = document.createElement('span'); // rb element is deprecated in HTML

    } else if (isd_element.styleAttrs[byName.ruby.qname] === 'text') {

      e = document.createElement('rt');


    } else if (isd_element.styleAttrs[byName.ruby.qname] === 'baseContainer') {

      e = document.createElement('rbc');


    } else if (isd_element.styleAttrs[byName.ruby.qname] === 'textContainer') {

      e = document.createElement('rtc');


    } else if (isd_element.styleAttrs[byName.ruby.qname] === 'delimiter') {

      /* ignore rp */
      return;

    } else {

      e = document.createElement('span');

    }

    //e.textContent = isd_element.text;
  } else if (isd_element.kind === 'br') {

    e = document.createElement('br');

  }

  if (!e) {

    reportError(context.errorHandler, 'Error processing ISD element kind: ' + isd_element.kind);

    return;

  }

  /* set language */
  if (isd_element.lang) {

    if (isd_element.kind === 'region' || isd_element.lang !== isd_parent.lang) {
      e.lang = isd_element.lang;
    }

  }

  /* add to parent */
  dom_parent.appendChild(e);

  /* override UA default margin */
  /* TODO: should apply to <p> only */
  e.style.margin = '0';

  /* determine ipd and bpd */
  if (isd_element.kind === 'region') {

    const wdir = isd_element.styleAttrs[byName.writingMode.qname];

    if (wdir === 'lrtb' || wdir === 'lr') {

      context.ipd = 'lr';
      context.bpd = 'tb';

    } else if (wdir === 'rltb' || wdir === 'rl') {

      context.ipd = 'rl';
      context.bpd = 'tb';

    } else if (wdir === 'tblr') {

      context.ipd = 'tb';
      context.bpd = 'lr';

    } else if (wdir === 'tbrl' || wdir === 'tb') {

      context.ipd = 'tb';
      context.bpd = 'rl';

    }

  } else if (isd_element.kind === 'p' && context.bpd === 'tb') {

    const pdir = isd_element.styleAttrs[byName.direction.qname];

    context.ipd = pdir === 'ltr' ? 'lr' : 'rl';

  }

  /* tranform TTML styles to CSS styles */
  for (let i = 0; i < STYLING_MAP_DEFS.length; i++) {

    const sm = STYLING_MAP_DEFS[i];

    const attr = isd_element.styleAttrs[sm.qname];

    if (attr !== undefined && sm.map !== null) {

      sm.map(context, e, isd_element, attr);

    }

  }

  let proc_e = e;

  /* do we have linePadding ? */
  const lp = isd_element.styleAttrs[byName.linePadding.qname];

  if (lp && (!lp.isZero())) {

    const plength = lp.toUsedLength(context.w, context.h);


    if (plength > 0) {

      /* apply padding to the <p> so that line padding does not cause line wraps */
      const padmeasure = Math.ceil(plength) + 'px';

      if (context.bpd === 'tb') {

        proc_e.style.paddingLeft = padmeasure;
        proc_e.style.paddingRight = padmeasure;

      } else {

        proc_e.style.paddingTop = padmeasure;
        proc_e.style.paddingBottom = padmeasure;

      }

      context.lp = lp;
    }
  }

  // do we have multiRowAlign?
  const mra = isd_element.styleAttrs[byName.multiRowAlign.qname];

  if (mra && mra !== 'auto') {

    /* create inline block to handle multirowAlign */
    const s = document.createElement('span');

    s.style.display = 'inline-block';

    s.style.textAlign = mra;

    e.appendChild(s);

    proc_e = s;

    context.mra = mra;

  }

  /* do we have rubyReserve? */
  const rr = isd_element.styleAttrs[byName.rubyReserve.qname];

  if (rr && rr[0] !== 'none') {
    context.rubyReserve = rr;
  }


  /* remember we are filling line gaps */
  if (isd_element.styleAttrs[byName.fillLineGap.qname]) {
    context.flg = true;
  }


  if (isd_element.kind === 'span' && isd_element.text) {

    const te = isd_element.styleAttrs[byName.textEmphasis.qname];

    if (te && te.style !== 'none') {

      context.textEmphasis = true;

    }

    if (byName.textCombine.qname in isd_element.styleAttrs &&
      isd_element.styleAttrs[byName.textCombine.qname] === 'all') {

      /* ignore tate-chu-yoku since line break cannot happen within */
      e.textContent = isd_element.text;
      e._isd_element = isd_element;

      if (te) {

        applyTextEmphasis(context, e, isd_element, te);

      };

    } else {

      // wrap characters in spans to find the line wrap locations
      let cbuf = '';

      for (let j = 0; j < isd_element.text.length; j++) {

        cbuf += isd_element.text.charAt(j);

        const cc = isd_element.text.charCodeAt(j);

        if (cc < 55296 || cc > 56319 || j === isd_element.text.length - 1) {

          /* wrap the character(s) in a span unless it is a high surrogate */
          const span = document.createElement('span');

          span.textContent = cbuf;

          /* apply textEmphasis */
          if (te) {

            applyTextEmphasis(context, span, isd_element, te);

          };

          e.appendChild(span);

          cbuf = '';

          //For the sake of merging these back together, record what isd element generated it.
          span._isd_element = isd_element;
        }

      }

    }
  }

  /* process the children of the ISD element */
  if ('contents' in isd_element) {

    for (let k = 0; k < isd_element.contents.length; k++) {

      processElement(context, proc_e, isd_element.contents[k], isd_element);

    }

  }

  /* list of lines */
  const linelist = [];


  /* paragraph processing */
  /* TODO: linePadding only supported for horizontal scripts */
  if (isd_element.kind === 'p') {

    constructLineList(context, proc_e, linelist, null);

    /* apply rubyReserve */
    if (context.rubyReserve) {

      applyRubyReserve(linelist, context);

      context.rubyReserve = null;

    }

    /* apply tts:rubyPosition="outside" */
    if (context.ruby || context.rubyReserve) {

      applyRubyPosition(linelist, context);

      context.ruby = null;

    }

    /* apply text emphasis "outside" position */
    if (context.textEmphasis) {

      applyTextEmphasisOutside(linelist, context);

      context.textEmphasis = null;

    }

    /* insert line breaks for multirowalign */
    if (context.mra) {

      applyMultiRowAlign(linelist);

      context.mra = null;

    }

    /* add linepadding */
    if (context.lp) {

      applyLinePadding(linelist, context.lp.toUsedLength(context.w, context.h), context);

      context.lp = null;

    }

    mergeSpans(linelist, context); // The earlier we can do this the less processing there will be.



    /* fill line gaps linepadding */
    if (context.flg) {

      const par_edges = rect2edges(proc_e.getBoundingClientRect(), context);

      applyFillLineGap(linelist, par_edges.before, par_edges.after, context, proc_e);

      context.flg = null;

    }

  }


  /* region processing */
  if (isd_element.kind === 'region') {

    /* perform roll up if needed */
    if ((context.bpd === 'tb') &&
      context.enableRollUp &&
      isd_element.contents.length > 0 &&
      isd_element.styleAttrs[byName.displayAlign.qname] === 'after') {

      /* build line list */
      constructLineList(context, proc_e, linelist, null);

      /* horrible hack, perhaps default region id should be underscore everywhere? */
      const rid = isd_element.id === '' ? '_' : isd_element.id;

      const rb = new RegionPBuffer(rid, linelist);

      context.currentISDState[rb.id] = rb;

      if (context.previousISDState &&
        rb.id in context.previousISDState &&
        context.previousISDState[rb.id].plist.length > 0 &&
        rb.plist.length > 1 &&
        rb.plist[rb.plist.length - 2].text ===
        context.previousISDState[rb.id].plist[context.previousISDState[rb.id].plist.length - 1].text) {

        const body_elem = e.firstElementChild;

        const h = rb.plist[rb.plist.length - 1].after - rb.plist[rb.plist.length - 1].before;

        body_elem.style.bottom = '-' + h + 'px';
        body_elem.style.transition = 'transform 0.4s';
        body_elem.style.position = 'relative';
        body_elem.style.transform = 'translateY(-' + h + 'px)';

      }

    }
  }
}
