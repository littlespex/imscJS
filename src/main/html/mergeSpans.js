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

import { getSpanAncestorColor } from './getSpanAncestorColor.js';
import { spanMerge } from './spanMerge.js';


export function mergeSpans(lineList, context) {

  for (let i = 0; i < lineList.length; i++) {

    const line = lineList[i];

    for (let j = 1; j < line.elements.length;) {

      const previous = line.elements[j - 1];
      const span = line.elements[j];

      if (spanMerge(previous.node, span.node, context)) {

        //removed from DOM by spanMerge(), remove from the list too.
        line.elements.splice(j, 1);
        continue;

      } else {

        j++;

      }

    }
  }

  // Copy backgroundColor to each span so that fillLineGap will apply padding to elements with the right background
  let thisNode, ancestorBackgroundColor;
  const clearTheseBackgrounds = [];

  for (let l = 0; l < lineList.length; l++) {

    for (let el = 0; el < lineList[l].elements.length; el++) {

      thisNode = lineList[l].elements[el].node;
      ancestorBackgroundColor = getSpanAncestorColor(thisNode, clearTheseBackgrounds, false);

      if (ancestorBackgroundColor) {

        thisNode.style.backgroundColor = ancestorBackgroundColor;

      }
    }
  }

  for (let bi = 0; bi < clearTheseBackgrounds.length; bi++) {

    clearTheseBackgrounds[bi].style.backgroundColor = "";

  }
}
