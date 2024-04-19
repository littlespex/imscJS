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

import { TEXTEMPHASISSTYLE_PROP } from './TEXTEMPHASISSTYLE_PROP.js';
import { isSameLine } from './isSameLine.js';
import { rect2edges } from './rect2edges.js';

export function constructLineList(context, element, llist, bgcolor) {

  if (element.localName === "rt" || element.localName === "rtc") {

    /* skip ruby annotations */
    return;

  }

  const curbgcolor = element.style.backgroundColor || bgcolor;

  if (element.childElementCount === 0) {

    if (element.localName === 'span' || element.localName === 'rb') {

      const r = element.getBoundingClientRect();

      const edges = rect2edges(r, context);

      if (llist.length === 0 ||
        (!isSameLine(edges.before, edges.after, llist[llist.length - 1].before, llist[llist.length - 1].after))) {
        llist.push({
          before: edges.before,
          after: edges.after,
          start: edges.start,
          end: edges.end,
          start_elem: 0,
          end_elem: 0,
          elements: [],
          rbc: [],
          te: [],
          text: "",
          br: false
        });

      } else {

        /* positive for BPD = lr and tb, negative for BPD = rl */
        const bpd_dir = Math.sign(edges.after - edges.before);

        /* positive for IPD = lr and tb, negative for IPD = rl */
        const ipd_dir = Math.sign(edges.end - edges.start);

        /* check if the line height has increased */
        if (bpd_dir * (edges.before - llist[llist.length - 1].before) < 0) {
          llist[llist.length - 1].before = edges.before;
        }

        if (bpd_dir * (edges.after - llist[llist.length - 1].after) > 0) {
          llist[llist.length - 1].after = edges.after;
        }

        if (ipd_dir * (edges.start - llist[llist.length - 1].start) < 0) {
          llist[llist.length - 1].start = edges.start;
          llist[llist.length - 1].start_elem = llist[llist.length - 1].elements.length;
        }

        if (ipd_dir * (edges.end - llist[llist.length - 1].end) > 0) {
          llist[llist.length - 1].end = edges.end;
          llist[llist.length - 1].end_elem = llist[llist.length - 1].elements.length;
        }

      }

      llist[llist.length - 1].text += element.textContent;

      llist[llist.length - 1].elements.push(
        {
          node: element,
          bgcolor: curbgcolor,
          before: edges.before,
          after: edges.after
        }
      );

    } else if (element.localName === 'br' && llist.length !== 0) {

      llist[llist.length - 1].br = true;

    }

  } else {

    let child = element.firstChild;

    while (child) {

      if (child.nodeType === Node.ELEMENT_NODE) {

        constructLineList(context, child, llist, curbgcolor);

        if (child.localName === 'ruby' || child.localName === 'rtc') {

          /* remember non-empty ruby and rtc elements so that tts:rubyPosition can be applied */
          if (llist.length > 0) {

            llist[llist.length - 1].rbc.push(child);

          }

        } else if (child.localName === 'span' &&
          child.style[TEXTEMPHASISSTYLE_PROP] &&
          child.style[TEXTEMPHASISSTYLE_PROP] !== "none") {

          /* remember non-empty span elements with textEmphasis */
          if (llist.length > 0) {

            llist[llist.length - 1].te.push(child);

          }

        }


      }

      child = child.nextSibling;
    }
  }

}
