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

export function parseTimeExpression(tickRate, effectiveFrameRate, str) {

  const CLOCK_TIME_FRACTION_RE = /^(\d{2,}):(\d\d):(\d\d(?:\.\d+)?)$/;
  const CLOCK_TIME_FRAMES_RE = /^(\d{2,}):(\d\d):(\d\d):(\d{2,})$/;
  const OFFSET_FRAME_RE = /^(\d+(?:\.\d+)?)f$/;
  const OFFSET_TICK_RE = /^(\d+(?:\.\d+)?)t$/;
  const OFFSET_MS_RE = /^(\d+(?:\.\d+)?)ms$/;
  const OFFSET_S_RE = /^(\d+(?:\.\d+)?)s$/;
  const OFFSET_H_RE = /^(\d+(?:\.\d+)?)h$/;
  const OFFSET_M_RE = /^(\d+(?:\.\d+)?)m$/;
  let m;
  let r = null;

  if ((m = OFFSET_FRAME_RE.exec(str)) !== null) {

    if (effectiveFrameRate !== null) {

      r = parseFloat(m[1]) / effectiveFrameRate;
    }

  } else if ((m = OFFSET_TICK_RE.exec(str)) !== null) {

    if (tickRate !== null) {

      r = parseFloat(m[1]) / tickRate;
    }

  } else if ((m = OFFSET_MS_RE.exec(str)) !== null) {

    r = parseFloat(m[1]) / 1000;

  } else if ((m = OFFSET_S_RE.exec(str)) !== null) {

    r = parseFloat(m[1]);

  } else if ((m = OFFSET_H_RE.exec(str)) !== null) {

    r = parseFloat(m[1]) * 3600;

  } else if ((m = OFFSET_M_RE.exec(str)) !== null) {

    r = parseFloat(m[1]) * 60;

  } else if ((m = CLOCK_TIME_FRACTION_RE.exec(str)) !== null) {

    r = parseInt(m[1]) * 3600 +
      parseInt(m[2]) * 60 +
      parseFloat(m[3]);

  } else if ((m = CLOCK_TIME_FRAMES_RE.exec(str)) !== null) {

    /* this assumes that HH:MM:SS is a clock-time-with-fraction */
    if (effectiveFrameRate !== null) {

      r = parseInt(m[1]) * 3600 +
        parseInt(m[2]) * 60 +
        parseInt(m[3]) +
        (m[4] === null ? 0 : parseInt(m[4]) / effectiveFrameRate);
    }

  }

  return r;
}
