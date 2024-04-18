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

import { parseLength } from "./parseLength.js";

/* Documents the error handler interface */
/**
 * @classdesc Generic interface for handling events. The interface exposes four
 * methods:
 * * <pre>info</pre>: unusual event that does not result in an inconsistent state
 * * <pre>warn</pre>: unexpected event that should not result in an inconsistent state
 * * <pre>error</pre>: unexpected event that may result in an inconsistent state
 * * <pre>fatal</pre>: unexpected event that results in an inconsistent state
 *   and termination of processing
 * Each method takes a single <pre>string</pre> describing the event as argument,
 * and returns a single <pre>boolean</pre>, which terminates processing if <pre>true</pre>.
 *
 * @name ErrorHandler
 * @class
 */



export function parsePosition(str) {
  /* see https://www.w3.org/TR/ttml2/#style-value-position */

  var s = str.split(" ");

  var isKeyword = function (str) {

    return str === "center" ||
      str === "left" ||
      str === "top" ||
      str === "bottom" ||
      str === "right";

  };

  if (s.length > 4) {

    return null;

  }

  /* initial clean-up pass */
  for (var j = 0; j < s.length; j++) {

    if (!isKeyword(s[j])) {

      var l = parseLength(s[j]);

      if (l === null)
        return null;

      s[j] = l;
    }

  }

  /* position default */
  var pos = {
    h: { edge: "left", offset: { value: 50, unit: "%" } },
    v: { edge: "top", offset: { value: 50, unit: "%" } }
  };

  /* update position */
  for (var i = 0; i < s.length;) {

    /* extract the current component */
    var comp = s[i++];

    if (isKeyword(comp)) {

      /* we have a keyword */
      var offset = { value: 0, unit: "%" };

      /* peek at the next component */
      if (s.length !== 2 && i < s.length && (!isKeyword(s[i]))) {

        /* followed by an offset */
        offset = s[i++];

      }

      /* skip if center */
      if (comp === "right") {

        pos.h.edge = comp;

        pos.h.offset = offset;

      } else if (comp === "bottom") {

        pos.v.edge = comp;


        pos.v.offset = offset;


      } else if (comp === "left") {

        pos.h.offset = offset;


      } else if (comp === "top") {

        pos.v.offset = offset;


      }

    } else if (s.length === 1 || s.length === 2) {

      /* we have a bare value */
      if (i === 1) {

        /* assign it to left edge if first bare value */
        pos.h.offset = comp;

      } else {

        /* assign it to top edge if second bare value */
        pos.v.offset = comp;

      }

    } else {

      /* error condition */
      return null;

    }

  }

  return pos;
}
