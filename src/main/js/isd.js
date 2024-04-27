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

import { reportError } from './error.js';
import { all, byName, byQName } from './styles.js';
import { ComputedLength, hasOwnProperty } from './utils.js';

/**
 * @module imscISD
 */

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
    const regions = tt.head.layout.regions;
    for (const layout_child in regions) {
        if (hasOwnProperty(regions, layout_child)) {
            const region = regions[layout_child];
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
    if (activeRegions[''] !== undefined) {
        activeRegions[''] = true;
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
};

/* set of styles not applicable to ruby container spans */

const _rcs_na_styles = [
    byName.color.qname,
    byName.textCombine.qname,
    byName.textDecoration.qname,
    byName.textEmphasis.qname,
    byName.textOutline.qname,
    byName.textShadow.qname,
];

function isdProcessContentElement(doc, offset, region, body, parent, inherited_region_id, elem, errorHandler, context) {

    /* prune if temporally inactive */

    if (offset < elem.begin || offset >= elem.end) {
        return null;
    }

    /*
     * set the associated region as specified by the regionID attribute, or the
     * inherited associated region otherwise
     */

    const associated_region_id = 'regionID' in elem && elem.regionID !== '' ? elem.regionID : inherited_region_id;

    /* prune the element if either:
     * - the element is not terminal and the associated region is neither the default
     *   region nor the parent region (this allows children to be associated with a
     *   region later on)
     * - the element is terminal and the associated region is not the parent region
     */

    /* TODO: improve detection of terminal elements since <region> has no contents */

    if (parent !== null /* are we in the region element */ &&
        associated_region_id !== region.id &&
        (
            (!('contents' in elem)) ||
            ('contents' in elem && elem.contents.length === 0) ||
            associated_region_id !== ''
        )
    )
        return null;

    /* create an ISD element, including applying specified styles */

    const isd_element = new ISDContentElement(elem);
    const styleAttrs = isd_element.styleAttrs;

    /* apply set (animation) styling */

    if ('sets' in elem) {
        for (let i = 0; i < elem.sets.length; i++) {

            if (offset < elem.sets[i].begin || offset >= elem.sets[i].end)
                continue;

            styleAttrs[elem.sets[i].qname] = elem.sets[i].value;

        }
    }

    /*
     * keep track of specified styling attributes so that we
     * can compute them later
     */

    const spec_attr = {};

    for (const qname in styleAttrs) {

        if (!hasOwnProperty(styleAttrs, qname)) continue;

        spec_attr[qname] = true;

        /* special rule for tts:writingMode (section 7.29.1 of XSL)
         * direction is set consistently with writingMode only
         * if writingMode sets inline-direction to LTR or RTL
         */

        if (isd_element.kind === 'region' &&
            qname === byName.writingMode.qname &&
            !(byName.direction.qname in styleAttrs)) {

            const wm = styleAttrs[qname];

            if (wm === 'lrtb' || wm === 'lr') {

                styleAttrs[byName.direction.qname] = 'ltr';

            } else if (wm === 'rltb' || wm === 'rl') {

                styleAttrs[byName.direction.qname] = 'rtl';

            }

        }
    }

    /* inherited styling */

    if (parent !== null) {

        for (let j = 0; j < all.length; j++) {

            const sa = all[j];

            /* textDecoration has special inheritance rules */

            if (sa.qname === byName.textDecoration.qname) {

                /* handle both textDecoration inheritance and specification */

                const ps = parent.styleAttrs[sa.qname];
                const es = styleAttrs[sa.qname];
                let outs = [];

                if (es === undefined) {

                    outs = ps;

                } else if (es.indexOf('none') === -1) {

                    if ((es.indexOf('noUnderline') === -1 &&
                        ps.indexOf('underline') !== -1) ||
                        es.indexOf('underline') !== -1) {

                        outs.push('underline');

                    }

                    if ((es.indexOf('noLineThrough') === -1 &&
                        ps.indexOf('lineThrough') !== -1) ||
                        es.indexOf('lineThrough') !== -1) {

                        outs.push('lineThrough');

                    }

                    if ((es.indexOf('noOverline') === -1 &&
                        ps.indexOf('overline') !== -1) ||
                        es.indexOf('overline') !== -1) {

                        outs.push('overline');

                    }

                } else {

                    outs.push('none');

                }

                styleAttrs[sa.qname] = outs;

            } else if (sa.qname === byName.fontSize.qname &&
                !(sa.qname in styleAttrs) &&
                isd_element.kind === 'span' &&
                styleAttrs[byName.ruby.qname] === 'textContainer') {

                /* special inheritance rule for ruby text container font size */

                const ruby_fs = parent.styleAttrs[byName.fontSize.qname];

                styleAttrs[sa.qname] = new ComputedLength(
                    0.5 * ruby_fs.rw,
                    0.5 * ruby_fs.rh);

            } else if (sa.qname === byName.fontSize.qname &&
                !(sa.qname in styleAttrs) &&
                isd_element.kind === 'span' &&
                styleAttrs[byName.ruby.qname] === 'text') {

                /* special inheritance rule for ruby text font size */

                const parent_fs = parent.styleAttrs[byName.fontSize.qname];

                if (parent.styleAttrs[byName.ruby.qname] === 'textContainer') {

                    styleAttrs[sa.qname] = parent_fs;

                } else {

                    styleAttrs[sa.qname] = new ComputedLength(
                        0.5 * parent_fs.rw,
                        0.5 * parent_fs.rh);
                }

            } else if (sa.inherit &&
                (sa.qname in parent.styleAttrs) &&
                !(sa.qname in styleAttrs)) {

                styleAttrs[sa.qname] = parent.styleAttrs[sa.qname];

            }

        }

    }

    /* initial value styling */

    for (let k = 0; k < all.length; k++) {

        const ivs = all[k];

        /* skip if value is already specified */

        if (ivs.qname in styleAttrs) continue;

        /* skip tts:position if tts:origin is specified */

        if (ivs.qname === byName.position.qname &&
            byName.origin.qname in styleAttrs)
            continue;

        /* skip tts:origin if tts:position is specified */

        if (ivs.qname === byName.origin.qname &&
            byName.position.qname in styleAttrs)
            continue;

        /* determine initial value */

        const iv = doc.head.styling.initials[ivs.qname] || ivs.initial;

        if (iv === null) {
            /* skip processing if no initial value defined */

            continue;
        }

        /* apply initial value to elements other than region only if non-inherited */

        if (isd_element.kind === 'region' || (ivs.inherit === false && iv !== null)) {

            const piv = ivs.parse(iv);

            if (piv !== null) {

                styleAttrs[ivs.qname] = piv;

                /* keep track of the style as specified */

                spec_attr[ivs.qname] = true;

            } else {

                reportError(errorHandler, "Invalid initial value for '" + ivs.qname + "' on element '" + isd_element.kind);

            }

        }

    }

    /* compute styles (only for non-inherited styles) */
    /* TODO: get rid of spec_attr */

    for (let z = 0; z < all.length; z++) {

        const cs = all[z];

        if (!(cs.qname in spec_attr)) continue;

        if (cs.compute !== null) {

            const cstyle = cs.compute(
                /*doc, parent, element, attr, context*/
                doc,
                parent,
                isd_element,
                styleAttrs[cs.qname],
                context,
            );

            if (cstyle !== null) {

                styleAttrs[cs.qname] = cstyle;

            } else {
                /* if the style cannot be computed, replace it by its initial value */

                styleAttrs[cs.qname] = cs.compute(
                    /*doc, parent, element, attr, context*/
                    doc,
                    parent,
                    isd_element,
                    cs.parse(cs.initial),
                    context,
                );

                reportError(errorHandler, "Style '" + cs.qname + "' on element '" + isd_element.kind + "' cannot be computed");
            }
        }

    }

    /* prune if tts:display is none */

    if (styleAttrs[byName.display.qname] === 'none')
        return null;

    /* process contents of the element */

    let contents = null;

    if (parent === null) {

        /* we are processing the region */

        if (body === null) {

            /* if there is no body, still process the region but with empty content */

            contents = [];

        } else {

            /*use the body element as contents */

            contents = [body];

        }

    } else if ('contents' in elem) {

        contents = elem.contents;

    }

    for (let x = 0; contents !== null && x < contents.length; x++) {

        const c = isdProcessContentElement(doc, offset, region, body, isd_element, associated_region_id, contents[x], errorHandler, context);

        /*
         * keep child element only if they are non-null and their region match
         * the region of this element
         */

        if (c !== null) {

            isd_element.contents.push(c.element);

        }

    }

    /* remove styles that are not applicable */

    for (const qnameb in styleAttrs) {
        if (!hasOwnProperty(styleAttrs, qnameb)) continue;

        /* true if not applicable */

        let na = false;

        /* special applicability of certain style properties to ruby container spans */
        /* TODO: in the future ruby elements should be translated to elements instead of kept as spans */

        if (isd_element.kind === 'span') {

            const rsp = styleAttrs[byName.ruby.qname];

            na = (rsp === 'container' || rsp === 'textContainer' || rsp === 'baseContainer') &&
                _rcs_na_styles.indexOf(qnameb) !== -1;

            if (!na) {

                na = rsp !== 'container' &&
                    qnameb === byName.rubyAlign.qname;

            }

            if (!na) {

                na = (!(rsp === 'textContainer' || rsp === 'text')) &&
                    qnameb === byName.rubyPosition.qname;

            }

        }

        /* normal applicability */

        if (!na) {

            const da = byQName[qnameb];

            if ('applies' in da) {

                na = da.applies.indexOf(isd_element.kind) === -1;

            }

        }

        if (na) {
            delete styleAttrs[qnameb];
        }

    }

    /* trim whitespace around explicit line breaks */

    const ruby = styleAttrs[byName.ruby.qname];

    if (isd_element.kind === 'p' ||
        (isd_element.kind === 'span' && (ruby === 'textContainer' || ruby === 'text'))
    ) {

        const elist = [];

        constructSpanList(isd_element, elist);

        collapseLWSP(elist);

        pruneEmptySpans(isd_element);

    }

    /* keep element if:
     * * contains a background image
     * * <br/>
     * * if there are children
     * * if it is an image
     * * if <span> and has text
     * * if region and showBackground = always
     */

    if ((isd_element.kind === 'div' && byName.backgroundImage.qname in styleAttrs) ||
        isd_element.kind === 'br' ||
        isd_element.kind === 'image' ||
        ('contents' in isd_element && isd_element.contents.length > 0) ||
        (isd_element.kind === 'span' && isd_element.text !== null) ||
        (isd_element.kind === 'region' &&
            styleAttrs[byName.showBackground.qname] === 'always')) {

        return {
            region_id: associated_region_id,
            element: isd_element,
        };
    }

    return null;
}

function collapseLWSP(elist) {

    function isPrevCharLWSP(prev_element) {
        return prev_element.kind === 'br' || /[\r\n\t ]$/.test(prev_element.text);
    }

    function isNextCharLWSP(next_element) {
        return next_element.kind === 'br' || (next_element.space === 'preserve' && /^[\r\n]/.test(next_element.text));
    }

    /* collapse spaces and remove leading LWSPs */

    let element;

    for (let i = 0; i < elist.length;) {

        element = elist[i];

        if (element.kind === 'br' || element.space === 'preserve') {
            i++;
            continue;
        }

        let trimmed_text = element.text.replace(/[\t\r\n ]+/g, ' ');

        if (/^[ ]/.test(trimmed_text)) {

            if (i === 0 || isPrevCharLWSP(elist[i - 1])) {
                trimmed_text = trimmed_text.substring(1);
            }

        }

        element.text = trimmed_text;

        if (trimmed_text.length === 0) {
            elist.splice(i, 1);
        } else {
            i++;
        }

    }

    /* remove trailing LWSPs */

    for (let i = 0; i < elist.length; i++) {

        element = elist[i];

        if (element.kind === 'br' || element.space === 'preserve') {
            i++;
            continue;
        }

        if (/[ ]$/.test(element.text)) {

            if (i === (elist.length - 1) || isNextCharLWSP(elist[i + 1])) {
                element.text = element.text.slice(0, -1);
            }

        }

    }

}

function constructSpanList(element, elist) {

    if (!('contents' in element)) {
        return;
    }

    for (let i = 0; i < element.contents.length; i++) {

        const child = element.contents[i];
        const ruby = child.styleAttrs[byName.ruby.qname];

        if (child.kind === 'span' && (ruby === 'textContainer' || ruby === 'text')) {

            /* skip ruby text and text containers, which are handled on their own */

            continue;

        } else if ('contents' in child) {

            constructSpanList(child, elist);

        } else if ((child.kind === 'span' && child.text.length !== 0) || child.kind === 'br') {

            /* skip empty spans */

            elist.push(child);

        }

    }

}

function pruneEmptySpans(element) {

    if (element.kind === 'br') {

        return false;

    } else if ('text' in element) {

        return element.text.length === 0;

    } else if ('contents' in element) {

        let i = element.contents.length;

        while (i--) {

            if (pruneEmptySpans(element.contents[i])) {
                element.contents.splice(i, 1);
            }

        }

        return element.contents.length === 0;

    }
}

class ISD {
    constructor(tt) {
        this.contents = [];
        this.aspectRatio = tt.aspectRatio;
        this.lang = tt.lang;
    }
}

class ISDContentElement {
    constructor(ttelem) {

        /* assume the element is a region if it does not have a kind */

        this.kind = ttelem.kind || 'region';

        /* copy lang */

        this.lang = ttelem.lang;

        /* copy id */

        if (ttelem.id) {
            this.id = ttelem.id;
        }

        /* deep copy of style attributes */
        this.styleAttrs = {};

        for (const sname in ttelem.styleAttrs) {

            if (!hasOwnProperty(ttelem.styleAttrs, sname)) continue;

            this.styleAttrs[sname] =
                ttelem.styleAttrs[sname];
        }

        /* copy src and type if image */

        if ('src' in ttelem) {

            this.src = ttelem.src;

        }

        if ('type' in ttelem) {

            this.type = ttelem.type;

        }

        /* TODO: clean this!
         * TODO: ISDElement and document element should be better tied together */

        if ('text' in ttelem) {

            this.text = ttelem.text;

        } else if (this.kind === 'region' || 'contents' in ttelem) {

            this.contents = [];
        }

        if ('space' in ttelem) {

            this.space = ttelem.space;
        }
    }
}
