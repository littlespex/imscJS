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

import { RUBYPOSITION_ISWK } from './RUBYPOSITION_ISWK.js';
import { RUBYPOSITION_PROP } from './RUBYPOSITION_PROP.js';


export function applyRubyReserve(lineList, context) {

  for (let i = 0; i < lineList.length; i++) {

    const ruby = document.createElement('ruby');

    const rb = document.createElement('span'); // rb element is deprecated in HTML
    rb.textContent = '\u200B';

    ruby.appendChild(rb);

    let rt1;
    let rt2;

    const fs = context.rubyReserve[1].toUsedLength(context.w, context.h) + 'px';

    if (context.rubyReserve[0] === 'both' || (context.rubyReserve[0] === 'outside' && lineList.length == 1)) {

      rt1 = document.createElement('rtc');
      rt1.style[RUBYPOSITION_PROP] = RUBYPOSITION_ISWK ? 'after' : 'under';
      rt1.textContent = '\u200B';
      rt1.style.fontSize = fs;

      rt2 = document.createElement('rtc');
      rt2.style[RUBYPOSITION_PROP] = RUBYPOSITION_ISWK ? 'before' : 'over';
      rt2.textContent = '\u200B';
      rt2.style.fontSize = fs;

      ruby.appendChild(rt1);
      ruby.appendChild(rt2);

    } else {

      rt1 = document.createElement('rtc');
      rt1.textContent = '\u200B';
      rt1.style.fontSize = fs;

      let pos;

      if (context.rubyReserve[0] === 'after' || (context.rubyReserve[0] === 'outside' && i > 0)) {

        pos = RUBYPOSITION_ISWK ? 'after' : ((context.bpd === 'tb' || context.bpd === 'rl') ? 'under' : 'over');

      } else {

        pos = RUBYPOSITION_ISWK ? 'before' : ((context.bpd === 'tb' || context.bpd === 'rl') ? 'over' : 'under');

      }

      rt1.style[RUBYPOSITION_PROP] = pos;

      ruby.appendChild(rt1);

    }

    /* add in front of the first ruby element of the line, if it exists */
    let sib = null;

    for (let j = 0; j < lineList[i].rbc.length; j++) {

      if (lineList[i].rbc[j].localName === 'ruby') {

        sib = lineList[i].rbc[j];

        /* copy specified style properties from the sibling ruby container */
        for (let k = 0; k < sib.style.length; k++) {

          ruby.style.setProperty(sib.style.item(k), sib.style.getPropertyValue(sib.style.item(k)));

        }

        break;
      }

    }

    /* otherwise add before first span */
    sib = sib || lineList[i].elements[0].node;

    sib.parentElement.insertBefore(ruby, sib);

  }

}
