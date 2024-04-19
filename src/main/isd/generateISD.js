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

import { byName } from '../styles/byName.js';
import { hasOwnProperty } from '../utils/hasOwnProperty.js';
import { ISD } from './ISD.js';
import { isdProcessContentElement } from './isdProcessContentElement.js';

/**
 * Creates a canonical representation of an IMSC1 document returned by <pre>imscDoc.fromXML()</pre>
 * at a given absolute offset in seconds. This offset does not have to be one of the values returned
 * by <pre>getMediaTimeEvents()</pre>.
 *
 * @param {Object} tt IMSC1 document
 * @param {number} offset Absolute offset (in seconds)
 * @param {?module:imscUtils.ErrorHandler} errorHandler Error callback
 * @returns {Object} Opaque in-memory representation of an ISD
 */
export function generateISD(tt, offset, errorHandler) {
  /* TODO check for tt and offset validity */

  /* create the ISD object from the IMSC1 doc */
  const isd = new ISD(tt);

  /* context */
  const context = {
    /*rubyfs: []*/ /* font size of the nearest textContainer or container */
  };

  /* Filter body contents - Only process what we need within the offset and discard regions not applicable to the content */
  let body = {};
  const activeRegions = {};

  /* gather any regions that might have showBackground="always" and show a background */
  const initialShowBackground = tt.head.styling.initials[byName.showBackground.qname];
  const initialbackgroundColor = tt.head.styling.initials[byName.backgroundColor.qname];
  for (const layout_child in tt.head.layout.regions) {
    if (hasOwnProperty(tt.head.layout.regions, layout_child)) {
      const region = tt.head.layout.regions[layout_child];
      const showBackground = region.styleAttrs[byName.showBackground.qname] || initialShowBackground;
      const backgroundColor = region.styleAttrs[byName.backgroundColor.qname] || initialbackgroundColor;
      activeRegions[region.id] = (
        (showBackground === 'always' || showBackground === undefined) &&
        backgroundColor !== undefined &&
        !(offset < region.begin || offset >= region.end)
      );
    }
  }

  /* If the body specifies a region, catch it, since no filtered content will */
  /* likely specify the region. */
  if (tt.body && tt.body.regionID) {
    activeRegions[tt.body.regionID] = true;
  }

  function filter(offset, element) {
    function offsetFilter(element) {
      return !(offset < element.begin || offset >= element.end);
    }

    if (element.contents) {
      const clone = {};
      for (const prop in element) {
        if (hasOwnProperty(element, prop)) {
          clone[prop] = element[prop];
        }
      }
      clone.contents = [];

      element.contents.filter(offsetFilter).forEach(function (el) {
        const filteredElement = filter(offset, el);
        if (filteredElement.regionID) {
          activeRegions[filteredElement.regionID] = true;
        }

        if (filteredElement !== null) {
          clone.contents.push(filteredElement);
        }
      });
      return clone;
    } else {
      return element;
    }
  }

  if (tt.body !== null) {
    body = filter(offset, tt.body);
  } else {
    body = null;
  }

  /* rewritten TTML will always have a default - this covers it. because the region is defaulted to "" */
  if (activeRegions[""] !== undefined) {
    activeRegions[""] = true;
  }

  /* process regions */
  for (const regionID in activeRegions) {
    if (activeRegions[regionID]) {
      /* post-order traversal of the body tree per [construct intermediate document] */
      const c = isdProcessContentElement(tt, offset, tt.head.layout.regions[regionID], body, null, '', tt.head.layout.regions[regionID], errorHandler, context);

      if (c !== null) {

        /* add the region to the ISD */
        isd.contents.push(c.element);
      }
    }
  }

  return isd;
}
