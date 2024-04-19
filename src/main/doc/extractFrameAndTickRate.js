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
import { imscNames } from '../imscNames.js';
import { findAttribute } from './findAttribute.js';

export function extractFrameAndTickRate(node, errorHandler) {
  // subFrameRate is ignored per IMSC1 specification

  // extract frame rate
  const fps_attr = findAttribute(node, imscNames.ns_ttp, "frameRate");

  // initial value
  let fps = 30;

  // match variable
  let m;

  if (fps_attr !== null) {

    const FRAME_RATE_RE = /(\d+)/;

    m = FRAME_RATE_RE.exec(fps_attr);

    if (m !== null) {

      fps = parseInt(m[1]);

    } else {

      reportWarning(errorHandler, "Malformed frame rate attribute (using initial value instead)");
    }

  }

  // extract frame rate multiplier
  const frm_attr = findAttribute(node, imscNames.ns_ttp, "frameRateMultiplier");

  // initial value
  let frm = 1;

  if (frm_attr !== null) {

    const FRAME_RATE_MULT_RE = /(\d+) (\d+)/;

    m = FRAME_RATE_MULT_RE.exec(frm_attr);

    if (m !== null) {

      frm = parseInt(m[1]) / parseInt(m[2]);

    } else {

      reportWarning(errorHandler, "Malformed frame rate multiplier attribute (using initial value instead)");
    }

  }

  const efps = frm * fps;

  // extract tick rate
  let tr = 1;

  const trattr = findAttribute(node, imscNames.ns_ttp, "tickRate");

  if (trattr === null) {

    if (fps_attr !== null)
      tr = efps;

  } else {

    const TICK_RATE_RE = /(\d+)/;

    m = TICK_RATE_RE.exec(trattr);

    if (m !== null) {

      tr = parseInt(m[1]);

    } else {

      reportWarning(errorHandler, "Malformed tick rate attribute (using initial value instead)");
    }

  }

  return { effectiveFrameRate: efps, tickRate: tr };

}
