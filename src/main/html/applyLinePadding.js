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

const browserIsFirefox = /firefox/i.test(navigator.userAgent);

export function applyLinePadding(lineList, lp, context) {

  if (lineList === null) return;

  for (let i = 0; i < lineList.length; i++) {

    const l = lineList[i].elements.length;

    const pospadpxlen = Math.ceil(lp) + 'px';

    const negpadpxlen = '-' + Math.ceil(lp) + 'px';

    if (l !== 0) {

      const se = lineList[i].elements[lineList[i].start_elem];

      const ee = lineList[i].elements[lineList[i].end_elem];

      if (se === ee) {

        // Check to see if there's any background at all
        const elementBoundingRect = se.node.getBoundingClientRect();

        if (elementBoundingRect.width == 0 || elementBoundingRect.height == 0) {

          // There's no background on this line, move on.
          continue;

        }

      }

      // Start element
      if (context.ipd === 'lr') {

        se.node.style.marginLeft = negpadpxlen;
        se.node.style.paddingLeft = pospadpxlen;

      } else if (context.ipd === 'rl') {

        se.node.style.paddingRight = pospadpxlen;
        se.node.style.marginRight = negpadpxlen;

      } else if (context.ipd === 'tb') {

        se.node.style.paddingTop = pospadpxlen;
        se.node.style.marginTop = negpadpxlen;

      }

      // End element
      if (context.ipd === 'lr') {

        // Firefox has a problem with line-breaking when a negative margin is applied.
        // The positioning will be wrong but don't apply when on firefox.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1502610
        if (!browserIsFirefox) {
          ee.node.style.marginRight = negpadpxlen;
        }
        ee.node.style.paddingRight = pospadpxlen;

      } else if (context.ipd === 'rl') {

        ee.node.style.paddingLeft = pospadpxlen;
        if (!browserIsFirefox) {
          ee.node.style.marginLeft = negpadpxlen;
        }

      } else if (context.ipd === 'tb') {

        ee.node.style.paddingBottom = pospadpxlen;
        ee.node.style.marginBottom = negpadpxlen;

      }

    }

  }

}
