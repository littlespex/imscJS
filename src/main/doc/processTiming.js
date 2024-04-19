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

import { reportWarning } from '../error/reportWarning.js';
import { parseTimeExpression } from './parseTimeExpression.js';

export function processTiming(doc, parent, node, errorHandler) {
  /* determine explicit begin */

  let explicit_begin = null;

  if (node && 'begin' in node.attributes) {

    explicit_begin = parseTimeExpression(doc.tickRate, doc.effectiveFrameRate, node.attributes.begin.value);

    if (explicit_begin === null) {

      reportWarning(errorHandler, 'Malformed begin value ' + node.attributes.begin.value + ' (using 0)');

    }

  }

  /* determine explicit duration */
  let explicit_dur = null;

  if (node && 'dur' in node.attributes) {

    explicit_dur = parseTimeExpression(doc.tickRate, doc.effectiveFrameRate, node.attributes.dur.value);

    if (explicit_dur === null) {

      reportWarning(errorHandler, 'Malformed dur value ' + node.attributes.dur.value + ' (ignoring)');

    }

  }

  /* determine explicit end */
  let explicit_end = null;

  if (node && 'end' in node.attributes) {

    explicit_end = parseTimeExpression(doc.tickRate, doc.effectiveFrameRate, node.attributes.end.value);

    if (explicit_end === null) {

      reportWarning(errorHandler, 'Malformed end value (ignoring)');

    }

  }

  return {
    explicit_begin: explicit_begin,
    explicit_end: explicit_end,
    explicit_dur: explicit_dur
  };

}
