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

import { AnimatedElement } from './AnimatedElement.js';
import { IdentifiedElement } from './IdentifiedElement.js';
import { StyledElement } from './StyledElement.js';
import { TimedElement } from './TimedElement.js';
import { elementGetStyleRefs } from './elementGetStyleRefs.js';
import { elementGetStyles } from './elementGetStyles.js';

/*
 * Represents a TTML Region element
 */

export class Region {
  createDefaultRegion(xmllang) {
    const r = new Region();

    r.id = '';
    r.styleAttrs = {};
    r.sets = [];
    r.explicit_begin = 0;
    r.explicit_end = Number.POSITIVE_INFINITY;
    r.explicit_dur = null;

    this.lang = xmllang;

    return r;
  }

  initFromNode(doc, node, xmllang, errorHandler) {
    IdentifiedElement.prototype.initFromNode.call(this, doc, null, node, errorHandler);
    TimedElement.prototype.initFromNode.call(this, doc, null, node, errorHandler);
    AnimatedElement.prototype.initFromNode.call(this, doc, null, node, errorHandler);
    StyledElement.prototype.initFromNode.call(this, doc, null, node, errorHandler);

    /* add specified styles */
    this.styleAttrs = elementGetStyles(node, errorHandler);

    /* remember referential styles for merging after nested styling is processed*/
    this.styleRefs = elementGetStyleRefs(node);

    /* xml:lang */
    this.lang = xmllang;
  }
}
