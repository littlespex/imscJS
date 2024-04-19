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

import { parseColor } from "./parseColor.js";
import { parseLength } from "./parseLength.js";


export function parseTextShadow(str) {

  const shadows = str.match(/([^(,)]|\([^)]+\))+/g);

  const r = [];

  for (let i = 0; i < shadows.length; i++) {

    const shadow = shadows[i].split(" ");

    if (shadow.length === 1 && shadow[0] === "none") {

      return "none";

    } else if (shadow.length > 1 && shadow.length < 5) {

      const out_shadow = [null, null, null, null];

      /* x offset */
      let l = parseLength(shadow.shift());

      if (l === null)
        return null;

      out_shadow[0] = l;

      /* y offset */
      l = parseLength(shadow.shift());

      if (l === null)
        return null;

      out_shadow[1] = l;

      /* is there a third component */
      if (shadow.length === 0) {
        r.push(out_shadow);
        continue;
      }

      l = parseLength(shadow[0]);

      if (l !== null) {

        out_shadow[2] = l;

        shadow.shift();

      }

      if (shadow.length === 0) {
        r.push(out_shadow);
        continue;
      }

      const c = parseColor(shadow[0]);

      if (c === null)
        return null;

      out_shadow[3] = c;

      r.push(out_shadow);
    }

  }

  return r;
}
