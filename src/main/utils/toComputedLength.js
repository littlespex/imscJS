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

import { ComputedLength } from './ComputedLength.js';

/**
 * Computes a specified length to a root container relative length
 *
 * @param {number} lengthVal Length value to be computed
 * @param {string} lengthUnit Units of the length value
 * @param {number} emScale length of 1em, or null if em is not allowed
 * @param {number} percentScale length to which , or null if perecentage is not allowed
 * @param {number} cellScale length of 1c, or null if c is not allowed
 * @param {number} pxScale length of 1px, or null if px is not allowed
 * @param {number} direction 0 if the length is computed in the horizontal direction, 1 if the length is computed in the vertical direction
 * @return {number} Computed length
 */
export function toComputedLength(lengthVal, lengthUnit, emLength, percentLength, cellLength, pxLength) {

  if (lengthUnit === '%' && percentLength) {

    return new ComputedLength(
      percentLength.rw * lengthVal / 100,
      percentLength.rh * lengthVal / 100
    );

  } else if (lengthUnit === 'em' && emLength) {

    return new ComputedLength(
      emLength.rw * lengthVal,
      emLength.rh * lengthVal
    );

  } else if (lengthUnit === 'c' && cellLength) {

    return new ComputedLength(
      lengthVal * cellLength.rw,
      lengthVal * cellLength.rh
    );

  } else if (lengthUnit === 'px' && pxLength) {

    return new ComputedLength(
      lengthVal * pxLength.rw,
      lengthVal * pxLength.rh
    );

  } else if (lengthUnit === 'rh') {

    return new ComputedLength(
      0,
      lengthVal / 100
    );

  } else if (lengthUnit === 'rw') {

    return new ComputedLength(
      lengthVal / 100,
      0
    );

  } else {

    return null;

  }

}
