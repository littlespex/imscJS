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

export function applyFillLineGap(lineList, par_before, par_after, context) {

  /* positive for BPD = lr and tb, negative for BPD = rl */
  const s = Math.sign(par_after - par_before);

  for (let i = 0; i <= lineList.length; i++) {

    /* compute frontier between lines */
    let frontier;

    if (i === 0) {

      frontier = Math.round(par_before);

    } else if (i === lineList.length) {

      frontier = Math.round(par_after);

    } else {

      frontier = Math.round((lineList[i - 1].after + lineList[i].before) / 2);

    }

    let padding;
    let l, thisNode;

    /* before line */
    if (i > 0) {

      if (lineList[i - 1]) {

        for (l = 0; l < lineList[i - 1].elements.length; l++) {

          thisNode = lineList[i - 1].elements[l];
          padding = s * (frontier - thisNode.after) + "px";

          if (context.bpd === "lr") {

            thisNode.node.style.paddingRight = padding;

          } else if (context.bpd === "rl") {

            thisNode.node.style.paddingLeft = padding;

          } else if (context.bpd === "tb") {

            thisNode.node.style.paddingBottom = padding;

          }

        }

      }

    }

    /* after line */
    if (i < lineList.length) {

      for (l = 0; l < lineList[i].elements.length; l++) {

        thisNode = lineList[i].elements[l];
        padding = s * (thisNode.before - frontier) + "px";

        if (context.bpd === "lr") {

          thisNode.node.style.paddingLeft = padding;

        } else if (context.bpd === "rl") {

          thisNode.node.style.paddingRight = padding;

        } else if (context.bpd === "tb") {

          thisNode.node.style.paddingTop = padding;

        }

      }

    }

  }

}
