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

const HEX_COLOR_RE = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?/;
const DEC_COLOR_RE = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/;
const DEC_COLORA_RE = /rgba\(\s*(\d+),\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/;
const NAMED_COLOR = {
  transparent: [0, 0, 0, 0],
  black: [0, 0, 0, 255],
  silver: [192, 192, 192, 255],
  gray: [128, 128, 128, 255],
  white: [255, 255, 255, 255],
  maroon: [128, 0, 0, 255],
  red: [255, 0, 0, 255],
  purple: [128, 0, 128, 255],
  fuchsia: [255, 0, 255, 255],
  magenta: [255, 0, 255, 255],
  green: [0, 128, 0, 255],
  lime: [0, 255, 0, 255],
  olive: [128, 128, 0, 255],
  yellow: [255, 255, 0, 255],
  navy: [0, 0, 128, 255],
  blue: [0, 0, 255, 255],
  teal: [0, 128, 128, 255],
  aqua: [0, 255, 255, 255],
  cyan: [0, 255, 255, 255]
};

/*
 * Parses a TTML color expression
 * 
 */
export function parseColor(str) {

  let m;

  let r = null;

  const nc = NAMED_COLOR[str.toLowerCase()];

  if (nc !== undefined) {

    r = nc;

  } else if ((m = HEX_COLOR_RE.exec(str)) !== null) {

    r = [parseInt(m[1], 16),
    parseInt(m[2], 16),
    parseInt(m[3], 16),
    (m[4] !== undefined ? parseInt(m[4], 16) : 255)];

  } else if ((m = DEC_COLOR_RE.exec(str)) !== null) {

    r = [parseInt(m[1]),
    parseInt(m[2]),
    parseInt(m[3]),
      255];

  } else if ((m = DEC_COLORA_RE.exec(str)) !== null) {

    r = [parseInt(m[1]),
    parseInt(m[2]),
    parseInt(m[3]),
    parseInt(m[4])];

  }

  return r;
}
