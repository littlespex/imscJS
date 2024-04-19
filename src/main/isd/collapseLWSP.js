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

export function collapseLWSP(elist) {

  function isPrevCharLWSP(prev_element) {
    return prev_element.kind === 'br' || /[\r\n\t ]$/.test(prev_element.text);
  }

  function isNextCharLWSP(next_element) {
    return next_element.kind === 'br' || (next_element.space === 'preserve' && /^[\r\n]/.test(next_element.text));
  }

  /* collapse spaces and remove leading LWSPs */
  let element;

  for (let i = 0; i < elist.length;) {

    element = elist[i];

    if (element.kind === 'br' || element.space === 'preserve') {
      i++;
      continue;
    }

    let trimmed_text = element.text.replace(/[\t\r\n ]+/g, ' ');

    if (/^[ ]/.test(trimmed_text)) {

      if (i === 0 || isPrevCharLWSP(elist[i - 1])) {
        trimmed_text = trimmed_text.substring(1);
      }

    }

    element.text = trimmed_text;

    if (trimmed_text.length === 0) {
      elist.splice(i, 1);
    } else {
      i++;
    }

  }

  /* remove trailing LWSPs */
  for (let i = 0; i < elist.length; i++) {

    element = elist[i];

    if (element.kind === 'br' || element.space === 'preserve') {
      i++;
      continue;
    }

    if (/[ ]$/.test(element.text)) {

      if (i === (elist.length - 1) || isNextCharLWSP(elist[i + 1])) {
        element.text = element.text.slice(0, -1);
      }

    }

  }

}
