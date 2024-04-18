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

import { TEXTEMPHASISPOSITION_PROP } from './TEXTEMPHASISPOSITION_PROP.js';


export function applyTextEmphasisOutside(lineList, context) {
  /* supports "outside" only */

  for (var i = 0; i < lineList.length; i++) {

    for (var j = 0; j < lineList[i].te.length; j++) {

      /* skip if position already set */
      if (lineList[i].te[j].style[TEXTEMPHASISPOSITION_PROP] &&
        lineList[i].te[j].style[TEXTEMPHASISPOSITION_PROP] !== "none")
        continue;

      var pos;

      if (context.bpd === "tb") {

        pos = (i === 0) ? "left over" : "left under";


      } else {

        if (context.bpd === "rl") {

          pos = (i === 0) ? "right under" : "left under";

        } else {

          pos = (i === 0) ? "left under" : "right under";

        }

      }

      lineList[i].te[j].style[TEXTEMPHASISPOSITION_PROP] = pos;

    }

  }

}
