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

import { reportError } from '../error/reportError.js';
import { reportWarning } from '../error/reportWarning.js';
import { byName } from '../styles/byName.js';
import { byQName } from '../styles/byQName.js';

export function elementGetStyles(node, errorHandler) {

  const s = {};

  if (node !== null) {

    for (const i in node.attributes) {

      const qname = node.attributes[i].uri + ' ' + node.attributes[i].local;

      const sa = byQName[qname];

      if (sa !== undefined) {

        const val = sa.parse(node.attributes[i].value);

        if (val !== null) {

          s[qname] = val;

          /* TODO: consider refactoring errorHandler into parse and compute routines */
          if (sa === byName.zIndex) {
            reportWarning(errorHandler, 'zIndex attribute present but not used by IMSC1 since regions do not overlap');
          }

        } else {

          reportError(errorHandler, 'Cannot parse styling attribute ' + qname + ' --> ' + node.attributes[i].value);

        }

      }

    }

  }

  return s;
}
