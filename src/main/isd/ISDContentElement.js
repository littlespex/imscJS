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

export class ISDContentElement {
  constructor(ttelem) {
    /* assume the element is a region if it does not have a kind */

    this.kind = ttelem.kind || 'region';

    /* copy lang */
    this.lang = ttelem.lang;

    /* copy id */
    if (ttelem.id) {
      this.id = ttelem.id;
    }

    /* deep copy of style attributes */
    this.styleAttrs = {};

    for (var sname in ttelem.styleAttrs) {

      if (!ttelem.styleAttrs.hasOwnProperty(sname)) continue;

      this.styleAttrs[sname] =
        ttelem.styleAttrs[sname];
    }

    /* copy src and type if image */
    if ('src' in ttelem) {

      this.src = ttelem.src;

    }

    if ('type' in ttelem) {

      this.type = ttelem.type;

    }

    /* TODO: clean this!
        * TODO: ISDElement and document element should be better tied together */
    if ('text' in ttelem) {

      this.text = ttelem.text;

    } else if (this.kind === 'region' || 'contents' in ttelem) {

      this.contents = [];
    }

    if ('space' in ttelem) {

      this.space = ttelem.space;
    }
  }
}
