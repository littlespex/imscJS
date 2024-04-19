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

import { reportFatal } from '../error/reportFatal.js';
import { imscNames } from '../imscNames.js';
import { ComputedLength } from '../utils/ComputedLength.js';
import { Head } from './Head.js';
import { extractAspectRatio } from './extractAspectRatio.js';
import { extractCellResolution } from './extractCellResolution.js';
import { extractExtent } from './extractExtent.js';
import { extractFrameAndTickRate } from './extractFrameAndTickRate.js';
import { findAttribute } from './findAttribute.js';
import { indexOf } from './indexOf.js';


export class TT {
  constructor() {
    this.events = [];
    this.head = new Head();
    this.body = null;
  }

  initFromNode(node, xmllang, errorHandler) {
    /* compute cell resolution */

    const cr = extractCellResolution(node, errorHandler);

    this.cellLength = {
      'h': new ComputedLength(0, 1 / cr.h),
      'w': new ComputedLength(1 / cr.w, 0)
    };

    /* extract frame rate and tick rate */
    const frtr = extractFrameAndTickRate(node, errorHandler);

    this.effectiveFrameRate = frtr.effectiveFrameRate;

    this.tickRate = frtr.tickRate;

    /* extract aspect ratio */
    this.aspectRatio = extractAspectRatio(node, errorHandler);

    /* check timebase */
    const attr = findAttribute(node, imscNames.ns_ttp, 'timeBase');

    if (attr !== null && attr !== 'media') {

      reportFatal(errorHandler, 'Unsupported time base');

    }

    /* retrieve extent */
    const e = extractExtent(node, errorHandler);

    if (e === null) {

      this.pxLength = {
        'h': null,
        'w': null
      };

    } else {

      if (e.h.unit !== 'px' || e.w.unit !== 'px') {
        reportFatal(errorHandler, 'Extent on TT must be in px or absent');
      }

      this.pxLength = {
        'h': new ComputedLength(0, 1 / e.h.value),
        'w': new ComputedLength(1 / e.w.value, 0)
      };
    }

    /** set root container dimensions to (1, 1) arbitrarily
         * the root container is mapped to actual dimensions at rendering
    **/
    this.dimensions = {
      'h': new ComputedLength(0, 1),
      'w': new ComputedLength(1, 0)
    };

    /* xml:lang */
    this.lang = xmllang;

  };

  /* register a temporal events */
  _registerEvent(elem) {
    /* skip if begin is not < then end */

    if (elem.end <= elem.begin)
      return;

    /* index the begin time of the event */
    const b_i = indexOf(this.events, elem.begin);

    if (!b_i.found) {
      this.events.splice(b_i.index, 0, elem.begin);
    }

    /* index the end time of the event */
    if (elem.end !== Number.POSITIVE_INFINITY) {

      const e_i = indexOf(this.events, elem.end);

      if (!e_i.found) {
        this.events.splice(e_i.index, 0, elem.end);
      }

    }

  };


  /*
   * Retrieves the range of ISD times covered by the document
   *
   * @returns {Array} Array of two elements: min_begin_time and max_begin_time
   *
   */
  getMediaTimeRange() {

    return [this.events[0], this.events[this.events.length - 1]];
  };

  /*
   * Returns list of ISD begin times
   *
   * @returns {Array}
   */
  getMediaTimeEvents() {

    return this.events;
  };
}
